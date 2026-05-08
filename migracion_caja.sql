-- ============================================================
--  MIGRACIÓN: Tablas faltantes para el módulo Caja del Día
--  Ejecutar en la base de datos: boticanovasalud
-- ============================================================

-- ------------------------------------------------------------
-- Tabla: Cajas  (registro de apertura/cierre de caja diaria)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Cajas` (
  `id_caja`              INT(11)        NOT NULL AUTO_INCREMENT,
  `monto_inicial`        DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  `monto_final`          DECIMAL(10,2)           DEFAULT NULL,
  `observaciones`        TEXT                    DEFAULT NULL,
  `observaciones_cierre` TEXT                    DEFAULT NULL,
  `estado`               VARCHAR(10)    NOT NULL DEFAULT 'Abierta'
                           COMMENT 'Valores: Abierta | Cerrada',
  `id_usuario`           INT(11)        NOT NULL,
  `fecha_apertura`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_cierre`         DATETIME                DEFAULT NULL,
  PRIMARY KEY (`id_caja`),
  KEY `fk_caja_usuario` (`id_usuario`),
  CONSTRAINT `fk_caja_usuario`
    FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabla: Movimientos_Caja  (ingresos y egresos del día)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Movimientos_Caja` (
  `id_movimiento` INT(11)        NOT NULL AUTO_INCREMENT,
  `id_caja`       INT(11)                 DEFAULT NULL
                    COMMENT 'FK a la caja del día (opcional)',
  `tipo`          VARCHAR(10)    NOT NULL
                    COMMENT 'Valores: INGRESO | EGRESO',
  `categoria`     VARCHAR(50)    NOT NULL DEFAULT 'Otro',
  `monto`         DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  `descripcion`   VARCHAR(255)            DEFAULT NULL,
  `forma_pago`    VARCHAR(20)    NOT NULL DEFAULT 'EFECTIVO'
                    COMMENT 'Valores: EFECTIVO | TARJETA | YAPE | PLIN',
  `id_usuario`    INT(11)        NOT NULL,
  `fecha_hora`    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_movimiento`),
  KEY `fk_mov_caja`    (`id_caja`),
  KEY `fk_mov_usuario` (`id_usuario`),
  KEY `idx_fecha_hora` (`fecha_hora`),
  CONSTRAINT `fk_mov_caja`
    FOREIGN KEY (`id_caja`) REFERENCES `Cajas` (`id_caja`)
      ON DELETE SET NULL,
  CONSTRAINT `fk_mov_usuario`
    FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
