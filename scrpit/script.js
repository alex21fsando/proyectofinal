// =============================================
//  TECHCORE STORE — Script Principal
// =============================================

document.addEventListener('DOMContentLoaded', () => {

    // --- Menú hamburguesa (mobile) ---
    const toggle = document.getElementById('navToggle');
    const menu   = document.getElementById('navMenu');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', menu.classList.contains('open'));
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!toggle.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // --- Dropdown en mobile (tap) ---
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dd => {
        const btn = dd.querySelector('.dropbtn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                // Solo en mobile (menú abierto)
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dd.classList.toggle('open');
                }
            });
        }
    });

    // --- Navbar: sombra al hacer scroll ---
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.style.boxShadow = window.scrollY > 10
                ? '0 2px 20px rgba(0,0,0,0.5)'
                : 'none';
        });
    }

    // --- Marcar enlace activo según página actual ---
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // --- Animación de entrada al hacer scroll (Intersection Observer) ---
    const animItems = document.querySelectorAll(
        '.categoria-card, .producto-card, .ventaja-item'
    );

    if ('IntersectionObserver' in window && animItems.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animItems.forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });
    }

});
