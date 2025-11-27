import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { docenteService } from "../../services/docenteService";
import { Users, Loader2 } from "lucide-react";

export default function MisClases() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alumnos, setAlumnos] = useState([]);

  const idDocente = user?.idDocente;

  const loadData = async () => {
    try {
      setLoading(true);

      const docInst = await docenteService.getDocenteInstitucion(idDocente);
      if (!docInst) return;

      const idInstitucion = docInst.institucion.idInstitucion;

      const listaAlumnos = await docenteService.getAlumnosInstitucion(idInstitucion);

      setAlumnos(listaAlumnos);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (idDocente) loadData();
  }, [idDocente]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-teal-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold flex items-center gap-3 mb-6">
        <Users className="text-teal-600" /> Mis Clases
      </h1>

      {alumnos.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow border text-center text-gray-500">
          No hay alumnos aún en tu institución.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alumnos.map((a) => (
            <div
              key={a.idAlumnoInstitucion}
              className="bg-white p-4 rounded-xl shadow border hover:shadow-md transition-all"
            >
              <h2 className="font-bold text-lg text-gray-800">
                {a.alumno.nombres} {a.alumno.apellidos}
              </h2>

              <p className="text-gray-500 text-sm">
                ID Alumno: {a.alumno.idAlumno}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                Estado: {a.estado}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
