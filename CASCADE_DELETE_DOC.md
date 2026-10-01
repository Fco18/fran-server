# Eliminación en Cascada de Estudiantes

## Descripción

Este endpoint permite eliminar un estudiante y todos sus datos relacionados del sistema, incluyendo sus registros de asistencia y pagos. Esta operación es irreversible.

## Endpoint

```
DELETE /api/students/:id/cascade
```

## Parámetros URL

| Parámetro | Tipo   | Descripción                  | Requerido |
| --------- | ------ | ---------------------------- | --------- |
| id        | string | ID del estudiante a eliminar | Sí        |

## Ejemplo de Uso

### Usando Fetch (JavaScript)

```javascript
const deleteStudent = async (studentId) => {
  try {
    const response = await fetch(
      `http://localhost:3002/api/students/${studentId}/cascade`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log("Estudiante eliminado:", data.message);
      return data.deletedStudent;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("Error al eliminar estudiante:", error);
    throw error;
  }
};
```

### Usando Axios (JavaScript)

```javascript
const deleteStudent = async (studentId) => {
  try {
    const { data } = await axios.delete(
      `http://localhost:3002/api/students/${studentId}/cascade`
    );

    if (data.success) {
      console.log("Estudiante eliminado:", data.message);
      return data.deletedStudent;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error(
      "Error al eliminar estudiante:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};
```

### Usando cURL

```bash
curl -X DELETE "http://localhost:3002/api/students/[ID_DEL_ESTUDIANTE]/cascade"
```

## Respuestas

### Éxito (200 OK)

```json
{
  "success": true,
  "message": "Estudiante y todos sus datos relacionados eliminados exitosamente",
  "deletedStudent": {
    "_id": "67f313c4a14bcf869a0f0ae1",
    "nombre": "Juan Pérez"
    // ... otros datos del estudiante ...
  }
}
```

### Error - Estudiante no encontrado (404 Not Found)

```json
{
  "success": false,
  "message": "Estudiante no encontrado"
}
```

### Error del servidor (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Error al eliminar el estudiante y sus datos relacionados",
  "error": "Mensaje detallado del error"
}
```

## Consideraciones de Implementación Frontend

1. **Confirmación del Usuario**

   ```javascript
   // Ejemplo de diálogo de confirmación
   const handleDeleteStudent = async (studentId) => {
     if (
       confirm(
         "¿Está seguro de eliminar este estudiante? Esta acción eliminará todos sus registros de asistencia y pagos."
       )
     ) {
       try {
         await deleteStudent(studentId);
         // Actualizar UI después de la eliminación exitosa
       } catch (error) {
         // Manejar error
       }
     }
   };
   ```

2. **Manejo de Estado**

   ```javascript
   const [isDeleting, setIsDeleting] = useState(false);
   const [error, setError] = useState(null);

   const handleDeleteStudent = async (studentId) => {
     setIsDeleting(true);
     setError(null);
     try {
       await deleteStudent(studentId);
       // Actualizar lista de estudiantes
     } catch (error) {
       setError(error.message);
     } finally {
       setIsDeleting(false);
     }
   };
   ```

3. **Feedback Visual**
   ```javascript
   // Componente de ejemplo
   function StudentDeleteButton({ studentId }) {
     const [isDeleting, setIsDeleting] = useState(false);

     return (
       <button
         onClick={() => handleDeleteStudent(studentId)}
         disabled={isDeleting}
       >
         {isDeleting ? "Eliminando..." : "Eliminar Estudiante"}
       </button>
     );
   }
   ```

## Buenas Prácticas

1. **Siempre confirmar antes de eliminar**

   - Mostrar un diálogo de confirmación
   - Explicar claramente las consecuencias

2. **Manejar estados de carga**

   - Mostrar indicadores de progreso
   - Deshabilitar botones durante la operación

3. **Gestión de errores**

   - Mostrar mensajes de error claros
   - Ofrecer opciones de recuperación

4. **Actualización de UI**

   - Actualizar listas/tablas inmediatamente
   - Mostrar notificaciones de éxito

5. **Caché y Estado**
   - Actualizar caché local después de la eliminación
   - Sincronizar estado global si es necesario
