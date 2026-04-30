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

## 🛠️ Setup y Despliegue

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase
1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. Ve a Settings > API y copia la URL y la anon key
3. Crea un archivo `.env.local` con:
```
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 3. Configurar base de datos en Supabase
Ejecuta esta SQL en el SQL Editor de Supabase:
```sql
-- Crear tabla de perfiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 4. Desplegar en Vercel
```bash
npm install -g vercel
vercel --prod
```

### 5. Configurar variables de entorno en Vercel
En el dashboard de Vercel, ve a Settings > Environment Variables y agrega:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

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

## 🚀 Cómo Usar

1. Reemplaza `+5491234567890` con tu número real en todos los archivos (busca y reemplaza)
2. Actualiza `info@webpro.com` con tu email real
3. Verifica que la imagen `imagenes/fondo.jpg` existe
4. Todos los CSS están en `pages.css` (un solo archivo para mantener)
5. Todos los scripts de páginas están en `script-pages.js`

## 📝 Cambios Realizados en index.html

- Links del menú ahora apuntan a las nuevas páginas
- Se agregó referencia a `pages.css` para consistencia

## ⚙️ Personalización

Para cambiar números, emails o información:
- Busca y reemplaza en todos los archivos:
  - `+5491234567890` → Tu número WhatsApp
  - `info@webpro.com` → Tu email
  - `WebPro` → Tu nombre de empresa

## 🎯 Estructura de Carpetas Recomendada

```
proyecto/
├── index.html
├── servicios.html
├── contacto.html
├── style.css (original)
├── style2.css (original)
├── pages.css (nueva)
├── script.js (original)
├── script2.js (original)
├── script-pages.js (nueva)
└── imagenes/
    └── fondo.jpg
```

---

**Nota**: Todos los estilos son responsivos y hay soporte completo para dispositivos móviles.
