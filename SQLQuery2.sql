

CREATE TABLE Roles (
    id_rol       INT IDENTITY(1,1) NOT NULL,
    nombre_rol   NVARCHAR(50)      NOT NULL,
    descripcion  NVARCHAR(255)     NULL,
    CONSTRAINT PK_Roles PRIMARY KEY (id_rol)
);
GO

CREATE TABLE Estacionamientos (
    id_estacionamiento INT IDENTITY(1,1) NOT NULL,
    nombre             NVARCHAR(100)     NOT NULL,
    direccion          NVARCHAR(255)     NULL,
    capacidad_total    INT               NULL,
    horario_apertura   TIME              NULL,
    horario_cierre     TIME              NULL,
    CONSTRAINT PK_Estacionamientos PRIMARY KEY (id_estacionamiento)
);
GO

CREATE TABLE TiposEspacio (
    id_tipo_espacio INT IDENTITY(1,1) NOT NULL,
    nombre_tipo     NVARCHAR(50)      NOT NULL,
    descripcion     NVARCHAR(255)     NULL,
    CONSTRAINT PK_TiposEspacio PRIMARY KEY (id_tipo_espacio)
);
GO

CREATE TABLE MetodosPago (
    id_metodo_pago INT IDENTITY(1,1) NOT NULL,
    nombre_metodo  NVARCHAR(50)      NOT NULL,
    CONSTRAINT PK_MetodosPago PRIMARY KEY (id_metodo_pago)
);
GO

/* 2. Usuarios (depende de Roles)*/

CREATE TABLE Usuarios (
    id_usuario      INT IDENTITY(1,1) NOT NULL,
    nombre          NVARCHAR(100)     NOT NULL,
    apellido        NVARCHAR(100)     NOT NULL,
    correo          NVARCHAR(150)     NOT NULL,
    hash_contrasena NVARCHAR(255)     NOT NULL,
    telefono        NVARCHAR(20)      NULL,
    fecha_registro  DATE              NULL,
    estado_cuenta   NVARCHAR(20)      NULL,
    id_rol          INT               NOT NULL,
    CONSTRAINT PK_Usuarios PRIMARY KEY (id_usuario),
    CONSTRAINT UQ_Usuarios_correo UNIQUE (correo),
    CONSTRAINT FK_Usuarios_Roles FOREIGN KEY (id_rol)
        REFERENCES Roles (id_rol)
);
GO

/* 3. Espacios (depende de TiposEspacio y Estacionamientos)*/

CREATE TABLE Espacios (
    id_espacio         INT IDENTITY(1,1) NOT NULL,
    numero_espacio     NVARCHAR(20)      NOT NULL,
    estado             NVARCHAR(20)      NULL,
    id_tipo_espacio    INT               NOT NULL,
    id_estacionamiento INT               NOT NULL,
    CONSTRAINT PK_Espacios PRIMARY KEY (id_espacio),
    CONSTRAINT FK_Espacios_TiposEspacio FOREIGN KEY (id_tipo_espacio)
        REFERENCES TiposEspacio (id_tipo_espacio),
    CONSTRAINT FK_Espacios_Estacionamientos FOREIGN KEY (id_estacionamiento)
        REFERENCES Estacionamientos (id_estacionamiento)
);
GO

/* 4. Vehiculos y Tarjetas (dependen de Usuarios)*/

CREATE TABLE Vehiculos (
    id_vehiculo   INT IDENTITY(1,1) NOT NULL,
    placa         NVARCHAR(15)      NOT NULL,
    marca         NVARCHAR(50)      NULL,
    modelo        NVARCHAR(50)      NULL,
    color         NVARCHAR(30)      NULL,
    tipo_vehiculo NVARCHAR(30)      NULL,
    id_usuario    INT               NOT NULL,
    CONSTRAINT PK_Vehiculos PRIMARY KEY (id_vehiculo),
    CONSTRAINT UQ_Vehiculos_placa UNIQUE (placa),
    CONSTRAINT FK_Vehiculos_Usuarios FOREIGN KEY (id_usuario)
        REFERENCES Usuarios (id_usuario)
);
GO

CREATE TABLE Tarjetas (
    id_tarjeta       INT IDENTITY(1,1) NOT NULL,
    ultimos_4        CHAR(4)           NOT NULL,
    titular          NVARCHAR(100)     NOT NULL,
    tipo_tarjeta     NVARCHAR(30)      NULL,
    fecha_expiracion DATE              NULL,
    id_usuario       INT               NOT NULL,
    CONSTRAINT PK_Tarjetas PRIMARY KEY (id_tarjeta),
    CONSTRAINT FK_Tarjetas_Usuarios FOREIGN KEY (id_usuario)
        REFERENCES Usuarios (id_usuario)
);
GO

/*  5. Tarifas (depende de TiposEspacio)*/

CREATE TABLE Tarifas (
    id_tarifa           INT IDENTITY(1,1) NOT NULL,
    precio_hora         DECIMAL(10,2)     NOT NULL,
    precio_dia          DECIMAL(10,2)     NULL,
    fecha_actualizacion DATE              NULL,
    id_tipo_espacio     INT               NOT NULL,
    CONSTRAINT PK_Tarifas PRIMARY KEY (id_tarifa),
    CONSTRAINT FK_Tarifas_TiposEspacio FOREIGN KEY (id_tipo_espacio)
        REFERENCES TiposEspacio (id_tipo_espacio)
);
GO

/* 6. Reservas (depende de Usuarios, Vehiculos y Espacios) */

CREATE TABLE Reservas (
    id_reserva     INT IDENTITY(1,1) NOT NULL,
    fecha_reserva  DATE              NOT NULL,
    hora_inicio    TIME              NULL,
    hora_fin       TIME              NULL,
    estado_reserva NVARCHAR(20)      NULL,
    id_usuario     INT               NOT NULL,
    id_vehiculo    INT               NOT NULL,
    id_espacio     INT               NOT NULL,
    CONSTRAINT PK_Reservas PRIMARY KEY (id_reserva),
    CONSTRAINT FK_Reservas_Usuarios FOREIGN KEY (id_usuario)
        REFERENCES Usuarios (id_usuario),
    CONSTRAINT FK_Reservas_Vehiculos FOREIGN KEY (id_vehiculo)
        REFERENCES Vehiculos (id_vehiculo),
    CONSTRAINT FK_Reservas_Espacios FOREIGN KEY (id_espacio)
        REFERENCES Espacios (id_espacio)
);
GO

/*  7. Pagos (depende de Reservas, MetodosPago y Tarjetas) */

CREATE TABLE Pagos (
    id_pago        INT IDENTITY(1,1) NOT NULL,
    monto          DECIMAL(10,2)     NOT NULL,
    fecha_pago     DATE              NULL,
    estado_pago    NVARCHAR(20)      NULL,
    id_reserva     INT               NOT NULL,
    id_metodo_pago INT               NOT NULL,
    id_tarjeta     INT               NULL,
    CONSTRAINT PK_Pagos PRIMARY KEY (id_pago),
    CONSTRAINT FK_Pagos_Reservas FOREIGN KEY (id_reserva)
        REFERENCES Reservas (id_reserva),
    CONSTRAINT FK_Pagos_MetodosPago FOREIGN KEY (id_metodo_pago)
        REFERENCES MetodosPago (id_metodo_pago),
    CONSTRAINT FK_Pagos_Tarjetas FOREIGN KEY (id_tarjeta)
        REFERENCES Tarjetas (id_tarjeta)
);
GO

/*8. HistorialEspacios (depende de Espacios y Usuarios/admin)*/

CREATE TABLE HistorialEspacios (
    id_historial    INT IDENTITY(1,1) NOT NULL,
    estado_anterior NVARCHAR(20)      NULL,
    estado_nuevo    NVARCHAR(20)      NULL,
    fecha_cambio    DATETIME2         NULL,
    id_espacio      INT               NOT NULL,
    id_admin        INT               NOT NULL,
    CONSTRAINT PK_HistorialEspacios PRIMARY KEY (id_historial),
    CONSTRAINT FK_HistorialEspacios_Espacios FOREIGN KEY (id_espacio)
        REFERENCES Espacios (id_espacio),
    CONSTRAINT FK_HistorialEspacios_Usuarios FOREIGN KEY (id_admin)
        REFERENCES Usuarios (id_usuario)
);
GO

/*9. Tickets (depende de Reservas) */

CREATE TABLE Tickets (
    id_ticket        INT IDENTITY(1,1) NOT NULL,
    codigo_ticket    NVARCHAR(50)      NOT NULL,
    fecha_generacion DATETIME2         NULL,
    estado_ticket    NVARCHAR(20)      NULL,
    id_reserva       INT               NOT NULL,
    CONSTRAINT PK_Tickets PRIMARY KEY (id_ticket),
    CONSTRAINT UQ_Tickets_codigo UNIQUE (codigo_ticket),
    CONSTRAINT FK_Tickets_Reservas FOREIGN KEY (id_reserva)
        REFERENCES Reservas (id_reserva)
);
GO

/* 10. Reportes (depende de Usuarios/admin) */

CREATE TABLE Reportes (
    id_reporte       INT IDENTITY(1,1) NOT NULL,
    tipo_reporte     NVARCHAR(50)      NOT NULL,
    fecha_generacion DATE              NULL,
    descripcion      NVARCHAR(255)     NULL,
    id_admin         INT               NOT NULL,
    CONSTRAINT PK_Reportes PRIMARY KEY (id_reporte),
    CONSTRAINT FK_Reportes_Usuarios FOREIGN KEY (id_admin)
        REFERENCES Usuarios (id_usuario)
);

