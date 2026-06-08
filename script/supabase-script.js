// script/supabase-script.js

const SUPABASE_URL =
'https://vzmdtmusrcyrnizfpygu.supabase.co';

const SUPABASE_ANON_KEY =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bWR0bXVzcmN5cm5pemZweWd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDg5MzYsImV4cCI6MjA5NTU4NDkzNn0.Jqyl2-xiZ5AjCR5g5lgZlI6pUg4S32s7qXcuMaFQq3I';

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// Obtener usuario actual
async function getCurrentUser() {

    const {
        data: { user }
    } = await db.auth.getUser();

    return user;
}

// Escuchar cambios de sesión
db.auth.onAuthStateChange(
    async (event, session) => {

        console.log(
            "Auth:",
            event,
            session?.user?.email
        );

        if (
            typeof actualizarEstadoUsuario ===
            "function"
        ) {
            actualizarEstadoUsuario();
        }
    }
);


