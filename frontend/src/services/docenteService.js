// frontend/src/services/docenteService.js
import api from './api';
import { missionService } from './missionService';
import { studentService } from './studentService';

export const docenteService = {

  // Docente → Institución
  getDocenteInstitucion: async (idDocente) => {
    const res = await api.get(`/docente-institucion/listar-segun-docente`, {
      params: { idDocente }
    });
    return res.data?.data?.[0] || null;
  },

  // 🔥 Misiones que el docente debe gestionar
  getMisionesParaGestion: async (idDocente) => {

    // 1. Obtener institución REAL del docente
    const docInst = await docenteService.getDocenteInstitucion(idDocente);
    if (!docInst) return [];

    const idInstitucion = docInst.institucion.idInstitucion;

    // 2. Obtener misiones por estado
    const [revision, convocatoria, progreso] = await Promise.all([
      missionService.getByStatus(idInstitucion, "EN_REVISION"),
      missionService.getByStatus(idInstitucion, "CONVOCATORIA"),
      missionService.getByStatus(idInstitucion, "EN_PROGRESO"),
    ]);

    return [...revision, ...convocatoria, ...progreso];
  },

  // 🔥 Alumnos de la institución del docente
  getAlumnosInstitucion: async (idDocente) => {

    const docInst = await docenteService.getDocenteInstitucion(idDocente);
    if (!docInst) return [];

    const idInstitucion = docInst.institucion.idInstitucion;

    const res = await api.get(`/alumno-institucion/listar-segun-institucion`, {
      params: { idInstitucion }
    });

    return res.data?.data || [];
  },

  // Registrar alumno en misión
  inscribirAlumno: async (idMision, idAlumnoInstitucion) => {
    return await studentService.startMission(idMision, idAlumnoInstitucion);
  },

  actualizarAsignacion: async (idAsignacion, data) => {
    const res = await api.put(`/asignacion/actualizar/${idAsignacion}`, data);
    return res.data?.data;
  }
};
