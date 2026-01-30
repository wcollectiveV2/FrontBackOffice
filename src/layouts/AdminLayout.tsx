import { useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';

export const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F1F5F9' }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        marginLeft: '250px', 
        padding: '30px',
        maxWidth: 'calc(100vw - 250px)'
      }}>
        <Outlet />
      </main>
    </div>
  );
};
