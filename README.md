# Botica Nova Salud - Sistema de Gestión de Ventas

Sistema integral de gestión para la **Botica Nova Salud**, con inventario, ventas, clientes y alertas inteligentes de stock y vencimiento.

## 🚀 Tecnologías

### Backend
- **Node.js** + **Express** · **MySQL** · **mysql2** · **dotenv** · **CORS**

### Frontend
- **React 18** + **Vite** · **Tailwind CSS** · **Lucide React** · **Axios** · **React Router v6**

---

## 📁 Estructura del Proyecto

```
tareadehoy/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Autenticación
│   │   ├── productos.js     # Inventario + alertas stock/vencimiento
│   │   ├── ventas.js        # POS + top vendidos
│   │   └── clientes.js      # Directorio de clientes
│   ├── db.js
│   ├── server.js
│   └── .env
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── StockBadge.jsx          # Badge rojo de stock crítico
│       │   ├── VencimientoBadge.jsx    # Badge de vencimiento (CRÍTICO/PRÓXIMO/OK)
│       │   ├── BuscadorProductos.jsx   # Búsqueda fuzzy por nombre y principio activo
│       │   ├── TopVendidosChart.jsx    # Gráfico de barras top 5 vendidos
│       │   └── AlertasVencimiento.jsx  # Panel de alertas + exportación PDF
│       ├── i18n/
│       │   ├── es.js                   # Traducciones en español
│       │   └── index.jsx               # Contexto i18n (useI18n hook)
│       └── pages/
│           ├── Login.jsx
│           ├── Dashboard.jsx           # KPIs + top vendidos + alertas
│           ├── Productos.jsx           # Inventario con filtros y alertas
│           ├── Ventas.jsx              # POS con buscador avanzado
│           └── Clientes.jsx
├── BoticaNovaSalud_DB.sql              # Schema principal
└── BoticaNovaSalud_Additions.sql       # Vistas e índices adicionales
```

---

## 🛠️ Instalación

### 1. Base de Datos
```sql
-- Primero importa el schema principal:
source BoticaNovaSalud_DB.sql;

-- Luego aplica las adiciones (vistas e índices):
source BoticaNovaSalud_Additions.sql;
```

### 2. Backend
```bash
cd backend
npm install
npm start   # Puerto 5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev  # Puerto 5173
```

---

## ✨ Funcionalidades Implementadas

### 1. Sistema de Alertas de Stock Crítico
- **Badge rojo animado** (`StockBadge`) cuando `stock_actual <= stock_minimo`
- Vista SQL `v_productos_criticos` optimizada
- Endpoint `GET /api/productos/criticos`
- Filtro "Stock Crítico" en la página de Inventario
- Panel de alertas en el Dashboard con contador en tiempo real

### 2. Dashboard "Lo más vendido"
- Componente `TopVendidosChart` con gráfico de barras horizontal
- Período configurable: **30 / 60 / 90 días**
- Paleta de colores diferenciada por posición (1°-5°)
- Endpoint `GET /api/ventas/top-vendidos?dias=30`
- Estados de carga y vacío incluidos

### 3. Buscador por Principio Activo
- Componente `BuscadorProductos` con búsqueda fuzzy (debounce 300ms)
- Búsqueda simultánea por `nombre_comercial` y `principio_activo`
- Resultados **agrupados por principio activo** con acordeón
- Indicador visual de stock (disponible / bajo / sin stock)
- Precios comparativos entre marcas del mismo grupo
- Etiqueta "GENÉRICO ALTERNATIVO" cuando el producto sin stock tiene alternativas
- Integrado en Ventas y Productos

### 4. Alertas de Vencimiento Próximo
- Componente `AlertasVencimiento` con filtros CRÍTICO / PRÓXIMO
- Categorías: **CRÍTICO** (≤7d, rojo pulsante), **PRÓXIMO** (8-30d, amarillo), **OK** (>30d)
- `VencimientoBadge` en la tabla de inventario
- **Exportación a PDF** nativa del navegador (sin dependencias extra)
- Vista SQL `v_productos_por_vencer`
- Endpoint `GET /api/productos/por-vencer?categoria=CRITICO`

### 5. Internacionalización (i18n)
- Contexto `I18nProvider` + hook `useI18n`
- Archivo de traducciones `es.js` con todas las cadenas del sistema
- Preparado para agregar nuevos idiomas (crear `en.js`, etc.)

### 6. Accesibilidad (WCAG 2.1 AA)
- Roles ARIA en tablas, listas y controles interactivos
- `aria-label`, `aria-live`, `aria-pressed`, `aria-expanded`
- Focus visible con outline de color de marca
- Soporte `prefers-reduced-motion`
- Textos alternativos en todos los íconos

---

## 🔐 Credenciales de Acceso
- **Usuario**: `admin`
- **Contraseña**: `admin123`

---

## � Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Autenticación |
| GET | `/api/productos` | Listado completo |
| GET | `/api/productos/criticos` | Stock crítico |
| GET | `/api/productos/por-vencer` | Próximos a vencer (30d) |
| GET | `/api/productos/search?term=` | Búsqueda fuzzy |
| GET | `/api/ventas/resumen-hoy` | KPIs del día |
| GET | `/api/ventas/top-vendidos?dias=` | Top 5 más vendidos |
| POST | `/api/ventas` | Registrar venta |
| GET | `/api/clientes` | Listado de clientes |
| GET | `/api/clientes/buscar/:doc` | Buscar por documento |
