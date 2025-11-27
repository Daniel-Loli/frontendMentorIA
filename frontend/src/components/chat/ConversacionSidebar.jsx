import { useEffect, useState } from "react";
import { chatService } from "../../services/chatService";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Pencil, Trash2, MessageSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function ConversacionSidebar() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const activeId = parseInt(params.get("id"));
  const [conversaciones, setConversaciones] = useState([]);

  const load = async () => {
    const data = await chatService.listConversations(user.id);
    setConversaciones(data);
  };

  useEffect(() => {
    if (user?.id) load();
  }, [user]);

  const nuevaConversacion = async () => {
    const id = await chatService.initConversation(user.id);
    toast.success("Nueva conversación creada");
    navigate(`/chat-tutor?id=${id}`);
  };

  const rename = async (conv) => {
    const nuevoNombre = prompt("Nuevo nombre:", conv.nombre);
    if (!nuevoNombre) return;

    await chatService.renameConversation(conv.idConversacion, nuevoNombre);
    toast.success("Nombre actualizado");
    load();
  };

  const remove = async (conv) => {
    if (!confirm("¿Eliminar esta conversación?")) return;

    await chatService.deleteConversation(conv.idConversacion);
    toast.success("Conversación eliminada");

    if (conv.idConversacion === activeId) {
      nuevaConversacion();
    } else {
      load();
    }
  };

  return (
    <div className="w-72 h-full bg-primary-dark text-white flex flex-col">
      
      {/* Header */}
      <div className="p-4 border-b border-primary-light">
        <h1 className="text-lg font-bold">Agente Tutor</h1>
        <p className="text-xs text-gray-300">Tus conversaciones recientes</p>

        <button 
          onClick={nuevaConversacion}
          className="mt-4 w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg flex items-center gap-2 justify-center"
        >
          <Plus size={16} />
          Nueva Conversación
        </button>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-2">
        {conversaciones.map(conv => (
          <div 
            key={conv.idConversacion}
            className={`p-3 rounded-lg cursor-pointer transition flex justify-between items-center group ${
              activeId === conv.idConversacion 
                ? "bg-primary-light text-white" 
                : "bg-primary/10 hover:bg-primary-light/40"
            }`}
            onClick={() => navigate(`/chat-tutor?id=${conv.idConversacion}`)}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={16} />
              <span className="truncate max-w-[120px] text-sm">{conv.nombre}</span>
            </div>

            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); rename(conv); }}
              >
                <Pencil size={14} className="text-yellow-300 hover:text-yellow-400" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); remove(conv); }}
              >
                <Trash2 size={14} className="text-red-300 hover:text-red-400" />
              </button>
            </div>
          </div>
        ))}

        {conversaciones.length === 0 && (
          <p className="text-sm text-gray-300 text-center mt-4">
            No tienes conversaciones aún.
          </p>
        )}
      </div>

      {/* Footer usuario */}
      <div className="p-4 border-t border-primary-light flex items-center gap-3 text-sm">
        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
          {user?.nombre?.charAt(0)}
        </div>
        <div>
          <p className="font-bold">{user.nombre}</p>
          <p className="text-gray-300 text-xs">{user.codigo}</p>
        </div>
      </div>

    </div>
  );
}
