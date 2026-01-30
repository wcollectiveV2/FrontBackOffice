import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { DashboardView } from './views/DashboardView';
import { UserManagementView } from './views/UserManagementView';
import { ProtocolManagementView } from './views/ProtocolManagementView';
import { LoginView } from './views/LoginView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardView />} />
          <Route path="users" element={<UserManagementView />} />
          <Route path="protocols" element={<ProtocolManagementView />} />
          <Route path="retreats" element={<div style={{ padding: '20px' }}><h2>Retreats Management</h2><p>Coming Soon</p></div>} />
          <Route path="shop" element={<div style={{ padding: '20px' }}><h2>Shop Management</h2><p>Coming Soon</p></div>} />
          <Route path="settings" element={<div style={{ padding: '20px' }}><h2>Settings</h2><p>Platform Configuration</p></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
