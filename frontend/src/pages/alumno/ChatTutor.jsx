// frontend/src/pages/alumno/ChatTutor.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { chatService } from "../../services/chatService";
import { Send, Bot, User, MoreVertical, Trash2, Edit3, Menu } from "lucide-react";
import toast from "react-hot-toast";

export default function ChatTutor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingSidebar, setLoadingSidebar] = useState(false);

  // ----------------------------------------------------------
  // LEER ID DE URL
  // ----------------------------------------------------------
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get("id");
    if (id) {
      setActiveConversationId(parseInt(id));
    }
  }, [location.search]);

  // ----------------------------------------------------------
  // CARGAR CONVERSACIONES
  // ----------------------------------------------------------
  const loadConversations = async () => {
    setLoadingSidebar(true);
    const data = await chatService.listConversations(user.id);
    setConversations(data);
    setLoadingSidebar(false);
  };

  // ----------------------------------------------------------
  // CARGAR MENSAJES
  // ----------------------------------------------------------
  const loadMessages = async (conversationId) => {
    setLoadingMessages(true);
    const msgs = await chatService.getHistory(conversationId);

    // Ordenar por fecha ASC → del más viejo al más nuevo
    const ordered = msgs.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    setMessages(ordered);

    setLoadingMessages(false);
  };

  // ----------------------------------------------------------
  // EFECTO INICIAL
  // ----------------------------------------------------------
  useEffect(() => {
    if (user?.id) loadConversations();
  }, [user]);

  // ----------------------------------------------------------
  // Cargar historial al seleccionar conversación
  // ----------------------------------------------------------
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId]);

  // ----------------------------------------------------------
  // CREAR NUEVA CONVERSACIÓN
  // ----------------------------------------------------------
  const handleNewChat = async () => {
    const newId = await chatService.initConversation(user.id);

    setConversations(prev => [
      { idConversacion: newId, nombre: "Tutoría Personalizada" },
      ...prev
    ]);

    navigate(`/chat-tutor?id=${newId}`);
    setActiveConversationId(newId);
    setMessages([]);
  };

  // ----------------------------------------------------------
  // RENOMBRAR CONVERSACIÓN
  // ----------------------------------------------------------
  const handleRename = async (id) => {
    const newName = prompt("Nuevo nombre de la conversación:");
    if (!newName) return;

    await chatService.renameConversation(id, newName);

    setConversations(prev =>
      prev.map(c => c.idConversacion === id ? { ...c, nombre: newName } : c)
    );

    toast.success("Conversación renombrada");
  };

  // ----------------------------------------------------------
  // ELIMINAR CONVERSACIÓN
  // ----------------------------------------------------------
  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar esta conversación?")) return;

    await chatService.deleteConversation(id);

    setConversations(prev => prev.filter(c => c.idConversacion !== id));

    if (id === activeConversationId) {
      navigate("/chat-tutor");
      setActiveConversationId(null);
      setMessages([]);
    }

    toast.success("Conversación eliminada");
  };

  // ----------------------------------------------------------
  // ENVIAR MENSAJE
  // ----------------------------------------------------------
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;

    const userMsg = {
      idMensaje: Date.now(),
      tipo: "USUARIO",
      contenido: newMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessage("");

    try {
      const botMsg = await chatService.sendMessage(activeConversationId, newMessage);

      if (botMsg) {
        setMessages(prev => [...prev, botMsg]);
      } else {
        toast.error("El servidor no devolvió contenido válido");
      }
    } catch {
      toast.error("Error al enviar mensaje");
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-100 overflow-hidden">

      {/* ---------------------------------------------------
           SIDEBAR (Historial de conversaciones)
      --------------------------------------------------- */}
      <div
        className={`transition-all duration-300 bg-white border-r shadow-sm ${
          isSidebarOpen ? "w-80" : "w-0"
        } overflow-hidden`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-gray-700">Tus conversaciones</h2>
          <button
            className="lg:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Menu size={18} />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition"
          >
            + Nueva Conversación
          </button>
        </div>

        <div className="overflow-y-auto h-full px-2 pb-10">
          {loadingSidebar ? (
            <p className="text-gray-400 text-sm p-4">Cargando...</p>
          ) : conversations.length === 0 ? (
            <p className="text-gray-400 text-sm p-4">Sin conversaciones</p>
          ) : (
            conversations.map((c) => (
              <div
                key={c.idConversacion}
                className={`flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer transition ${
                  activeConversationId === c.idConversacion
                    ? "bg-primary text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => navigate(`/chat-tutor?id=${c.idConversacion}`)}
              >
                <span className="truncate">{c.nombre}</span>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename(c.idConversacion);
                    }}
                    className="p-1 hover:bg-white/30 rounded"
                  >
                    <Edit3 size={16} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(c.idConversacion);
                    }}
                    className="p-1 hover:bg-white/30 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Botón para abrir sidebar */}
      {!isSidebarOpen && (
        <button
          className="absolute top-24 left-2 bg-primary text-white p-2 rounded-lg shadow hover:bg-primary-hover"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
      )}

      {/* ---------------------------------------------------
           ÁREA DEL CHAT
      --------------------------------------------------- */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white p-4 shadow flex items-center gap-3">
          <Bot size={22} />
          <div>
            <h2 className="font-bold text-lg">Agente Tutor</h2>
            <p className="text-xs text-white/80">Conectado a Azure Knowledge Base</p>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {loadingMessages ? (
            <p className="text-gray-400 text-sm">Cargando mensajes...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-10">
              No hay mensajes en esta conversación.
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m.idMensaje}
                className={`flex ${
                  m.tipo === "USUARIO" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-xl max-w-xl shadow ${
                    m.tipo === "USUARIO"
                      ? "bg-secondary text-white"
                      : "bg-white border"
                  }`}
                >
                  {m.contenido}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="p-4 bg-white border-t flex gap-3 items-center"
        >
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Pregunta algo…"
            className="flex-1 p-3 bg-gray-100 rounded-xl resize-none max-h-28"
            rows="1"
          />

          <button
            type="submit"
            className="bg-primary text-white p-3 rounded-lg shadow hover:bg-primary-hover"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
