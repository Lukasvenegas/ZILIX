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
        const urlWhatsApp = `https://wa.me/5691234567?text=${encodeURIComponent(textoWhatsApp)}`;

        // Abrir WhatsApp
        window.open(urlWhatsApp, "_blank");

        // Mostrar confirmación
        alert("¡Gracias! Te redireccionaremos a WhatsApp para completar la conversación.");

        // Limpiar formulario
        contactForm.reset();
    });
}
