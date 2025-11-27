import Modal from '../../components/ui/Modal';
import EvidenceUpload from './EvidenceUpload';

export default function MissionDetailModal({ mission, onClose }) {
  return (
    <Modal isOpen={!!mission} onClose={onClose} title={mission.titulo}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Izquierda */}
        <div className="md:col-span-2 space-y-4 p-2">
          <h3 className="font-semibold text-lg">Descripción</h3>
          <p className="text-gray-600">{mission.descripcion}</p>

          <h3 className="font-semibold text-lg mt-4">Objetivos</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>Investigar fuentes confiables.</li>
            <li>Crear el modelo o evidencia.</li>
            <li>Subir archivo como evidencia.</li>
          </ul>
        </div>

        {/* Derecha */}
        <div className="md:col-span-1">
          <EvidenceUpload mission={mission} />
        </div>
      </div>
    </Modal>
  );
}
