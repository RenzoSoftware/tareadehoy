# Documentación Técnica y Manual de Usuario - Botica Nova Salud

## 1. Análisis Técnico de Mejoras

### 1.1 Interfaz de Usuario (UI/UX)
- **Problema**: El modal de productos aparecía desalineado en la parte inferior.
- **Solución**: Se actualizó el sistema de posicionamiento en `index.css` usando Flexbox centrado (`items-center justify-center`) y se incrementó el `z-index` a 100.
- **Mejora de Temas**: Se implementó una transición CSS global de 0.3s para suavizar el cambio entre modo claro y oscuro, evitando el parpadeo de colores.
- **Animaciones**: Se añadieron animaciones de escala y opacidad (`modal-scale-in`) para una entrada más orgánica de los componentes.

### 1.2 Módulo de Ventas
- **Integración con DB**: Se migró la lógica de inserción simple a un Procedimiento Almacenado (`sp_registrar_venta`) que maneja transacciones atómicas.
- **Gestión de Stock**: El backend ahora selecciona automáticamente los lotes por fecha de vencimiento (FEFO) para descontar el stock de manera inteligente.
- **Comprobantes**: Se habilitó la selección dinámica de tipos de comprobante (Boleta, Factura) consultando directamente la tabla `tipos_comprobante`.

### 1.3 Seguridad y Roles (Multi-tenant)
- **Middleware**: Se creó `backend/middleware/auth.js` para validar la identidad del usuario y su rol en cada petición.
- **RBAC (Role-Based Access Control)**:
    - **Administrador**: Acceso total, incluyendo paneles de configuración, cargos y categorías.
    - **Cajero**: Acceso a ventas y clientes.
    - **Almacenero**: Acceso a productos e inventario.

---

## 2. Manual de Usuario (Nuevas Funciones Administrativas)

### 2.1 Acceso al Panel de Administración
Solo los usuarios con el cargo de "Administrador" verán la sección "Administración" en el menú lateral.

### 2.2 Gestión de Categorías
- Diríjase a **Administración > Categorías**.
- Use el botón **"Nueva Categoría"** para agregar clasificaciones de productos.
- Puede editar o eliminar categorías existentes usando los iconos de acción.

### 2.3 Gestión de Cargos
- Diríjase a **Administración > Cargos**.
- Aquí podrá visualizar los roles definidos en el sistema y sus descripciones.

### 2.4 Registro de Ventas con Comprobante
- En el módulo de **Ventas**, seleccione el **Tipo de Comprobante**.
- Ingrese el **Monto Recibido**; el sistema calculará automáticamente el vuelto si el monto supera el total de la venta.
- Haga clic en **"Finalizar Venta"** para registrar la transacción y descontar el stock.
