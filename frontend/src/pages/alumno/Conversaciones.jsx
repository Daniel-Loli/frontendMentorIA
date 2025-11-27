import { useState, useEffect } from "react";
import { chatService } from "../../services/chatService";
import { useAuth } from "../../context/AuthContext";
import { Pencil, Trash2, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Conversaciones() {
  const { user } = useAuth();
  const [conversaciones, setConversaciones] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await chatService.listConversations(user.id);
    setConversaciones(data);
  };

  const rename = async (conv) => {
    const nuevoNombre = prompt("Nuevo nombre:", conv.nombre);
    if (!nuevoNombre) return;
    await chatService.renameConversation(conv.idConversacion, nuevoNombre);
    toast.success("Nombre cambiado");
    load();
  };

  const remove = async (conv) => {
    if (!confirm("¿Eliminar esta conversación?")) return;
    await chatService.deleteConversation(conv.idConversacion);
    toast.success("Conversación eliminada");
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Mis Conversaciones</h1>

      {conversaciones.length === 0 && (
        <p className="text-gray-400">Aún no tienes conversaciones.</p>
      )}

      <div className="space-y-4">
        {conversaciones.map((c) => (
          <div 
            key={c.idConversacion}
            className="p-4 bg-white border rounded-xl shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-lg">{c.nombre}</p>
              <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
            </div>

            <div className="flex items-center gap-3">

              <Link 
                to={`/chat-tutor?id=${c.idConversacion}`}
                className="px-3 py-1 bg-primary text-white rounded-lg flex items-center gap-2"
              >
                <MessageSquare size={16} />
                Abrir
              </Link>

              <button onClick={() => rename(c)}>
                <Pencil size={18} className="text-yellow-600 hover:text-yellow-700" />
              </button>

              <button onClick={() => remove(c)}>
                <Trash2 size={18} className="text-red-600 hover:text-red-700" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
