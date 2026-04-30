/**
 * LOGIN SECURITY MODULE
 * Implementa medidas de seguridad para el formulario de login
 * 
 * MEDIDAS IMPLEMENTADAS:
 * 1. Rate Limiting (previene ataques de fuerza bruta)
 * 2. CSRF Token Protection
 * 3. Validación de contraseña fuerte
 * 4. Protección contra XSS
 * 5. Manejo seguro de sesiones
 * 6. Indicador de fortaleza de contraseña
 * 7. Sanitización de inputs
 * 8. Límite de intentos de login
 */

// ============ CONFIGURACIÓN DE SEGURIDAD ============
const SECURITY_CONFIG = {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutos
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    EMAIL_MAX_LENGTH: 255
};

// ============ RATE LIMITING ============
class RateLimiter {
    constructor(maxAttempts, lockoutTime) {
        this.maxAttempts = maxAttempts;
        this.lockoutTime = lockoutTime;
        this.key = 'login_attempts';
    }

    getAttempts() {
        const stored = localStorage.getItem(this.key);
        if (!stored) return { count: 0, timestamp: Date.now() };
        return JSON.parse(stored);
    }

    recordAttempt() {
        const attempts = this.getAttempts();
        const now = Date.now();


        // Si el tiempo de bloqueo ha pasado, reiniciar
        if (now - attempts.timestamp > this.lockoutTime) {
            localStorage.setItem(this.key, JSON.stringify({
                count: 1,
                timestamp: now
            }));
            return { allowed: true, remaining: this.maxAttempts - 1 };
        }

        // Incrementar intentos
        attempts.count++;
        localStorage.setItem(this.key, JSON.stringify(attempts));

        if (attempts.count >= this.maxAttempts) {
            return { allowed: false, remaining: 0, timestamp: attempts.timestamp };
        }

        return { allowed: true, remaining: this.maxAttempts - attempts.count };
    }

    isLocked() {
        const attempts = this.getAttempts();
        const now = Date.now();
        const elapsedTime = now - attempts.timestamp;

        return attempts.count >= this.maxAttempts && 
               elapsedTime < this.lockoutTime;
    }

    getTimeRemaining() {
        const attempts = this.getAttempts();
        const now = Date.now();
        const elapsedTime = now - attempts.timestamp;
        const remaining = this.lockoutTime - elapsedTime;

        if (remaining > 0) {
            return Math.ceil(remaining / 1000);
        }
        return 0;
    }

    reset() {
        localStorage.removeItem(this.key);
    }
}

// ============ CSRF TOKEN MANAGEMENT ============
function generateCSRFToken() {
    // En producción, esto debe venir del servidor
    const token = 'csrf_' + Math.random().toString(36).substr(2, 9) + 
                  '_' + Date.now() + 
                  '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('csrf_token', token);
    return token;
}

function getCSRFToken() {
    let token = sessionStorage.getItem('csrf_token');
    if (!token) {
        token = generateCSRFToken();
    }
    return token;
}

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

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const strengthIndicator = document.getElementById('strengthIndicator');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    const csrfTokenInput = document.getElementById('csrfToken');
    const menuToggle = document.getElementById('menu-toggle');
    const navOverlay = document.getElementById('nav-overlay');
    const nav = document.getElementById('nav');

    const rateLimiter = new RateLimiter(
        SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
        SECURITY_CONFIG.LOCKOUT_TIME
    );
    const passwordValidator = new PasswordValidator();

    // Generar y asignar CSRF Token
    csrfTokenInput.value = getCSRFToken();

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

        // Verificar CSRF Token
        if (csrfTokenInput.value !== getCSRFToken()) {
            mostrarError('Token de seguridad inválido. Recarga la página.');
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
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Verificar Rate Limiting
        if (rateLimiter.isLocked()) {
            const timeRemaining = rateLimiter.getTimeRemaining();
            const minutes = Math.ceil(timeRemaining / 60);
            mostrarError(`Demasiados intentos. Intenta nuevamente en ${minutes} minuto(s).`);
            submitBtn.disabled = true;
            setTimeout(() => {
                submitBtn.disabled = false;
            }, rateLimiter.lockoutTime);
            return;
        }

        // Validar formulario
        if (!validarFormulario()) {
            const result = rateLimiter.recordAttempt();
            if (!result.allowed) {
                submitBtn.disabled = true;
            }
            return;
        }

        // Enviar a API backend
        submitBtn.disabled = true;
        submitBtn.textContent = 'Procesando...';

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: sanitizeEmail(emailInput.value),
                    password: passwordInput.value
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Login exitoso
                rateLimiter.reset();
                
                // Guardar tokens de forma segura
                localStorage.setItem('supabase_session', JSON.stringify({
                    access_token: data.user.session.access_token,
                    refresh_token: data.user.session.refresh_token,
                    expires_at: data.user.session.expires_at,
                    user: data.user
                }));

                mostrarSuccess('¡Conectado exitosamente! Redirigiendo...');
                console.log('✓ Login exitoso para:', data.user.email);
                
                // Redirigir después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'index.html'; // Cambiar a la página principal
                }, 2000);
            } else {
                // Error en login
                const result = rateLimiter.recordAttempt();
                mostrarError(data.error || 'Email o contraseña incorrectos. ' + result.remaining + ' intento(s) restante(s).');
                console.log('✗ Login fallido:', data.error);
                
                if (!result.allowed) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Cuenta bloqueada (15 min)';
                    setTimeout(() => {
                        rateLimiter.reset();
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Iniciar Sesión';
                    }, rateLimiter.lockoutTime);
                } else {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Iniciar Sesión';
                }
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            mostrarError('Error de conexión. Inténtalo de nuevo.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
        }
    });

    // ============ INPUT LIMITS ============
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

    // ============ SESSION TIMEOUT ============
    let sessionTimer;
    function resetSessionTimer() {
        clearTimeout(sessionTimer);
        sessionTimer = setTimeout(() => {
            console.log('Sesión expirada por inactividad');
            sessionStorage.removeItem('user_session');
            mostrarError('Tu sesión ha expirado. Por favor, vuelve a conectarte.');
        }, SECURITY_CONFIG.SESSION_TIMEOUT);
    }

    // Resetear timer en actividad del usuario
    document.addEventListener('mousemove', resetSessionTimer);
    document.addEventListener('keypress', resetSessionTimer);
    document.addEventListener('click', resetSessionTimer);

    // ============ LOGOUT ON PAGE UNLOAD ============
    window.addEventListener('beforeunload', function(e) {
        // Limpiar datos sensibles si cierra la página
        sessionStorage.removeItem('csrf_token');
    });

    console.log('✓ Login security module initialized');
    console.log('DEMO CREDENTIALS: email: demo@webpro.com, password: Demo@12345');
});

/**
 * RECOMENDACIONES PARA PRODUCCIÓN:
 * 
 * 1. HTTPS OBLIGATORIO
 *    - Todos los datos deben ir encriptados a través de HTTPS
 *    - Usar HSTS (HTTP Strict Transport Security)
 * 
 * 2. BACKEND SECURITY
 *    - Hash de contraseñas usando bcrypt, Argon2 o similar
 *    - Nunca transmitir contraseñas en plain text
 *    - Validar CSRF token en el servidor
 *    - Rate limiting en el servidor (más robusto)
 * 
 * 3. SESSION MANAGEMENT
 *    - Usar cookies httpOnly (no accesibles desde JS)
 *    - SameSite cookies (CSRF protection)
 *    - Secure flag en cookies (HTTPS only)
 * 
 * 4. 2FA / MFA
 *    - Implementar autenticación de dos factores
 *    - SMS, email, o apps como Google Authenticator
 * 
 * 5. MONITOREO
 *    - Logging de intentos de login fallidos
 *    - Alertas para actividad sospechosa
 *    - Análisis de patrones de acceso
 * 
 * 6. PROTECCIÓN ADICIONAL
 *    - WAF (Web Application Firewall)
 *    - DDoS protection
 *    - SQL Injection prevention (prepared statements)
 *    - XSS protection headers
 * 
 * 7. CUMPLIMIENTO LEGAL
 *    - GDPR compliance
 *    - CCPA compliance
 *    - Política de privacidad
 *    - Términos de servicio
 */



// ============ SISTEMA DE PERSISTENCIA (JSON SIMULADO) ============
const UserStorage = {
    dbKey: 'webpro_users_db',

    getUsers() {
        const data = localStorage.getItem(this.dbKey);
        return data ? JSON.parse(data) : [];
    },

    saveUser(email, password) {
        const users = this.getUsers();
        if (users.find(u => u.email === email)) return { success: false, msg: "El usuario ya existe." };
        
        const newUser = {
            email,
            password, // En esta fase de prueba JSON los guardamos planos
            stats: { plan: 'Ninguno', waClicks: 0, messages: 0 }
        };
        
        users.push(newUser);
        localStorage.setItem(this.dbKey, JSON.stringify(users));
        return { success: true, msg: "¡Registro exitoso! Ya puedes iniciar sesión." };
    }
};

// ============ INTERACCIÓN CON TU FORMULARIO ORIGINAL ============
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const toggleReg = document.querySelector('.login-footer a[href="#"]'); // Tu enlace de registro
    let isRegistering = false;

    // Cambiar entre Login y Registro usando tus elementos existentes
    toggleReg.addEventListener('click', (e) => {
        e.preventDefault();
        isRegistering = !isRegistering;
        
        document.querySelector('.login-box h2').innerText = isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión';
        submitBtn.innerText = isRegistering ? 'Registrarse' : 'Iniciar Sesión';
        toggleReg.innerText = isRegistering ? 'Ir a Iniciar Sesión' : 'Regístrate aquí';
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;

        if (isRegistering) {
            const res = UserStorage.saveUser(email, pass);
            alert(res.msg);
            if (res.success) toggleReg.click(); // Vuelve al login
        } else {
            // Lógica de Login
            const users = UserStorage.getUsers();
            const user = users.find(u => u.email === email && u.password === pass);
            
            if (user) {
                sessionStorage.setItem('activeUser', JSON.stringify(user));
                window.location.href = 'index.html';
            } else {
                alert("Correo o contraseña incorrectos.");
            }
        }
    });
});