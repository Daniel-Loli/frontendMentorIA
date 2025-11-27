import api from './api';

export const institutionService = {
  // --- GESTIÓN DE DOCENTES ---
  getTeachers: async (idInstitucion) => {
    try {
      const response = await api.get(`/docente-institucion/listar-segun-institucion`, {
        params: { idInstitucion }
      });
      return response.data;
    } catch (error) {
      console.error("Error obteniendo docentes:", error);
      return { data: [] }; // Retorno seguro en caso de error
    }
  },

  createTeacher: async (data, idInstitucion) => {
    try {
      const resDocente = await api.post('/docente/registrar', {
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        password: data.password,
        telefono: data.telefono,
        tipoDocumento: data.tipoDocumento,
        docIdentidad: data.docIdentidad,
        sexo: data.sexo
      });

      const newDocenteId = resDocente.data.data.idDocente;

      await api.post('/docente-institucion/registrar', {
        idDocente: newDocenteId,
        idInstitucion: idInstitucion
      });

      return true;
    } catch (error) {
      throw error;
    }
  },

  // --- GESTIÓN DE ALUMNOS ---
  getStudents: async (idInstitucion) => {
    try {
      const response = await api.get(`/alumno-institucion/listar-segun-institucion`, {
        params: { idInstitucion }
      });
      return response.data;
    } catch (error) {
      console.error("Error obteniendo alumnos:", error);
      return { data: [] };
    }
  },

  createStudent: async (data, idInstitucion) => {
    try {
      const resAlumno = await api.post('/alumno/registrar', {
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        password: data.password,
        telefono: data.telefono,
        tipoDocumento: data.tipoDocumento,
        docIdentidad: data.docIdentidad,
        sexo: data.sexo
      });

      const newAlumnoId = resAlumno.data.data.idAlumno;

      await api.post('/alumno-institucion/registrar', {
        idAlumno: newAlumnoId,
        idInstitucion: idInstitucion
      });

      return true;
    } catch (error) {
      throw error;
    }
  },

  // --- GESTIÓN DE ESTRUCTURA ACADÉMICA ---
  getAcademicStructure: async (idInstitucion) => {
    try {
      const response = await api.get('/unidad/buscar-unidades-completa', {
        params: { idInstitucion }
      });
      return response.data;
    } catch (error) {
      // Si no hay unidades, devolvemos array vacío
      return { data: [] };
    }
  },

  addUnit: async (data) => {
    try {
      const response = await api.post('/unidad/registrar', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // --- DASHBOARD (CORREGIDO PARA SER ROBUSTO) ---
  getDashboardStats: async (idInstitucion) => {
    // Función auxiliar para manejar cada petición individualmente
    const fetchCount = async (endpoint) => {
        try {
            const response = await api.get(endpoint, { params: { idInstitucion } });
            // Verificamos si existe data.data y si es un array
            if (response.data && Array.isArray(response.data.data)) {
                return response.data.data.length;
            }
            return 0;
        } catch (error) {
            // Si falla (ej: 404 porque no hay datos), asumimos 0 y no rompemos el resto
            console.warn(`Fallo al cargar stats de ${endpoint}`, error);
            return 0;
        }
    };

    // Ejecutamos en paralelo, pero cada una maneja su propio error
    const [totalAlumnos, totalDocentes, totalMisiones] = await Promise.all([
        fetchCount('/alumno-institucion/listar-segun-institucion'),
        fetchCount('/docente-institucion/listar-segun-institucion'),
        fetchCount('/mision/listar-segun-institucion')
    ]);

    return {
        totalAlumnos,
        totalDocentes,
        totalMisiones
    };
  }
};