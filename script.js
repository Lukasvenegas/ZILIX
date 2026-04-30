const toggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");
const overlay = document.getElementById("nav-overlay");

toggle.addEventListener("click", () => {
    nav.classList.toggle("active");
    toggle.classList.toggle("active");
    overlay.classList.toggle("active");
});

// cerrar al hacer click afuera
overlay.addEventListener("click", () => {
    nav.classList.remove("active");
    toggle.classList.remove("active");
    overlay.classList.remove("active");
});

// BUSCADOR PROFESIONAL
const searchInput = document.getElementById("search");
if (searchInput) {
    const cards = document.querySelectorAll(".services");
    const infoSection = document.getElementById("info-section");

    searchInput.addEventListener("keyup", (e) => {
        const value = searchInput.value.toLowerCase();
        let matches = 0;

        // Cerrar info-section si hay texto
        if (value.trim() !== "") {
            infoSection.style.display = "none";
        } else {
            infoSection.style.display = "block";
            setTimeout(() => infoSection.classList.add("active"), 10);
        }

        // Filtrar tarjetas
        cards.forEach(card => {
            const text = card.innerText.toLowerCase();
            const found = text.includes(value);
            card.style.display = found ? "block" : "none";
            if (found) matches++;
        });

        // SI PRESIONA ENTER Y NO HAY RESULTADOS
        if (e.key === "Enter" && matches === 0) {

            // Guardar texto original
            const originalText = searchInput.value;

            // Mostrar mensaje temporal
            searchInput.value = "no se encontró su búsqueda";
            searchInput.style.color = "red";

            // Cerrar info-section
            infoSection.style.display = "none";

            // Después de 2 segundos → limpiar y restaurar
            setTimeout(() => {
                searchInput.value = "";
                searchInput.style.color = "";

                // Reabrir info-section
                infoSection.style.display = "block";
                setTimeout(() => infoSection.classList.add("active"), 10);

                // Mostrar todas las tarjetas nuevamente
                cards.forEach(card => card.style.display = "block");

            }, 2000);
        }
    });
}

// FORMULARIO DE CONTACTO
const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const nombre = document.getElementById("nombre").value;
        const email = document.getElementById("email").value;
        const telefono = document.getElementById("telefono").value;
        const plan = document.getElementById("plan").value;
        const mensaje = document.getElementById("mensaje").value;

        // Mensaje para WhatsApp
        const textoWhatsApp = `Hola, soy ${nombre}.\n\nMe interesa el plan: ${plan}\n\nEmail: ${email}\nTeléfono: ${telefono}\n\nMensaje: ${mensaje}`;
        const urlWhatsApp = `https://wa.me/56956591585?text=${encodeURIComponent(textoWhatsApp)}`;

        // Abrir WhatsApp
        window.open(urlWhatsApp, "_blank");

        // Mostrar confirmación
        alert("¡Gracias! Te redireccionaremos a WhatsApp para completar la conversación.");

        // Limpiar formulario
        contactForm.reset();
    });
}

/* Efecto de inclinación suave en tarjetas */
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll(".services, .services_2");
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
        });
    });
});

/* ============ EFECTO DE SCROLL SUAVE ============ */
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal');

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            /* Si el elemento entra en la pantalla */
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                /* Dejamos de observarlo para que la animación solo ocurra la primera vez */
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15, /* Se activa cuando el 15% del elemento es visible */
        rootMargin: "0px 0px -50px 0px" /* Activa la animación un poquito antes de llegar al borde */
    });

    /* Le decimos al observer que vigile cada elemento con la clase .reveal */
    revealElements.forEach(el => {
        scrollObserver.observe(el);
    });
});
