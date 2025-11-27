import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Search, User, Shield, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('TODOS');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminService.getUsers();
        setUsers(response.data || []);
      } catch (error) {
        toast.error("Error al cargar usuarios");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filtrado dinámico
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.nombre && user.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'TODOS' || user.rol?.nombre === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Gestión de Usuarios</h1>
          <p className="text-text-muted">Administración de cuentas y roles del sistema.</p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por email o nombre..." 
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select 
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
            >
                <option value="TODOS">Todos los Roles</option>
                <option value="INSTITUCION">Institución</option>
                <option value="DOCENTE">Docente</option>
                <option value="ALUMNO">Alumno</option>
                <option value="UGEL">UGEL</option>
            </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-text-muted font-medium border-b">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center">Cargando...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No se encontraron usuarios.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.idUsuario} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-medium text-text-main">{user.codigo || 'Sin Nombre'}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-xs font-bold text-gray-600 border border-gray-200">
                        <Shield size={12} />
                        {user.rol?.nombre}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.telefono || '-'}</td>
                    <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            ACTIVO
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:underline font-medium text-xs">Editar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}