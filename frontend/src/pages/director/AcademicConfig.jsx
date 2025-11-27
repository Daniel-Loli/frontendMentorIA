// frontend/src/pages/director/AcademicConfig.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { institutionService } from '../../services/institutionService';
import { Building2, Plus, Layers, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function AcademicConfig() {
  const { user } = useAuth();
  const [structure, setStructure] = useState([]);
  const [loading, setLoading] = useState(true);
  const idInstitucion = user?.id || 1;

  const loadStructure = async () => {
    try {
      const response = await institutionService.getAcademicStructure(idInstitucion);
      setStructure(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStructure(); }, []);

  const handleAddUnit = async (nivel, grado) => {
    try {
      await institutionService.addUnit({
        nivel,
        grado,
        idInstitucion
      });
      toast.success(`Agregado ${grado}° Grado a ${nivel}`);
      loadStructure();
    } catch (error) {
      toast.error("Error al agregar unidad");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">Configuración Académica</h1>
        <p className="text-text-muted">Define los niveles y grados que ofrece tu institución.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel de Estructura Actual */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Layers className="text-primary" /> Estructura Actual
            </h3>
            
            {loading ? <p>Cargando...</p> : (
                <div className="space-y-4">
                    {structure.map((nivelData, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 font-bold text-text-main flex justify-between">
                                {nivelData.nivel}
                                <span className="text-xs bg-white border px-2 py-1 rounded text-gray-500 font-normal">
                                    {nivelData.grados.length} Grados activos
                                </span>
                            </div>
                            <div className="p-4 grid grid-cols-3 gap-2">
                                {nivelData.grados.map((g) => (
                                    <div key={g.unidad.idUnidad} className="bg-primary/5 text-primary text-center py-2 rounded-lg text-sm font-medium border border-primary/10">
                                        {g.grado}° Grado
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {structure.length === 0 && <p className="text-gray-400 text-center">No hay grados configurados.</p>}
                </div>
            )}
        </div>

        {/* Panel de Acciones Rápidas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Plus className="text-secondary" /> Agregar Unidades
            </h3>
            <p className="text-sm text-text-muted mb-6">
                Haz clic para habilitar un grado rápidamente.
            </p>

            {['PRIMARIA', 'SECUNDARIA'].map(nivel => (
                <div key={nivel} className="mb-6">
                    <h4 className="font-bold text-sm text-gray-500 uppercase mb-2">{nivel}</h4>
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6].map(grado => (
                            <button 
                                key={grado}
                                onClick={() => handleAddUnit(nivel, grado)}
                                className="w-10 h-10 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-secondary hover:text-secondary hover:bg-secondary/5 flex items-center justify-center transition-all font-bold"
                                title={`Agregar ${grado}° ${nivel}`}
                            >
                                {grado}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}