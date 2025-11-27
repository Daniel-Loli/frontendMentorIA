import { UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { studentService } from '../../services/studentService';
import toast from 'react-hot-toast';

export default function EvidenceUpload({ mission }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file) return toast.error("Primero selecciona un archivo");

    setLoading(true);
    try {
      await studentService.uploadEvidence(123, file);
      toast.success("¡Evidencia enviada!");
    } catch {
      toast.error("Error al subir archivo");
    }
    setLoading(false);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl shadow-sm">
      <h3 className="font-bold text-yellow-800 flex items-center gap-2 mb-3">
        <UploadCloud size={20} /> Tu Evidencia
      </h3>

      <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center block cursor-pointer hover:border-primary">
        {!file ? (
          <>
            <UploadCloud size={36} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Arrastra tu archivo o haz clic aquí</p>
            <p className="text-xs text-gray-400 mt-1">PDF • JPG • MP4 • DOCX</p>
          </>
        ) : (
          <div className="text-green-600 font-semibold">{file.name}</div>
        )}
        <input
          type="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </label>

      <button
        onClick={handleSubmit}
        className="w-full bg-secondary text-white py-2 rounded-lg font-bold mt-4 disabled:bg-gray-300"
        disabled={!file || loading}
      >
        {loading ? "Enviando..." : "Enviar Tarea"}
      </button>
    </div>
  );
}
