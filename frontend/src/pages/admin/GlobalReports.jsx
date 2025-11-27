import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { BarChart3, Users, School, GraduationCap, BookUser } from 'lucide-react';
import toast from 'react-hot-toast';

// Componente simple de barra
const SimpleBar = ({ label, value, color }) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="font-bold">{value}%</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2.5">
      <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default function GlobalReports() {
  // Estado inicial con ceros
  const [stats, setStats] = useState({ 
    totalInstitutions: 0, 
    totalUsers: 0,
    totalDocentes: 0,
    totalAlumnos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getGlobalStats();
        setStats(data);
      } catch (error) {
        toast.error("Error cargando estadísticas");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando datos reales...</div>;

  // Calculamos porcentajes reales para las gráficas (evitando división por cero)
  const totalGente = stats.totalUsers || 1;
  const pctAlumnos = Math.round((stats.totalAlumnos / totalGente) * 100);
  const pctDocentes = Math.round((stats.totalDocentes / totalGente) * 100);
  const pctAdmin = 100 - pctAlumnos - pctDocentes; // El resto son admins/ugel

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <BarChart3 className="text-secondary" /> Reportes Globales
        </h1>
        <p className="text-text-muted">Datos consolidados en tiempo real de la plataforma.</p>
      </div>

      {/* TARJETAS DE DATOS 100% REALES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Card 1: Colegios */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <School size={24} />
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-3xl font-bold text-text-main">{stats.totalInstitutions}</h3>
                <p className="text-xs text-text-muted font-bold uppercase mt-1">Instituciones Activas</p>
            </div>
        </div>

        {/* Card 2: Usuarios Totales */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                    <Users size={24} />
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-3xl font-bold text-text-main">{stats.totalUsers}</h3>
                <p className="text-xs text-text-muted font-bold uppercase mt-1">Usuarios Totales</p>
            </div>
        </div>

        {/* Card 3: Docentes */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                    <BookUser size={24} />
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-3xl font-bold text-text-main">{stats.totalDocentes}</h3>
                <p className="text-xs text-text-muted font-bold uppercase mt-1">Docentes Registrados</p>
            </div>
        </div>

        {/* Card 4: Alumnos */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                    <GraduationCap size={24} />
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-3xl font-bold text-text-main">{stats.totalAlumnos}</h3>
                <p className="text-xs text-text-muted font-bold uppercase mt-1">Alumnos Registrados</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Distribución (Basado en datos reales) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
            <h3 className="font-bold text-lg mb-6 w-full text-left">Distribución de Usuarios</h3>
            
            {/* Gráfico Donut CSS Puro */}
            <div className="relative w-48 h-48 rounded-full flex items-center justify-center"
                 style={{
                    background: `conic-gradient(
                        #2A9E9C 0% ${pctAlumnos}%, 
                        #E8AA32 ${pctAlumnos}% ${pctAlumnos + pctDocentes}%, 
                        #E42289 ${pctAlumnos + pctDocentes}% 100%
                    )`
                 }}
            >
                {/* Círculo interior blanco para hacer efecto donut */}
                <div className="absolute w-36 h-36 bg-white rounded-full flex flex-col items-center justify-center">
                    <Users size={24} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Total</span>
                    <p className="font-bold text-xl">{stats.totalUsers}</p>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div> 
                    <span>Alumnos ({pctAlumnos}%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-secondary rounded-full"></div> 
                    <span>Docentes ({pctDocentes}%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent rounded-full"></div> 
                    <span>Admin/Otros ({pctAdmin}%)</span>
                </div>
            </div>
        </div>

        {/* Nota informativa */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <BarChart3 size={20} />
                </div>
                <h3 className="font-bold text-blue-800 text-lg">Métricas de Misiones</h3>
            </div>
            <p className="text-blue-700/80 text-sm leading-relaxed">
                El conteo global de "Misiones Completadas" y "Promedio de Notas" aún no está disponible en este reporte general. 
                <br/><br/>
                Actualmente, estos datos se calculan de forma individual dentro del panel de cada <strong>Director de Institución</strong> para asegurar la privacidad de los datos académicos por colegio.
            </p>
        </div>
      </div>
    </div>
  );
}