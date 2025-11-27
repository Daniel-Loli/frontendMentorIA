import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Pages - Auth
import Login from './pages/auth/Login';

// Pages - General
import Home from './pages/dashboard/Home';

// Pages - Docente
import MisionesIA from './pages/docente/MisionesIA';
import DocenteGestionMisiones from './pages/docente/DocenteGestionMisiones';
import MisClases from './pages/docente/MisClases';

// Pages - Alumno
import ChatTutor from './pages/alumno/ChatTutor';
import MisMisiones from './pages/alumno/MisMisiones';

// Pages - Admin / UGEL
import UgelDashboard from './pages/admin/UgelDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import GlobalReports from './pages/admin/GlobalReports';

// Director
import TeachersManagement from './pages/director/TeachersManagement';
import StudentsManagement from './pages/director/StudentsManagement';
import AcademicConfig from './pages/director/AcademicConfig';

const PrivateRoute = ({ children }) => {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>

				<Toaster position="top-right" toastOptions={{
					className: 'text-sm font-medium',
					duration: 4000,
					style: { background: '#fff', color: '#1F2937' }
				}} />

				<Routes>

					<Route path="/login" element={<Login />} />

					<Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>

						<Route path="/" element={<Navigate to="/dashboard" replace />} />

						<Route path="/dashboard" element={<Home />} />

						{/* DOCENTE */}
						<Route path="/gestion-misiones" element={<DocenteGestionMisiones />} />
						<Route path="/misiones-ia" element={<MisionesIA />} />
						<Route path="/mis-clases" element={<MisClases />} />

						{/* ALUMNO */}
						<Route path="/chat-tutor" element={<ChatTutor />} />
						<Route path="/chat-tutor/:id" element={<ChatTutor />} />
						<Route path="/mis-misiones" element={<MisMisiones />} />

						{/* DIRECTOR / INSTITUCIÓN */}
						<Route path="/docentes" element={<TeachersManagement />} />
						<Route path="/alumnos" element={<StudentsManagement />} />
						<Route path="/configuracion-academica" element={<AcademicConfig />} />

						{/* ADMIN UGEL */}
						<Route path="/admin/instituciones" element={<UgelDashboard />} />
						<Route path="/admin/usuarios" element={<UsersManagement />} />
						<Route path="/admin/reportes" element={<GlobalReports />} />

					</Route>

					<Route path="*" element={<Navigate to="/login" replace />} />

				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
