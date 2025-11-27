// frontend/src/services/studentService.js
import api from './api';

export const studentService = {

  // 🔹 Obtener institución del alumno
  getAlumnoInstitucion: async (idAlumno) => {
    const res = await api.get(`/alumno-institucion/listar-segun-alumno`, {
      params: { idAlumno }
    });

    // res.data.data es SIEMPRE un array
    const data = res.data?.data || [];

    return data.length > 0 ? data[0] : null;
  },

  // 🔹 Obtener misiones de la institución
  getMissionsByInstitution: async (idInstitucion, estado = null) => {
    const res = await api.get(`/mision/listar-segun-institucion`, {
      params: { idInstitucion, estado }
    });

    return res.data?.data || [];
  },

  // 🔹 Obtener asignaciones por misión
  getAssignmentForMission: async (idMision) => {
    const res = await api.get(`/asignacion/listar-segun-mision`, {
      params: { idMision }
    });

    return res.data?.data || [];
  },

  // 🔹 Registrar alumno en misión
  startMission: async (idMision, idAlumnoInstitucion) => {
    const res = await api.post(`/asignacion/registrar`, {
      idMision,
      idAlumnoInstitucion
    });

    return res.data?.data;
  },

  // 🔹 Subir evidencia
  uploadEvidence: async (idAsignacion, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.put(`/asignacion/actualizar-evidencia/${idAsignacion}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    return res.data?.data;
  }
};
