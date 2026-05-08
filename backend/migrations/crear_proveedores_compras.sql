-- ============================================================
-- Tablas: Proveedores, Compras, Compra_Detalle
-- Compatible con boticanovasalud.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS `proveedores` (
  `id_proveedor`    int(11)      NOT NULL AUTO_INCREMENT,
  `razon_social`    varchar(200) NOT NULL,
  `ruc`             varchar(11)  DEFAULT NULL,
  `direccion`       varchar(200) DEFAULT NULL,
  `telefono`        varchar(15)  DEFAULT NULL,
  `correo`          varchar(100) DEFAULT NULL,
  `contacto_nombre` varchar(100) DEFAULT NULL,
  `estado`          tinyint(1)   NOT NULL DEFAULT 1,
  `created_at`      datetime     NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_proveedor`),
  UNIQUE KEY `uq_ruc` (`ruc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Datos de ejemplo
INSERT INTO `proveedores` (`razon_social`, `ruc`, `direccion`, `telefono`, `correo`, `contacto_nombre`) VALUES
('Laboratorios Farma S.A.C.',  '20100012345', 'Av. Industrial 123, Lima',    '01-4567890', 'ventas@farma.com',    'Carlos Ríos'),
('Distribuidora MedPharma',    '20200023456', 'Jr. Comercio 456, Lima',      '01-3456789', 'pedidos@medpharma.com','Ana Torres'),
('Importaciones Salud Total',  '20300034567', 'Calle Los Pinos 789, Lima',   '01-2345678', 'info@saludtotal.com', 'Luis Vargas');

-- ============================================================

CREATE TABLE IF NOT EXISTS `compras` (
  `id_compra`    int(11)        NOT NULL AUTO_INCREMENT,
  `id_proveedor` int(11)        NOT NULL,
  `fecha_compra` date           NOT NULL DEFAULT (curdate()),
  `nro_factura`  varchar(20)    DEFAULT NULL,
  `forma_pago`   enum('CONTADO','CREDITO','TRANSFERENCIA') NOT NULL DEFAULT 'CONTADO',
  `estado`       enum('Pendiente','Pagado','Anulado')      NOT NULL DEFAULT 'Pendiente',
  `notas`        text           DEFAULT NULL,
  `total`        decimal(10,2)  NOT NULL DEFAULT 0.00,
  `created_at`   datetime       NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_compra`),
  KEY `fk_compra_proveedor` (`id_proveedor`),
  CONSTRAINT `fk_compra_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================

CREATE TABLE IF NOT EXISTS `compra_detalle` (
  `id_detalle`     int(11)       NOT NULL AUTO_INCREMENT,
  `id_compra`      int(11)       NOT NULL,
  `id_producto`    int(11)       NOT NULL,
  `cantidad`       int(11)       NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal`       decimal(10,2) GENERATED ALWAYS AS (`cantidad` * `precio_unitario`) STORED,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_det_compra`    (`id_compra`),
  KEY `fk_det_producto`  (`id_producto`),
  CONSTRAINT `fk_det_compra`   FOREIGN KEY (`id_compra`)   REFERENCES `compras`   (`id_compra`),
  CONSTRAINT `fk_det_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
