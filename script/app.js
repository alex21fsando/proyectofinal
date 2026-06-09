// ======================================
// app.js - TECHSTORE JHOEL
// ======================================

// =========================
// VALIDAR SUPABASE
// =========================
if (typeof db === "undefined") {
    console.error("❌ Supabase no inicializado");
    throw new Error("Supabase no inicializado");
}

// =========================
// TOAST NOTIFICATIONS
// =========================
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) { console.log(message); return; }

    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(30px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// =========================
// VARIABLES GLOBALES
// =========================
let productos = [];
let carrito = [];
let usuarioActual = null;

// =========================
// ESCAPAR HTML
// =========================
function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto || "";
    return div.innerHTML;
}

// =========================
// GUARDAR CARRITO
// =========================
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// =========================
// CARGAR CARRITO
// =========================
function cargarCarritoGuardado() {
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
        try {
            carrito = JSON.parse(carritoGuardado);
        } catch (err) {
            carrito = [];
        }
    }
}

// =========================
// INICIO
// =========================
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Verificar sesión
        const { data: { session } } = await db.auth.getSession();
        if (session) {
            usuarioActual = session.user;
            console.log("✅ Usuario:", usuarioActual.email);
            entrarSistema();
        } else {
            console.log("ℹ️ Sin sesión activa");
            mostrarvista("home");
        }

        await actualizarEstadoUsuario();

        // Recordar correo
        const loginCorreo = document.getElementById("loginCorreo");
        if (loginCorreo) {
            const correo = localStorage.getItem("correo");
            if (correo) {
                loginCorreo.value = correo;
                loginCorreo.readOnly = true;
            }
        }

        cargarCarritoGuardado();
        await cargarProductos();
        renderizarCarrito();
        actualizarContador();

        iniciarLogin();
        iniciarRegistro();
        iniciarContacto();

    } catch (err) {
        console.error("❌ Error:", err);
    }
});

// =========================
// CAMBIAR VISTA
// =========================
function mostrarvista(vista) {
    document.querySelectorAll(".view").forEach(sec => {
        sec.classList.remove("active");
    });
    const vistaElement = document.getElementById("view-" + vista);
    if (vistaElement) {
        vistaElement.classList.add("active");
    }
}

// =========================
// ESTADO USUARIO
// =========================
async function actualizarEstadoUsuario() {
    const estado = document.getElementById("estado-usuario");
    const btnLogin = document.getElementById("btn-login");
    const btnRegistro = document.getElementById("btn-registro");
    const btnCerrar = document.getElementById("btn-cerrar");

    if (!estado) return;

    const { data: { user } } = await db.auth.getUser();

    if (user) {
        estado.innerHTML = `✅ ${user.email}`;
        if (btnLogin) btnLogin.style.display = "none";
        if (btnRegistro) btnRegistro.style.display = "none";
        if (btnCerrar) btnCerrar.style.display = "inline-block";
    } else {
        estado.innerHTML = "❌ No has iniciado sesión";
        if (btnLogin) btnLogin.style.display = "inline-block";
        if (btnRegistro) btnRegistro.style.display = "inline-block";
        if (btnCerrar) btnCerrar.style.display = "none";
    }
}

// =========================
// LOGIN
// =========================
function iniciarLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async e => {
        e.preventDefault();
        const email = document.getElementById("loginCorreo").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            alert("Completa los campos");
            return;
        }

        try {
            const { data, error } = await db.auth.signInWithPassword({ email, password });
            if (error) {
                showToast("Correo o contraseña incorrectos", "error");
                return;
            }
            usuarioActual = data.user;
            localStorage.setItem("correo", email);
            await actualizarEstadoUsuario();
            entrarSistema();
            showToast("Sesión iniciada correctamente", "success");
        } catch (err) {
            console.error(err);
            showToast("Error al iniciar sesión", "error");
        }
    });
}

// =========================
// REGISTRO
// =========================
function iniciarRegistro() {
    const form = document.getElementById("registroForm");
    if (!form) return;

    form.addEventListener("submit", async e => {
        e.preventDefault();
        const nombre = document.getElementById("regNombre").value.trim();
        const correo = document.getElementById("regCorreo").value.trim();
        const password = document.getElementById("regPassword").value;

        if (!nombre || !correo || !password) {
            alert("Completa todos los campos");
            return;
        }

        try {
            const { error } = await db.auth.signUp({
                email: correo,
                password: password,
                options: { data: { nombre: nombre } }
            });

            if (error) {
                showToast(error.message, "error");
                return;
            }
            showToast("Cuenta creada. Revisa tu correo para confirmar.", "success");
            form.reset();
            mostrarvista("login");
        } catch (err) {
            console.error(err);
            showToast("Error al registrarse", "error");
        }
    });
}

// =========================
// ENTRAR SISTEMA
// =========================
function entrarSistema() {
    mostrarvista("home");
}

// =========================
// CERRAR SESIÓN
// =========================
async function cerrarSesion() {
    await db.auth.signOut();
    usuarioActual = null;
    carrito = [];
    guardarCarrito();
    localStorage.removeItem("correo");
    await actualizarEstadoUsuario();
    showToast("Sesión cerrada", "info");
    location.reload();
}

// =========================
// PRODUCTOS
// =========================
async function cargarProductos() {
    try {
        const { data, error } = await db
            .from("products")
            .select("*")
            .eq("disponible", true)
            .order("id", { ascending: true });

        if (error) {
            console.error(error);
            return;
        }
        productos = data || [];
        renderizarProductos();
    } catch (err) {
        console.error(err);
    }
}

// =========================
// RENDER PRODUCTOS
// =========================
function renderizarProductos() {

    const contenedores = [
        "pc-alta",
        "pc-media",
        "pc-oficina",

        "laptop-alta",
        "laptop-media",
        "laptop-oficina",

        "accesorio-alta",
        "accesorio-media",
        "accesorio-oficina"
    ];

    // Limpiar contenedores
    contenedores.forEach(id => {
        const contenedor = document.getElementById(id);
        if (contenedor) {
            contenedor.innerHTML = "";
        }
    });

    productos.forEach(p => {

        const badgeClass = p.gama === "Alta" ? "badge-alta" : p.gama === "Media" ? "badge-media" : "badge-oficina";
        const badgeLabel = p.gama === "Alta" ? "🔥 Alta" : p.gama === "Media" ? "⚡ Media" : "💼 Oficina";

        const card = `
            <div class="product-card">
                <span class="badge-gama ${badgeClass}">${badgeLabel}</span>
                <img
                    src="${p.imagen || 'img/logo.png'}"
                    alt="${escaparHTML(p.nombre)}"
                    onerror="this.src='img/logo.png'"
                    loading="lazy"
                >
                <h3>${escaparHTML(p.nombre)}</h3>
                <p>${escaparHTML(p.descripcion || "")}</p>
                <span class="precio">Bs ${Number(p.precio).toFixed(2)}</span>
                <button class="btn-comprar agregar-btn" data-id="${p.id}">
                    🛒 Agregar al carrito
                </button>
            </div>
        `;

        let destino = "";

        if (p.categoria === "PC") {
            if (p.gama === "Alta") destino = "pc-alta";
            else if (p.gama === "Media") destino = "pc-media";
            else destino = "pc-oficina";
        }

        else if (p.categoria === "Laptop") {
            if (p.gama === "Alta") destino = "laptop-alta";
            else if (p.gama === "Media") destino = "laptop-media";
            else destino = "laptop-oficina";
        }

        else if (p.categoria === "Accesorio") {
            if (p.gama === "Alta") destino = "accesorio-alta";
            else if (p.gama === "Media") destino = "accesorio-media";
            else destino = "accesorio-oficina";
        }

        const contenedor = document.getElementById(destino);

        if (contenedor) {
            contenedor.innerHTML += card;
        }
    });

    document.querySelectorAll(".agregar-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            comprar(parseInt(this.dataset.id));
        });
    });
}
// =========================
// COMPRAR
// =========================
function comprar(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) {
        alert("❌ Producto no encontrado");
        return;
    }

    const existe = carrito.find(p => p.id === id);
    
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    guardarCarrito();
    renderizarCarrito();
    actualizarContador();
    showToast(`${producto.nombre} agregado al carrito`, "success");
}

// =========================
// RENDER CARRITO
// =========================
function renderizarCarrito() {
    const contenedor = document.getElementById("cart-items");
    if (!contenedor) return;

    let html = "";

    if (carrito.length === 0) {
        html = `
            <h2 style="margin-bottom:28px; font-size:1.8rem; font-weight:800; color:var(--white);">🛒 Carrito</h2>
            <div class="empty-state">
                <div class="empty-icon">🛒</div>
                <h3>Tu carrito está vacío</h3>
                <p>Agrega productos desde la sección de Productos</p>
            </div>
        `;
        contenedor.innerHTML = html;
        return;
    }

    html += `
        <h2 style="margin-bottom:20px; font-size:1.8rem; font-weight:800; color:var(--white);">🛒 Carrito</h2>
        <div class="cart-header">
            <span>Producto</span>
            <span>Subtotal</span>
            <span>Cantidad</span>
            <span>Acciones</span>
        </div>
    `;

    let total = 0;

    carrito.forEach(p => {
        const subtotal = p.precio * p.cantidad;
        total += subtotal;

        html += `
            <div class="cart-row">
                <span>${p.nombre}</span>
                <span>Bs ${subtotal.toFixed(2)}</span>
                <span>${p.cantidad}</span>
                <div class="cantidad-box">
                    <button onclick="disminuirCantidad(${p.id})">-</button>
                    <button onclick="aumentarCantidad(${p.id})">+</button>
                </div>
            </div>
        `;
    });

    html += `
        <div class="cart-summary">
            <span>Total:</span>
            <span class="total">Bs ${total.toFixed(2)}</span>
        </div>
        <div class="cart-actions">
            <button class="btn-vaciar" onclick="vaciarCarrito()">Vaciar carrito</button>
            <button class="btn-pagar" onclick="pagar()">Pagar pedido</button>
        </div>
    `;

    contenedor.innerHTML = html;
}

// =========================
// FUNCIONES DE CANTIDAD
// =========================
function aumentarCantidad(id) {
    const producto = carrito.find(x => x.id === id);
    if (producto) producto.cantidad++;
    guardarCarrito();
    renderizarCarrito();
    actualizarContador();
}

function disminuirCantidad(id) {
    const producto = carrito.find(x => x.id === id);
    if (!producto) return;
    producto.cantidad--;
    if (producto.cantidad <= 0) {
        carrito = carrito.filter(x => x.id !== id);
    }
    guardarCarrito();
    renderizarCarrito();
    actualizarContador();
}

// =========================
// ACTUALIZAR CONTADOR
// =========================
function actualizarContador() {
    let total = 0;
    carrito.forEach(p => total += p.cantidad);

    const contador = document.getElementById("cart-count");
    if (contador) contador.textContent = total;
}

// =========================
// VACIAR CARRITO
// =========================
function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    renderizarCarrito();
    actualizarContador();
}

// =========================
// PAGAR (con WhatsApp)
// =========================
async function pagar() {
    if (carrito.length === 0) {
        alert("Carrito vacío");
        return;
    }

    try {
        const { data: { user } } = await db.auth.getUser();
        if (!user) {
            showToast("Inicia sesión para realizar el pedido", "error");
            mostrarvista("login");
            return;
        }

        let total = 0;
        carrito.forEach(item => total += item.precio * item.cantidad);

        const { data: pedido, error: pedidoError } = await db
            .from("orders")
            .insert([{ user_id: user.id, total: total, estado: "pendiente" }])
            .select()
            .single();

        if (pedidoError) {
            showToast("Error al guardar pedido: " + pedidoError.message, "error");
            return;
        }

        const productosPedido = carrito.map(producto => ({
            order_id: pedido.id,
            product_id: producto.id,
            cantidad: producto.cantidad,
            precio_unit: producto.precio
        }));

        const { error: itemsError } = await db
            .from("order_items")
            .insert(productosPedido);

        if (itemsError) {
            showToast("Error al guardar productos: " + itemsError.message, "error");
            return;
        }

        // Mensaje WhatsApp
        const mensaje = encodeURIComponent(
            `🛒 NUEVO PEDIDO\n` +
            `Pedido #${pedido.id}\n\n` +
            carrito.map(i => `${i.nombre} x${i.cantidad} = Bs ${i.precio * i.cantidad}`).join("\n") +
            `\n\nTOTAL: Bs ${total.toFixed(2)}`
        );

        window.open(`https://wa.me/59164916803?text=${mensaje}`, "_blank");

        vaciarCarrito();
        showToast(`Pedido #${pedido.id} guardado correctamente`, "success");

    } catch (err) {
        console.error(err);
        showToast("Error procesando el pedido", "error");
    }
}

// =========================
// CONTACTO
// =========================
function iniciarContacto() {
    const form = document.getElementById("formContacto");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const mensaje = document.getElementById("mensaje").value.trim();

        try {
            await emailjs.send("service_wu1c7hl", "template_qir85vy", {
                from_name: nombre,
                from_email: correo,
                message: mensaje
            });
            showToast("Mensaje enviado correctamente", "success");
            form.reset();
        } catch (error) {
            console.error(error);
            showToast("Error al enviar el mensaje", "error");
        }
    });
}

function usarOtraCuenta() {
    const loginCorreo = document.getElementById("loginCorreo");
    if (loginCorreo) {
        loginCorreo.value = "";
        loginCorreo.readOnly = false;
        loginCorreo.focus();
    }
}