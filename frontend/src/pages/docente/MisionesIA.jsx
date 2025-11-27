import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { missionService } from '../../services/missionService';
import { toast } from 'react-hot-toast';
import { BrainCircuit, CheckCircle, Edit3, Trash2, Calendar } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useForm } from 'react-hook-form';

export default function MisionesIA() {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState(null);

  // Formulario para el Modal de Edición
  const { register, handleSubmit, reset, setValue } = useForm();

  // 1. Cargar Misiones "EN_REVISION" (Generadas por el Agente)
  const fetchMissions = async () => {
    try {
      // NOTA: Asumimos ID institución 3 por el ejemplo, pero deberías sacarlo del user context si existe
      // const idInstitucion = user.institucion?.id || 3; 
      const idInstitucion = 3; 
      
      const response = await missionService.getByStatus(idInstitucion, 'EN_REVISION');
      setMissions(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar las propuestas de la IA");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  // 2. Manejar Aprobación Directa
  const handleApprove = async (idMision) => {
    const promise = missionService.approve(idMision);
    toast.promise(promise, {
      loading: 'Publicando misión...',
      success: '¡Misión validada y publicada a los alumnos!',
      error: 'Error al publicar'
    });

    try {
      await promise;
      // Eliminar de la lista localmente para feedback inmediato
      setMissions(prev => prev.filter(m => m.idMision !== idMision));
    } catch (e) { console.error(e); }
  };

  // 3. Manejar Eliminación
  const handleDelete = async (idMision) => {
    if(!confirm("¿Estás seguro de descartar esta propuesta de la IA?")) return;
    
    try {
      await missionService.delete(idMision);
      toast.success("Propuesta descartada");
      setMissions(prev => prev.filter(m => m.idMision !== idMision));
    } catch (e) {
      toast.error("Error al eliminar");
    }
  };

  // 4. Abrir Modal de Edición
  const openEditModal = (mission) => {
    setEditingMission(mission);
    setValue('titulo', mission.titulo);
    setValue('descripcion', mission.descripcion);
    // Aquí podrías setear fechas, actividades, etc.
    setIsModalOpen(true);
  };

  // 5. Guardar Edición
  const onSaveEdit = async (data) => {
    try {
      await missionService.update(editingMission.idMision, data);
      toast.success("Cambios guardados");
      setIsModalOpen(false);
      fetchMissions(); // Recargar lista
    } catch (error) {
      toast.error("Error al guardar cambios");
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando propuestas del Agente Vigía...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <BrainCircuit className="text-accent" />
            Bandeja de Entrada IA
          </h1>
          <p className="text-text-muted">
            El <strong>Agente Vigía</strong> generó estas propuestas anoche. Revísalas antes de publicar.
          </p>
        </div>
        <div className="bg-accent/10 text-accent px-4 py-2 rounded-lg font-bold text-sm">
          {missions.length} Propuestas Pendientes
        </div>
      </div>

      {/* Grid de Tarjetas */}
      {missions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <p className="text-text-muted">No hay propuestas pendientes por ahora.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {missions.map((mission) => (
            <div key={mission.idMision} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col">
              
              {/* Header de Tarjeta */}
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                    <BrainCircuit size={12} /> IA Generado
                  </span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Calendar size={12} /> {new Date(mission.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-text-main mb-2 leading-tight">
                  {mission.titulo}
                </h3>
                <p className="text-sm text-text-muted line-clamp-4">
                  {mission.descripcion}
                </p>
              </div>

              {/* Footer de Acciones */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                <Button 
                  onClick={() => handleApprove(mission.idMision)}
                  className="flex-1 text-sm bg-primary hover:bg-primary-hover"
                >
                  <CheckCircle size={16} /> Validar
                </Button>
                
                <button 
                    onClick={() => openEditModal(mission)}
                    className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors tooltip"
                    title="Editar Contenido"
                >
                    <Edit3 size={20} />
                </button>
                
                <button 
                    onClick={() => handleDelete(mission.idMision)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Descartar"
                >
                    <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edición */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Revisión de Misión Generada"
      >
        <form onSubmit={handleSubmit(onSaveEdit)} className="space-y-4">
            <Input 
                label="Título de la Misión"
                {...register('titulo', { required: true })}
            />
            
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-text-main">Descripción General</label>
                <textarea 
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    {...register('descripcion', { required: true })}
                ></textarea>
                <p className="text-xs text-text-muted">
                    Edita el texto generado por la IA si encuentras alucinaciones o errores conceptuales.
                </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                </Button>
                <Button type="submit" variant="secondary">
                    Guardar Cambios
                </Button>
            </div>
        </form>
      </Modal>
    </div>
  );
}