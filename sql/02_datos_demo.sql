/* =========================================================================
   sql/02_datos_demo.sql  ·  ParkSpot
   Datos de ejemplo para probar el modulo de estacionamientos y reservas:
   tipos de espacio, un estacionamiento, tarifas y varios espacios.
   Ejecutalo DESPUES de crear las tablas y de 01_roles_y_admin.sql.
   ========================================================================= */

USE ParkSpot;   -- cambia el nombre si tu base se llama distinto
GO

/* ---------- 1) Tipos de espacio ---------- */
IF NOT EXISTS (SELECT 1 FROM TiposEspacio WHERE nombre_tipo = 'Normal')
    INSERT INTO TiposEspacio (nombre_tipo, descripcion) VALUES ('Normal', 'Espacio estandar para autos');
IF NOT EXISTS (SELECT 1 FROM TiposEspacio WHERE nombre_tipo = 'Discapacitado')
    INSERT INTO TiposEspacio (nombre_tipo, descripcion) VALUES ('Discapacitado', 'Espacio reservado para personas con discapacidad');
IF NOT EXISTS (SELECT 1 FROM TiposEspacio WHERE nombre_tipo = 'Moto')
    INSERT INTO TiposEspacio (nombre_tipo, descripcion) VALUES ('Moto', 'Espacio para motocicletas');
GO

/* ---------- 2) Estacionamiento ---------- */
IF NOT EXISTS (SELECT 1 FROM Estacionamientos WHERE nombre = 'ParkSpot Centro')
    INSERT INTO Estacionamientos (nombre, direccion, capacidad_total, horario_apertura, horario_cierre)
    VALUES ('ParkSpot Centro', 'Av. Principal 123, Centro', 12, '07:00', '22:00');
GO

/* ---------- 3) Tarifas (por tipo de espacio) ---------- */
DECLARE @tNormal INT = (SELECT id_tipo_espacio FROM TiposEspacio WHERE nombre_tipo = 'Normal');
DECLARE @tDisc   INT = (SELECT id_tipo_espacio FROM TiposEspacio WHERE nombre_tipo = 'Discapacitado');
DECLARE @tMoto   INT = (SELECT id_tipo_espacio FROM TiposEspacio WHERE nombre_tipo = 'Moto');

IF NOT EXISTS (SELECT 1 FROM Tarifas WHERE id_tipo_espacio = @tNormal)
    INSERT INTO Tarifas (precio_hora, precio_dia, fecha_actualizacion, id_tipo_espacio)
    VALUES (25.00, 180.00, CAST(GETDATE() AS DATE), @tNormal);
IF NOT EXISTS (SELECT 1 FROM Tarifas WHERE id_tipo_espacio = @tDisc)
    INSERT INTO Tarifas (precio_hora, precio_dia, fecha_actualizacion, id_tipo_espacio)
    VALUES (20.00, 150.00, CAST(GETDATE() AS DATE), @tDisc);
IF NOT EXISTS (SELECT 1 FROM Tarifas WHERE id_tipo_espacio = @tMoto)
    INSERT INTO Tarifas (precio_hora, precio_dia, fecha_actualizacion, id_tipo_espacio)
    VALUES (15.00, 100.00, CAST(GETDATE() AS DATE), @tMoto);
GO

/* ---------- 4) Espacios del estacionamiento ---------- */
DECLARE @est INT = (SELECT id_estacionamiento FROM Estacionamientos WHERE nombre = 'ParkSpot Centro');
DECLARE @tNormal INT = (SELECT id_tipo_espacio FROM TiposEspacio WHERE nombre_tipo = 'Normal');
DECLARE @tDisc   INT = (SELECT id_tipo_espacio FROM TiposEspacio WHERE nombre_tipo = 'Discapacitado');
DECLARE @tMoto   INT = (SELECT id_tipo_espacio FROM TiposEspacio WHERE nombre_tipo = 'Moto');

IF NOT EXISTS (SELECT 1 FROM Espacios WHERE id_estacionamiento = @est)
BEGIN
    INSERT INTO Espacios (numero_espacio, estado, id_tipo_espacio, id_estacionamiento) VALUES
        ('A-01', 'Disponible', @tNormal, @est),
        ('A-02', 'Disponible', @tNormal, @est),
        ('A-03', 'Ocupado',    @tNormal, @est),
        ('A-04', 'Disponible', @tNormal, @est),
        ('A-05', 'Reservado',  @tNormal, @est),
        ('A-06', 'Disponible', @tNormal, @est),
        ('B-01', 'Disponible', @tDisc,   @est),
        ('B-02', 'Disponible', @tDisc,   @est),
        ('M-01', 'Disponible', @tMoto,   @est),
        ('M-02', 'Ocupado',    @tMoto,   @est),
        ('M-03', 'Disponible', @tMoto,   @est),
        ('M-04', 'Disponible', @tMoto,   @est);
END
GO

SELECT * FROM TiposEspacio;
SELECT * FROM Estacionamientos;
SELECT * FROM Espacios;
SELECT * FROM Tarifas;
GO
