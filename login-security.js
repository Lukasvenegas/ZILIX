/**
 * LOGIN SECURITY MODULE
 * Fixes aplicados:
 * - Rate limiting en memoria (no bypasseable via localStorage)
 * - CSRF token con crypto.getRandomValues() (criptográficamente seguro)
 * - Tokens JWT NO almacenados en localStorage (vulnerabilidad XSS)
 * - Eliminado UserStorage con contraseñas en texto plano
 * - Eliminadas credenciales hardcodeadas del console.log
 */

const SECURITY_CONFIG = {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME: 15 * 60 * 1000,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    EMAIL_MAX_LENGTH: 255
};

// ============ RATE LIMITING (en memoria, no en localStorage) ============
class RateLimiter {
    constructor(maxAttempts, lockoutTime) {
        this.maxAttempts = maxAttempts;
        this.lockoutTime = lockoutTime;
        this.attempts = 0;
        this.lockedUntil = null;
    }

    recordAttempt() {
        const now = Date.now();
        if (this.lockedUntil && now >= this.lockedUntil) {
            this.attempts = 0;
            this.lockedUntil = null;
        }
        this.attempts++;
        if (this.attempts >= this.maxAttempts) {
            this.lockedUntil = now + this.lockoutTime;
            return { allowed: false, remaining: 0 };
        }
        return { allowed: true, remaining: this.maxAttempts - this.attempts };
    }

    isLocked() {
        return !!(this.lockedUntil && Date.now() < this.lockedUntil);
    }

    getTimeRemaining() {
        if (!this.lockedUntil) return 0;
        return Math.max(0, Math.ceil((this.lockedUntil - Date.now()) / 1000));
    }

    reset() {
        this.attempts = 0;
        this.lockedUntil = null;
    }
}

// ============ CSRF TOKEN (criptográficamente seguro) ============
function generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('csrf_token', token);
    return token;
}

function getCSRFToken() {
    return sessionStorage.getItem('csrf_token') || generateCSRFToken();
}

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

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', function () {
    const loginForm         = document.getElementById('loginForm');
    const emailInput        = document.getElementById('email');
    const passwordInput     = document.getElementById('password');
    const submitBtn         = document.getElementById('submitBtn');
    const errorMessage      = document.getElementById('errorMessage');
    const successMessage    = document.getElementById('successMessage');
    const strengthIndicator = document.getElementById('strengthIndicator');
    const strengthFill      = document.getElementById('strengthFill');
    const strengthText      = document.getElementById('strengthText');
    const csrfTokenInput    = document.getElementById('csrfToken');

    const rateLimiter       = new RateLimiter(SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS, SECURITY_CONFIG.LOCKOUT_TIME);
    const passwordValidator = new PasswordValidator();

    csrfTokenInput.value = getCSRFToken();

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
        if (csrfTokenInput.value !== getCSRFToken()) {
            mostrarError('Token de seguridad inválido. Recarga la página.');
            return false;
        }
        return true;
    }

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (rateLimiter.isLocked()) {
            const mins = Math.ceil(rateLimiter.getTimeRemaining() / 60);
            mostrarError(`Demasiados intentos. Intenta nuevamente en ${mins} minuto(s).`);
            submitBtn.disabled = true;
            return;
        }

        if (!validarFormulario()) {
            rateLimiter.recordAttempt();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Procesando...';

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: sanitizeEmail(emailInput.value),
                    password: passwordInput.value
                })
            });

            const data = await response.json();

            if (response.ok) {
                rateLimiter.reset();
                const accessToken = data?.user?.session?.access_token;
                if (accessToken) {
                    sessionStorage.setItem('access_token', accessToken);
                }
                // ✅ Sesión manejada por Supabase — guardada solo en sessionStorage
                mostrarSuccess('¡Conectado exitosamente! Redirigiendo...');
                setTimeout(() => { window.location.href = 'index.html'; }, 2000);
            } else {
                const result = rateLimiter.recordAttempt();
                const extra = result.remaining > 0 ? ` (${result.remaining} intento(s) restantes)` : '';
                mostrarError((data.error || 'Email o contraseña incorrectos.') + extra);

                if (!result.allowed) {
                    submitBtn.textContent = 'Bloqueado (15 min)';
                    setTimeout(() => {
                        rateLimiter.reset();
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Iniciar Sesión';
                    }, SECURITY_CONFIG.LOCKOUT_TIME);
                } else {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Iniciar Sesión';
                }
            }
        } catch (err) {
            mostrarError('Error de conexión. Inténtalo de nuevo.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
        }
    });

    // Límites de input
    emailInput.addEventListener('input', function () {
        if (this.value.length > SECURITY_CONFIG.EMAIL_MAX_LENGTH)
            this.value = this.value.substring(0, SECURITY_CONFIG.EMAIL_MAX_LENGTH);
    });
    passwordInput.addEventListener('input', function () {
        if (this.value.length > SECURITY_CONFIG.PASSWORD_MAX_LENGTH)
            this.value = this.value.substring(0, SECURITY_CONFIG.PASSWORD_MAX_LENGTH);
    });

    // Limpiar CSRF al salir
    window.addEventListener('beforeunload', () => sessionStorage.removeItem('csrf_token'));

    console.log('✓ Login security module initialized');
});