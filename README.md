# ParkSpot · Sistema de autenticación (Node.js + Express + SQL Server)

Aplicación web para gestión de estacionamiento. Esta primera entrega incluye el
**sistema de autenticación completo**: registro, login, contraseñas hasheadas,
sesiones y redirección según rol (Administrador / Usuario), con diseño moderno
tipo SaaS y arquitectura **MVC sencilla**.

---

## 1. Estructura del proyecto y qué hace cada archivo

```
ParkSpotAPP/
│
├── app.js                    → PUNTO DE ENTRADA: configura Express, EJS, sesiones y monta las rutas
├── package.json              → dependencias y scripts (npm start / npm run dev)
├── .env.example              → plantilla de variables de entorno (cópiala como .env)
│
├── config/
│   └── db.js                 → conexión a SQL Server con "mssql" (pool de conexiones)
│
├── src/                      → tu aplicación (MVC)
│   ├── models/               → MODELO: acceso a la base de datos
│   │   ├── Usuario.js         → crear usuario, buscar por correo, verificar credenciales (bcrypt)
│   │   └── Rol.js             → consultar roles (obtener id del rol "Usuario", etc.)
│   │
│   ├── controllers/          → CONTROLADOR: lógica y flujo
│   │   ├── authController.js   → login, registro, logout, redirección por rol
│   │   ├── adminController.js  → panel del administrador
│   │   └── userController.js   → panel del usuario
│   │
│   ├── middleware/
│   │   └── auth.js            → requireLogin y requireRole (protección de rutas)
│   │
│   ├── routes/
│   │   └── index.js           → define las URLs y las asocia a los controladores
│   │
│   └── views/                → VISTA: plantillas EJS (HTML)
│       ├── partials/
│       │   ├── header.ejs      → cabecera HTML común
│       │   └── footer.ejs      → pie HTML común
│       ├── auth/
│       │   ├── login.ejs       → pantalla de inicio de sesión
│       │   └── register.ejs    → pantalla de registro
│       ├── admin/
│       │   └── dashboard.ejs   → panel del administrador
│       └── user/
│           └── dashboard.ejs   → panel del usuario
│
├── public/                   → archivos estáticos (servidos tal cual)
│   ├── css/
│   │   └── style.css         → diseño SaaS (login, registro y paneles)
│   └── js/
│       └── validations.js    → validaciones del formulario en el navegador
│
├── sql/
│   └── 01_roles_y_admin.sql  → inserta roles base + un admin de prueba
│
└── README.md                 → este archivo
```

### ¿Dónde va cada tipo de código? (resumen MVC)

- **¿Quieres tocar la base de datos?** → un archivo en `src/models/`.
- **¿Quieres lógica/flujo (qué pasa al pulsar un botón)?** → `src/controllers/`.
- **¿Quieres cambiar lo que se ve (HTML)?** → `src/views/` (archivos `.ejs`).
- **¿Una URL nueva?** → añádela en `src/routes/index.js`.

---

## 2. Requisitos

1. **Node.js 18+** (incluye npm).
2. **SQL Server** (Express vale) con tu base de datos ya creada (las tablas que enviaste).
3. **ODBC Driver 17 o 18 for SQL Server** instalado en Windows (necesario para la
   Autenticación de Windows con `msnodesqlv8`). Descarga: busca "Microsoft ODBC Driver for SQL Server".

---

## 3. Puesta en marcha

1. **Crea las tablas** en SQL Server (el script que ya tienes).
2. **Inserta roles y admin de prueba**: ejecuta `sql/01_roles_y_admin.sql`.
3. **Instala dependencias**:
   ```bash
   npm install
   ```
4. **Configura el entorno**: copia `.env.example` como `.env`. La app usa
   **Autenticación de Windows** (tu cuenta de Windows, igual que en SSMS), así que
   NO necesitas usuario ni contraseña:
   ```
   DB_HOST=localhost
   DB_INSTANCE=SQLEXPRESS
   DB_NAME=ParkSpot
   DB_TRUST_CERT=true
   ```
   - `DB_INSTANCE` es el nombre de tu instancia (en tu caso `SQLEXPRESS`). El servidor
     resultante será `localhost\SQLEXPRESS`.
   - Si tu SQL Server NO usa instancia con nombre, deja `DB_INSTANCE=` vacío.
5. **Arranca el servidor**:
   ```bash
   npm start
   ```
   (o `npm run dev` para que se reinicie al guardar cambios)
6. Abre **http://localhost:3000/**

> **Habilitar TCP/IP**: si la conexión falla, abre *SQL Server Configuration Manager*
> y activa el protocolo **TCP/IP** para tu instancia, luego reinicia el servicio.

---

## 4. Credenciales de prueba

| Rol           | Correo               | Contraseña |
|---------------|----------------------|------------|
| Administrador | admin@parkspot.com   | Admin1234  |

Los usuarios nuevos que se registren se crean automáticamente con el rol **Usuario**.

---

## 5. Cómo funciona la autenticación (flujo)

1. El usuario abre `/login` o `/register` → los sirve `authController`.
2. Al registrarse, `authController.procesarRegister` valida los datos, comprueba
   que el correo no exista y llama a `Usuario.crear()`, que guarda la contraseña
   **hasheada con bcrypt**.
3. Al iniciar sesión, `Usuario.verificarCredenciales()` compara con
   `bcrypt.compare()`. Si es correcto, se guarda el usuario en `req.session.user`.
4. Según el rol, se redirige a `/admin` (Administrador) o `/usuario` (Usuario).
5. Los middlewares `requireLogin` y `requireRole` protegen los paneles.

---

## 6. Seguridad incluida

- Contraseñas **hasheadas con bcrypt** (nunca en texto plano).
- **Consultas parametrizadas** (mssql `request().input()`) → protección contra inyección SQL.
- `req.session.regenerate()` al iniciar sesión → evita fijación de sesión.
- Escape automático de EJS con `<%= %>` en las vistas → evita XSS.
- Validación **doble**: en el navegador (JS) y en el servidor (Node).

---

## 7. Próximos pasos sugeridos

Con esta base MVC ya puedes ir añadiendo los siguientes módulos de ParkSpot
(espacios, reservas, pagos, tickets, reportes) creando su modelo en `src/models`,
su controlador en `src/controllers`, sus vistas en `src/views` y sus rutas en
`src/routes/index.js`, siguiendo exactamente el mismo patrón.
