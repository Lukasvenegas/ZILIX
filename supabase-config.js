// Configuración de Supabase para el cliente
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Supabase
// Los encuentras en: https://supabase.com/dashboard/project/[tu-proyecto]/settings/api

const SUPABASE_CONFIG = {
  url: 'https://mzdtvajqkdjnwdtufimj.supabase.co', // Ej: https://abcdefghijklmnop.supabase.co
  anonKey: 'sb_publishable_jVOGdM3J3SRS7NmeCapVRw_37fBuaB8' // La clave anónima (public)
};

// Inicializar Supabase client
const supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// API endpoints
const API_ENDPOINTS = {
  register: '/api/register',
  login: '/api/login',
  logout: '/api/logout',
  profile: '/api/profile'
};

// Exportar configuración
window.SupabaseConfig = {
  client: supabaseClient,
  endpoints: API_ENDPOINTS
};