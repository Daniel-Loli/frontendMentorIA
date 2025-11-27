// frontend/src/services/chatService.js
import api from './api';

export const chatService = {

  // ----------------------------------------------------------
  // 1. LISTAR CONVERSACIONES por usuario
  // ----------------------------------------------------------
  listConversations: async (idUsuario) => {
    try {
      const response = await api.get('/conversacion/listar-segun-usuario', {
        params: { idUsuario }
      });
      return response.data?.data || [];
    } catch (error) {
      console.error("Error listando conversaciones:", error);
      return [];
    }
  },

  // ----------------------------------------------------------
  // 2. CREAR NUEVA CONVERSACIÓN
  // ----------------------------------------------------------
  initConversation: async (idUsuario) => {
    try {
      const response = await api.post('/conversacion/registrar', {
        idUsuario,
        nombre: "Tutoría Personalizada"
      });

      return response.data?.data?.idConversacion;
    } catch (error) {
      console.warn("No se pudo crear, usando ID temporal");
      return 1;
    }
  },

  // ----------------------------------------------------------
  // 3. RENOMBRAR CONVERSACIÓN
  // ----------------------------------------------------------
  renameConversation: async (idConversacion, nombre) => {
    const response = await api.put(`/conversacion/actualizar/${idConversacion}`, {
      nombre
    });
    return response.data?.data;
  },

  // ----------------------------------------------------------
  // 4. ELIMINAR CONVERSACIÓN
  // ----------------------------------------------------------
  deleteConversation: async (idConversacion) => {
    const response = await api.delete(`/conversacion/eliminar/${idConversacion}`);
    return response.data;
  },

  // ----------------------------------------------------------
  // 5. LISTAR MENSAJES DE UNA CONVERSACIÓN
  // ----------------------------------------------------------
  getHistory: async (idConversacion) => {
    try {
      const response = await api.get('/mensaje/listar-segun-conversacion', {
        params: { idConversacion }
      });

      return response.data?.data || [];

    } catch (error) {
      console.error("Error en historial:", error);
      return [];
    }
  },

  // ----------------------------------------------------------
  // 6. ENVIAR MENSAJE AL CHATBOT
  // ----------------------------------------------------------
  sendMessage: async (idConversacion, contenido) => {
    try {
      const response = await api.post('/mensaje/enviar-chatbot', {
        idConversacion,
        contenido
      });

      // Devuelve un array con mensajes, tomamos el primero
      const mensajes = response.data?.data;
      if (Array.isArray(mensajes) && mensajes.length > 0) {
        return mensajes[0];
      }

      return null;

    } catch (error) {
      console.error("Error enviando mensaje:", error);
      throw error;
    }
  }
};
