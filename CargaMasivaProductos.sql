-- ============================================================
--  CARGA MASIVA DE PRODUCTOS - BOTICA NOVA SALUD
-- ============================================================

-- 1. Insertar más Categorías (si faltan)
INSERT INTO `categorias` (`id_categoria`, `nombre`, `descripcion`, `estado`) VALUES
(8, 'Suplementos', 'Suplementos alimenticios', 1),
(9, 'Pediatría', 'Medicamentos para niños', 1),
(10, 'Gastroenterología', 'Medicamentos digestivos', 1),
(11, 'Cardiología', 'Salud cardiovascular', 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- 2. Insertar más Productos (Genéricos y de Marca)
INSERT INTO `productos` (`id_producto`, `codigo_barra`, `nombre_comercial`, `principio_activo`, `concentracion`, `id_laboratorio`, `id_categoria`, `id_presentacion`, `requiere_receta`, `descripcion`) VALUES
-- Antibióticos
(27, '7750123000271', 'Ciprofloxacino 500mg', 'Ciprofloxacino', '500mg', 1, 1, 1, 1, 'Antibiótico de amplio espectro'),
(28, '7750123000288', 'Ciproxina 500mg', 'Ciprofloxacino', '500mg', 4, 1, 1, 1, 'Ciprofloxacino de marca (Abbott)'),
-- Analgésicos / Antiinflamatorios
(29, '7750123000295', 'Naproxeno 500mg', 'Naproxeno', '500mg', 1, 3, 1, 0, 'Alivio de inflamación y dolor'),
(30, '7750123000301', 'Apronax 550mg', 'Naproxeno Sódico', '550mg', 4, 3, 1, 0, 'Naproxeno de marca potente'),
(31, '7750123000318', 'Ketorolaco 10mg', 'Ketorolaco Trometamol', '10mg', 1, 2, 1, 1, 'Analgésico potente'),
-- Gastro
(32, '7750123000325', 'Lansoprazol 30mg', 'Lansoprazol', '30mg', 2, 10, 4, 1, 'Inhibidor de bomba de protones'),
(33, '7750123000332', 'Magnesia Bisurada', 'Hidróxido de Magnesio', 'Pastilla', 3, 10, 1, 0, 'Antiácido masticable'),
-- Suplementos / Vitaminas
(34, '7750123000349', 'Complejo B Forte', 'Vitamina B1, B6, B12', 'Forte', 1, 5, 1, 0, 'Suplemento vitamínico B'),
(35, '7750123000356', 'Neurobion 5000', 'Vitamina B1, B6, B12', '5000', 4, 5, 3, 1, 'Inyectable de complejo B potente'),
(36, '7750123000363', 'Zinc 20mg', 'Sulfato de Zinc', '20mg', 2, 8, 1, 0, 'Suplemento de Zinc'),
-- Otros
(37, '7750123000370', 'Cetirizina 10mg', 'Cetirizina', '10mg', 1, 2, 1, 0, 'Antihistamínico'),
(38, '7750123000387', 'Zyrtec 10mg', 'Cetirizina', '10mg', 4, 2, 1, 0, 'Cetirizina de marca'),
(39, '7750123000394', 'Enalapril 10mg', 'Enalapril', '10mg', 1, 11, 1, 1, 'Antihipertensivo'),
(40, '7750123000400', 'Renitec 10mg', 'Enalapril', '10mg', 4, 11, 1, 1, 'Enalapril de marca')
ON DUPLICATE KEY UPDATE nombre_comercial=VALUES(nombre_comercial);

-- 3. Insertar Precios para los nuevos productos
INSERT INTO `producto_precios` (`id_producto`, `id_unidad`, `cantidad_equivalente`, `precio_venta`, `activo`) VALUES
(27, 1, 1, 0.80, 1),
(28, 1, 1, 2.50, 1),
(29, 1, 1, 0.50, 1),
(30, 1, 1, 1.80, 1),
(31, 1, 1, 0.60, 1),
(32, 1, 1, 1.20, 1),
(33, 1, 1, 0.30, 1),
(34, 1, 1, 0.50, 1),
(35, 1, 1, 15.00, 1),
(36, 1, 1, 0.40, 1),
(37, 1, 1, 0.40, 1),
(38, 1, 1, 2.20, 1),
(39, 1, 1, 0.30, 1),
(40, 1, 1, 1.50, 1);

-- 4. Insertar Lotes (Stock inicial) para los nuevos productos
-- Nota: Usamos fechas de vencimiento variadas
INSERT INTO `lotes` (`id_producto`, `numero_lote`, `fecha_vencimiento`, `stock_actual`, `stock_minimo`) VALUES
(27, 'LOT-CIP-001', '2027-12-01', 150, 20),
(28, 'LOT-CPX-001', '2028-06-15', 50, 10),
(29, 'LOT-NAP-001', '2027-10-20', 200, 30),
(30, 'LOT-APX-001', '2028-02-28', 80, 15),
(31, 'LOT-KET-001', '2027-08-10', 100, 20),
(32, 'LOT-LAN-001', '2027-09-05', 120, 15),
(33, 'LOT-MAG-001', '2028-01-12', 300, 50),
(34, 'LOT-CBF-001', '2027-11-30', 250, 40),
(35, 'LOT-NEU-001', '2026-12-20', 40, 5),
(36, 'LOT-ZNC-001', '2027-07-15', 180, 30),
(37, 'LOT-CET-001', '2027-05-25', 220, 30),
(38, 'LOT-ZYR-001', '2028-03-10', 60, 10),
(39, 'LOT-ENA-001', '2027-02-14', 160, 25),
(40, 'LOT-REN-001', '2027-08-20', 45, 10);
