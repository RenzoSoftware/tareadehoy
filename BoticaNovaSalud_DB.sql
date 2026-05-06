-- ============================================================
--  BASE DE DATOS: Botica Nova Salud
--  Versión optimizada y estructurada
--  Motor: MySQL 8.0+
-- ============================================================

DROP DATABASE IF EXISTS BoticaNovaSalud;
CREATE DATABASE BoticaNovaSalud
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE BoticaNovaSalud;

-- ============================================================
-- SECCIÓN 1: TABLAS DE CLASIFICACIÓN Y CATÁLOGOS
-- ============================================================

CREATE TABLE Laboratorios (
    id_laboratorio   INT            AUTO_INCREMENT PRIMARY KEY,
    nombre           VARCHAR(100)   NOT NULL,
    pais_origen      VARCHAR(60),
    ruc              CHAR(11)       UNIQUE,
    contacto         VARCHAR(100),
    telefono         VARCHAR(15),
    email            VARCHAR(100),
    estado           TINYINT(1)     NOT NULL DEFAULT 1,     -- 1=activo, 0=inactivo
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_lab_estado CHECK (estado IN (0, 1))
);

-- -----------------------------------------------
CREATE TABLE Categorias (
    id_categoria     INT            AUTO_INCREMENT PRIMARY KEY,
    nombre           VARCHAR(80)    NOT NULL UNIQUE,        -- Ej: Antibióticos, Cuidado Personal
    descripcion      TEXT,
    estado           TINYINT(1)     NOT NULL DEFAULT 1,
    CONSTRAINT chk_cat_estado CHECK (estado IN (0, 1))
);

-- -----------------------------------------------
CREATE TABLE Presentaciones (
    id_presentacion  INT            AUTO_INCREMENT PRIMARY KEY,
    nombre           VARCHAR(60)    NOT NULL UNIQUE         -- Ej: Pastilla, Jarabe, Inyectable
);

-- -----------------------------------------------
CREATE TABLE Unidades_Medida (
    id_unidad        INT            AUTO_INCREMENT PRIMARY KEY,
    nombre           VARCHAR(60)    NOT NULL UNIQUE,        -- Ej: Unidad, Blíster, Caja
    abreviatura      VARCHAR(10)    NOT NULL
);


-- ============================================================
-- SECCIÓN 2: RECURSOS HUMANOS Y ACCESO
-- ============================================================

CREATE TABLE Cargos (
    id_cargo         INT            AUTO_INCREMENT PRIMARY KEY,
    nombre           VARCHAR(80)    NOT NULL UNIQUE,        -- Ej: Administrador, Cajero, Almacenero
    descripcion      TEXT
);

-- -----------------------------------------------
CREATE TABLE Empleados (
    id_empleado      INT            AUTO_INCREMENT PRIMARY KEY,
    dni              CHAR(8)        NOT NULL UNIQUE,
    nombres          VARCHAR(100)   NOT NULL,
    apellidos        VARCHAR(100)   NOT NULL,
    telefono         VARCHAR(15),
    email            VARCHAR(100),
    id_cargo         INT            NOT NULL,
    fecha_ingreso    DATE           NOT NULL DEFAULT (CURRENT_DATE),
    estado           TINYINT(1)     NOT NULL DEFAULT 1,
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_emp_cargo  FOREIGN KEY (id_cargo) REFERENCES Cargos(id_cargo),
    CONSTRAINT chk_emp_estado CHECK (estado IN (0, 1))
);

-- -----------------------------------------------
CREATE TABLE Usuarios (
    id_usuario       INT            AUTO_INCREMENT PRIMARY KEY,
    username         VARCHAR(50)    NOT NULL UNIQUE,
    password_hash    VARCHAR(255)   NOT NULL,
    id_empleado      INT            NOT NULL UNIQUE,        -- 1 usuario por empleado
    ultimo_acceso    DATETIME,
    estado           TINYINT(1)     NOT NULL DEFAULT 1,
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usr_empleado FOREIGN KEY (id_empleado) REFERENCES Empleados(id_empleado),
    CONSTRAINT chk_usr_estado  CHECK (estado IN (0, 1))
);


-- ============================================================
-- SECCIÓN 3: PRODUCTOS, PRECIOS Y STOCK
-- ============================================================

CREATE TABLE Productos (
    id_producto              INT            AUTO_INCREMENT PRIMARY KEY,
    codigo_barra             VARCHAR(50)    UNIQUE,
    nombre_comercial         VARCHAR(150)   NOT NULL,
    principio_activo         VARCHAR(150),
    concentracion            VARCHAR(50),                   -- Ej: 500mg, 120mg/5mL
    id_laboratorio           INT            NOT NULL,
    id_categoria             INT            NOT NULL,
    id_presentacion          INT            NOT NULL,
    requiere_receta          TINYINT(1)     NOT NULL DEFAULT 0,
    descripcion              TEXT,
    estado                   TINYINT(1)     NOT NULL DEFAULT 1,
    created_at               DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_prod_lab   FOREIGN KEY (id_laboratorio)  REFERENCES Laboratorios(id_laboratorio),
    CONSTRAINT fk_prod_cat   FOREIGN KEY (id_categoria)    REFERENCES Categorias(id_categoria),
    CONSTRAINT fk_prod_pres  FOREIGN KEY (id_presentacion) REFERENCES Presentaciones(id_presentacion)
);

-- -----------------------------------------------
-- Stock y lotes separados para trazabilidad
CREATE TABLE Lotes (
    id_lote          INT            AUTO_INCREMENT PRIMARY KEY,
    id_producto      INT            NOT NULL,
    numero_lote      VARCHAR(50)    NOT NULL,
    fecha_vencimiento DATE          NOT NULL,
    stock_actual     INT            NOT NULL DEFAULT 0,
    stock_minimo     INT            NOT NULL DEFAULT 20,
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lote_prod  FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
    CONSTRAINT chk_stock_actual  CHECK (stock_actual  >= 0),
    CONSTRAINT chk_stock_minimo  CHECK (stock_minimo  >= 0),
    UNIQUE KEY uq_lote (id_producto, numero_lote)
);

-- -----------------------------------------------
-- Precio por unidad de medida (caja tiene precio distinto que unidad)
CREATE TABLE Producto_Precios (
    id_precio                INT              AUTO_INCREMENT PRIMARY KEY,
    id_producto              INT              NOT NULL,
    id_unidad                INT              NOT NULL,
    cantidad_equivalente     INT              NOT NULL DEFAULT 1, -- unidades base que contiene
    precio_venta             DECIMAL(10, 2)   NOT NULL,
    activo                   TINYINT(1)       NOT NULL DEFAULT 1,
    CONSTRAINT fk_pp_prod    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
    CONSTRAINT fk_pp_unidad  FOREIGN KEY (id_unidad)   REFERENCES Unidades_Medida(id_unidad),
    CONSTRAINT chk_precio    CHECK (precio_venta > 0),
    CONSTRAINT chk_qty_equiv CHECK (cantidad_equivalente > 0),
    UNIQUE KEY uq_prod_unidad (id_producto, id_unidad)          -- un precio por unidad/producto
);


-- ============================================================
-- SECCIÓN 4: CLIENTES
-- ============================================================

CREATE TABLE Tipo_Documento_Identidad (
    id_tipo_doc      INT            AUTO_INCREMENT PRIMARY KEY,
    codigo           VARCHAR(5)     NOT NULL UNIQUE,        -- DNI, RUC, CE, PAS
    descripcion      VARCHAR(50)    NOT NULL
);

-- -----------------------------------------------
CREATE TABLE Clientes (
    id_cliente       INT            AUTO_INCREMENT PRIMARY KEY,
    id_tipo_doc      INT            NOT NULL DEFAULT 1,
    numero_documento VARCHAR(15)    NOT NULL,
    nombres_razon    VARCHAR(200)   NOT NULL,
    direccion        VARCHAR(200),
    telefono         VARCHAR(15),
    email            VARCHAR(100),
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cli_tipo_doc FOREIGN KEY (id_tipo_doc) REFERENCES Tipo_Documento_Identidad(id_tipo_doc),
    UNIQUE KEY uq_cli_doc (id_tipo_doc, numero_documento)
);


-- ============================================================
-- SECCIÓN 5: VENTAS Y COMPROBANTES
-- ============================================================

CREATE TABLE Tipos_Comprobante (
    id_tipo_comprobante  INT         AUTO_INCREMENT PRIMARY KEY,
    nombre               VARCHAR(20) NOT NULL UNIQUE,       -- BOLETA, FACTURA
    serie_actual         CHAR(4)     NOT NULL,              -- B001, F001
    correlativo_actual   INT         NOT NULL DEFAULT 0,
    CONSTRAINT chk_tipo_comp CHECK (nombre IN ('BOLETA', 'FACTURA'))
);

-- -----------------------------------------------
CREATE TABLE Ventas (
    id_venta             INT              AUTO_INCREMENT PRIMARY KEY,
    id_tipo_comprobante  INT              NOT NULL,
    serie                CHAR(4)          NOT NULL,
    correlativo          INT              NOT NULL,
    numero_completo      VARCHAR(20)      AS (CONCAT(serie, '-', LPAD(correlativo, 8, '0'))) STORED,
    fecha_hora           DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_cliente           INT              NOT NULL,
    id_usuario           INT              NOT NULL,         -- empleado que realizó la venta
    forma_pago           ENUM('CONTADO', 'CREDITO', 'TARJETA', 'TRANSFERENCIA') NOT NULL DEFAULT 'CONTADO',
    monto_recibido       DECIMAL(10, 2)   DEFAULT 0.00,
    vuelto               DECIMAL(10, 2)   AS (GREATEST(monto_recibido - total, 0)) STORED,
    subtotal             DECIMAL(10, 2)   NOT NULL DEFAULT 0.00,
    igv                  DECIMAL(10, 2)   NOT NULL DEFAULT 0.00,
    total                DECIMAL(10, 2)   NOT NULL DEFAULT 0.00,
    estado               ENUM('ACTIVA','ANULADA') NOT NULL DEFAULT 'ACTIVA',
    observaciones        TEXT,
    CONSTRAINT fk_vta_tipo  FOREIGN KEY (id_tipo_comprobante) REFERENCES Tipos_Comprobante(id_tipo_comprobante),
    CONSTRAINT fk_vta_cli   FOREIGN KEY (id_cliente)          REFERENCES Clientes(id_cliente),
    CONSTRAINT fk_vta_usr   FOREIGN KEY (id_usuario)          REFERENCES Usuarios(id_usuario),
    CONSTRAINT chk_total    CHECK (total >= 0),
    UNIQUE KEY uq_comprobante (serie, correlativo)
);

-- -----------------------------------------------
CREATE TABLE Detalle_Ventas (
    id_detalle           INT              AUTO_INCREMENT PRIMARY KEY,
    id_venta             INT              NOT NULL,
    id_producto          INT              NOT NULL,
    id_precio            INT              NOT NULL,          -- registra qué precio/unidad se usó
    id_lote              INT,                                -- trazabilidad de lote
    cantidad             INT              NOT NULL,
    precio_unitario      DECIMAL(10, 2)   NOT NULL,
    subtotal             DECIMAL(10, 2)   AS (cantidad * precio_unitario) STORED,
    CONSTRAINT fk_det_vta    FOREIGN KEY (id_venta)    REFERENCES Ventas(id_venta),
    CONSTRAINT fk_det_prod   FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
    CONSTRAINT fk_det_precio FOREIGN KEY (id_precio)   REFERENCES Producto_Precios(id_precio),
    CONSTRAINT fk_det_lote   FOREIGN KEY (id_lote)     REFERENCES Lotes(id_lote),
    CONSTRAINT chk_det_qty   CHECK (cantidad > 0),
    CONSTRAINT chk_det_prec  CHECK (precio_unitario > 0)
);


-- ============================================================
-- SECCIÓN 6: ÍNDICES DE RENDIMIENTO
-- ============================================================

-- Búsqueda de productos por nombre o código de barra
CREATE INDEX idx_prod_nombre   ON Productos(nombre_comercial);
CREATE INDEX idx_prod_activo   ON Productos(principio_activo);
CREATE INDEX idx_prod_estado   ON Productos(estado);

-- Filtrado de ventas por fecha, cliente y usuario
CREATE INDEX idx_vta_fecha     ON Ventas(fecha_hora);
CREATE INDEX idx_vta_cliente   ON Ventas(id_cliente);
CREATE INDEX idx_vta_usuario   ON Ventas(id_usuario);
CREATE INDEX idx_vta_estado    ON Ventas(estado);

-- Búsqueda de detalle por venta
CREATE INDEX idx_det_venta     ON Detalle_Ventas(id_venta);

-- Alertas de stock bajo
CREATE INDEX idx_lote_stock    ON Lotes(stock_actual);
CREATE INDEX idx_lote_venc     ON Lotes(fecha_vencimiento);

-- Búsqueda de clientes por documento
CREATE INDEX idx_cli_doc       ON Clientes(numero_documento);


-- ============================================================
-- SECCIÓN 7: DATOS INICIALES (SEED)
-- ============================================================

INSERT INTO Tipos_Comprobante (nombre, serie_actual, correlativo_actual) VALUES
  ('BOLETA',  'B001', 0),
  ('FACTURA', 'F001', 0);

INSERT INTO Tipo_Documento_Identidad (codigo, descripcion) VALUES
  ('DNI', 'Documento Nacional de Identidad'),
  ('RUC', 'Registro Único de Contribuyentes'),
  ('CE',  'Carné de Extranjería'),
  ('PAS', 'Pasaporte');

INSERT INTO Presentaciones (nombre) VALUES
  ('Pastilla'), ('Jarabe'), ('Inyectable'), ('Cápsula'),
  ('Crema'), ('Gotas'), ('Supositorio'), ('Parche');

INSERT INTO Unidades_Medida (nombre, abreviatura) VALUES
  ('Unidad',  'UND'),
  ('Blíster', 'BLS'),
  ('Caja',    'CJA'),
  ('Frasco',  'FRS'),
  ('Ampolla', 'AMP');

INSERT INTO Categorias (nombre, descripcion) VALUES
  ('Antibióticos',        'Medicamentos para combatir infecciones bacterianas'),
  ('Analgésicos',         'Medicamentos para el dolor y la fiebre'),
  ('Antiinflamatorios',   'Reducción de inflamación y dolor'),
  ('Cuidado Personal',    'Productos de higiene y cuidado'),
  ('Vitaminas y Suplementos', 'Vitaminas, minerales y suplementos nutricionales'),
  ('Antiparasitarios',    'Tratamiento de parasitosis'),
  ('Dermatológicos',      'Productos para la piel');

INSERT INTO Laboratorios (nombre, pais_origen, contacto) VALUES
  ('Pharma Genéricos',  'Perú',     'ventas@pharma.com.pe'),
  ('Portugal Pharma',   'Portugal', 'info@portugal-pharma.com'),
  ('Hersil',            'Perú',     'contacto@hersil.com.pe'),
  ('Abbott',            'EE.UU.',   'info@abbott.com'),
  ('MK',                'Colombia', 'ventas@mk.com.co');

INSERT INTO Cargos (nombre, descripcion) VALUES
  ('Administrador',   'Acceso total al sistema'),
  ('Cajero',          'Registro de ventas y cobros'),
  ('Almacenero',      'Gestión de stock e inventario'),
  ('Químico Farmacéutico', 'Responsable técnico de la botica');


-- ============================================================
-- SECCIÓN 8: VISTAS ÚTILES
-- ============================================================

-- Vista: stock con alertas de productos próximos a agotarse o vencer
CREATE VIEW v_stock_alertas AS
SELECT
    p.nombre_comercial,
    l.numero_lote,
    um_base.nombre       AS unidad_base,
    l.stock_actual,
    l.stock_minimo,
    l.fecha_vencimiento,
    DATEDIFF(l.fecha_vencimiento, CURDATE()) AS dias_para_vencer,
    CASE
        WHEN l.stock_actual = 0                                  THEN 'SIN STOCK'
        WHEN l.stock_actual < l.stock_minimo                     THEN 'STOCK BAJO'
        WHEN DATEDIFF(l.fecha_vencimiento, CURDATE()) <= 30      THEN 'PRÓXIMO A VENCER'
        ELSE 'OK'
    END AS alerta
FROM Lotes l
JOIN Productos p         ON l.id_producto = p.id_producto
JOIN Unidades_Medida um_base ON um_base.abreviatura = 'UND'
WHERE p.estado = 1;

-- -----------------------------------------------
-- Vista: resumen de ventas por día
CREATE VIEW v_ventas_por_dia AS
SELECT
    DATE(v.fecha_hora)               AS fecha,
    COUNT(v.id_venta)                AS total_ventas,
    SUM(v.total)                     AS ingresos_total,
    SUM(CASE WHEN tc.nombre = 'BOLETA'  THEN 1 ELSE 0 END) AS boletas,
    SUM(CASE WHEN tc.nombre = 'FACTURA' THEN 1 ELSE 0 END) AS facturas
FROM Ventas v
JOIN Tipos_Comprobante tc ON v.id_tipo_comprobante = tc.id_tipo_comprobante
WHERE v.estado = 'ACTIVA'
GROUP BY DATE(v.fecha_hora);

-- -----------------------------------------------
-- Vista: detalle completo de venta (útil para imprimir comprobante)
CREATE VIEW v_detalle_comprobante AS
SELECT
    v.id_venta,
    v.numero_completo,
    tc.nombre           AS tipo_comprobante,
    v.fecha_hora,
    v.forma_pago,
    c.nombres_razon     AS cliente,
    c.numero_documento  AS doc_cliente,
    tdi.codigo          AS tipo_doc_cliente,
    CONCAT(e.nombres, ' ', e.apellidos) AS vendedor,
    p.nombre_comercial  AS producto,
    um.nombre           AS unidad,
    dv.cantidad,
    dv.precio_unitario,
    dv.subtotal         AS subtotal_linea,
    v.subtotal,
    v.igv,
    v.total
FROM Detalle_Ventas dv
JOIN Ventas              v   ON dv.id_venta    = v.id_venta
JOIN Tipos_Comprobante   tc  ON v.id_tipo_comprobante = tc.id_tipo_comprobante
JOIN Clientes            c   ON v.id_cliente   = c.id_cliente
JOIN Tipo_Documento_Identidad tdi ON c.id_tipo_doc = tdi.id_tipo_doc
JOIN Usuarios            u   ON v.id_usuario   = u.id_usuario
JOIN Empleados           e   ON u.id_empleado  = e.id_empleado
JOIN Productos           p   ON dv.id_producto = p.id_producto
JOIN Producto_Precios    pp  ON dv.id_precio   = pp.id_precio
JOIN Unidades_Medida     um  ON pp.id_unidad   = um.id_unidad;


-- ============================================================
-- SECCIÓN 9: TRIGGERS
-- ============================================================

DELIMITER $$

-- Trigger: descuenta stock del lote al confirmar una venta
CREATE TRIGGER trg_descontar_stock
AFTER INSERT ON Detalle_Ventas
FOR EACH ROW
BEGIN
    IF NEW.id_lote IS NOT NULL THEN
        UPDATE Lotes
        SET stock_actual = stock_actual - NEW.cantidad
        WHERE id_lote = NEW.id_lote;
    END IF;
END$$

-- -----------------------------------------------
-- Trigger: devuelve stock al anular una venta
CREATE TRIGGER trg_devolver_stock
AFTER UPDATE ON Ventas
FOR EACH ROW
BEGIN
    IF NEW.estado = 'ANULADA' AND OLD.estado = 'ACTIVA' THEN
        UPDATE Lotes l
        JOIN Detalle_Ventas dv ON l.id_lote = dv.id_lote
        SET l.stock_actual = l.stock_actual + dv.cantidad
        WHERE dv.id_venta = NEW.id_venta;
    END IF;
END$$

-- -----------------------------------------------
-- Trigger: auto-incrementa correlativo del comprobante antes de insertar
CREATE TRIGGER trg_numero_comprobante
BEFORE INSERT ON Ventas
FOR EACH ROW
BEGIN
    DECLARE v_serie      CHAR(4);
    DECLARE v_correlativo INT;

    SELECT serie_actual, correlativo_actual + 1
    INTO v_serie, v_correlativo
    FROM Tipos_Comprobante
    WHERE id_tipo_comprobante = NEW.id_tipo_comprobante
    FOR UPDATE;

    UPDATE Tipos_Comprobante
    SET correlativo_actual = v_correlativo
    WHERE id_tipo_comprobante = NEW.id_tipo_comprobante;

    SET NEW.serie       = v_serie;
    SET NEW.correlativo = v_correlativo;
END$$

DELIMITER ;


-- ============================================================
-- SECCIÓN 10: PROCEDIMIENTO - REGISTRAR VENTA
-- ============================================================

DELIMITER $$

CREATE PROCEDURE sp_registrar_venta (
    IN  p_id_tipo_comprobante  INT,
    IN  p_id_cliente           INT,
    IN  p_id_usuario           INT,
    IN  p_forma_pago           VARCHAR(20),
    IN  p_monto_recibido       DECIMAL(10,2),
    IN  p_items                JSON,           -- array de {id_precio, id_lote, cantidad}
    OUT p_id_venta             INT,
    OUT p_mensaje              VARCHAR(200)
)
BEGIN
    DECLARE v_subtotal   DECIMAL(10,2) DEFAULT 0;
    DECLARE v_igv        DECIMAL(10,2);
    DECLARE v_total      DECIMAL(10,2);
    DECLARE v_idx        INT DEFAULT 0;
    DECLARE v_len        INT;
    DECLARE v_id_precio  INT;
    DECLARE v_id_lote    INT;
    DECLARE v_cantidad   INT;
    DECLARE v_precio_u   DECIMAL(10,2);
    DECLARE v_id_prod    INT;
    DECLARE v_stock      INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_mensaje  = 'Error al registrar la venta. Transacción revertida.';
        SET p_id_venta = -1;
    END;

    START TRANSACTION;

    SET v_len = JSON_LENGTH(p_items);

    -- Bloque etiquetado para poder salir anticipadamente con LEAVE
    proc_body: BEGIN

        -- Validar stock por cada ítem
        WHILE v_idx < v_len DO
            SET v_id_precio = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_idx, '].id_precio')));
            SET v_id_lote   = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_idx, '].id_lote')));
            SET v_cantidad  = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_idx, '].cantidad')));

            SELECT stock_actual INTO v_stock FROM Lotes WHERE id_lote = v_id_lote FOR UPDATE;

            IF v_stock < v_cantidad THEN
                ROLLBACK;
                SET p_id_venta = -1;
                SET p_mensaje  = CONCAT('Stock insuficiente para el lote ', v_id_lote);
                LEAVE proc_body;
            END IF;

            SELECT precio_venta, id_producto INTO v_precio_u, v_id_prod
            FROM Producto_Precios WHERE id_precio = v_id_precio;

            SET v_subtotal = v_subtotal + (v_cantidad * v_precio_u);
            SET v_idx = v_idx + 1;
        END WHILE;

        SET v_igv   = ROUND(v_subtotal * 0.18, 2);
        SET v_total = v_subtotal + v_igv;

        -- Insertar cabecera de venta
        INSERT INTO Ventas (id_tipo_comprobante, id_cliente, id_usuario,
                            forma_pago, monto_recibido, subtotal, igv, total)
        VALUES (p_id_tipo_comprobante, p_id_cliente, p_id_usuario,
                p_forma_pago, p_monto_recibido, v_subtotal, v_igv, v_total);

        SET p_id_venta = LAST_INSERT_ID();

        -- Insertar detalle
        SET v_idx = 0;
        WHILE v_idx < v_len DO
            SET v_id_precio = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_idx, '].id_precio')));
            SET v_id_lote   = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_idx, '].id_lote')));
            SET v_cantidad  = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_idx, '].cantidad')));

            SELECT precio_venta, id_producto INTO v_precio_u, v_id_prod
            FROM Producto_Precios WHERE id_precio = v_id_precio;

            INSERT INTO Detalle_Ventas (id_venta, id_producto, id_precio, id_lote, cantidad, precio_unitario)
            VALUES (p_id_venta, v_id_prod, v_id_precio, v_id_lote, v_cantidad, v_precio_u);

            SET v_idx = v_idx + 1;
        END WHILE;

        COMMIT;
        SET p_mensaje = 'Venta registrada exitosamente.';

    END proc_body;
END$$

DELIMITER ;
