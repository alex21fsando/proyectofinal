// =====================================
// js/supabase-cliente.js
// CONFIGURACION PROFESIONAL SUPABASE
// =====================================

// URL DEL PROYECTO
const SUPABASE_URL = "https://mzbykhcrccrsyffojqso.supabase.co";

// PUBLIC ANON KEY
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16YnlraGNyY2Nyc3lmZm9qcXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDQ1MzIsImV4cCI6MjA5NjU4MDUzMn0.-Ph-Fq208epHvrYSef_57tubZx9F41WQZjw4187Piv0";

// CREAR CLIENTE
const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: true,     // mantener sesión iniciada
            autoRefreshToken: true,  // renovar sesión
            detectSessionInUrl: true // recuperación de cuenta
        }
    }
);

// MENSAJE CONSOLA
console.log("💻 Supabase conectado correctamente");
