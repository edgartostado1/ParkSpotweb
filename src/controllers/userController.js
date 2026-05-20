/**
 * src/controllers/userController.js
 * ---------------------------------------------------------------------------
 * Panel del Usuario. Protegido con requireLogin en las rutas.
 * ---------------------------------------------------------------------------
 */

const userController = {
  // GET /usuario
  dashboard(req, res) {
    res.render('user/dashboard', {
      titulo: 'Mi panel',
      user: req.session.user,
    });
  },
};

module.exports = userController;
