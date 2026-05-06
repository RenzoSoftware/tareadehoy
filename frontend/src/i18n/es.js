/**
 * @fileoverview Traducciones en español (idioma base)
 * Para agregar un nuevo idioma, crea un archivo similar (ej: en.js)
 * y actualiza el contexto I18nContext.
 */

const es = {
  // Navegación
  nav: {
    dashboard:  'Dashboard',
    ventas:     'Ventas',
    productos:  'Productos',
    clientes:   'Clientes',
    logout:     'Cerrar Sesión',
  },

  // Dashboard
  dashboard: {
    title:          'Visión General',
    subtitle:       'Análisis de rendimiento y stock',
    ventasDia:      'Ventas del Día',
    transacciones:  'Transacciones',
    stockCritico:   'Stock Crítico',
    productos:      'Productos',
    topProductos:   'PRODUCTOS TOP',
    alertasCriticas:'ALERTAS CRÍTICAS',
    sinDatos:       'Sin datos en este periodo',
    todoControl:    'Todo el inventario está bajo control',
    dias:           'DÍAS',
  },

  // Productos / Inventario
  productos: {
    title:          'Inventario',
    subtitle:       'Gestión Global de Stock',
    nuevo:          'Nuevo Producto',
    buscar:         'Buscar por marca, principio activo o categoría...',
    columnas: {
      producto:     'Producto / Composición',
      categoria:    'Categoría / Lab',
      existencias:  'Existencias',
      vencimiento:  'Vencimiento',
      gestion:      'Gestión',
    },
    reabastecer:    'REABASTECER',
    sinProductos:   'No se encontraron productos en el inventario',
    cargando:       'Cargando inventario...',
    filtros: {
      todos:        'Todos',
      criticos:     'Stock Crítico',
      porVencer:    'Por Vencer',
    },
    vencimiento: {
      critico:      'CRÍTICO',
      proximo:      'PRÓXIMO',
      normal:       'OK',
      na:           'N/A',
    },
  },

  // Alertas de vencimiento
  vencimiento: {
    title:          'Alertas de Vencimiento',
    subtitle:       'Productos próximos a vencer en los próximos 30 días',
    filtro: {
      todos:        'Todos',
      critico:      'Crítico (≤7 días)',
      proximo:      'Próximo (8-30 días)',
    },
    dias:           'días',
    lote:           'Lote',
    stock:          'Stock',
    exportarPDF:    'Exportar PDF',
    sinAlertas:     'No hay productos próximos a vencer',
  },

  // Búsqueda
  busqueda: {
    placeholder:    'Buscar por nombre comercial o principio activo...',
    sinResultados:  'No se encontraron resultados',
    disponible:     'Disponible',
    sinStock:       'Sin stock',
    alternativas:   'Alternativas genéricas',
    precio:         'Precio',
    grupo:          'Grupo',
  },

  // Ventas
  ventas: {
    tipoComprobante:'Tipo Comprobante',
    buscarCliente:  'Buscar Cliente (DNI/RUC)',
    buscarProducto: 'Buscar Producto',
    resumen:        'Resumen',
    total:          'Total:',
    finalizarVenta: 'FINALIZAR VENTA',
    carritoVacio:   'No hay productos en el detalle',
    columnas: {
      producto:     'Producto',
      precio:       'Precio',
      cantidad:     'Cant.',
      subtotal:     'Subtotal',
    },
  },

  // Clientes
  clientes: {
    title:          'Directorio de Clientes',
    nuevo:          'Nuevo Cliente',
    buscar:         'Buscar por nombre o documento...',
    sinTelefono:    'Sin teléfono',
    sinDireccion:   'Sin dirección',
    sinClientes:    'No se encontraron clientes que coincidan con la búsqueda.',
  },

  // Errores comunes
  errores: {
    conexion:       'No se pudo conectar con el servidor.',
    generico:       'Ocurrió un error inesperado.',
    cargando:       'Cargando...',
  },
};

export default es;
