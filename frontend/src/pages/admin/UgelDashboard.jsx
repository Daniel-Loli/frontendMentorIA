import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { adminService } from '../../services/adminService';
import { 
  Building2, Users, MapPin, Plus, Search, School, BarChart3 
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function UgelDashboard() {
  const [stats, setStats] = useState({ totalInstitutions: 0, totalUsers: 0 });
  const [institutions, setInstitutions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  // Cargar datos
  const loadData = async () => {
    try {
      const statsData = await adminService.getGlobalStats();
      setStats(statsData);
      
      const schoolsData = await adminService.getInstitutions();
      setInstitutions(schoolsData.data || []);
    } catch (error) {
      toast.error("Error cargando datos de la UGEL");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Registrar Colegio
  const onSubmit = async (data) => {
    try {
      await adminService.createInstitution(data);
      toast.success("Institución registrada correctamente");
      setIsModalOpen(false);
      reset();
      loadData(); // Recargar tabla
    } catch (error) {
      toast.error("Error al registrar: " + (error.response?.data?.message || "Intente nuevamente"));
    }
  };

  // Filtrado de tabla
  const filteredSchools = institutions.filter(school => 
    school.nombre.toLowerCase().includes(filter.toLowerCase()) ||
    school.codigoLocal.includes(filter)
  );

  return (
    <div className="space-y-8">
      {/* Header y Métricas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Panel de Administración UGEL</h1>
          <p className="text-text-muted">Gestión regional de instituciones educativas.</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" className="hidden md:flex">
                <BarChart3 size={18} /> Reportes
            </Button>
            <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                <Plus size={18} /> Registrar Institución
            </Button>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
                <School size={32} />
            </div>
            <div>
                <p className="text-sm text-text-muted">Colegios Registrados</p>
                <h3 className="text-3xl font-bold">{stats.totalInstitutions}</h3>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-secondary/10 rounded-full text-secondary">
                <Users size={32} />
            </div>
            <div>
                <p className="text-sm text-text-muted">Total Usuarios</p>
                <h3 className="text-3xl font-bold">{stats.totalUsers}</h3>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-accent/10 rounded-full text-accent">
                <MapPin size={32} />
            </div>
            <div>
                <p className="text-sm text-text-muted">Cobertura</p>
                <h3 className="text-3xl font-bold">100%</h3>
            </div>
        </div>
      </div>

      {/* Tabla de Gestión */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
            <h3 className="font-bold text-lg">Directorio de Instituciones</h3>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o código..." 
                    className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-text-muted font-medium border-b">
                    <tr>
                        <th className="px-6 py-4">Código Local</th>
                        <th className="px-6 py-4">Nombre Institución</th>
                        <th className="px-6 py-4">Director / Contacto</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredSchools.map((school) => (
                        <tr key={school.idInstitucion} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-mono text-gray-500">{school.codigoLocal}</td>
                            <td className="px-6 py-4 font-bold text-primary">{school.nombre}</td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span>{school.usuario?.email || 'Sin asignar'}</span>
                                    <span className="text-xs text-gray-400">{school.telefono}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${school.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {school.enabled ? 'ACTIVO' : 'INACTIVO'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-secondary hover:underline font-medium">Ver Detalles</button>
                            </td>
                        </tr>
                    ))}
                    {filteredSchools.length === 0 && (
                        <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                No se encontraron instituciones.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal de Registro */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nueva Institución">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                    label="Nombre del Colegio" 
                    placeholder="IE. 1020 San Martin"
                    {...register("nombre", { required: "Campo obligatorio" })}
                />
                <Input 
                    label="Código Local" 
                    placeholder="084521"
                    {...register("codigoLocal", { required: "Campo obligatorio" })}
                />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
                <h4 className="text-sm font-bold text-primary">Datos de Cuenta (Director)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        label="Correo Electrónico" 
                        type="email"
                        {...register("email", { required: "Campo obligatorio" })}
                    />
                     <Input 
                        label="Contraseña Inicial" 
                        type="password"
                        {...register("password", { required: "Campo obligatorio", minLength: { value: 6, message: "Mínimo 6 caracteres"} })}
                        error={errors.password}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Input 
                    label="Teléfono" 
                    {...register("telefono")}
                />
                 <Input 
                    label="Dirección" 
                    {...register("direccion")}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="secondary" isLoading={isSubmitting}>Registrar Colegio</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
}