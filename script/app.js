// ======================================
// app.js - TECHCORE STORE (FULL VERSION JS PRODUCTS)
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
// GUARDAR / CARGAR CARRITO
// =========================
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function cargarCarritoGuardado() {
    const data = localStorage.getItem("carrito");
    if (data) {
        try {
            carrito = JSON.parse(data);
        } catch {
            carrito = [];
        }
    }
}

// =========================
// PRODUCTOS EN JS (TU TIENDA)
// =========================
const productosBase = [
    { id: 1, nombre: "PC Gamer RTX 4060", descripcion: "Ryzen 5 5600X, 16GB RAM, RTX 4060", precio: 4500, imagen: "img/pc1.jpg" },
    { id: 2, nombre: "Laptop MSI", descripcion: "i7 13th, RTX 4070, 32GB RAM", precio: 5200, imagen: "img/laptop1.jpg" },
    { id: 3, nombre: "Monitor 144Hz", descripcion: "27 pulgadas IPS Gaming", precio: 1250, imagen: "img/monitor.jpg" },
    { id: 4, nombre: "Teclado RGB", descripcion: "Mecánico gaming RGB", precio: 320, imagen: "img/teclado.jpg" },
    { id: 5, nombre: "Mouse Gamer", descripcion: "Alta precisión DPI", precio: 180, imagen: "img/mouse.jpg" }
];

// =========================
// CARGAR PRODUCTOS
// =========================
function cargarProductos() {
    productos = productosBase;
}

// =========================
// RENDER PRODUCTOS
// =========================
function renderizarProductos() {
    const contenedor = document.getElementById("products-container");
    if (!contenedor) return;

    let html = "";

    productos.forEach(p => {
        html += `
        <div class="product-card">
            <img src="${p.imagen}" onerror="this.src='img/default.jpg'">
            <h3>${escaparHTML(p.nombre)}</h3>
            <p>${escaparHTML(p.descripcion)}</p>
            <span class="precio">Bs ${p.precio}</span>
            <button class="btn-comprar" onclick="comprar(${p.id})">
                🛒 Agregar al carrito
            </button>
        </div>
        `;
    });

    contenedor.innerHTML = html;
}

// =========================
// COMPRAR
// =========================
function comprar(id) {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;

    const existe = carrito.find(p => p.id === id);

    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ ...prod, cantidad: 1 });
    }

    guardarCarrito();
    renderizarCarrito();
    actualizarContador();
}

// =========================
// RENDER CARRITO (COMPLETO)
// =========================
function renderizarCarrito() {
    const contenedor = document.getElementById("cart-items");
    if (!contenedor) return;

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p>🛒 Carrito vacío</p>";
        return;
    }

    let total = 0;
    let html = "";

    carrito.forEach(p => {
        const subtotal = p.precio * p.cantidad;
        total += subtotal;

        html += `
        <div class="cart-row">
            <span>${p.nombre}</span>
            <span>Bs ${subtotal}</span>
            <span>${p.cantidad}</span>
            <div>
                <button onclick="disminuir(${p.id})">-</button>
                <button onclick="aumentar(${p.id})">+</button>
            </div>
        </div>
        `;
    });

    html += `
    <h3>Total: Bs ${total}</h3>
    <button onclick="vaciarCarrito()">Vaciar</button>
    <button onclick="pagar()">Pagar</button>
    `;

    contenedor.innerHTML = html;
}

// =========================
// CANTIDAD
// =========================
function aumentar(id) {
    const p = carrito.find(x => x.id === id);
    if (p) p.cantidad++;
    guardarCarrito();
    renderizarCarrito();
    actualizarContador();
}

function disminuir(id) {
    const p = carrito.find(x => x.id === id);
    if (!p) return;

    p.cantidad--;
    if (p.cantidad <= 0) {
        carrito = carrito.filter(x => x.id !== id);
    }

    guardarCarrito();
    renderizarCarrito();
    actualizarContador();
}

// =========================
// CONTADOR
// =========================
function actualizarContador() {
    const c = document.getElementById("cart-count");
    if (!c) return;

    let total = 0;
    carrito.forEach(p => total += p.cantidad);
    c.textContent = total;
}

// =========================
// VACÍO
// =========================
function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    renderizarCarrito();
    actualizarContador();
}

// =========================
// PAGAR (WHATSAPP + SUPABASE OPCIONAL)
// =========================
async function pagar() {
    if (carrito.length === 0) return alert("Carrito vacío");

    const { data: { user } } = await db.auth.getUser();
    if (!user) {
        alert("Debes iniciar sesión");
        mostrarvista("login");
        return;
    }

    let total = 0;
    carrito.forEach(p => total += p.precio * p.cantidad);

    // Guardar pedido en Supabase (igual que cafetería)
    const { data: pedido } = await db
        .from("orders")
        .insert([{ user_id: user.id, total, estado: "pendiente" }])
        .select()
        .single();

    const items = carrito.map(p => ({
        order_id: pedido.id,
        product_id: p.id,
        cantidad: p.cantidad,
        precio_unit: p.precio
    }));

    await db.from("order_items").insert(items);

    // WhatsApp
    const msg = encodeURIComponent(
        `🛒 PEDIDO #${pedido.id}\n\n` +
        carrito.map(p => `${p.nombre} x${p.cantidad} = Bs ${p.precio * p.cantidad}`).join("\n") +
        `\n\nTOTAL: Bs ${total}`
    );

    window.open(`https://wa.me/59164916803?text=${msg}`, "_blank");

    vaciarCarrito();
    alert("✅ Pedido realizado");
}

// =========================
// EMAILJS (CONTACTO)
// =========================
function iniciarContacto() {
    const form = document.getElementById("formContacto");
    if (!form) return;

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const nombre = document.getElementById("nombre").value;
        const correo = document.getElementById("correo").value;
        const mensaje = document.getElementById("mensaje").value;

        try {
            await emailjs.send("service_4r0zhsb", "template_0now3v8", {
                from_name: nombre,
                from_email: correo,
                message: mensaje
            });

            alert("✅ Mensaje enviado");
            form.reset();
        } catch (err) {
            alert("❌ Error enviando mensaje");
        }
    });
}

// =========================
// VISTAS
// =========================
function mostrarvista(vista) {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));

    const el = document.getElementById("view-" + vista);
    if (el) {
        el.classList.add("active");

        if (vista === "menu") renderizarProductos();
        if (vista === "cart") renderizarCarrito();
    }
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    cargarCarritoGuardado();
    actualizarContador();

    iniciarContacto();

    mostrarvista("home");
});