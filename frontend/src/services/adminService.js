// frontend/src/services/adminService.js
import api from './api';

export const adminService = {
  // Listar todas las instituciones (Colegios)
  getInstitutions: async () => {
    try {
      const response = await api.get('/institucion/listar');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Registrar una nueva institución + Director
  createInstitution: async (data) => {
    try {
      const response = await api.post('/institucion/registrar', {
        nombre: data.nombre,
        codigoLocal: data.codigoLocal,
        email: data.email, 
        password: data.password,
        telefono: data.telefono,
        niveles: ["PRIMARIA", "SECUNDARIA"], 
        tipoPeriodo: "BIMESTRE",
        direccion: data.direccion
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Listar todos los usuarios
  getUsers: async () => {
    try {
      const response = await api.get('/usuario/listar');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // --- AQUÍ ESTÁ EL CAMBIO CLAVE ---
  // Obtener estadísticas globales REALES llamando a todos los endpoints de conteo
  getGlobalStats: async () => {
    try {
      // Ejecutamos las 4 peticiones en paralelo
      const [instReq, usersReq, docentesReq, alumnosReq] = await Promise.all([
        api.get('/institucion/contar'),
        api.get('/usuario/contar'),
        api.get('/docente/contar'), // Endpoint encontrado en Swagger
        api.get('/alumno/contar')   // Endpoint encontrado en Swagger
      ]);
      
      return {
        totalInstitutions: instReq.data.data || 0,
        totalUsers: usersReq.data.data || 0,
        totalDocentes: docentesReq.data.data || 0,
        totalAlumnos: alumnosReq.data.data || 0
      };
    } catch (error) {
        console.error("Error cargando stats:", error);
        // Si falla, devolvemos ceros para no romper la pantalla
        return { totalInstitutions: 0, totalUsers: 0, totalDocentes: 0, totalAlumnos: 0 };
    }
  }
};