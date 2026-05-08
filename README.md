# Zilix - Aplicación Web con Autenticación Segura

## 🚀 Características

- **Autenticación segura** con Supabase
- **Backend serverless** compatible con Vercel
- **Frontend responsive** con diseño moderno
- **Sistema de registro y login** con validaciones avanzadas
- **Protección contra ataques** (XSS, CSRF, rate limiting)

## 📁 Estructura del Proyecto

### Páginas HTML
- `index.html` - Página principal
- `login.html` - Página de inicio de sesión
- `register.html` - Página de registro
- `servicios.html` - Página de servicios
- `contacto.html` - Página de contacto

### Backend (API)
- `api/register.js` - Endpoint de registro
- `api/login.js` - Endpoint de login
- `api/logout.js` - Endpoint de logout
- `api/profile.js` - Endpoint para obtener perfil

### Scripts de Seguridad
- `login-security.js` - Validaciones y seguridad para login
- `register-security.js` - Validaciones y seguridad para registro
- `supabase-config.js` - Configuración de Supabase

 

## 🔒 Medidas de Seguridad Implementadas
### Frontend
- ✅ Validación de contraseñas fuertes
- ✅ Sanitización de inputs (protección XSS)
- ✅ Rate limiting en login
- ✅ CSRF tokens
- ✅ Content Security Policy (CSP)

### Backend
- ✅ Hash de contraseñas con Supabase Auth
- ✅ JWT tokens para sesiones
- ✅ Validación de emails
- ✅ Protección contra inyección SQL (ORM de Supabase)

## 🎨 Diseño

- **Tema oscuro** (#0f172a, #020617)
- **Color acento** cian (#38bdf8)
- **Tipografía** Poppins
- **Responsive** para móvil, tablet y desktop

## 📱 Funcionalidades

- **Registro de usuarios** con verificación de email
- **Inicio de sesión** seguro
- **Gestión de sesiones** con tokens JWT
- **Perfil de usuario** básico
- **Navegación responsive**
- **Formularios de contacto** integrados con WhatsApp
- Formularios interactivos
- Footer con 3 columnas
- Botón WhatsApp flotante con animación pulse

✅ **Responsividad**
- Mobile-first approach
- Breakpoints: 768px y 480px
- Menú hamburguesa en móvil
- Grillas adaptables

## 🔗 Navegación

Todas las páginas están interconectadas mediante:
- **Menú Principal**: Inicio → Servicios → Contratación → Condiciones
- **Footer**: Enlaces a todas las secciones
- **Botón WhatsApp**: Disponible en todas las páginas

## 📱 Funcionalidades

### Formulario de Contacto
- Recoge: Nombre, Email, Teléfono, Plan, Mensaje
- Al enviar, abre WhatsApp con el mensaje pre-llenado
- Compatible con backend para email (comentado en código)

### Menú Responsivo
- Desktop: Menú horizontal
- Mobile: Hamburguesa. Se cierra al hacer clic en un enlace

### Links a WhatsApp
- Botón flotante en todas las páginas
- Links en secciones de contacto
- Formatos predefinidos para mensajes



**Nota**: Todos los estilos son responsivos y hay soporte completo para dispositivos móviles.
