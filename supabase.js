// CONFIGURACIÓN DE SUPABASE
// ==============================================================================
// 1. Crea un proyecto en supabase.com
// 2. Ve a Settings -> API
// 3. Copia la Project URL y la anon "public" API key
// 4. Reemplaza los valores de abajo
// ==============================================================================

const SUPABASE_URL = 'https://ivnwommtapglwrjwnnpz.supabase.co'; // Ej. https://abcdefghijkl.supabase.co
const SUPABASE_ANON_KEY = 'sb_publishable_xAGjh4fdZz6w9WxNPkMLMw_tninj1EV';

// Inicializar el cliente
if (!window.supabase) {
    console.error("El script de Supabase no se cargó correctamente. Revisa la conexión a Internet.");
}

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
