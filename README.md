# Botica Nova Salud - Sistema de Gestión de Ventas

Este es un sistema integral de gestión para la **Botica Nova Salud**, diseñado para administrar el inventario, las ventas, los clientes y el personal de manera eficiente.

## 🚀 Tecnologías Utilizadas

### Backend
- **Node.js** y **Express**: Servidor de aplicaciones.
- **MySQL**: Base de datos relacional.
- **dotenv**: Gestión de variables de entorno.
- **CORS**: Intercambio de recursos de origen cruzado.
- **mysql2**: Driver para la conexión con MySQL.

### Frontend
- **React**: Biblioteca de UI.
- **Vite**: Herramienta de construcción rápida.
- **Tailwind CSS**: Framework de estilos.
- **Lucide React**: Iconografía.
- **Axios**: Cliente HTTP para peticiones al API.

---

## 📁 Estructura del Proyecto

```text
tareadehoy/
├── backend/                # Servidor Node.js
│   ├── routes/             # Definición de endpoints (auth, clientes, etc.)
│   ├── db.js               # Configuración de conexión a MySQL
│   ├── server.js           # Punto de entrada del servidor
│   └── .env                # Variables de entorno (Configuración DB)
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables (Navbar, Sidebar)
│   │   ├── pages/          # Vistas principales (Login, Ventas, etc.)
│   │   └── App.jsx         # Componente raíz
│   └── tailwind.config.js  # Configuración de estilos
└── BoticaNovaSalud_DB.sql  # Script de creación de la base de datos
```

---

## 🛠️ Configuración e Instalación

### 1. Requisitos Previos
- Node.js instalado.
- MySQL Server corriendo localmente.

### 2. Base de Datos
1. Abre tu gestor de MySQL (como phpMyAdmin o MySQL Workbench).
2. Importa el archivo `BoticaNovaSalud_DB.sql` para crear la base de datos y las tablas necesarias.

### 3. Configuración del Backend
1. Navega a la carpeta `backend`:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Verifica el archivo `.env` (ya configurado):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=BoticaNovaSalud
   ```

### 4. Configuración del Frontend
1. Navega a la carpeta `frontend`:
   ```bash
   cd ../frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```

---

## 🏃 Cómo Iniciar el Proyecto

Debes tener dos terminales abiertas para ejecutar ambos servicios simultáneamente:

### Iniciar el Backend
Desde la carpeta `backend`:
```bash
npm start
```
*El servidor correrá en `http://localhost:5000`*

### Iniciar el Frontend
Desde la carpeta `frontend`:
```bash
npm run dev
```
*La aplicación estará disponible en `http://localhost:5173`*

---

## 🔐 Credenciales de Acceso (Ejemplo)
Si ya creaste el usuario recomendado, puedes ingresar con:
- **Usuario**: `admin`
- **Contraseña**: `admin123`

---

## 📝 Notas Adicionales
- Los puertos del frontend han sido actualizados para comunicarse con el puerto `5000` del backend.
- La base de datos utiliza `SHA2` de 256 bits para el almacenamiento seguro de contraseñas.
