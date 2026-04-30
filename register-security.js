/**
 * REGISTER SECURITY MODULE
 * Implementa medidas de seguridad para el formulario de registro
 */

// ============ CONFIGURACIÓN DE SEGURIDAD ============
const SECURITY_CONFIG = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    EMAIL_MAX_LENGTH: 255,
    NAME_MAX_LENGTH: 255
};

// ============ PASSWORD STRENGTH VALIDATION ============
class PasswordValidator {
    constructor() {
        this.requirements = {
            length: { regex: /.{8,}/, text: "Mínimo 8 caracteres" },
            lowercase: { regex: /[a-z]/, text: "Al menos una minúscula" },
            uppercase: { regex: /[A-Z]/, text: "Al menos una mayúscula" },
            number: { regex: /[0-9]/, text: "Al menos un número" },
            special: { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, text: "Al menos un carácter especial" }
        };
    }

    validate(password) {
        const results = {};
        let metCount = 0;

        Object.keys(this.requirements).forEach(key => {
            results[key] = this.requirements[key].regex.test(password);
            if (results[key]) metCount++;
        });

        return {
            isValid: Object.values(results).every(v => v),
            results: results,
            strength: this.calculateStrength(password, metCount)
        };
    }

    calculateStrength(password, metCount) {
        if (password.length === 0) return 'none';
        if (metCount <= 1 || password.length < 10) return 'weak';
        if (metCount <= 2 || password.length < 12) return 'fair';
        if (metCount <= 3 || password.length < 14) return 'good';
        return 'strong';
    }

    getTextLength(password) {
        return password.length;
    }
}

// ============ INPUT SANITIZATION (Protección contra XSS) ============
function sanitizeInput(input) {
    // Eliminar caracteres peligrosos
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function sanitizeEmail(email) {
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email.trim().toLowerCase() : null;
}

function sanitizeName(name) {
    // Permitir solo letras, espacios, guiones y apóstrofes
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    const sanitized = name.trim();
    return nameRegex.test(sanitized) && sanitized.length >= 2 ? sanitized : null;
}

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const strengthIndicator = document.getElementById('strengthIndicator');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    const menuToggle = document.getElementById('menu-toggle');
    const navOverlay = document.getElementById('nav-overlay');
    const nav = document.getElementById('nav');

    const passwordValidator = new PasswordValidator();

    // ============ PASSWORD STRENGTH MONITOR ============
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const validation = passwordValidator.validate(password);

        if (password.length > 0) {
            strengthIndicator.style.display = 'block';

            // Actualizar barra de fortaleza
            strengthFill.className = 'strength-fill ' + validation.strength;
            
            // Actualizar texto
            const strengthLabels = {
                'weak': 'Débil',
                'fair': 'Regular',
                'good': 'Buena',
                'strong': 'Muy Fuerte'
            };
            strengthText.textContent = 'Fuerza: ' + strengthLabels[validation.strength];

        } else {
            strengthIndicator.style.display = 'none';
        }
    });

    // ============ FORM VALIDATION ============
    function validarFormulario() {
        // Limpiar mensajes previos
        errorMessage.classList.remove('show');
        successMessage.classList.remove('show');

        // Validar nombre
        const sanitizedName = sanitizeName(nameInput.value);
        if (!sanitizedName) {
            mostrarError('Por favor, ingresa un nombre válido (solo letras, espacios, guiones y apóstrofes)');
            return false;
        }

        // Validar email
        const sanitizedEmail = sanitizeEmail(emailInput.value);
        if (!sanitizedEmail) {
            mostrarError('Por favor, ingresa un email válido');
            return false;
        }

        // Validar contraseña
        if (passwordInput.value.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
            mostrarError(`La contraseña debe tener al menos ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} caracteres`);
            return false;
        }

        if (passwordInput.value.length > SECURITY_CONFIG.PASSWORD_MAX_LENGTH) {
            mostrarError(`La contraseña no puede tener más de ${SECURITY_CONFIG.PASSWORD_MAX_LENGTH} caracteres`);
            return false;
        }

        // Validar fortaleza de contraseña
        const validation = passwordValidator.validate(passwordInput.value);
        if (!validation.isValid) {
            mostrarError('La contraseña no cumple con los requisitos mínimos de seguridad');
            return false;
        }

        // Validar confirmación de contraseña
        if (passwordInput.value !== confirmPasswordInput.value) {
            mostrarError('Las contraseñas no coinciden');
            return false;
        }

        return true;
    }

    function mostrarError(mensaje) {
        errorMessage.textContent = '❌ ' + sanitizeInput(mensaje);
        errorMessage.classList.add('show');
    }

    function mostrarSuccess(mensaje) {
        successMessage.textContent = '✓ ' + sanitizeInput(mensaje);
        successMessage.classList.add('show');
    }

    // ============ FORM SUBMISSION ============
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validar formulario
        if (!validarFormulario()) {
            return;
        }

        // Enviar a API backend
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creando cuenta...';

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: sanitizeName(nameInput.value),
                    email: sanitizeEmail(emailInput.value),
                    password: passwordInput.value
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Registro exitoso
                mostrarSuccess(data.message || 'Cuenta creada exitosamente. Revisa tu email para verificar la cuenta.');
                console.log('✓ Registro exitoso para:', data.user.email);
                
                // Limpiar formulario
                registerForm.reset();
                
                // Redirigir a login después de 3 segundos
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            } else {
                // Error en registro
                mostrarError(data.error || 'Error al crear la cuenta. Inténtalo de nuevo.');
                console.log('✗ Registro fallido:', data.error);
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            mostrarError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Crear Cuenta';
        }
    });

    // ============ INPUT LIMITS ============
    nameInput.addEventListener('input', function() {
        if (this.value.length > SECURITY_CONFIG.NAME_MAX_LENGTH) {
            this.value = this.value.substring(0, SECURITY_CONFIG.NAME_MAX_LENGTH);
        }
    });

    emailInput.addEventListener('input', function() {
        if (this.value.length > SECURITY_CONFIG.EMAIL_MAX_LENGTH) {
            this.value = this.value.substring(0, SECURITY_CONFIG.EMAIL_MAX_LENGTH);
        }
    });

    passwordInput.addEventListener('input', function() {
        if (this.value.length > SECURITY_CONFIG.PASSWORD_MAX_LENGTH) {
            this.value = this.value.substring(0, SECURITY_CONFIG.PASSWORD_MAX_LENGTH);
        }
    });

    confirmPasswordInput.addEventListener('input', function() {
        if (this.value.length > SECURITY_CONFIG.PASSWORD_MAX_LENGTH) {
            this.value = this.value.substring(0, SECURITY_CONFIG.PASSWORD_MAX_LENGTH);
        }
    });

    console.log('✓ Register security module initialized');
});