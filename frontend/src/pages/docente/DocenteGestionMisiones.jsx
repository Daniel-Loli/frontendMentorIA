import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { docenteService } from "../../services/docenteService";
import toast from "react-hot-toast";
import { ListChecks, Loader2, UserPlus } from "lucide-react";

export default function DocenteGestionMisiones() {

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [misiones, setMisiones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);

  const idDocente = user?.idDocente;

  const cargarDatos = async () => {
    if (!idDocente) return;

    try {
      setLoading(true);

      // ✔ Obtener misiones para gestionar (con idDocente, no institución)
      const misionesGestion = await docenteService.getMisionesParaGestion(idDocente);
      setMisiones(misionesGestion);

      // ✔ Obtener alumnos del docente (docente → institución → alumnos)
      const alumnosInst = await docenteService.getAlumnosInstitucion(idDocente);
      setAlumnos(alumnosInst);

    } catch (error) {
      console.log(error);
      toast.error("Error cargando información");
    }

    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [idDocente]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-teal-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">

      <h1 className="text-3xl font-bold flex items-center gap-3">
        <ListChecks className="text-teal-500" />
        Gestión de Misiones
      </h1>

      {misiones.length === 0 ? (
        <div className="text-gray-600 bg-white p-8 rounded-xl text-center border">
          No hay misiones para gestionar.
        </div>
      ) : (
        <div className="space-y-6">
          {misiones.map(m => (
            <div key={m.idMision} className="bg-white border rounded-xl p-6">
              
              <h2 className="text-xl font-bold mb-1">{m.titulo}</h2>
              <p className="text-gray-600 mb-4">{m.descripcion}</p>

              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <UserPlus size={18}/> Alumnos de la institución
              </h3>

              <ul className="space-y-2">
                {alumnos.map(a => (
                  <li key={a.idAlumnoInstitucion} className="bg-gray-50 border p-3 rounded flex justify-between">

                    <div>
                      {a.alumno.nombres} {a.alumno.apellidos}
                    </div>

                    <button
                      className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded"
                      onClick={async () => {
                        await docenteService.inscribirAlumno(m.idMision, a.idAlumnoInstitucion);
                        toast.success("Alumno inscrito");
                      }}
                    >
                      Inscribir
                    </button>

                  </li>
                ))}
              </ul>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
