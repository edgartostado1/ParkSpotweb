/**
 * src/controllers/authController.js
 * ---------------------------------------------------------------------------
 * Controlador de autenticacion: login, registro, logout.
 * Aqui esta la validacion del lado servidor, la creacion de la sesion
 * y la redireccion segun el rol del usuario.
 * ---------------------------------------------------------------------------
 */

const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');

/** Toma el mensaje flash de la sesion y lo borra (se muestra una sola vez). */
function popFlash(req) {
  const flash = req.session.flash || {};
  req.session.flash = null;
  return flash;
}

/** Redirige al panel correcto segun el rol. */
function redirigirPorRol(req, res) {
  if (req.session.user.nombre_rol.toLowerCase() === 'administrador') {
    return res.redirect('/admin');
  }
  return res.redirect('/usuario');
}

const authController = {
  // GET /login
  loginForm(req, res) {
    if (req.session.user) return redirigirPorRol(req, res);
    res.render('auth/login', { titulo: 'Iniciar sesion', flash: popFlash(req) });
  },

  // POST /login
  async procesarLogin(req, res) {
    const correo = (req.body.correo || '').trim();
    const contrasena = req.body.contrasena || '';

    if (!correo || !contrasena) {
      req.session.flash = { error: 'Completa correo y contrasena.' };
      return res.redirect('/login');
    }

    try {
      const usuario = await Usuario.verificarCredenciales(correo, contrasena);

      if (!usuario) {
        req.session.flash = { error: 'Correo o contrasena incorrectos.' };
        return res.redirect('/login');
      }

      if (usuario.estado_cuenta && usuario.estado_cuenta.toLowerCase() !== 'activo') {
        req.session.flash = { error: 'Tu cuenta no esta activa. Contacta al administrador.' };
        return res.redirect('/login');
      }

      // Regenerar la sesion previene fijacion de sesion.
      req.session.regenerate((err) => {
        if (err) {
          req.session.flash = { error: 'Error al iniciar sesion.' };
          return res.redirect('/login');
        }
        req.session.user = {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          id_rol: usuario.id_rol,
          nombre_rol: usuario.nombre_rol,
        };
        redirigirPorRol(req, res);
      });
    } catch (e) {
      console.error(e);
      req.session.flash = { error: 'Error de servidor. Revisa la conexion a la base de datos.' };
      res.redirect('/login');
    }
  },

  // GET /register
  registerForm(req, res) {
    if (req.session.user) return redirigirPorRol(req, res);
    res.render('auth/register', { titulo: 'Crear cuenta', flash: popFlash(req) });
  },

  // POST /register
  async procesarRegister(req, res) {
    const nombre = (req.body.nombre || '').trim();
    const apellido = (req.body.apellido || '').trim();
    const correo = (req.body.correo || '').trim();
    const telefono = (req.body.telefono || '').trim();
    const contrasena = req.body.contrasena || '';
    const confirmar = req.body.confirmar || '';

    const errores = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nombre || !apellido) errores.push('Nombre y apellido son obligatorios.');
    if (!emailRegex.test(correo)) errores.push('El correo no tiene un formato valido.');
    if (contrasena.length < 8) errores.push('La contrasena debe tener al menos 8 caracteres.');
    if (contrasena !== confirmar) errores.push('Las contrasenas no coinciden.');

    try {
      if (errores.length === 0 && await Usuario.correoExiste(correo)) {
        errores.push('Ya existe una cuenta con ese correo.');
      }

      if (errores.length > 0) {
        req.session.flash = { error: errores.join(' ') };
        return res.redirect('/register');
      }

      const idRolUsuario = await Rol.idPorNombre('Usuario');
      if (!idRolUsuario) {
        req.session.flash = { error: 'No existe el rol "Usuario". Ejecuta el script SQL de roles.' };
        return res.redirect('/register');
      }

      await Usuario.crear({ nombre, apellido, correo, telefono, contrasena, id_rol: idRolUsuario });

      req.session.flash = { success: 'Cuenta creada. Ya puedes iniciar sesion.' };
      res.redirect('/login');
    } catch (e) {
      console.error(e);
      req.session.flash = { error: 'No se pudo crear la cuenta. Revisa la conexion a la base de datos.' };
      res.redirect('/register');
    }
  },

  // GET /logout
  logout(req, res) {
    req.session.destroy(() => res.redirect('/login'));
  },
};

module.exports = authController;
