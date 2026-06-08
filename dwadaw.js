// ======================================
// app.js - CAFETERÍA JHOEL (CORREGIDO)
// ======================================

// =========================
// VALIDAR SUPABASE
// =========================
if (typeof db === "undefined") {
    alert("❌ Error conectando con Supabase");
    throw new Error("Supabase no inicializado");
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
            console.log("❌ Sin sesión");
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
                alert("❌ Correo o contraseña incorrectos");
                return;
            }
            usuarioActual = data.user;
            localStorage.setItem("correo", email);
            await actualizarEstadoUsuario();
            entrarSistema();
            alert("✅ Sesión iniciada");
        } catch (err) {
            console.error(err);
            alert("Error iniciando sesión");
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
                alert("❌ " + error.message);
                return;
            }
            alert("✅ Cuenta creada. Revisa tu correo para confirmar.");
            form.reset();
            mostrarvista("login");
        } catch (err) {
            console.error(err);
            alert("Error registrando");
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
    alert("✅ Sesión cerrada");
    location.reload();
}

// =========================
// PRODUCTOS
// =========================
const productos = [
    { id:1, nombre:"cafe", descripcion:"cafe clasico", precio:12, imagen:"img/cafe.jpg" },
    { id:2, nombre:"brownie", descripcion:"masa de chocolate", precio:8, imagen:"img/brownie.jpg" },
    { id:3, nombre:"capuccino", descripcion:"expreso con leche", precio:18, imagen:"img/capuccino.jpg" },
    { id:4, nombre:"cuernito", descripcion:"masa con queso", precio:10, imagen:"img/cuernito.jpg" },
    { id:5, nombre:"empanada", descripcion:"relleno con queso", precio:7, imagen:"img/empanada.jpg" },
    { id:6, nombre:"helado", descripcion:"artesanal", precio:15, imagen:"img/helado.jpg" },
    { id:7, nombre:"donas", descripcion:"glaseado chocolate", precio:8, imagen:"img/donas.jpg" },
    { id:8, nombre:"pastel", descripcion:"con crema y frutas", precio:12, imagen:"img/pastel.jpg" }
];
async function entrarSistema() {

let carrito = [];
    document.querySelector("nav").style.display = "flex";

    mostrarvista("menu");
}
// =========================
// RENDER PRODUCTOS
// =========================
function renderizarProductos() {
    const contenedor = document.getElementById("products-container");
    if (!contenedor) return;

    let html = "";

    if (productos.length === 0) {
        contenedor.innerHTML = `<p style="text-align:center; padding:40px;">No hay productos disponibles.</p>`;
        return;
    }

    productos.forEach(p => {
        html += `
            <div class="product-card" data-id="${p.id}">
                <h3>${escaparHTML(p.nombre)}</h3>
                <img src="${p.imagen || 'img/default.jpg'}" 
                     alt="${escaparHTML(p.nombre)}"
                     onerror="this.src='img/default.jpg'">
                <p>${escaparHTML(p.descripcion)}</p>
                <span class="precio">Bs ${Number(p.precio).toFixed(2)}</span>
                <button class="btn-comprar agregar-btn" data-id="${p.id}">
                    🛒 Agregar al carrito
                </button>
            </div>
        `;
    });

    contenedor.innerHTML = html;

    document.querySelectorAll('.agregar-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            comprar(id);
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
            <h2>🛒 Carrito</h2>
            <p style="text-align:center; margin-top:30px; font-size:1.2rem;">
                Tu carrito está vacío
            </p>
        `;
        contenedor.innerHTML = html;
        return;
    }

    html += `
        <h2 style="margin-bottom:20px; font-size:2rem;">🛒 Carrito</h2>
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
            alert("Inicia sesión para realizar el pedido");
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
            alert("Error al guardar pedido: " + pedidoError.message);
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
            alert("Error al guardar productos: " + itemsError.message);
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
        alert(`✅ Pedido #${pedido.id} guardado correctamente!`);

    } catch (err) {
        console.error(err);
        alert("Error procesando el pedido.");
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
            await emailjs.send("service_4r0zhsb", "template_0now3v8", {
                from_name: nombre,
                from_email: correo,
                message: mensaje
            });
            alert("✅ Mensaje enviado");
            form.reset();
        } catch (error) {
            console.error(error);
            alert("❌ Error enviando mensaje");
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