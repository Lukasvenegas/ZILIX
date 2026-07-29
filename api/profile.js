const { createClient } = require('@supabase/supabase-js');

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const serviceClient = serviceRoleKey
  ? createClient(process.env.SUPABASE_URL, serviceRoleKey)
  : null;

async function getAuthenticatedClient(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization header required' });
    return null;
  }

  const access_token = authHeader.substring(7);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${access_token}` } }
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }

  return { supabase, user };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const auth = await getAuthenticatedClient(req, res);
      if (!auth) return;

      const { supabase, user } = auth;
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST102') {
        console.error('Profile query error:', error);
      }

      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: profile?.name || 'User',
          role: profile?.role || 'user',
          created_at: user.created_at
        }
      });
    }

    if (req.method === 'PUT') {
      const auth = await getAuthenticatedClient(req, res);
      if (!auth) return;

      const { supabase, user } = auth;
      const { name, email, password } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      const userPayload = { email };
      if (password) userPayload.password = password;

      const { error: authError } = await supabase.auth.updateUser(userPayload);
      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name, email })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        return res.status(500).json({ error: 'Profile update failed' });
      }

      return res.status(200).json({ message: 'Perfil actualizado correctamente.' });
    }

    if (req.method === 'DELETE') {
      const auth = await getAuthenticatedClient(req, res);
      if (!auth) return;

      const { user } = auth;

      const deleteProfile = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
      const { error: profileDeleteError } = await deleteProfile
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileDeleteError) {
        console.error('Profile delete error:', profileDeleteError);
        return res.status(500).json({ error: 'Failed to delete profile data' });
      }

      if (serviceClient) {
        const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id);
        if (deleteError) {
          console.error('Auth delete error:', deleteError);
          return res.status(500).json({ error: 'Failed to delete authentication account' });
        }

        return res.status(200).json({ message: 'Cuenta eliminada correctamente.' });
      }

      return res.status(200).json({
        message: 'Perfil eliminado correctamente. Para borrar también la cuenta de autenticación, configure SUPABASE_SERVICE_ROLE_KEY en el servidor.'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Profile handler error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
