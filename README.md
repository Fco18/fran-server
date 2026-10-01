# Sistema de Gestión Escolar - API REST

## Descripción

API REST para la gestión de una institución educativa. El sistema permite administrar estudiantes, asistencias, inventario y pagos.

## Tecnologías Utilizadas

- Node.js
- Express.js
- MongoDB (MongoDB Atlas)
- Mongoose
- dotenv (variables de entorno)
- CORS

## Requisitos Previos

- Node.js (versión 14 o superior)
- MongoDB Atlas cuenta y conexión
- npm (gestor de paquetes de Node.js)

## Instalación

1. Clonar el repositorio:

```bash
git clone [URL_DEL_REPOSITORIO]
cd fran_server
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:
   - Crear archivo `.env` en la raíz del proyecto
   - Agregar las siguientes variables:

```env
MONGODB_URI=tu_url_de_conexion_mongodb
PORT=3002
```

## Comandos Disponibles

- **Desarrollo con auto-recarga:**

```bash
npm run dev
```

- **Construir el proyecto:**

```bash
npm run build
```

- **Ejecutar en producción:**

```bash
npm run prod
```

- **Iniciar servidor:**

```bash
npm start
```

## Estructura del Proyecto

El proyecto está organizado en los siguientes módulos:

### 1. Estudiantes

- Gestión de información de estudiantes
- Estados: Activo, Inactivo, Suspendido
- Registro de datos personales y académicos

### 2. Asistencia

- Registro de asistencia diaria
- Estados: Presente, Ausente, Retardo
- Reportes por estudiante y fecha

### 3. Inventario

- Control de inventario escolar
- Gestión de stock y ubicaciones
- Alertas de bajo stock

### 4. Pagos

- Registro de pagos escolares
- Múltiples métodos de pago
- Generación automática de números de recibo
- Reportes financieros

## Endpoints Principales

### Estudiantes

- `GET /api/students`: Listar estudiantes
- `GET /api/students/:id`: Obtener estudiante específico

### Asistencia

- `GET /api/attendance`: Listar registros de asistencia
- `GET /api/attendance/stats/student/:studentId`: Estadísticas por estudiante

### Inventario

- `GET /api/inventory`: Listar items de inventario
- `GET /api/inventory/status/low-stock`: Items con bajo stock

### Pagos

- `GET /api/payments`: Listar pagos
- `GET /api/payments/student/:studentId/summary`: Resumen de pagos por estudiante

## Características Especiales

1. **Automatizaciones**:

   - Generación automática de números de recibo
   - Actualización automática de estado de inventario
   - Cálculo automático de estadísticas

2. **Validaciones**:

   - Validación de formatos de fecha
   - Validación de correos electrónicos
   - Validación de estados y métodos de pago

3. **Seguridad**:
   - Validación de datos
   - Manejo de errores
   - Protección CORS

## Manejo de Errores

El sistema incluye mensajes de error en español y códigos de estado HTTP:

- 200: Éxito
- 201: Creado exitosamente
- 400: Error en la solicitud
- 404: No encontrado
- 500: Error del servidor

## Documentación Adicional

Para una documentación más detallada de la API, consultar el archivo `API_DOCUMENTATION.md`.

## Soporte

Para reportar problemas o solicitar nuevas características, por favor crear un issue en el repositorio.

---

Última actualización: Marzo 2024
