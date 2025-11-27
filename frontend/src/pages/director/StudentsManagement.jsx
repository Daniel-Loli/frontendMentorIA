// frontend/src/pages/director/StudentsManagement.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { institutionService } from '../../services/institutionService';
import { useForm } from 'react-hook-form';
import { GraduationCap, Plus, Search, FileText } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function StudentsManagement() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const idInstitucion = user?.id || 1;
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const loadStudents = async () => {
    try {
      const response = await institutionService.getStudents(idInstitucion);
      setStudents(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const onSubmit = async (data) => {
    try {
      await institutionService.createStudent(data, idInstitucion);
      toast.success("Alumno registrado exitosamente");
      setIsModalOpen(false);
      reset();
      loadStudents();
    } catch (error) {
      toast.error("Error al registrar alumno");
    }
  };

  const filteredStudents = students.filter(item => 
    item.alumno?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alumno?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Alumnado</h1>
          <p className="text-text-muted">Directorio de estudiantes matriculados.</p>
        </div>
        <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Nuevo Alumno
        </Button>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
            type="text" 
            placeholder="Buscar alumno por nombre o apellido..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-text-muted border-b">
                    <tr>
                        <th className="px-6 py-4">Alumno</th>
                        <th className="px-6 py-4">Documento</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((item) => (
                        <tr key={item.idAlumnoInstitucion} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-text-main">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold">
                                        {item.alumno?.nombres?.charAt(0)}
                                    </div>
                                    {item.alumno?.nombres} {item.alumno?.apellidos}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {item.alumno?.tipoDocumento}: {item.alumno?.docIdentidad}
                            </td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                    {item.estado}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-primary hover:underline">Historial</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal Registro (Reutilizamos estructura) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Matricular Alumno">
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
            <Input label="Email" type="email" {...register("email")} />
            <Input label="Contraseña" type="password" {...register("password", { required: true })} />
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Sexo</label>
                    <select {...register("sexo")} className="border rounded-lg px-3 py-2">
                        <option value="MASCULINO">Masculino</option>
                        <option value="FEMENINO">Femenino</option>
                    </select>
                </div>
                <Input label="Teléfono Apoderado" {...register("telefono")} />
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