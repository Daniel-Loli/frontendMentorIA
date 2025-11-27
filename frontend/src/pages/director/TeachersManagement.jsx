// frontend/src/pages/director/StudentsManagement.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { institutionService } from '../../services/institutionService';
import { useForm } from 'react-hook-form';
import { Users, Plus, Search, Mail, Phone, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function TeachersManagement() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // ID de la institución del usuario logueado (Ajustar según tu AuthContext)
  const idInstitucion = user?.id || 1; 

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const loadTeachers = async () => {
    try {
      const response = await institutionService.getTeachers(idInstitucion);
      setTeachers(response.data || []);
    } catch (error) {
      toast.error("Error cargando plana docente");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const onSubmit = async (data) => {
    try {
      await institutionService.createTeacher(data, idInstitucion);
      toast.success("Docente registrado y vinculado exitosamente");
      setIsModalOpen(false);
      reset();
      loadTeachers();
    } catch (error) {
      toast.error("Error al registrar docente");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Plana Docente</h1>
          <p className="text-text-muted">Gestión de profesores de la institución.</p>
        </div>
        <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Nuevo Docente
        </Button>
      </div>

      {/* Lista de Docentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((item) => (
          <div key={item.idDocenteInstitucion} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                {item.docente?.nombres?.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-text-main">{item.docente?.nombres} {item.docente?.apellidos}</h3>
                <div className="mt-2 space-y-1 text-sm text-text-muted">
                  <p className="flex items-center gap-2"><Mail size={14} /> {item.docente?.usuario?.email || 'Sin email'}</p>
                  <p className="flex items-center gap-2"><Phone size={14} /> {item.docente?.usuario?.telefono || 'Sin teléfono'}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${item.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.estado}
                    </span>
                    <button className="text-sm text-secondary hover:underline">Editar</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {teachers.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Users className="mx-auto text-gray-300 mb-2" size={48} />
                <p className="text-gray-500">No hay docentes registrados aún.</p>
            </div>
        )}
      </div>

      {/* Modal Registro */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nuevo Docente">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Input label="Nombres" {...register("nombres", { required: true })} />
                <Input label="Apellidos" {...register("apellidos", { required: true })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Tipo Documento</label>
                    <select {...register("tipoDocumento")} className="border rounded-lg px-3 py-2">
                        <option value="DNI">DNI</option>
                        <option value="CE">CE</option>
                    </select>
                </div>
                <Input label="Nro Documento" {...register("docIdentidad", { required: true })} />
            </div>
            <Input label="Email Corporativo" type="email" {...register("email", { required: true })} />
            <Input label="Contraseña Temporal" type="password" {...register("password", { required: true })} />
            <div className="grid grid-cols-2 gap-4">
                <Input label="Teléfono" {...register("telefono")} />
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Sexo</label>
                    <select {...register("sexo")} className="border rounded-lg px-3 py-2">
                        <option value="MASCULINO">Masculino</option>
                        <option value="FEMENINO">Femenino</option>
                    </select>
                </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="secondary" isLoading={isSubmitting}>Registrar</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
}