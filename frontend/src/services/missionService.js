// frontend/src/services/missionService.js
import api from './api';

export const missionService = {
// Obtener misiones filtradas por estado
  getByStatus: async (idInstitucion, estado = 'EN_REVISION') => {
    try {
      const response = await api.get(`/mision/listar-segun-institucion`, {
        params: { idInstitucion, estado }
      });
      
      // ❌ ANTES: return response.data;  (Devolvía el objeto con status 0)
      // ✅ AHORA: Devolvemos el array que está DENTRO de data
      return response.data?.data || []; 

    } catch (error) {
      console.error("Error fetching missions:", error);
      return []; // En caso de error, devolvemos array vacío para no romper el Promise.all
    }
  },

  // Aprobar/Publicar misión (Cambiar estado a CONVOCATORIA o VALIDADA)
  approve: async (idMision) => {
    try {
      // Enviamos solo el cambio de estado
      const response = await api.put(`/mision/actualizar/${idMision}`, {
        estado: 'CONVOCATORIA' 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar contenido (si el docente edita el texto de la IA)
  update: async (idMision, data) => {
    try {
      const response = await api.put(`/mision/actualizar/${idMision}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Descartar/Eliminar misión
  delete: async (idMision) => {
    try {
      const response = await api.delete(`/mision/eliminar/${idMision}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};