import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { institutionService } from '../../services/institutionService';
import { studentService } from '../../services/studentService';
import { missionService } from '../../services/missionService';
import { docenteService } from '../../services/docenteService';

import { 
  Users, BookOpen, BrainCircuit, Activity, 
  Clock, CheckCircle, AlertCircle, Trophy, Target, Loader2
} from 'lucide-react';

import { Link } from 'react-router-dom';

// --------------------------------------------------------------------
// COMPONENTES REUTILIZABLES
// --------------------------------------------------------------------

const StatCard = ({ title, value, icon: Icon, colorClass, footer }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
        <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
      </div>
    </div>
    {footer && <div className="mt-4 text-xs text-gray-400">{footer}</div>}
  </div>
);

const AgenteVigiaWidget = () => (
  <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-xl p-6 text-white shadow-lg relative overflow-hidden mt-6">
    <BrainCircuit className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32" />
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-white/20 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Estado del Sistema</span>
        <span className="flex items-center gap-1 text-xs font-medium text-green-200">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
        </span>
      </div>
      <h2 className="text-2xl font-bold mb-2">Agente Vigía: Activo</h2>
      <p className="text-white/80 text-sm mb-6 max-w-md">El agente ha generado nuevas propuestas basadas en el currículo.</p>
      <Link to="/misiones-ia" className="bg-white text-teal-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
        <CheckCircle size={16} /> Revisar Propuestas
      </Link>
    </div>
  </div>
);

export default function Home() {

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  // Estadísticas Director
  const [stats, setStats] = useState({ totalAlumnos: 0, totalDocentes: 0, totalMisiones: 0 });

  // Estadísticas Alumno
  const [alumnoStats, setAlumnoStats] = useState({ enProgreso: 0, completadas: 0, puntos: 0 });

  // Estadísticas Docente
  const [docenteStats, setDocenteStats] = useState({
    misionesRevision: 0,
    totalClases: 0
  });

  const idInstitucion = user?.idInstitucion || null;
  const idAlumno = user?.idAlumno;
  const idDocente = user?.idDocente;

  useEffect(() => {

    const fetchStats = async () => {
      try {
        setLoading(true);

        // =====================================================================
        // -------------------- DASHBOARD DIRECTOR / INSTITUCIÓN ---------------
        // =====================================================================
        if (user?.rol === 'INSTITUCION' || user?.rol?.nombre === 'INSTITUCION') {
          const data = await institutionService.getDashboardStats(idInstitucion);
          setStats(data);
        }

        // =====================================================================
        // --------------------------- DASHBOARD DOCENTE -----------------------
        // =====================================================================
        if (user?.rol === 'DOCENTE' || user?.rol?.nombre === 'DOCENTE') {

          const docInst = await docenteService.getDocenteInstitucion(idDocente);

          if (docInst) {
            const idInst = docInst.institucion.idInstitucion;

            // 1. Misiones que debe revisar → EN_REVISION
            const misionesRev = await missionService.getByStatus(idInst, 'EN_REVISION');

            // 2. Clases del Docente → alumnos de la institución
            const alumnos = await docenteService.getAlumnosByInstitution(idInst);

            setDocenteStats({
              misionesRevision: misionesRev.length,
              totalClases: alumnos.length
            });
          }
        }

        // =====================================================================
        // ----------------------------- DASHBOARD ALUMNO ----------------------
        // =====================================================================
        if (user?.rol === 'ALUMNO' || user?.rol?.nombre === 'ALUMNO') {

          if (!idAlumno) return;

          const aluInst = await studentService.getAlumnoInstitucion(idAlumno);
          if (!aluInst) return;

          const idInst = aluInst.institucion.idInstitucion;
          const idAluInst = aluInst.idAlumnoInstitucion;

          const [conv, prog, fin] = await Promise.all([
            missionService.getByStatus(idInst, 'CONVOCATORIA'),
            missionService.getByStatus(idInst, 'EN_PROGRESO'),
            missionService.getByStatus(idInst, 'FINALIZADO'),
          ]);

          const all = [...conv, ...prog, ...fin];
          let enProg = 0;
          let finalizadas = 0;
          let puntos = 0;

          const assignmentPromises = all.map(m => studentService.getAssignmentForMission(m.idMision));
          const results = await Promise.all(assignmentPromises);

          results.forEach(asg => {
            const myAsg = asg.find(a => a.idAlumnoInstitucion === idAluInst);
            if (myAsg) {
              if (myAsg.estado === 'FINALIZADO') {
                finalizadas++;
                puntos += myAsg.puntos || 0;
              } else {
                enProg++;
              }
            }
          });

          setAlumnoStats({
            enProgreso: enProg,
            completadas: finalizadas,
            puntos
          });
        }

      } catch (error) {
        console.error("Error dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStats();

  }, [user, idInstitucion, idAlumno, idDocente]);

  // ------------------------------------------------------------------------
  // ------------------------------- RENDER ---------------------------------
  // ------------------------------------------------------------------------

  return (
    <div className="space-y-8 p-2">

      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Hola, {user?.nombre?.split(' ')[0] || user?.codigo} 👋
          </h1>
          <p className="text-gray-500 mt-1">Bienvenido de nuevo a tu panel de aprendizaje.</p>
        </div>
        <div className="text-sm text-gray-400 hidden md:block">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* ====================== DASHBOARD DIRECTOR ====================== */}
      {(user?.rol === 'INSTITUCION' || user?.rol?.nombre === 'INSTITUCION') && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Alumnos" value={stats.totalAlumnos} icon={Users} colorClass="bg-blue-500 text-blue-600" />
            <StatCard title="Docentes Activos" value={stats.totalDocentes} icon={Users} colorClass="bg-purple-500 text-purple-600" />
            <StatCard title="Misiones Activas" value={stats.totalMisiones} icon={Activity} colorClass="bg-amber-500 text-amber-600" />
            <StatCard title="Alertas IA" value="0" icon={AlertCircle} colorClass="bg-red-500 text-red-600" />
          </div>
          <AgenteVigiaWidget />
        </>
      )}

      {/* ========================= DASHBOARD DOCENTE ======================= */}
      {(user?.rol === 'DOCENTE' || user?.rol?.nombre === 'DOCENTE') && (
        <>
          <AgenteVigiaWidget />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <StatCard 
              title="Misiones por Revisar" 
              value={docenteStats.misionesRevision} 
              icon={Clock} 
              colorClass="bg-amber-500 text-amber-600" 
            />

            <StatCard 
              title="Mis Clases" 
              value={docenteStats.totalClases} 
              icon={Users} 
              colorClass="bg-teal-600 text-teal-700" 
            />
          </div>
        </>
      )}

      {/* ========================== DASHBOARD ALUMNO ======================== */}
      {(user?.rol === 'ALUMNO' || user?.rol?.nombre === 'ALUMNO') && (
        <div>
          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="En Progreso" value={alumnoStats.enProgreso} icon={Target} colorClass="bg-blue-500 text-blue-600" />
            <StatCard title="Completadas" value={alumnoStats.completadas} icon={Trophy} colorClass="bg-green-500 text-green-600" />
            <StatCard title="Puntos XP" value={alumnoStats.puntos} icon={Activity} colorClass="bg-amber-500 text-amber-600" />
          </div>
        </div>
      )}

    </div>
  );
}
