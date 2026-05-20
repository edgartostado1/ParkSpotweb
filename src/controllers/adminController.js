/**
 * src/controllers/adminController.js
 * ---------------------------------------------------------------------------
 * Panel del Administrador. La proteccion por rol se aplica en las rutas
 * mediante el middleware requireRole('Administrador').
 * ---------------------------------------------------------------------------
 */

const adminController = {
  // GET /admin
  dashboard(req, res) {
    res.render('admin/dashboard', {
      titulo: 'Panel de Administrador',
      user: req.session.user,
    });
  },
};

module.exports = adminController;
