import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut, 
  MessageSquare, 
  Menu, 
  X, 
  GraduationCap, 
  Building2,
  School,      // <--- FALTABA ESTE
  BarChart3    // <--- Y ESTE PARA REPORTES
} from 'lucide-react';
import clsx from 'clsx';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Definir menú según rol
  const getMenuItems = () => {
    const role = user?.rol?.nombre || user?.rol; // Ajuste para leer el rol correctamente (Objeto o String)

    const common = [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' }
    ];

    // ROL: DIRECTOR (INSTITUCION)
    if (role === 'INSTITUCION') { 
      return [
        ...common,
        { icon: Users, label: 'Docentes', to: '/docentes' },
        { icon: GraduationCap, label: 'Alumnos', to: '/alumnos' },
        { icon: Building2, label: 'Grados y Unidades', to: '/configuracion-academica' },
      ];
    }

    // ROL: DOCENTE
    if (role === 'DOCENTE') {
      return [
        ...common,
        { icon: BookOpen, label: 'Misiones IA', to: '/misiones-ia' }, // Bandeja de entrada del Agente
        { icon: Users, label: 'Mis Clases', to: '/mis-clases' },
      ];
    }

    // ROL: ALUMNO
    if (role === 'ALUMNO') {
      return [
        ...common, 
        { icon: BookOpen, label: 'Mis Misiones', to: '/mis-misiones' },
        { icon: MessageSquare, label: 'Agente Tutor', to: '/chat-tutor' },
      ];
    }

    // ROL: UGEL / ADMIN
    if (role === 'UGEL' || role === 'ADMIN') {
        return [
          ...common,
          { icon: School, label: 'Instituciones', to: '/admin/instituciones' },
          { icon: Users, label: 'Gestión Usuarios', to: '/admin/usuarios' },
          { icon: BarChart3, label: 'Reportes Globales', to: '/admin/reportes' },
        ];
    }

    return common; // Fallback
  };

  const navItems = getMenuItems();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transition-transform duration-300 md:relative md:translate-x-0 flex flex-col shadow-xl",
        !isMobileMenuOpen && "-translate-x-full"
      )}>
        <div className="p-6 border-b border-white/10 flex items-center gap-2">
          <div className="bg-white p-1 rounded">
             {/* Logo Placeholder */}
             <div className="w-6 h-6 bg-primary rounded-sm"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">MentorIA</h1>
            <p className="text-[10px] text-white/70 uppercase tracking-widest">{user?.rol?.nombre || user?.rol}</p>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                location.pathname === item.to 
                  ? "bg-white/20 text-white font-semibold shadow-inner" 
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-primary-hover/20">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-bold uppercase">
                    {user?.nombre?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{user?.nombre}</p>
                    <p className="text-xs text-white/60 truncate">{user?.email}</p>
                </div>
            </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-black/20 hover:bg-black/30 text-white rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-primary text-white p-4 flex items-center justify-between shadow-md">
          <span className="font-bold">MentorIA</span>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          <Outlet />
        </div>
      </main>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
}