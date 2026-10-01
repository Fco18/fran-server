# Implementación del Sistema de Autenticación

## Índice

1. [Implementación Frontend](#implementación-frontend)
2. [Procesamiento Backend](#procesamiento-backend)
3. [Flujo de Autenticación](#flujo-de-autenticación)
4. [Validaciones](#validaciones)
5. [Manejo de Errores](#manejo-de-errores)

## Implementación Frontend

### Formulario de Registro (SignUp)

```jsx
// components/SignupForm.jsx
const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3002/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        // Guardar token y redirigir
        localStorage.setItem("token", data.token);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
        minLength={8}
      />
      <button type="submit">Registrarse</button>
    </form>
  );
};
```

### Formulario de Login

```jsx
// components/LoginForm.jsx
const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3002/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (data.success) {
        // Guardar token y redirigir
        localStorage.setItem("token", data.token);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        value={credentials.email}
        onChange={(e) =>
          setCredentials({ ...credentials, email: e.target.value })
        }
        required
      />
      <input
        type="password"
        name="password"
        value={credentials.password}
        onChange={(e) =>
          setCredentials({ ...credentials, password: e.target.value })
        }
        required
      />
      <button type="submit">Iniciar Sesión</button>
    </form>
  );
};
```

## Procesamiento Backend

### Modelo de Usuario

El backend utiliza Mongoose para definir el esquema de usuario con las siguientes validaciones:

```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre es requerido"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "El correo electrónico es requerido"],
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: "Por favor ingrese un correo electrónico válido",
    },
  },
  password: {
    type: String,
    required: [true, "La contraseña es requerida"],
    minlength: [8, "La contraseña debe tener al menos 8 caracteres"],
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});
```

### Proceso de Registro (SignUp)

1. **Recepción de Datos**:

   ```javascript
   router.post("/signup", async (req, res) => {
     try {
       const newUser = await User.create({
         name: req.body.name,
         email: req.body.email,
         password: req.body.password,
         role: req.body.role,
       });
       // Generar token y enviar respuesta
     } catch (error) {
       // Manejar errores
     }
   });
   ```

2. **Validaciones Automáticas**:

   - Nombre requerido
   - Email válido y único
   - Contraseña mínimo 8 caracteres
   - Rol válido ('admin' o 'user')

3. **Proceso de Contraseña**:
   ```javascript
   userSchema.pre("save", async function (next) {
     if (!this.isModified("password")) return next();
     this.password = await bcrypt.hash(this.password, 12);
     next();
   });
   ```

### Proceso de Login

1. **Validación de Credenciales**:

   ```javascript
   router.post("/login", async (req, res) => {
     try {
       const { email, password } = req.body;

       // Verificar si email y password existen
       if (!email || !password) {
         return res.status(400).json({
           success: false,
           message: "Por favor proporcione email y contraseña",
         });
       }

       // Verificar usuario y contraseña
       const user = await User.findOne({ email }).select("+password");
       if (!user || !(await user.comparePassword(password))) {
         return res.status(401).json({
           success: false,
           message: "Email o contraseña incorrectos",
         });
       }

       // Generar token y enviar respuesta
     } catch (error) {
       // Manejar errores
     }
   });
   ```

## Flujo de Autenticación

1. **Registro (SignUp)**:

   - Frontend envía: `{ name, email, password }`
   - Backend valida datos
   - Si es válido: Crea usuario y retorna token
   - Si hay error: Retorna mensaje de error

2. **Login**:

   - Frontend envía: `{ email, password }`
   - Backend verifica credenciales
   - Si son correctas: Retorna token
   - Si son incorrectas: Retorna error

3. **Protección de Rutas**:
   - Frontend incluye token en headers
   - Backend verifica token en middleware
   - Si token es válido: Permite acceso
   - Si token es inválido: Retorna error 401

## Validaciones

### Frontend

- Campos requeridos (HTML5 required)
- Formato de email (type="email")
- Longitud mínima de contraseña (minLength={8})
- Validación de formato antes de enviar

### Backend

- Validación de campos requeridos (Mongoose)
- Validación de email único
- Validación de formato de email
- Encriptación de contraseña
- Validación de rol
- Validación de token

## Manejo de Errores

### Errores Comunes y Respuestas

1. **Email Duplicado**:

   ```javascript
   if (error.code === 11000) {
     return res.status(400).json({
       success: false,
       message: "El correo electrónico ya está registrado",
     });
   }
   ```

2. **Credenciales Inválidas**:

   ```javascript
   return res.status(401).json({
     success: false,
     message: "Email o contraseña incorrectos",
   });
   ```

3. **Token Inválido**:
   ```javascript
   return res.status(401).json({
     success: false,
     message: "Token inválido o expirado",
   });
   ```

### Códigos de Estado HTTP

- 200: Operación exitosa
- 201: Recurso creado (signup exitoso)
- 400: Error de validación
- 401: No autorizado
- 403: Prohibido (rol incorrecto)
- 404: Recurso no encontrado
- 500: Error del servidor
