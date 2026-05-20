/* =========================================================================
   sql/01_roles_y_admin.sql  ·  ParkSpot
   Inserta los roles base y un usuario administrador de prueba.
   Ejecútalo en tu base de datos DESPUÉS de crear las tablas.
   ========================================================================= */

USE ParkSpot;   -- cambia el nombre si tu base se llama distinto
GO

/* ---------- 1) Roles ---------- */
IF NOT EXISTS (SELECT 1 FROM Roles WHERE nombre_rol = 'Administrador')
    INSERT INTO Roles (nombre_rol, descripcion)
    VALUES ('Administrador', 'Acceso total al sistema y panel de administración');

IF NOT EXISTS (SELECT 1 FROM Roles WHERE nombre_rol = 'Usuario')
    INSERT INTO Roles (nombre_rol, descripcion)
    VALUES ('Usuario', 'Cliente que reserva espacios de estacionamiento');
GO

/* ---------- 2) Usuario administrador de prueba ----------
   Correo:      admin@parkspot.com
   Contraseña:  Admin1234

   El valor de hash_contrasena es un hash bcrypt generado con PHP
   (password_hash('Admin1234', PASSWORD_BCRYPT)). PHP lo verificará con
   password_verify(). Puedes iniciar sesión directamente con estas credenciales.
*/
IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE correo = 'admin@parkspot.com')
BEGIN
    INSERT INTO Usuarios
        (nombre, apellido, correo, hash_contrasena, telefono,
         fecha_registro, estado_cuenta, id_rol)
    VALUES
        ('Admin', 'ParkSpot', 'admin@parkspot.com',
         '$2b$10$4yMVZBCGpLW1BWr3bsnGm.qkSH7aq2vLNPE5aDbyx9h/jYPvZR8d6',
         NULL, CAST(GETDATE() AS DATE), 'activo',
         (SELECT id_rol FROM Roles WHERE nombre_rol = 'Administrador'));
END
GO

SELECT * FROM Roles;
SELECT id_usuario, nombre, correo, estado_cuenta, id_rol FROM Usuarios;
GO
