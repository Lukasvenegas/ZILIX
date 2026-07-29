document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const profileForm = document.getElementById('profileForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const saveBtn = document.getElementById('saveBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const messageBox = document.getElementById('messageBox');
    const errorBox = document.getElementById('errorBox');
    const userIdEl = document.getElementById('userId');
    const createdAtEl = document.getElementById('createdAt');
    const userRoleEl = document.getElementById('userRole');

    function sanitizeText(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showMessage(message) {
        messageBox.textContent = sanitizeText(message);
        messageBox.style.display = 'block';
        errorBox.style.display = 'none';
    }

    function showError(message) {
        errorBox.textContent = sanitizeText(message);
        errorBox.style.display = 'block';
        messageBox.style.display = 'none';
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.trim());
    }

    function validateName(name) {
        return name.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s\-']+$/.test(name.trim());
    }

    async function fetchProfile() {
        try {
            const response = await fetch('/api/profile', {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                sessionStorage.removeItem('access_token');
                window.location.href = 'login.html';
                return;
            }

            const data = await response.json();
            const user = data.user || {};

            userIdEl.textContent = user.id || 'N/A';
            createdAtEl.textContent = user.created_at ? new Date(user.created_at).toLocaleString('es-CL') : 'N/A';
            userRoleEl.textContent = user.role || 'Usuario';
            nameInput.value = user.name || '';
            emailInput.value = user.email || '';
        } catch (err) {
            showError('No se pudo cargar el perfil. Intenta recargar la página.');
        }
    }

    profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!validateName(name)) {
            showError('Ingresa un nombre válido.');
            return;
        }
        if (!validateEmail(email)) {
            showError('Ingresa un email válido.');
            return;
        }
        if (password && password.length < 8) {
            showError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (password && password !== confirmPassword) {
            showError('Las contraseñas no coinciden.');
            return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = 'Guardando...';

        const payload = { name, email };
        if (password) payload.password = password;

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
                showError(data.error || 'No se pudo actualizar el perfil.');
            } else {
                showMessage(data.message || 'Perfil actualizado correctamente.');
                passwordInput.value = '';
                confirmPasswordInput.value = '';
            }
        } catch (err) {
            showError('Error de conexión. Intenta de nuevo.');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar cambios';
        }
    });

    logoutBtn.addEventListener('click', async () => {
        if (!confirm('¿Quieres cerrar sesión?')) return;
        try {
            await fetch('/api/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: token })
            });
        } catch (err) {
            console.error('Logout error', err);
        } finally {
            sessionStorage.removeItem('access_token');
            window.location.href = 'login.html';
        }
    });

    deleteBtn.addEventListener('click', async () => {
        const confirmed = confirm('Eliminar tu cuenta es irreversible. ¿Deseas continuar?');
        if (!confirmed) return;

        deleteBtn.disabled = true;
        deleteBtn.textContent = 'Eliminando...';

        try {
            const response = await fetch('/api/profile', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ confirm: true })
            });

            const data = await response.json();
            if (!response.ok) {
                showError(data.error || 'No se pudo eliminar la cuenta.');
            } else {
                sessionStorage.removeItem('access_token');
                alert('Tu cuenta ha sido eliminada correctamente.');
                window.location.href = 'register.html';
            }
        } catch (err) {
            showError('Error de conexión. Intenta de nuevo.');
        }
    });

    fetchProfile();
});
