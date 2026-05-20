/**
 * src/middleware/auth.js
 * ---------------------------------------------------------------------------
 * Middlewares de proteccion de rutas.
 *   - requireLogin: exige sesion iniciada.
 *   - requireRole(nombre): exige un rol concreto.
 * ---------------------------------------------------------------------------
 */

function requireLogin(req, res, next) {
  if (!req.session.user) {
    req.session.flash = { error: 'Debes iniciar sesion para continuar.' };
    return res.redirect('/login');
  }
  next();
}

function requireRole(nombreRol) {
  return function (req, res, next) {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    if (req.session.user.nombre_rol.toLowerCase() !== nombreRol.toLowerCase()) {
      return res.status(403).send('Acceso denegado: no tienes permisos para ver esta pagina.');
    }
    next();
  };
}

module.exports = { requireLogin, requireRole };
