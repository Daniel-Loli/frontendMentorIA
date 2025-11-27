// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión activa al recargar la página
    const checkSession = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // 1. DESESTRUCTURAMOS TODO LO QUE VIENE DEL BACKEND
      // (Usuario, Alumno, Docente, Institucion)
      const { token, usuario, alumno, docente, institucion } = response.data.data; 

      // Guardar token
      localStorage.setItem('token', token);
      
      // 2. CREAMOS EL OBJETO DE USUARIO ENRIQUECIDO
      // Guardamos el ID de usuario (login) Y los IDs específicos (alumno/docente)
      const userData = {
        id: usuario.idUsuario,           // ID para Login (ej: 17)
        email: usuario.email,
        nombre: usuario.codigo || "Usuario",
        rol: usuario.rol?.nombre || "INVITADO",
        
        // 🔹 GUARDAMOS LOS IDs ESPECÍFICOS AQUÍ:
        idAlumno: alumno?.idAlumno,           // ID Académico (ej: 5)
        idDocente: docente?.idDocente,        // Por si es profe
        idInstitucion: institucion?.idInstitucion // Por si es dire
      };

      // 3. LOG PARA VERIFICAR EN CONSOLA QUE SE GUARDÓ BIEN
      console.log("💾 Guardando usuario en contexto:", userData);

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };

    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}