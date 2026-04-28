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
              <ProtectedRoute><LaboratoriosPage /></ProtectedRoute>
            } />
            <Route path="/laboratorios/nuevo" element={
              <ProtectedRoute><LaboratorioFormPage /></ProtectedRoute>
            } />
            <Route path="/laboratorios/:id/editar" element={
              <ProtectedRoute><LaboratorioFormPage /></ProtectedRoute>
            } />
            <Route path="/dispositivos" element={
              <ProtectedRoute><DispositivosPage /></ProtectedRoute>
            } />
            <Route path="/dispositivos/nuevo" element={
              <ProtectedRoute><DispositivoFormPage /></ProtectedRoute>
            } />
            <Route path="/dispositivos/:id/editar" element={
              <ProtectedRoute><DispositivoFormPage /></ProtectedRoute>
            } />
            <Route path="/tarjetas" element={
              <ProtectedRoute><TarjetasPage /></ProtectedRoute>
            } />
            <Route path="/tarjetas/nueva" element={
              <ProtectedRoute><TarjetaFormPage /></ProtectedRoute>
            } />
            <Route path="/tarjetas/editar/:id" element={
              <ProtectedRoute><TarjetaFormPage /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
