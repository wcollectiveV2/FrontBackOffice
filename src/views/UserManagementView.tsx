import { useState, useEffect } from 'react';
import { Search, UserCog, Check, X } from 'lucide-react';

interface Group {
  id: number;
  name: string;
  type: string;
}

interface User {
  id: string; // Changed from number to string (UUID)
  email: string;
  roles: string[];
  groups: Group[];
  createdAt: string;
}

export const UserManagementView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Temporary state for editing
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${API_URL}/api/users`)
      .then(res => res.json())
      .then(data => {
        setUsers(data); 
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };
  
  const fetchGroups = () => {
      fetch(`${API_URL}/api/groups`)
        .then(res => res.json())
        .then(setAvailableGroups)
        .catch(console.error);
  }

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);
  
  const startEditing = (user: User) => {
      setEditingId(user.id);
      setSelectedRoles(user.roles || []);
      setSelectedGroupIds(user.groups ? user.groups.map(g => g.id) : []);
  }

  const saveChanges = async (userId: string) => {
    try {
        // Save Roles
        await fetch(`${API_URL}/api/users/${userId}/roles`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roles: selectedRoles })
        });
        
        // Save Groups
        const res = await fetch(`${API_URL}/api/users/${userId}/groups`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupIds: selectedGroupIds })
        });
        
        const updatedUser = await res.json();
        
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
        setEditingId(null);
    } catch (e) {
        console.error(e);
        alert('Failed to save changes');
    }
  };

  const toggleRole = (role: string) => {
      if (selectedRoles.includes(role)) {
          setSelectedRoles(selectedRoles.filter(r => r !== role));
      } else {
          setSelectedRoles([...selectedRoles, role]);
      }
  }

  const toggleGroup = (groupId: number) => {
      if (selectedGroupIds.includes(groupId)) {
          setSelectedGroupIds(selectedGroupIds.filter(id => id !== groupId));
      } else {
          setSelectedGroupIds([...selectedGroupIds, groupId]);
      }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
         <h1 style={{ fontSize: '28px', color: '#1E293B' }}>User Management</h1>
         <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={18} />
            <input 
              placeholder="Search users..." 
              style={{ 
                padding: '10px 10px 10px 40px', 
                borderRadius: '8px', 
                border: '1px solid #CBD5E1', 
                width: '300px',
                outline: 'none'
              }}
            />
         </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>User</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Roles</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Groups</th> 
              <th style={{ padding: '16px 24px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}>Loading users...</td></tr>
            ) : users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '16px 24px', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: '500', color: '#1E293B' }}>{user.email}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>ID: {user.id} Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                </td>
                
                {/* Roles Column */}
                <td style={{ padding: '16px 24px', verticalAlign: 'top' }}>
                   {editingId === user.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                         {['CLIENT', 'COACH', 'ADMIN'].map(role => (
                             <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                 <input 
                                    type="checkbox" 
                                    checked={selectedRoles.includes(role)} 
                                    onChange={() => toggleRole(role)}
                                 />
                                 {role}
                             </label>
                         ))}
                      </div>
                   ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {user.roles?.map(role => (
                            <span key={role} style={{ 
                                padding: '2px 8px', 
                                borderRadius: '9999px', 
                                fontSize: '11px', 
                                fontWeight: '600',
                                backgroundColor: role === 'ADMIN' ? '#DBEAFE' : role === 'COACH' ? '#DCFCE7' : '#F1F5F9',
                                color: role === 'ADMIN' ? '#1E40AF' : role === 'COACH' ? '#166534' : '#475569',
                            }}>
                                {role}
                            </span>
                        )) || '-'}
                      </div>
                   )}
                </td>

                {/* Groups Column */}
                <td style={{ padding: '16px 24px', verticalAlign: 'top' }}>
                   {editingId === user.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                         {availableGroups.map(group => (
                             <label key={group.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                 <input 
                                    type="checkbox" 
                                    checked={selectedGroupIds.includes(group.id)} 
                                    onChange={() => toggleGroup(group.id)}
                                 />
                                 {group.name}
                             </label>
                         ))}
                      </div>
                   ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {user.groups?.map(group => (
                            <span key={group.id} style={{ 
                                padding: '2px 8px', 
                                borderRadius: '4px', 
                                fontSize: '11px', 
                                border: '1px solid #E2E8F0',
                                color: '#475569',
                            }}>
                                {group.name}
                            </span>
                        ))}
                        {(!user.groups || user.groups.length === 0) && <span style={{ color: '#94A3B8', fontSize: '12px' }}>No groups</span>}
                      </div>
                   )}
                </td>

                <td style={{ padding: '16px 24px', textAlign: 'right', verticalAlign: 'top' }}>
                   {editingId === user.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                          <button 
                            onClick={() => saveChanges(user.id)}
                            style={{ color: '#166534', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                             <Check size={16} /> Save
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                             <X size={16} /> Cancel
                          </button>
                      </div>
                   ) : (
                      <button 
                        onClick={() => startEditing(user)}
                        style={{ color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                         <UserCog size={16} /> Edit
                      </button>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
