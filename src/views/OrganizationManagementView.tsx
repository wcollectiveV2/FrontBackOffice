import { useState, useEffect } from 'react';
import { Search, Building2, UserPlus, Pencil, Trash, Plus, Check, X } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  created_at: string;
}

export const OrganizationManagementView = () => {
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [formData, setFormData] = useState({ name: '', logo_url: '' });

    // Handle API URL from env var or default to backend port
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');

    const getAuthHeaders = () => {
      const token = localStorage.getItem('adminToken');
      return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
    };

    const fetchOrgs = () => {
         setLoading(true);
         fetch(`${API_URL}/api/organizations`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                setOrgs(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchOrgs();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/organizations`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowCreateModal(false);
                setFormData({ name: '', logo_url: '' });
                fetchOrgs();
            } else {
                alert('Failed to create organization');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
         e.preventDefault();
        if (!selectedOrg) return;
        try {
            const res = await fetch(`${API_URL}/api/organizations/${selectedOrg.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowEditModal(false);
                setSelectedOrg(null);
                setFormData({ name: '', logo_url: '' });
                fetchOrgs();
            } else {
                alert('Failed to update');
            }
        } catch (err) {
            console.error(err);
        }
    }
    
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this organization?')) return;
        try {
            const res = await fetch(`${API_URL}/api/organizations/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) fetchOrgs();
            else alert('Failed to delete');
        } catch (err) {
            console.error(err);
        }
    }
    
    const openEdit = (org: Organization) => {
        setSelectedOrg(org);
        setFormData({ name: org.name, logo_url: org.logo_url || '' });
        setShowEditModal(true);
    }

    return (
        <div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', color: '#1E293B' }}>Organizations Management</h1>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    backgroundColor: '#3B82F6',
                    color: 'white', border: 'none', borderRadius: '8px',
                    padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                  }}
                >
                    <Plus size={18} /> New Organization
                </button>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
               {loading ? <p>Loading...</p> : orgs.map(org => (
                   <div key={org.id} style={{
                       backgroundColor: 'white', borderRadius: '12px', padding: '24px',
                       boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                       display: 'flex', flexDirection: 'column', gap: '16px'
                   }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                           <div style={{
                               width: '48px', height: '48px', borderRadius: '8px',
                               backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                               color: '#94A3B8'
                           }}>
                               {org.logo_url ? <img src={org.logo_url} style={{width:'100%', height:'100%', borderRadius:'8px'}}/> : <Building2 size={24} />}
                           </div>
                           <div>
                               <h3 style={{ margin: 0, fontSize: '18px', color: '#1E293B' }}>{org.name}</h3>
                               <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94A3B8' }}>Created: {new Date(org.created_at).toLocaleDateString()}</p>
                           </div>
                       </div>
                       
                       <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 'auto' }}>
                            <button 
                                onClick={() => openEdit(org)}
                                style={{ padding: '8px', background: '#EFF6FF', color: '#3B82F6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                <Pencil size={16} />
                            </button>
                            <button 
                                onClick={() => handleDelete(org.id)}
                                style={{ padding: '8px', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                <Trash size={16} />
                            </button>
                       </div>
                   </div>
               ))}
           </div>
           
           {(showCreateModal || showEditModal) && (
             <div style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
              }}>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '400px' }}>
                   <h2>{showEditModal ? 'Edit Organization' : 'Create Organization'}</h2>
                   <form onSubmit={showEditModal ? handleUpdate : handleCreate}>
                        <div style={{ marginBottom: '16px' }}>
                              <label style={{ display: 'block', marginBottom: '8px' }}>Name</label>
                              <input 
                                  required value={formData.name}
                                  onChange={e => setFormData({...formData, name: e.target.value})}
                                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                              />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                              <label style={{ display: 'block', marginBottom: '8px' }}>Logo URL</label>
                              <input 
                                   value={formData.logo_url}
                                  onChange={e => setFormData({...formData, logo_url: e.target.value})}
                                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                              />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                              <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} style={{ padding: '8px 16px', background: 'white', border: '1px solid #ddd', borderRadius: '6px', cursor:'pointer' }}>Cancel</button>
                              <button type="submit" style={{ padding: '8px 16px', background: '#3B82F6', color:'white', border: 'none', borderRadius: '6px', cursor:'pointer' }}>Save</button>
                        </div>
                   </form>
                </div>
             </div>
           )}
        </div>
    );
}
