const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Crear perfil adicional si es necesario
    if (data.user) {
      // Verificar si ya hay perfiles para determinar el rol
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const role = count === 0 ? 'admin' : 'user';

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            name: name,
            role: role,
            created_at: new Date().toISOString(),
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // No fallar el registro por esto, pero loggear
      }
    }

    res.status(200).json({
      message: 'User registered successfully. Please check your email for verification.',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: name
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}