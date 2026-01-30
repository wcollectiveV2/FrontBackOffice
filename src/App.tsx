import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { DashboardView } from './views/DashboardView';
import { UserManagementView } from './views/UserManagementView';
import { ProtocolManagementView } from './views/ProtocolManagementView';
import { LoginView } from './views/LoginView';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const userJson = localStorage.getItem('adminUser');
  const user = userJson ? JSON.parse(userJson) : null;
  const userRoles = user?.roles || [];
  
  const hasPermission = !allowedRoles || 
                        userRoles.includes('admin') || 
                        allowedRoles.some((role: string) => userRoles.includes(role));
  
  if (!hasPermission) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardView />} />
          <Route path="users" element={<ProtectedRoute allowedRoles={['manager', 'coach']}><UserManagementView /></ProtectedRoute>} />
          <Route path="protocols" element={<ProtectedRoute allowedRoles={['protocol_manager']}><ProtocolManagementView /></ProtectedRoute>} />
          <Route path="retreats" element={<ProtectedRoute allowedRoles={['retreat_manager']}><div style={{ padding: '20px' }}><h2>Retreats Management</h2><p>Coming Soon</p></div></ProtectedRoute>} />
          <Route path="shop" element={<ProtectedRoute allowedRoles={['shop_manager']}><div style={{ padding: '20px' }}><h2>Shop Management</h2><p>Coming Soon</p></div></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute allowedRoles={[]}><div style={{ padding: '20px' }}><h2>Settings</h2><p>Platform Configuration</p></div></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
