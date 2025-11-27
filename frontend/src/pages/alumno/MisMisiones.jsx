import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { studentService } from "../../services/studentService";
import { missionService } from "../../services/missionService";
import toast from "react-hot-toast";
import { CheckCircle, BookOpen, ArrowRight, Loader2, AlertCircle, X, Calendar, Target, Trophy } from "lucide-react"; // Importamos Target y Trophy

// Imágenes de ejemplo (Assets)
const MISSION_IMAGES = [
  "https://img.freepik.com/free-vector/space-mission-background_23-2148936234.jpg",
  "https://img.freepik.com/free-vector/water-cycle-concept-illustration_114360-8634.jpg",
  "https://img.freepik.com/free-vector/people-recycling-concept-illustration_114360-1723.jpg",
  "https://img.freepik.com/free-vector/history-concept-illustration_114360-2647.jpg",
  "https://img.freepik.com/free-vector/science-lab-concept-illustration_114360-2339.jpg"
];

const getMissionImage = (id) => MISSION_IMAGES[id % MISSION_IMAGES.length];

export default function MisMisiones() {

  const { user } = useAuth();
  
  // Estados para las dos secciones:
  const [activeMissions, setActiveMissions] = useState([]);
  const [availableMissions, setAvailableMissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [viewingMission, setViewingMission] = useState(null); 
  const [selectedMission, setSelectedMission] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const idAlumno = user?.idAlumno;

  const loadAll = async () => {
    try {
      setLoading(true);
      const alumnoInst = await studentService.getAlumnoInstitucion(idAlumno);
      if (!alumnoInst) { setLoading(false); return; }

      const idInstitucion = alumnoInst.institucion.idInstitucion;
      const idAlumnoInstitucion = alumnoInst.idAlumnoInstitucion;

      const [resConvocatoria, resProgreso, resFinalizadas] = await Promise.all([
        missionService.getByStatus(idInstitucion, 'CONVOCATORIA'),
        missionService.getByStatus(idInstitucion, 'EN_PROGRESO'),
        missionService.getByStatus(idInstitucion, 'FINALIZADO')
      ]);

      const todasMisiones = [...(Array.isArray(resConvocatoria) ? resConvocatoria : []), 
                             ...(Array.isArray(resProgreso) ? resProgreso : []), 
                             ...(Array.isArray(resFinalizadas) ? resFinalizadas : [])];
      
      // Variables para separar las listas
      const tempActive = [];
      const tempAvailable = [];

      for (const m of todasMisiones) {
        try {
            const asignaciones = await studentService.getAssignmentForMission(m.idMision);
            const asignacionAlumno = asignaciones.find(
              a => a.idAlumnoInstitucion === idAlumnoInstitucion
            );

            let estadoAlumno = "NO_INSCRITO";
            let progreso = 0;

            if (asignacionAlumno) {
              // Si ya tiene asignación, usa su estado (COMPLETADO, EN_PROGRESO, etc.)
              estadoAlumno = asignacionAlumno.estado === "FINALIZADO" ? "COMPLETADO" : "EN_PROGRESO";
              progreso = estadoAlumno === "COMPLETADO" ? 100 : 50;
            } else if (m.estado !== "CONVOCATORIA") {
              // Si no está inscrito y no está en CONVOCATORIA, es INVISIBLE/CERRADO
              continue; 
            }
            
            const misionProcesada = {
              ...m, estadoAlumno, progreso,
              idAsignacion: asignacionAlumno?.idAsignacion || null,
              imagen: getMissionImage(m.idMision)
            };

            // 🧠 SEPARACIÓN DE LISTAS
            if (estadoAlumno === "EN_PROGRESO" || estadoAlumno === "COMPLETADO") {
                tempActive.push(misionProcesada);
            } else { 
                // Debe ser "NO_INSCRITO" Y "CONVOCATORIA" (por el filtro de arriba)
                tempAvailable.push(misionProcesada);
            }

        } catch (err) { 
            // Esto captura el error 500 de la Misión 13 y la salta
            console.error(`Error procesando misión ${m.idMision}. Se ignora.`, err); 
        }
      }

      setActiveMissions(tempActive);
      setAvailableMissions(tempAvailable);

    } catch (error) { toast.error("Error cargando misiones"); }
    setLoading(false);
  };

  useEffect(() => { if (idAlumno) loadAll(); }, [idAlumno]);

  // --- MODAL HANDLERS (Iguales que antes) ---
  const handleStartMission = async (mission) => {
    try {
      const alumnoInst = await studentService.getAlumnoInstitucion(idAlumno);
      await studentService.startMission(mission.idMision, alumnoInst.idAlumnoInstitucion);
      toast.success("¡Te has inscrito correctamente!");
      setViewingMission(null); 
      loadAll(); 
    } catch (e) { toast.error("Error al inscribirse"); }
  };

  const handleUploadEvidence = async () => {
    if (!selectedFile) return toast.error("Selecciona archivo");
    setUploading(true);
    try {
      await studentService.uploadEvidence(selectedMission.idAsignacion, selectedFile);
      toast.success("Evidencia enviada");
      setSelectedMission(null); setSelectedFile(null); loadAll();
    } catch (e) { toast.error("Error al subir"); }
    setUploading(false);
  };

  const formatDate = (dateString) => {
    if(!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  };

  if (!user) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-6 w-full max-w-7xl mx-auto bg-gray-50 min-h-screen space-y-12">

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BookOpen className="text-teal-600" size={32} />
          Tablero de Misiones
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Explora, aprende y completa tus desafíos.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-600" size={48} /></div>
      ) : (
        <div className="space-y-12">
            {/* ---------------------------------------------------- */}
            {/* SECCIÓN 1: MIS MISIONES ACTIVAS / COMPLETADAS */}
            {/* ---------------------------------------------------- */}
            <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <Target className="text-amber-500" /> Mis Misiones Activas y Finalizadas
                </h2>

                {activeMissions.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center text-gray-500 shadow-sm">
                        No tienes misiones en curso. ¡Inscríbete a una abajo!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activeMissions.map((m) => (
                            <MissionCard key={m.idMision} m={m} setViewingMission={setViewingMission} setSelectedMission={setSelectedMission} formatDate={formatDate} />
                        ))}
                    </div>
                )}
            </section>

            {/* ---------------------------------------------------- */}
            {/* SECCIÓN 2: MISIONES DISPONIBLES (CONVOCATORIA) */}
            {/* ---------------------------------------------------- */}
            <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <BookOpen className="text-teal-600" /> Nuevas Convocatorias
                </h2>
                
                {availableMissions.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center text-gray-500 shadow-sm">
                        No hay misiones nuevas disponibles por el momento.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {availableMissions.map((m) => (
                            <MissionCard key={m.idMision} m={m} setViewingMission={setViewingMission} setSelectedMission={setSelectedMission} formatDate={formatDate} />
                        ))}
                    </div>
                )}
            </section>
        </div>
      )}

      {/* RENDERIZADO DE MODALES */}
      <MissionDetailModal viewingMission={viewingMission} setViewingMission={setViewingMission} handleStartMission={handleStartMission} formatDate={formatDate} />
      <EvidenceUploadModal selectedMission={selectedMission} setSelectedMission={setSelectedMission} handleUploadEvidence={handleUploadEvidence} uploading={uploading} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
    </div>
  );
}

// ----------------------------------------------------
// COMPONENTES AUXILIARES
// ----------------------------------------------------

// Componente para la tarjeta de misión
const MissionCard = ({ m, setViewingMission, setSelectedMission }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
              
            {/* IMAGEN CARD */}
            <div className="relative h-48 overflow-hidden">
                <img src={m.imagen} alt={m.titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-3 right-3">
                    {m.estadoAlumno === "COMPLETADO" ? (
                        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1"><CheckCircle size={12} /> Completada</span>
                    ) : m.estado === "CONVOCATORIA" && m.estadoAlumno === "NO_INSCRITO" ? (
                        <span className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">Nueva</span>
                    ) : (
                        <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">En Curso</span>
                    )}
                </div>
            </div>

            {/* BODY CARD */}
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">{m.titulo}</h3>
                
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
                    <div className={`h-2.5 rounded-full transition-all duration-1000 ${m.estadoAlumno === "COMPLETADO" ? 'bg-green-500' : 'bg-teal-500'}`} style={{ width: `${m.progreso}%` }}></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 mb-4 font-medium">
                    <span>{m.progreso}% completado</span>
                    <span>{m.estadoAlumno === "NO_INSCRITO" ? "Por iniciar" : "En progreso"}</span>
                </div>

                <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1">{m.descripcion}</p>

                {/* BOTONES DE ACCIÓN */}
                <div className="mt-auto">
                    {m.estadoAlumno === "NO_INSCRITO" && m.estado === "CONVOCATORIA" && (
                        <button onClick={() => setViewingMission(m)} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-teal-200">
                            Ver Misión
                        </button>
                    )}
                    {m.estadoAlumno === "EN_PROGRESO" && (
                        <button onClick={() => setSelectedMission(m)} className="w-full bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-amber-200">
                            Continuar
                        </button>
                    )}
                    {m.estadoAlumno === "COMPLETADO" && (
                        <button className="w-full bg-green-600 text-white font-bold py-3 rounded-xl cursor-default opacity-90 flex justify-center items-center gap-2">
                            <CheckCircle size={18}/> Ver Resultado
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Componente para el Modal de Detalle
const MissionDetailModal = ({ viewingMission, setViewingMission, handleStartMission, formatDate }) => {
    if (!viewingMission) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header con Imagen Grande */}
                <div className="relative h-48 md:h-56">
                    <img src={viewingMission.imagen} alt="Cover" className="w-full h-full object-cover" />
                    <button onClick={() => setViewingMission(null)} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                        <span className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block">CONVOCATORIA ABIERTA</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{viewingMission.titulo}</h2>
                    </div>
                </div>

                {/* Contenido Scrollable */}
                <div className="p-6 md:p-8 overflow-y-auto">
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-6 border-b pb-4">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-teal-600" />
                            <span>Inicio: {formatDate(viewingMission.fechaInicio)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-red-500" />
                            <span>Cierre: {formatDate(viewingMission.fechaFin)}</span>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-2">Descripción de la Misión</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {viewingMission.descripcion || "Sin descripción detallada disponible."}
                    </p>

                    <div className="mt-6 bg-teal-50 border border-teal-100 rounded-xl p-4">
                        <h4 className="font-bold text-teal-800 mb-1 flex items-center gap-2">
                            <AlertCircle size={18}/> Importante
                        </h4>
                        <p className="text-sm text-teal-700">
                            Al inscribirte, te comprometes a subir las evidencias requeridas antes de la fecha de cierre.
                        </p>
                    </div>
                </div>

                {/* Footer con Botones */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={() => setViewingMission(null)} className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-colors">
                        Cancelar
                    </button>
                    <button 
                        onClick={() => handleStartMission(viewingMission)}
                        className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-200 transition-transform active:scale-95 flex items-center gap-2">
                        Inscribirme Ahora <ArrowRight size={18}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Componente para el Modal de Evidencia
const EvidenceUploadModal = ({ selectedMission, setSelectedMission, handleUploadEvidence, uploading, selectedFile, setSelectedFile }) => {
    if (!selectedMission) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Tu Evidencia</h3>
                    <button onClick={() => setSelectedMission(null)} className="text-gray-400 hover:text-gray-600"><X/></button>
                </div>
                
                <div className="border-2 border-dashed border-teal-200 bg-teal-50 rounded-2xl p-10 text-center mb-6 group hover:border-teal-400 transition-colors cursor-pointer relative">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        onChange={(e) => setSelectedFile(e.target.files[0])} />
                    <div className="flex flex-col items-center">
                        <div className="bg-white p-3 rounded-full shadow-sm mb-3 text-teal-500">
                            <ArrowRight className="transform -rotate-90" size={24}/>
                        </div>
                        <p className="text-teal-800 font-medium text-lg">Arrastra tu archivo aquí</p>
                        <p className="text-teal-600 text-sm mt-1">o haz clic para buscar</p>
                        {selectedFile && <p className="mt-4 text-xs font-bold text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">{selectedFile.name}</p>}
                    </div>
                </div>

                <button onClick={handleUploadEvidence} disabled={uploading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-200">
                    {uploading ? "Enviando..." : "Enviar Tarea"}
                </button>
            </div>
        </div>
    );
};