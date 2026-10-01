# Documentación de Implementación de Autenticación - Frontend

## Configuración Base

```javascript
// config/api.js
const API_BASE_URL = "http://localhost:3002/api";

export const AUTH_ENDPOINTS = {
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  PROFILE: `${API_BASE_URL}/auth/me`,
};
```

## Servicios de Autenticación

```javascript
// services/authService.js
export class AuthService {
  static async signup(userData) {
    try {
      const response = await fetch(AUTH_ENDPOINTS.SIGNUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        return data;
      }
      throw new Error(data.message);
    } catch (error) {
      throw error;
    }
  }

  static async login(credentials) {
    try {
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        return data;
      }
      throw new Error(data.message);
    } catch (error) {
      throw error;
    }
  }

  static async getProfile() {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token de autenticación");

      const response = await fetch(AUTH_ENDPOINTS.PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        return data.data.user;
      }
      throw new Error(data.message);
    } catch (error) {
      throw error;
    }
  }

  static logout() {
    localStorage.removeItem("token");
  }

  static isAuthenticated() {
    return !!localStorage.getItem("token");
  }
}
```

## Componentes de React (Ejemplo)

### Formulario de Registro

```jsx
// components/SignupForm.jsx
import { useState } from "react";
import { AuthService } from "../services/authService";

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await AuthService.signup(formData);
      // Redirigir al dashboard o página principal
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div>
        <label>Contraseña:</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
          minLength={8}
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit">Registrarse</button>
    </form>
  );
}
```

### Formulario de Login

```jsx
// components/LoginForm.jsx
import { useState } from "react";
import { AuthService } from "../services/authService";

export function LoginForm() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await AuthService.login(credentials);
      // Redirigir al dashboard o página principal
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={credentials.email}
          onChange={(e) =>
            setCredentials({ ...credentials, email: e.target.value })
          }
          required
        />
      </div>
      <div>
        <label>Contraseña:</label>
        <input
          type="password"
          value={credentials.password}
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
          required
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit">Iniciar Sesión</button>
    </form>
  );
}
```

## Protección de Rutas

```jsx
// components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { AuthService } from "../services/authService";

export function PrivateRoute({ children }) {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return children;
}
```

## Uso en React Router

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";
import { LoginForm } from "./components/LoginForm";
import { SignupForm } from "./components/SignupForm";
import { Dashboard } from "./components/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

## Interceptor para Axios (Alternativa a Fetch)

```javascript
// services/axiosConfig.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3002/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Manejo de Estado Global (Context API)

```jsx
// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { AuthService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          const userData = await AuthService.getProfile();
          setUser(userData);
        } catch (error) {
          AuthService.logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    const response = await AuthService.login(credentials);
    setUser(response.data.user);
    return response;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

## Uso del Context

```jsx
// App.jsx
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>{/* ... rutas ... */}</BrowserRouter>
    </AuthProvider>
  );
}
```

## Ejemplos de Uso

### Acceder al Usuario Actual

```jsx
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Bienvenido, {user.name}</h1>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

### Manejo de Errores

```jsx
try {
  await AuthService.login(credentials);
  navigate("/dashboard");
} catch (error) {
  if (error.response?.status === 401) {
    setError("Credenciales inválidas");
  } else {
    setError("Error en el servidor. Intente más tarde.");
  }
}
```

## Consideraciones de Seguridad

1. **Almacenamiento del Token**:

   - Usar `localStorage` solo para aplicaciones simples
   - Para mayor seguridad, considerar `httpOnly cookies`

2. **Validación de Formularios**:

   - Implementar validación en el cliente
   - Sanitizar datos antes de enviar

3. **Manejo de Sesión**:

   - Implementar renovación automática de token
   - Manejar expiración de sesión

4. **Protección de Rutas**:
   - Usar `PrivateRoute` para todas las rutas protegidas
   - Validar roles de usuario cuando sea necesario

## Buenas Prácticas

1. **Manejo de Estado**:

   - Centralizar la lógica de autenticación
   - Usar context para estado global
   - Mantener consistencia en el manejo de errores

2. **UX/UI**:

   - Mostrar indicadores de carga
   - Proporcionar mensajes de error claros
   - Implementar redirecciones intuitivas

3. **Código**:
   - Mantener servicios separados
   - Usar tipos/interfaces (TypeScript)
   - Documentar funciones y componentes
