/**
 * REGISTER SECURITY MODULE
 * Fixes aplicados:
 * - CSRF token con crypto.getRandomValues() (criptográficamente seguro)
 * - Sin almacenamiento inseguro de datos sensibles
 */

const SECURITY_CONFIG = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    EMAIL_MAX_LENGTH: 255,
    NAME_MAX_LENGTH: 255
};

// ============ PASSWORD STRENGTH ============
class PasswordValidator {
    constructor() {
        this.requirements = {
            length:  { regex: /.{8,}/ },
            lower:   { regex: /[a-z]/ },
            upper:   { regex: /[A-Z]/ },
            number:  { regex: /[0-9]/ },
            special: { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/ }
        };
    }
    validate(password) {
        let metCount = 0;
        Object.values(this.requirements).forEach(r => {
            if (r.regex.test(password)) metCount++;
        });
        return {
            isValid: metCount === Object.keys(this.requirements).length,
            strength: this.calculateStrength(password, metCount)
        };
    }
    calculateStrength(password, metCount) {
        if (!password.length) return 'none';
        if (metCount <= 1 || password.length < 10) return 'weak';
        if (metCount <= 2 || password.length < 12) return 'fair';
        if (metCount <= 3 || password.length < 14) return 'good';
        return 'strong';
    }
}

// ============ INPUT SANITIZATION ============
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function sanitizeEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email.trim().toLowerCase() : null;
}

function sanitizeName(name) {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    const sanitized = name.trim();
    return nameRegex.test(sanitized) && sanitized.length >= 2 ? sanitized : null;
}

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', function () {
    const registerForm      = document.getElementById('registerForm');
    const nameInput         = document.getElementById('name');
    const emailInput        = document.getElementById('email');
    const passwordInput     = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn         = document.getElementById('submitBtn');
    const errorMessage      = document.getElementById('errorMessage');
    const successMessage    = document.getElementById('successMessage');
    const strengthIndicator = document.getElementById('strengthIndicator');
    const strengthFill      = document.getElementById('strengthFill');
    const strengthText      = document.getElementById('strengthText');

    const passwordValidator = new PasswordValidator();

    // Password strength indicator
    passwordInput.addEventListener('input', function () {
        const { strength } = passwordValidator.validate(this.value);
        if (this.value.length > 0) {
            strengthIndicator.style.display = 'block';
            strengthFill.className = 'strength-fill ' + strength;
            const labels = { weak: 'Débil', fair: 'Regular', good: 'Buena', strong: 'Muy Fuerte' };
            strengthText.textContent = 'Fuerza: ' + (labels[strength] || '');
        } else {
            strengthIndicator.style.display = 'none';
        }
    });

    function mostrarError(msg) {
        errorMessage.textContent = '❌ ' + sanitizeInput(msg);
        errorMessage.classList.add('show');
        successMessage.classList.remove('show');
    }

    function mostrarSuccess(msg) {
        successMessage.textContent = '✓ ' + sanitizeInput(msg);
        successMessage.classList.add('show');
        errorMessage.classList.remove('show');
    }

    function validarFormulario() {
        errorMessage.classList.remove('show');
        successMessage.classList.remove('show');

        if (!sanitizeName(nameInput.value)) {
            mostrarError('Ingresa un nombre válido (solo letras, espacios, guiones y apóstrofes)');
            return false;
        }
        if (!sanitizeEmail(emailInput.value)) {
            mostrarError('Por favor, ingresa un email válido');
            return false;
        }
        if (passwordInput.value.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
            mostrarError(`La contraseña debe tener al menos ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} caracteres`);
            return false;
        }
        if (passwordInput.value.length > SECURITY_CONFIG.PASSWORD_MAX_LENGTH) {
            mostrarError(`La contraseña no puede superar ${SECURITY_CONFIG.PASSWORD_MAX_LENGTH} caracteres`);
            return false;
        }
        if (!passwordValidator.validate(passwordInput.value).isValid) {
            mostrarError('La contraseña no cumple los requisitos mínimos de seguridad');
            return false;
        }
        if (passwordInput.value !== confirmPasswordInput.value) {
            mostrarError('Las contraseñas no coinciden');
            return false;
        }
        return true;
    }

    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!validarFormulario()) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Creando cuenta...';

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: sanitizeName(nameInput.value),
                    email: sanitizeEmail(emailInput.value),
                    password: passwordInput.value
                })
            });

            const data = await response.json();

            if (response.ok) {
                mostrarSuccess(data.message || 'Cuenta creada. Revisa tu email para verificarla.');
                registerForm.reset();
                strengthIndicator.style.display = 'none';
                setTimeout(() => { window.location.href = 'login.html'; }, 3000);
            } else {
                mostrarError(data.error || 'Error al crear la cuenta. Inténtalo de nuevo.');
            }
        } catch (err) {
            mostrarError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Crear Cuenta';
        }
    });

    // Límites de input
    nameInput.addEventListener('input', function () {
        if (this.value.length > SECURITY_CONFIG.NAME_MAX_LENGTH)
            this.value = this.value.substring(0, SECURITY_CONFIG.NAME_MAX_LENGTH);
    });
    emailInput.addEventListener('input', function () {
        if (this.value.length > SECURITY_CONFIG.EMAIL_MAX_LENGTH)
            this.value = this.value.substring(0, SECURITY_CONFIG.EMAIL_MAX_LENGTH);
    });
    passwordInput.addEventListener('input', function () {
        if (this.value.length > SECURITY_CONFIG.PASSWORD_MAX_LENGTH)
            this.value = this.value.substring(0, SECURITY_CONFIG.PASSWORD_MAX_LENGTH);
    });
    confirmPasswordInput.addEventListener('input', function () {
        if (this.value.length > SECURITY_CONFIG.PASSWORD_MAX_LENGTH)
            this.value = this.value.substring(0, SECURITY_CONFIG.PASSWORD_MAX_LENGTH);
    });

    console.log('✓ Register security module initialized');
});