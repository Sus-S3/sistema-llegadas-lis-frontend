import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import UserFormPage from './pages/UserFormPage';
import LaboratoriosPage from './pages/LaboratoriosPage';
import LaboratorioFormPage from './pages/LaboratorioFormPage';
import DispositivosPage from './pages/DispositivosPage';
import DispositivoFormPage from './pages/DispositivoFormPage';
import TarjetasPage from './pages/TarjetasPage';
import TarjetaFormPage from './pages/TarjetaFormPage';
import AsistenciaPage from './pages/AsistenciaPage';
import HorariosPage from './pages/HorariosPage';
import HorarioFormPage from './pages/HorarioFormPage';
import RegistroPage from './pages/RegistroPage';
import JustificacionesPage from './pages/JustificacionesPage';
import JustificacionFormPage from './pages/JustificacionFormPage';
import ReemplazosPage from './pages/ReemplazosPage';
import ReemplazoFormPage from './pages/ReemplazoFormPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/usuarios" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/usuarios" element={
              <ProtectedRoute><UsersPage /></ProtectedRoute>
            } />
            <Route path="/usuarios/nuevo" element={
              <ProtectedRoute><UserFormPage /></ProtectedRoute>
            } />
            <Route path="/usuarios/:id/editar" element={
              <ProtectedRoute><UserFormPage /></ProtectedRoute>
            } />
            <Route path="/laboratorios" element={
              <ProtectedRoute adminOnly><LaboratoriosPage /></ProtectedRoute>
            } />
            <Route path="/laboratorios/nuevo" element={
              <ProtectedRoute adminOnly><LaboratorioFormPage /></ProtectedRoute>
            } />
            <Route path="/laboratorios/:id/editar" element={
              <ProtectedRoute adminOnly><LaboratorioFormPage /></ProtectedRoute>
            } />
            <Route path="/dispositivos" element={
              <ProtectedRoute adminOnly><DispositivosPage /></ProtectedRoute>
            } />
            <Route path="/dispositivos/nuevo" element={
              <ProtectedRoute adminOnly><DispositivoFormPage /></ProtectedRoute>
            } />
            <Route path="/dispositivos/:id/editar" element={
              <ProtectedRoute adminOnly><DispositivoFormPage /></ProtectedRoute>
            } />
            <Route path="/tarjetas" element={
              <ProtectedRoute adminOnly><TarjetasPage /></ProtectedRoute>
            } />
            <Route path="/tarjetas/nueva" element={
              <ProtectedRoute adminOnly><TarjetaFormPage /></ProtectedRoute>
            } />
            <Route path="/tarjetas/editar/:id" element={
              <ProtectedRoute adminOnly><TarjetaFormPage /></ProtectedRoute>
            } />
            <Route path="/asistencia" element={
              <ProtectedRoute><AsistenciaPage /></ProtectedRoute>
            } />
            <Route path="/horarios" element={
              <ProtectedRoute><HorariosPage /></ProtectedRoute>
            } />
            <Route path="/horarios/nuevo" element={
              <ProtectedRoute adminOnly><HorarioFormPage /></ProtectedRoute>
            } />
            <Route path="/horarios/:id/editar" element={
              <ProtectedRoute adminOnly><HorarioFormPage /></ProtectedRoute>
            } />
            <Route path="/registro" element={
              <ProtectedRoute><RegistroPage /></ProtectedRoute>
            } />
            <Route path="/justificaciones" element={
              <ProtectedRoute><JustificacionesPage /></ProtectedRoute>
            } />
            <Route path="/justificaciones/nueva" element={
              <ProtectedRoute><JustificacionFormPage /></ProtectedRoute>
            } />
            <Route path="/reemplazos" element={
              <ProtectedRoute><ReemplazosPage /></ProtectedRoute>
            } />
            <Route path="/reemplazos/nuevo" element={
              <ProtectedRoute><ReemplazoFormPage /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
