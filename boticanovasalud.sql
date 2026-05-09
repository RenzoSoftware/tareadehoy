-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-05-2026 a las 01:05:49
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `boticanovasalud`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_venta` (IN `p_id_tipo_comprobante` INT, IN `p_id_cliente` INT, IN `p_id_usuario` INT, IN `p_forma_pago` VARCHAR(20), IN `p_monto_recibido` DECIMAL(10,2), IN `p_items` JSON, OUT `p_id_venta` INT, OUT `p_mensaje` VARCHAR(200))   BEGIN
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cajas`
--

CREATE TABLE `cajas` (
  `id_caja` int(11) NOT NULL,
  `monto_inicial` decimal(10,2) NOT NULL DEFAULT 0.00,
  `monto_final` decimal(10,2) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `observaciones_cierre` text DEFAULT NULL,
  `estado` varchar(10) NOT NULL DEFAULT 'Abierta' COMMENT 'Valores: Abierta | Cerrada',
  `id_usuario` int(11) NOT NULL,
  `fecha_apertura` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_cierre` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cargos`
--

CREATE TABLE `cargos` (
  `id_cargo` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cargos`
--

INSERT INTO `cargos` (`id_cargo`, `nombre`, `descripcion`) VALUES
(1, 'Administrador', 'Acceso total al sistema'),
(2, 'Cajero', 'Registro de ventas y cobros'),
(3, 'Almacenero', 'Gestión de stock e inventario'),
(4, 'Químico Farmacéutico', 'Responsable técnico de la botica');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nombre`, `descripcion`, `estado`) VALUES
(1, 'Antibióticos', 'Medicamentos para combatir infecciones bacterianas', 1),
(2, 'Analgésicos', 'Medicamentos para el dolor y la fiebre', 1),
(3, 'Antiinflamatorios', 'Reducción de inflamación y dolor', 1),
(4, 'Cuidado Personal', 'Productos de higiene y cuidado', 1),
(5, 'Vitaminas y Suplementos', 'Vitaminas, minerales y suplementos nutricionales', 1),
(6, 'Antiparasitarios', 'Tratamiento de parasitosis', 1),
(7, 'Dermatológicos', 'Productos para la piel', 1),
(8, 'Suplementos', 'Suplementos alimenticios', 1),
(9, 'Pediatría', 'Medicamentos para niños', 1),
(10, 'Gastroenterología', 'Medicamentos digestivos', 1),
(11, 'Cardiología', 'Salud cardiovascular', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL,
  `id_tipo_doc` int(11) NOT NULL DEFAULT 1,
  `numero_documento` varchar(15) NOT NULL,
  `nombres_razon` varchar(200) NOT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id_cliente`, `id_tipo_doc`, `numero_documento`, `nombres_razon`, `direccion`, `telefono`, `email`, `created_at`) VALUES
(1, 1, '12345678', 'Juan Carlos Pérez López', NULL, '987654321', 'juan@email.com', '2026-05-05 20:38:29'),
(2, 1, '87654321', 'María Elena García Torres', NULL, '976543210', 'maria@email.com', '2026-05-05 20:38:29'),
(3, 2, '20512345678', 'Farmacia El Sol S.A.C.', NULL, '01-4567890', 'farmacia@email.com', '2026-05-05 20:38:29'),
(4, 1, '11223344', 'Carlos Alberto Ríos Vega', NULL, '965432109', 'carlos@email.com', '2026-05-05 20:38:29'),
(5, 1, '44332211', 'Ana Sofía Mendoza Paredes', NULL, '954321098', 'ana@email.com', '2026-05-05 20:38:29'),
(6, 1, '48574256', 'Alee Sayes Delgado', 'Av. Ganador', '997823566', 'sayes@gmail.com', '2026-05-05 20:56:07'),
(7, 1, '72642085', 'Alee Sayes', 'Av lima', '997823566', 'sayesalee@gmail.com', '2026-05-09 17:57:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compras`
--

CREATE TABLE `compras` (
  `id_compra` int(11) NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `numero_factura` varchar(20) NOT NULL,
  `fecha_compra` date NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `igv` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('PENDIENTE','PAGADO','ANULADO') NOT NULL DEFAULT 'PENDIENTE',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_compras`
--

CREATE TABLE `detalle_compras` (
  `id_detalle_compra` int(11) NOT NULL,
  `id_compra` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_compra` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS (`cantidad` * `precio_compra`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_ventas`
--

CREATE TABLE `detalle_ventas` (
  `id_detalle` int(11) NOT NULL,
  `id_venta` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_precio` int(11) NOT NULL,
  `id_lote` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS (`cantidad` * `precio_unitario`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_ventas`
--

INSERT INTO `detalle_ventas` (`id_detalle`, `id_venta`, `id_producto`, `id_precio`, `id_lote`, `cantidad`, `precio_unitario`) VALUES
(1, 1, 3, 3, 3, 20, 0.30),
(2, 1, 13, 13, 13, 10, 0.35),
(3, 2, 3, 3, 3, 15, 0.30),
(4, 2, 5, 5, 5, 8, 0.60),
(5, 3, 13, 13, 13, 20, 0.35),
(6, 3, 1, 1, 1, 12, 0.50),
(7, 3, 9, 9, 9, 10, 0.70),
(8, 4, 3, 3, 3, 25, 0.30),
(9, 4, 7, 7, 7, 15, 0.40),
(10, 4, 5, 5, 5, 10, 0.60),
(11, 5, 13, 13, 13, 30, 0.35),
(12, 5, 3, 3, 3, 20, 0.30),
(13, 5, 9, 9, 9, 15, 0.70),
(14, 5, 1, 1, 1, 8, 0.50),
(15, 6, 5, 5, 5, 18, 0.60),
(16, 6, 7, 7, 7, 12, 0.40),
(17, 6, 17, 17, 17, 5, 0.90),
(18, 7, 3, 3, 3, 30, 0.30),
(19, 7, 13, 13, 13, 15, 0.35),
(20, 8, 1, 1, 1, 20, 0.50),
(21, 8, 9, 9, 9, 12, 0.70),
(22, 8, 5, 5, 5, 15, 0.60),
(23, 9, 3, 3, NULL, 1, 0.30);

--
-- Disparadores `detalle_ventas`
--
DELIMITER $$
CREATE TRIGGER `trg_descontar_stock` AFTER INSERT ON `detalle_ventas` FOR EACH ROW BEGIN
    IF NEW.id_lote IS NOT NULL THEN
        UPDATE Lotes
        SET stock_actual = stock_actual - NEW.cantidad
        WHERE id_lote = NEW.id_lote;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados`
--

CREATE TABLE `empleados` (
  `id_empleado` int(11) NOT NULL,
  `dni` char(8) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `id_cargo` int(11) NOT NULL,
  `fecha_ingreso` date NOT NULL DEFAULT curdate(),
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empleados`
--

INSERT INTO `empleados` (`id_empleado`, `dni`, `nombres`, `apellidos`, `telefono`, `email`, `id_cargo`, `fecha_ingreso`, `estado`, `created_at`) VALUES
(1, '12345678', 'Admin', 'Sistema', NULL, NULL, 1, '2026-05-05', 1, '2026-05-05 19:36:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `laboratorios`
--

CREATE TABLE `laboratorios` (
  `id_laboratorio` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `pais_origen` varchar(60) DEFAULT NULL,
  `ruc` char(11) DEFAULT NULL,
  `contacto` varchar(100) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `laboratorios`
--

INSERT INTO `laboratorios` (`id_laboratorio`, `nombre`, `pais_origen`, `ruc`, `contacto`, `telefono`, `email`, `estado`, `created_at`, `updated_at`) VALUES
(1, 'Pharma Genéricos', 'Perú', NULL, 'ventas@pharma.com.pe', NULL, NULL, 1, '2026-05-05 19:28:09', '2026-05-05 19:28:09'),
(2, 'Portugal Pharma', 'Portugal', NULL, 'info@portugal-pharma.com', NULL, NULL, 1, '2026-05-05 19:28:09', '2026-05-05 19:28:09'),
(3, 'Hersil', 'Perú', NULL, 'contacto@hersil.com.pe', NULL, NULL, 1, '2026-05-05 19:28:09', '2026-05-05 19:28:09'),
(4, 'Abbott', 'EE.UU.', NULL, 'info@abbott.com', NULL, NULL, 1, '2026-05-05 19:28:09', '2026-05-05 19:28:09'),
(5, 'MK', 'Colombia', NULL, 'ventas@mk.com.co', NULL, NULL, 1, '2026-05-05 19:28:09', '2026-05-05 19:28:09'),
(6, 'Pharma Genéricos', 'Perú', NULL, 'ventas@pharma.com.pe', NULL, NULL, 1, '2026-05-05 20:59:25', '2026-05-05 20:59:25'),
(7, 'Portugal Pharma', 'Portugal', NULL, 'info@portugal-pharma.com', NULL, NULL, 1, '2026-05-05 20:59:25', '2026-05-05 20:59:25'),
(8, 'Hersil', 'Perú', NULL, 'contacto@hersil.com.pe', NULL, NULL, 1, '2026-05-05 20:59:25', '2026-05-05 20:59:25'),
(9, 'Abbott', 'EE.UU.', NULL, 'info@abbott.com', NULL, NULL, 1, '2026-05-05 20:59:25', '2026-05-05 20:59:25'),
(10, 'MK', 'Colombia', NULL, 'ventas@mk.com.co', NULL, NULL, 1, '2026-05-05 20:59:25', '2026-05-05 20:59:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lotes`
--

CREATE TABLE `lotes` (
  `id_lote` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `numero_lote` varchar(50) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `stock_actual` int(11) NOT NULL DEFAULT 0,
  `stock_minimo` int(11) NOT NULL DEFAULT 20,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `lotes`
--

INSERT INTO `lotes` (`id_lote`, `id_producto`, `numero_lote`, `fecha_vencimiento`, `stock_actual`, `stock_minimo`, `created_at`) VALUES
(1, 1, 'LOT-AMX-001', '2027-11-05', 110, 20, '2026-05-05 20:38:29'),
(2, 2, 'LOT-AMX-002', '2028-01-05', 80, 15, '2026-05-05 20:38:29'),
(3, 3, 'LOT-PAR-001', '2028-05-05', 190, 50, '2026-05-05 20:38:29'),
(4, 4, 'LOT-PAR-002', '2028-03-05', 120, 20, '2026-05-05 20:38:29'),
(5, 5, 'LOT-IBU-001', '2027-08-05', 149, 30, '2026-05-05 20:38:29'),
(6, 6, 'LOT-IBU-002', '2027-09-05', 90, 15, '2026-05-05 20:38:29'),
(7, 7, 'LOT-LOR-001', '2027-05-05', 153, 25, '2026-05-05 20:38:29'),
(8, 8, 'LOT-LOR-002', '2027-07-05', 60, 10, '2026-05-05 20:38:29'),
(9, 9, 'LOT-OME-001', '2027-03-05', 213, 40, '2026-05-05 20:38:29'),
(10, 10, 'LOT-OME-002', '2027-04-05', 70, 10, '2026-05-05 20:38:29'),
(11, 11, 'LOT-MET-001', '2027-01-05', 100, 20, '2026-05-05 20:38:29'),
(12, 12, 'LOT-MET-002', '2027-02-05', 45, 10, '2026-05-05 20:38:29'),
(13, 13, 'LOT-VTC-001', '2028-11-05', 325, 60, '2026-05-05 20:38:29'),
(14, 14, 'LOT-VTC-002', '2028-09-05', 150, 20, '2026-05-05 20:38:29'),
(15, 17, 'LOT-ATV-001', '2027-07-05', 90, 15, '2026-05-05 20:38:29'),
(16, 18, 'LOT-ATV-002', '2027-09-05', 40, 10, '2026-05-05 20:38:29'),
(17, 25, 'LOT-SAL-001', '2027-11-05', 30, 5, '2026-05-05 20:38:29'),
(18, 15, 'LOT-AZI-001', '2026-11-05', 8, 20, '2026-05-05 20:38:29'),
(19, 16, 'LOT-AZI-002', '2026-12-05', 3, 10, '2026-05-05 20:38:29'),
(20, 19, 'LOT-DIC-001', '2026-10-05', 12, 30, '2026-05-05 20:38:29'),
(21, 20, 'LOT-DIC-002', '2026-09-05', 5, 15, '2026-05-05 20:38:29'),
(22, 21, 'LOT-ALB-001', '2027-02-05', 0, 10, '2026-05-05 20:38:29'),
(23, 23, 'LOT-HID-001', '2027-01-05', 4, 10, '2026-05-05 20:38:29'),
(24, 24, 'LOT-BET-001', '2026-12-05', 2, 5, '2026-05-05 20:38:29'),
(25, 22, 'LOT-ZEN-VENC1', '2026-05-08', 15, 5, '2026-05-05 20:38:29'),
(26, 5, 'LOT-IBU-VENC1', '2026-05-10', 20, 10, '2026-05-05 20:38:29'),
(27, 3, 'LOT-PAR-VENC1', '2026-05-12', 30, 15, '2026-05-05 20:38:29'),
(28, 1, 'LOT-AMX-VENC1', '2026-05-15', 25, 10, '2026-05-05 20:38:29'),
(29, 9, 'LOT-OME-VENC1', '2026-05-20', 18, 8, '2026-05-05 20:38:29'),
(30, 13, 'LOT-VTC-VENC1', '2026-05-25', 40, 15, '2026-05-05 20:38:29'),
(31, 7, 'LOT-LOR-VENC1', '2026-05-30', 12, 5, '2026-05-05 20:38:29'),
(32, 11, 'LOT-MET-VENC1', '2026-06-02', 8, 3, '2026-05-05 20:38:29'),
(33, 27, 'LOT-CIP-001', '2027-12-01', 150, 20, '2026-05-09 18:02:42'),
(34, 28, 'LOT-CPX-001', '2028-06-15', 50, 10, '2026-05-09 18:02:42'),
(35, 29, 'LOT-NAP-001', '2027-10-20', 200, 30, '2026-05-09 18:02:42'),
(36, 30, 'LOT-APX-001', '2028-02-28', 80, 15, '2026-05-09 18:02:42'),
(37, 31, 'LOT-KET-001', '2027-08-10', 100, 20, '2026-05-09 18:02:42'),
(38, 32, 'LOT-LAN-001', '2027-09-05', 120, 15, '2026-05-09 18:02:42'),
(39, 33, 'LOT-MAG-001', '2028-01-12', 300, 50, '2026-05-09 18:02:42'),
(40, 34, 'LOT-CBF-001', '2027-11-30', 250, 40, '2026-05-09 18:02:42'),
(41, 35, 'LOT-NEU-001', '2026-12-20', 40, 5, '2026-05-09 18:02:42'),
(42, 36, 'LOT-ZNC-001', '2027-07-15', 180, 30, '2026-05-09 18:02:42'),
(43, 37, 'LOT-CET-001', '2027-05-25', 220, 30, '2026-05-09 18:02:42'),
(44, 38, 'LOT-ZYR-001', '2028-03-10', 60, 10, '2026-05-09 18:02:42'),
(45, 39, 'LOT-ENA-001', '2027-02-14', 160, 25, '2026-05-09 18:02:42'),
(46, 40, 'LOT-REN-001', '2027-08-20', 45, 10, '2026-05-09 18:02:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_caja`
--

CREATE TABLE `movimientos_caja` (
  `id_movimiento` int(11) NOT NULL,
  `id_caja` int(11) DEFAULT NULL COMMENT 'FK a la caja del día (opcional)',
  `tipo` varchar(10) NOT NULL COMMENT 'Valores: INGRESO | EGRESO',
  `categoria` varchar(50) NOT NULL DEFAULT 'Otro',
  `monto` decimal(10,2) NOT NULL DEFAULT 0.00,
  `descripcion` varchar(255) DEFAULT NULL,
  `forma_pago` varchar(20) NOT NULL DEFAULT 'EFECTIVO' COMMENT 'Valores: EFECTIVO | TARJETA | YAPE | PLIN',
  `id_usuario` int(11) NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimientos_caja`
--

INSERT INTO `movimientos_caja` (`id_movimiento`, `id_caja`, `tipo`, `categoria`, `monto`, `descripcion`, `forma_pago`, `id_usuario`, `fecha_hora`) VALUES
(1, NULL, 'INGRESO', 'Compra', 6600.00, 'fefd', 'TARJETA', 1, '2026-05-09 17:58:44');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `presentaciones`
--

CREATE TABLE `presentaciones` (
  `id_presentacion` int(11) NOT NULL,
  `nombre` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `presentaciones`
--

INSERT INTO `presentaciones` (`id_presentacion`, `nombre`) VALUES
(4, 'Cápsula'),
(5, 'Crema'),
(6, 'Gotas'),
(9, 'Inhalador'),
(3, 'Inyectable'),
(2, 'Jarabe'),
(8, 'Parche'),
(1, 'Pastilla'),
(7, 'Supositorio');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `codigo_barra` varchar(50) DEFAULT NULL,
  `nombre_comercial` varchar(150) NOT NULL,
  `principio_activo` varchar(150) DEFAULT NULL,
  `concentracion` varchar(50) DEFAULT NULL,
  `id_laboratorio` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `id_presentacion` int(11) NOT NULL,
  `requiere_receta` tinyint(1) NOT NULL DEFAULT 0,
  `descripcion` text DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `codigo_barra`, `nombre_comercial`, `principio_activo`, `concentracion`, `id_laboratorio`, `id_categoria`, `id_presentacion`, `requiere_receta`, `descripcion`, `estado`, `created_at`, `updated_at`) VALUES
(1, '7501234000001', 'Amoxicilina 500mg', 'Amoxicilina', '500mg', 1, 1, 1, 1, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(2, '7501234000002', 'Amoxil 500mg', 'Amoxicilina', '500mg', 4, 1, 1, 1, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(3, '7501234000003', 'Paracetamol 500mg', 'Paracetamol', '500mg', 1, 2, 1, 0, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(4, '7501234000004', 'Panadol 500mg', 'Paracetamol', '500mg', 4, 2, 1, 0, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(5, '7501234000005', 'Ibuprofeno 400mg', 'Ibuprofeno', '400mg', 3, 3, 1, 0, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(6, '7501234000006', 'Advil 400mg', 'Ibuprofeno', '400mg', 4, 3, 1, 0, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(7, '7501234000007', 'Loratadina 10mg', 'Loratadina', '10mg', 2, 2, 1, 0, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(8, '7501234000008', 'Claritin 10mg', 'Loratadina', '10mg', 4, 2, 1, 0, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(9, '7501234000009', 'Omeprazol 20mg', 'Omeprazol', '20mg', 1, 2, 4, 1, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(10, '7501234000010', 'Losec 20mg', 'Omeprazol', '20mg', 4, 2, 4, 1, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(11, '7501234000011', 'Metformina 850mg', 'Metformina', '850mg', 3, 2, 1, 1, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(12, '7501234000012', 'Glucophage 850mg', 'Metformina', '850mg', 4, 2, 1, 1, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(13, '7501234000013', 'Vitamina C 1000mg', 'Ácido Ascórbico', '1000mg', 1, 5, 1, 0, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(14, '7501234000014', 'Redoxon 1000mg', 'Ácido Ascórbico', '1000mg', 4, 5, 1, 0, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(15, '7501234000015', 'Azitromicina 500mg', 'Azitromicina', '500mg', 2, 1, 1, 1, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(16, '7501234000016', 'Zithromax 500mg', 'Azitromicina', '500mg', 4, 1, 1, 1, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(17, '7501234000017', 'Atorvastatina 20mg', 'Atorvastatina', '20mg', 3, 2, 1, 1, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(18, '7501234000018', 'Lipitor 20mg', 'Atorvastatina', '20mg', 4, 2, 1, 1, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(19, '7501234000019', 'Diclofenaco 50mg', 'Diclofenaco', '50mg', 1, 3, 1, 0, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(20, '7501234000020', 'Voltaren 50mg', 'Diclofenaco', '50mg', 4, 3, 1, 0, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(21, '7501234000021', 'Albendazol 400mg', 'Albendazol', '400mg', 5, 6, 1, 0, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(22, '7501234000022', 'Zentel 400mg', 'Albendazol', '400mg', 4, 6, 1, 0, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(23, '7501234000023', 'Hidrocortisona Crema 1%', 'Hidrocortisona', '1%', 3, 7, 5, 0, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(24, '7501234000024', 'Betametasona Crema 0.05%', 'Betametasona', '0.05%', 2, 7, 5, 1, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(25, '7501234000025', 'Salbutamol Inhalador', 'Salbutamol', '100mcg', 1, 2, 6, 1, NULL, 1, '2026-05-05 20:38:29', '2026-05-05 20:38:29'),
(26, '76551312320230', 'Clorofemamina', 'Cloro', '150mg', 8, 1, 6, 0, 'xd', 1, '2026-05-05 21:00:31', '2026-05-05 21:00:31'),
(27, '7750123000271', 'Ciprofloxacino 500mg', 'Ciprofloxacino', '500mg', 1, 1, 1, 1, 'Antibiótico de amplio espectro', 1, '2026-05-09 18:02:42', '2026-05-09 18:02:42'),
(28, '7750123000288', 'Ciproxina 500mg', 'Ciprofloxacino', '500mg', 4, 1, 1, 1, 'Ciprofloxacino de marca (Abbott)', 1, '2026-05-09 18:02:42', '2026-05-09 18:02:42'),
(29, '7750123000295', 'Naproxeno 500mg', 'Naproxeno', '500mg', 1, 3, 1, 0, 'Alivio de inflamación y dolor', 1, '2026-05-09 18:02:42', '2026-05-09 18:02:42'),
(30, '7750123000301', 'Apronax 550mg', 'Naproxeno Sódico', '550mg', 4, 3, 1, 0, 'Naproxeno de marca potente', 1, '2026-05-09 18:02:42', '2026-05-09 18:02:42'),
(31, '7750123000318', 'Ketorolaco 10mg', 'Ketorolaco Trometamol', '10mg', 1, 2, 1, 1, 'Analgésico potente', 1, '2026-05-09 18:02:42', '2026-05-09 18:02:42'),
(32, '7750123000325', 'Lansoprazol 30mg', 'Lansoprazol', '30mg', 2, 10, 4, 1, 'Inhibidor de bomba de protones', 1, '2026-05-09 18:02:42', '2026-05-09 18:02:42'),
(33, '7750123000332', 'Magnesia Bisurada', 'Hidróxido de Magnesio', 'Pastilla', 3, 10, 1, 0, 'Antiácido masticable', 1, '2026-05-09 18:02:42', '2026-05-09 18:02:42'),
(34, '7750123000349', 'Complejo B Forte', 'Vitamina B1, B6, B12', 'Forte', 1, 5, 1, 0, 'Suplemento vitamínico B', 1, '2026-05-09 18:02:42', '2026-05-09 18:02:42'),
(35, '7750123000356', 'Neurobion 5000', 'Vitamina B1, B6, B12', '5000', 4, 5, 3, 1, 'Inyectable de complejo B potente', 1, '2026-05-09 18:02:42', '2026-05-09 18:02:42'),
(36, '7750123000363', 'Zinc 20mg', 'Sulfato de Zinc', '20mg', 2, 8, 1, 0, 'Suplemento de Zinc', 1, '2026-05-09 18:02:42', '2026-05-09 18:02:42'),
(37, '7750123000370', 'Cetirizina 10mg', 'Cetirizina', '10mg', 1, 2, 1, 0, 'Antihistamínico', 1, '2026-05-09 18:02:42', '2026-05-09 18:02:42'),
(38, '7750123000387', 'Zyrtec 10mg', 'Cetirizina', '10mg', 4, 2, 1, 0, 'Cetirizina de marca', 1, '2026-05-09 18:02:42', '2026-05-09 18:02:42'),
(39, '7750123000394', 'Enalapril 10mg', 'Enalapril', '10mg', 1, 11, 1, 1, 'Antihipertensivo', 1, '2026-05-09 18:02:42', '2026-05-09 18:02:42'),
(40, '7750123000400', 'Renitec 10mg', 'Enalapril', '10mg', 4, 11, 1, 1, 'Enalapril de marca', 1, '2026-05-09 18:02:42', '2026-05-09 18:02:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_precios`
--

CREATE TABLE `producto_precios` (
  `id_precio` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_unidad` int(11) NOT NULL,
  `cantidad_equivalente` int(11) NOT NULL DEFAULT 1,
  `precio_venta` decimal(10,2) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto_precios`
--

INSERT INTO `producto_precios` (`id_precio`, `id_producto`, `id_unidad`, `cantidad_equivalente`, `precio_venta`, `activo`) VALUES
(1, 1, 1, 1, 0.50, 1),
(2, 2, 1, 1, 1.20, 1),
(3, 3, 1, 1, 0.30, 1),
(4, 4, 1, 1, 0.80, 1),
(5, 5, 1, 1, 0.60, 1),
(6, 6, 1, 1, 1.50, 1),
(7, 7, 1, 1, 0.40, 1),
(8, 8, 1, 1, 1.80, 1),
(9, 9, 1, 1, 0.70, 1),
(10, 10, 1, 1, 2.50, 1),
(11, 11, 1, 1, 0.45, 1),
(12, 12, 1, 1, 1.90, 1),
(13, 13, 1, 1, 0.35, 1),
(14, 14, 1, 1, 2.20, 1),
(15, 15, 1, 1, 1.80, 1),
(16, 16, 1, 1, 4.50, 1),
(17, 17, 1, 1, 0.90, 1),
(18, 18, 1, 1, 3.80, 1),
(19, 19, 1, 1, 0.40, 1),
(20, 20, 1, 1, 1.60, 1),
(21, 21, 1, 1, 2.50, 1),
(22, 22, 1, 1, 5.00, 1),
(23, 23, 1, 1, 3.50, 1),
(24, 24, 1, 1, 6.00, 1),
(25, 25, 1, 1, 18.00, 1),
(26, 27, 1, 1, 0.80, 1),
(27, 28, 1, 1, 2.50, 1),
(28, 29, 1, 1, 0.50, 1),
(29, 30, 1, 1, 1.80, 1),
(30, 31, 1, 1, 0.60, 1),
(31, 32, 1, 1, 1.20, 1),
(32, 33, 1, 1, 0.30, 1),
(33, 34, 1, 1, 0.50, 1),
(34, 35, 1, 1, 15.00, 1),
(35, 36, 1, 1, 0.40, 1),
(36, 37, 1, 1, 0.40, 1),
(37, 38, 1, 1, 2.20, 1),
(38, 39, 1, 1, 0.30, 1),
(39, 40, 1, 1, 1.50, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id_proveedor` int(11) NOT NULL,
  `ruc` char(11) NOT NULL,
  `razon_social` varchar(200) NOT NULL,
  `nombre_comercial` varchar(200) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT 'Laboratorio',
  `direccion` varchar(255) DEFAULT NULL,
  `distrito` varchar(100) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT 'Lima',
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `web` varchar(150) DEFAULT NULL,
  `contacto_nombre` varchar(150) DEFAULT NULL,
  `contacto_cargo` varchar(100) DEFAULT NULL,
  `contacto_telefono` varchar(20) DEFAULT NULL,
  `condicion_pago` varchar(50) DEFAULT 'Contado',
  `notas` text DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id_proveedor`, `ruc`, `razon_social`, `nombre_comercial`, `tipo`, `direccion`, `distrito`, `ciudad`, `telefono`, `email`, `web`, `contacto_nombre`, `contacto_cargo`, `contacto_telefono`, `condicion_pago`, `notas`, `estado`, `created_at`, `updated_at`) VALUES
(1, '20123456789', 'Droguería Pharma S.A.C.', 'Pharma Distribuidores', 'Droguería', NULL, NULL, 'Lima', '988776655', 'ventas@pharma.com', NULL, 'Roberto Carlos', NULL, NULL, 'Contado', NULL, 1, '2026-05-09 17:39:09', '2026-05-09 17:39:09'),
(2, '20987654321', 'Laboratorios Portugal S.R.L.', 'Portugal Pharma', 'Laboratorio', NULL, NULL, 'Lima', '955443322', 'contacto@portugal.pe', NULL, 'Elena Torres', NULL, NULL, 'Contado', NULL, 1, '2026-05-09 17:39:09', '2026-05-09 17:39:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_comprobante`
--

CREATE TABLE `tipos_comprobante` (
  `id_tipo_comprobante` int(11) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `serie_actual` char(4) NOT NULL,
  `correlativo_actual` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipos_comprobante`
--

INSERT INTO `tipos_comprobante` (`id_tipo_comprobante`, `nombre`, `serie_actual`, `correlativo_actual`) VALUES
(1, 'BOLETA', 'B001', 8),
(2, 'FACTURA', 'F001', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_documento_identidad`
--

CREATE TABLE `tipo_documento_identidad` (
  `id_tipo_doc` int(11) NOT NULL,
  `codigo` varchar(5) NOT NULL,
  `descripcion` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tipo_documento_identidad`
--

INSERT INTO `tipo_documento_identidad` (`id_tipo_doc`, `codigo`, `descripcion`) VALUES
(1, 'DNI', 'Documento Nacional de Identidad'),
(2, 'RUC', 'Registro Único de Contribuyentes'),
(3, 'CE', 'Carné de Extranjería'),
(4, 'PAS', 'Pasaporte');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unidades_medida`
--

CREATE TABLE `unidades_medida` (
  `id_unidad` int(11) NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `abreviatura` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `unidades_medida`
--

INSERT INTO `unidades_medida` (`id_unidad`, `nombre`, `abreviatura`) VALUES
(1, 'Unidad', 'UND'),
(2, 'Blíster', 'BLS'),
(3, 'Caja', 'CJA'),
(4, 'Frasco', 'FRS'),
(5, 'Ampolla', 'AMP');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `ultimo_acceso` datetime DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `username`, `password_hash`, `id_empleado`, `ultimo_acceso`, `estado`, `created_at`) VALUES
(1, 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 1, NULL, 1, '2026-05-05 19:36:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id_venta` int(11) NOT NULL,
  `id_tipo_comprobante` int(11) NOT NULL,
  `serie` char(4) NOT NULL,
  `correlativo` int(11) NOT NULL,
  `numero_completo` varchar(20) GENERATED ALWAYS AS (concat(`serie`,'-',lpad(`correlativo`,8,'0'))) STORED,
  `fecha_hora` datetime NOT NULL DEFAULT current_timestamp(),
  `id_cliente` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `forma_pago` enum('CONTADO','CREDITO','TARJETA','TRANSFERENCIA') NOT NULL DEFAULT 'CONTADO',
  `monto_recibido` decimal(10,2) DEFAULT 0.00,
  `vuelto` decimal(10,2) GENERATED ALWAYS AS (greatest(`monto_recibido` - `total`,0)) STORED,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `igv` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` enum('ACTIVA','ANULADA') NOT NULL DEFAULT 'ACTIVA',
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id_venta`, `id_tipo_comprobante`, `serie`, `correlativo`, `fecha_hora`, `id_cliente`, `id_usuario`, `forma_pago`, `monto_recibido`, `subtotal`, `igv`, `total`, `estado`, `observaciones`) VALUES
(1, 1, 'B001', 1, '2026-04-30 20:38:29', 1, 1, 'CONTADO', 50.00, 42.37, 7.63, 50.00, 'ACTIVA', NULL),
(2, 1, 'B001', 2, '2026-04-25 20:38:29', 2, 1, 'CONTADO', 30.00, 25.42, 4.58, 30.00, 'ACTIVA', NULL),
(3, 1, 'B001', 3, '2026-04-20 20:38:29', 3, 1, 'CONTADO', 80.00, 67.80, 12.20, 80.00, 'ACTIVA', NULL),
(4, 1, 'B001', 4, '2026-04-15 20:38:29', 1, 1, 'CONTADO', 60.00, 50.85, 9.15, 60.00, 'ACTIVA', NULL),
(5, 2, 'F001', 1, '2026-04-10 20:38:29', 3, 1, 'TRANSFERENCIA', 200.00, 169.49, 30.51, 200.00, 'ACTIVA', NULL),
(6, 1, 'B001', 5, '2026-03-31 20:38:29', 4, 1, 'CONTADO', 45.00, 38.14, 6.86, 45.00, 'ACTIVA', NULL),
(7, 1, 'B001', 6, '2026-03-16 20:38:29', 2, 1, 'CONTADO', 35.00, 29.66, 5.34, 35.00, 'ACTIVA', NULL),
(8, 1, 'B001', 7, '2026-02-24 20:38:29', 5, 1, 'CONTADO', 55.00, 46.61, 8.39, 55.00, 'ACTIVA', NULL),
(9, 1, 'B001', 8, '2026-05-09 17:58:20', 7, 1, 'CONTADO', 0.30, 0.25, 0.05, 0.30, 'ACTIVA', NULL);

--
-- Disparadores `ventas`
--
DELIMITER $$
CREATE TRIGGER `trg_devolver_stock` AFTER UPDATE ON `ventas` FOR EACH ROW BEGIN
    IF NEW.estado = 'ANULADA' AND OLD.estado = 'ACTIVA' THEN
        UPDATE Lotes l
        JOIN Detalle_Ventas dv ON l.id_lote = dv.id_lote
        SET l.stock_actual = l.stock_actual + dv.cantidad
        WHERE dv.id_venta = NEW.id_venta;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_numero_comprobante` BEFORE INSERT ON `ventas` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_detalle_comprobante`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_detalle_comprobante` (
`id_venta` int(11)
,`numero_completo` varchar(20)
,`tipo_comprobante` varchar(20)
,`fecha_hora` datetime
,`forma_pago` enum('CONTADO','CREDITO','TARJETA','TRANSFERENCIA')
,`cliente` varchar(200)
,`doc_cliente` varchar(15)
,`tipo_doc_cliente` varchar(5)
,`vendedor` varchar(201)
,`producto` varchar(150)
,`unidad` varchar(60)
,`cantidad` int(11)
,`precio_unitario` decimal(10,2)
,`subtotal_linea` decimal(10,2)
,`subtotal` decimal(10,2)
,`igv` decimal(10,2)
,`total` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_productos_criticos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_productos_criticos` (
`id_producto` int(11)
,`nombre_comercial` varchar(150)
,`principio_activo` varchar(150)
,`stock_total` decimal(32,0)
,`stock_minimo_min` int(11)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_resumen_caja`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_resumen_caja` (
`fecha` date
,`ingresos` decimal(32,2)
,`egresos` decimal(32,2)
,`balance` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_stock_alertas`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_stock_alertas` (
`nombre_comercial` varchar(150)
,`numero_lote` varchar(50)
,`unidad_base` varchar(60)
,`stock_actual` int(11)
,`stock_minimo` int(11)
,`fecha_vencimiento` date
,`dias_para_vencer` int(7)
,`alerta` varchar(16)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_ventas_por_dia`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_ventas_por_dia` (
`fecha` date
,`total_ventas` bigint(21)
,`ingresos_total` decimal(32,2)
,`boletas` decimal(22,0)
,`facturas` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `v_detalle_comprobante`
--
DROP TABLE IF EXISTS `v_detalle_comprobante`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_detalle_comprobante`  AS SELECT `v`.`id_venta` AS `id_venta`, `v`.`numero_completo` AS `numero_completo`, `tc`.`nombre` AS `tipo_comprobante`, `v`.`fecha_hora` AS `fecha_hora`, `v`.`forma_pago` AS `forma_pago`, `c`.`nombres_razon` AS `cliente`, `c`.`numero_documento` AS `doc_cliente`, `tdi`.`codigo` AS `tipo_doc_cliente`, concat(`e`.`nombres`,' ',`e`.`apellidos`) AS `vendedor`, `p`.`nombre_comercial` AS `producto`, `um`.`nombre` AS `unidad`, `dv`.`cantidad` AS `cantidad`, `dv`.`precio_unitario` AS `precio_unitario`, `dv`.`subtotal` AS `subtotal_linea`, `v`.`subtotal` AS `subtotal`, `v`.`igv` AS `igv`, `v`.`total` AS `total` FROM (((((((((`detalle_ventas` `dv` join `ventas` `v` on(`dv`.`id_venta` = `v`.`id_venta`)) join `tipos_comprobante` `tc` on(`v`.`id_tipo_comprobante` = `tc`.`id_tipo_comprobante`)) join `clientes` `c` on(`v`.`id_cliente` = `c`.`id_cliente`)) join `tipo_documento_identidad` `tdi` on(`c`.`id_tipo_doc` = `tdi`.`id_tipo_doc`)) join `usuarios` `u` on(`v`.`id_usuario` = `u`.`id_usuario`)) join `empleados` `e` on(`u`.`id_empleado` = `e`.`id_empleado`)) join `productos` `p` on(`dv`.`id_producto` = `p`.`id_producto`)) join `producto_precios` `pp` on(`dv`.`id_precio` = `pp`.`id_precio`)) join `unidades_medida` `um` on(`pp`.`id_unidad` = `um`.`id_unidad`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_productos_criticos`
--
DROP TABLE IF EXISTS `v_productos_criticos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_productos_criticos`  AS SELECT `p`.`id_producto` AS `id_producto`, `p`.`nombre_comercial` AS `nombre_comercial`, `p`.`principio_activo` AS `principio_activo`, sum(`l`.`stock_actual`) AS `stock_total`, min(`l`.`stock_minimo`) AS `stock_minimo_min` FROM (`productos` `p` join `lotes` `l` on(`p`.`id_producto` = `l`.`id_producto`)) GROUP BY `p`.`id_producto` HAVING `stock_total` <= `stock_minimo_min` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_resumen_caja`
--
DROP TABLE IF EXISTS `v_resumen_caja`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_resumen_caja`  AS SELECT cast(`movimientos_caja`.`fecha_hora` as date) AS `fecha`, sum(case when `movimientos_caja`.`tipo` = 'INGRESO' then `movimientos_caja`.`monto` else 0 end) AS `ingresos`, sum(case when `movimientos_caja`.`tipo` = 'EGRESO' then `movimientos_caja`.`monto` else 0 end) AS `egresos`, sum(case when `movimientos_caja`.`tipo` = 'INGRESO' then `movimientos_caja`.`monto` else -`movimientos_caja`.`monto` end) AS `balance` FROM `movimientos_caja` GROUP BY cast(`movimientos_caja`.`fecha_hora` as date) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_stock_alertas`
--
DROP TABLE IF EXISTS `v_stock_alertas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_stock_alertas`  AS SELECT `p`.`nombre_comercial` AS `nombre_comercial`, `l`.`numero_lote` AS `numero_lote`, `um_base`.`nombre` AS `unidad_base`, `l`.`stock_actual` AS `stock_actual`, `l`.`stock_minimo` AS `stock_minimo`, `l`.`fecha_vencimiento` AS `fecha_vencimiento`, to_days(`l`.`fecha_vencimiento`) - to_days(curdate()) AS `dias_para_vencer`, CASE WHEN `l`.`stock_actual` = 0 THEN 'SIN STOCK' WHEN `l`.`stock_actual` < `l`.`stock_minimo` THEN 'STOCK BAJO' WHEN to_days(`l`.`fecha_vencimiento`) - to_days(curdate()) <= 30 THEN 'PRÓXIMO A VENCER' ELSE 'OK' END AS `alerta` FROM ((`lotes` `l` join `productos` `p` on(`l`.`id_producto` = `p`.`id_producto`)) join `unidades_medida` `um_base` on(`um_base`.`abreviatura` = 'UND')) WHERE `p`.`estado` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_ventas_por_dia`
--
DROP TABLE IF EXISTS `v_ventas_por_dia`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_ventas_por_dia`  AS SELECT cast(`v`.`fecha_hora` as date) AS `fecha`, count(`v`.`id_venta`) AS `total_ventas`, sum(`v`.`total`) AS `ingresos_total`, sum(case when `tc`.`nombre` = 'BOLETA' then 1 else 0 end) AS `boletas`, sum(case when `tc`.`nombre` = 'FACTURA' then 1 else 0 end) AS `facturas` FROM (`ventas` `v` join `tipos_comprobante` `tc` on(`v`.`id_tipo_comprobante` = `tc`.`id_tipo_comprobante`)) WHERE `v`.`estado` = 'ACTIVA' GROUP BY cast(`v`.`fecha_hora` as date) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cajas`
--
ALTER TABLE `cajas`
  ADD PRIMARY KEY (`id_caja`),
  ADD KEY `fk_caja_usuario` (`id_usuario`);

--
-- Indices de la tabla `cargos`
--
ALTER TABLE `cargos`
  ADD PRIMARY KEY (`id_cargo`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `uq_cli_doc` (`id_tipo_doc`,`numero_documento`),
  ADD KEY `idx_cli_doc` (`numero_documento`);

--
-- Indices de la tabla `compras`
--
ALTER TABLE `compras`
  ADD PRIMARY KEY (`id_compra`),
  ADD KEY `fk_compra_prov` (`id_proveedor`),
  ADD KEY `fk_compra_usr` (`id_usuario`);

--
-- Indices de la tabla `detalle_compras`
--
ALTER TABLE `detalle_compras`
  ADD PRIMARY KEY (`id_detalle_compra`),
  ADD KEY `fk_dc_compra` (`id_compra`),
  ADD KEY `fk_dc_prod` (`id_producto`);

--
-- Indices de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `fk_det_prod` (`id_producto`),
  ADD KEY `fk_det_precio` (`id_precio`),
  ADD KEY `fk_det_lote` (`id_lote`),
  ADD KEY `idx_det_venta` (`id_venta`);

--
-- Indices de la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD PRIMARY KEY (`id_empleado`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD KEY `fk_emp_cargo` (`id_cargo`);

--
-- Indices de la tabla `laboratorios`
--
ALTER TABLE `laboratorios`
  ADD PRIMARY KEY (`id_laboratorio`),
  ADD UNIQUE KEY `ruc` (`ruc`);

--
-- Indices de la tabla `lotes`
--
ALTER TABLE `lotes`
  ADD PRIMARY KEY (`id_lote`),
  ADD UNIQUE KEY `uq_lote` (`id_producto`,`numero_lote`),
  ADD KEY `idx_lote_stock` (`stock_actual`),
  ADD KEY `idx_lote_venc` (`fecha_vencimiento`);

--
-- Indices de la tabla `movimientos_caja`
--
ALTER TABLE `movimientos_caja`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `fk_mov_caja` (`id_caja`),
  ADD KEY `fk_mov_usuario` (`id_usuario`),
  ADD KEY `idx_fecha_hora` (`fecha_hora`);

--
-- Indices de la tabla `presentaciones`
--
ALTER TABLE `presentaciones`
  ADD PRIMARY KEY (`id_presentacion`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`),
  ADD UNIQUE KEY `codigo_barra` (`codigo_barra`),
  ADD KEY `fk_prod_lab` (`id_laboratorio`),
  ADD KEY `fk_prod_cat` (`id_categoria`),
  ADD KEY `fk_prod_pres` (`id_presentacion`),
  ADD KEY `idx_prod_nombre` (`nombre_comercial`),
  ADD KEY `idx_prod_activo` (`principio_activo`),
  ADD KEY `idx_prod_estado` (`estado`);

--
-- Indices de la tabla `producto_precios`
--
ALTER TABLE `producto_precios`
  ADD PRIMARY KEY (`id_precio`),
  ADD UNIQUE KEY `uq_prod_unidad` (`id_producto`,`id_unidad`),
  ADD KEY `fk_pp_unidad` (`id_unidad`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id_proveedor`),
  ADD UNIQUE KEY `ruc` (`ruc`);

--
-- Indices de la tabla `tipos_comprobante`
--
ALTER TABLE `tipos_comprobante`
  ADD PRIMARY KEY (`id_tipo_comprobante`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `tipo_documento_identidad`
--
ALTER TABLE `tipo_documento_identidad`
  ADD PRIMARY KEY (`id_tipo_doc`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `unidades_medida`
--
ALTER TABLE `unidades_medida`
  ADD PRIMARY KEY (`id_unidad`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `id_empleado` (`id_empleado`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id_venta`),
  ADD UNIQUE KEY `uq_comprobante` (`serie`,`correlativo`),
  ADD KEY `fk_vta_tipo` (`id_tipo_comprobante`),
  ADD KEY `idx_vta_fecha` (`fecha_hora`),
  ADD KEY `idx_vta_cliente` (`id_cliente`),
  ADD KEY `idx_vta_usuario` (`id_usuario`),
  ADD KEY `idx_vta_estado` (`estado`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cajas`
--
ALTER TABLE `cajas`
  MODIFY `id_caja` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cargos`
--
ALTER TABLE `cargos`
  MODIFY `id_cargo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `compras`
--
ALTER TABLE `compras`
  MODIFY `id_compra` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_compras`
--
ALTER TABLE `detalle_compras`
  MODIFY `id_detalle_compra` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `id_empleado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `laboratorios`
--
ALTER TABLE `laboratorios`
  MODIFY `id_laboratorio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `lotes`
--
ALTER TABLE `lotes`
  MODIFY `id_lote` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT de la tabla `movimientos_caja`
--
ALTER TABLE `movimientos_caja`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `presentaciones`
--
ALTER TABLE `presentaciones`
  MODIFY `id_presentacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `producto_precios`
--
ALTER TABLE `producto_precios`
  MODIFY `id_precio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id_proveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tipos_comprobante`
--
ALTER TABLE `tipos_comprobante`
  MODIFY `id_tipo_comprobante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tipo_documento_identidad`
--
ALTER TABLE `tipo_documento_identidad`
  MODIFY `id_tipo_doc` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `unidades_medida`
--
ALTER TABLE `unidades_medida`
  MODIFY `id_unidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id_venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cajas`
--
ALTER TABLE `cajas`
  ADD CONSTRAINT `fk_caja_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `fk_cli_tipo_doc` FOREIGN KEY (`id_tipo_doc`) REFERENCES `tipo_documento_identidad` (`id_tipo_doc`);

--
-- Filtros para la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD CONSTRAINT `fk_det_lote` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id_lote`),
  ADD CONSTRAINT `fk_det_precio` FOREIGN KEY (`id_precio`) REFERENCES `producto_precios` (`id_precio`),
  ADD CONSTRAINT `fk_det_prod` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`),
  ADD CONSTRAINT `fk_det_vta` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`);

--
-- Filtros para la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD CONSTRAINT `fk_emp_cargo` FOREIGN KEY (`id_cargo`) REFERENCES `cargos` (`id_cargo`);

--
-- Filtros para la tabla `lotes`
--
ALTER TABLE `lotes`
  ADD CONSTRAINT `fk_lote_prod` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`);

--
-- Filtros para la tabla `movimientos_caja`
--
ALTER TABLE `movimientos_caja`
  ADD CONSTRAINT `fk_mov_caja` FOREIGN KEY (`id_caja`) REFERENCES `cajas` (`id_caja`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_mov_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_prod_cat` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`),
  ADD CONSTRAINT `fk_prod_lab` FOREIGN KEY (`id_laboratorio`) REFERENCES `laboratorios` (`id_laboratorio`),
  ADD CONSTRAINT `fk_prod_pres` FOREIGN KEY (`id_presentacion`) REFERENCES `presentaciones` (`id_presentacion`);

--
-- Filtros para la tabla `producto_precios`
--
ALTER TABLE `producto_precios`
  ADD CONSTRAINT `fk_pp_prod` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`),
  ADD CONSTRAINT `fk_pp_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidades_medida` (`id_unidad`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usr_empleado` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id_empleado`);

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `fk_vta_cli` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  ADD CONSTRAINT `fk_vta_tipo` FOREIGN KEY (`id_tipo_comprobante`) REFERENCES `tipos_comprobante` (`id_tipo_comprobante`),
  ADD CONSTRAINT `fk_vta_usr` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
