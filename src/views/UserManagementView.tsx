import { useState, useEffect } from 'react';
import { Search, UserCog, Check, X, Plus, Filter, MoreHorizontal, Mail, Shield, Users as UsersIcon, Trash2, Download } from 'lucide-react';
import { 
  Card, 
  Button, 
  SearchInput, 
  Badge, 
  Avatar, 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  FormField,
  Input,
  Checkbox,
  Table,
  TableColumn,
  Skeleton,
  DropdownMenu,
  PageHeader,
  EmptyState,
  cn 
} from '../components/ui/index';
import { usersApi, groupsApi, User, Group, ApiError } from '../services/api';

// ============================================
// USER MANAGEMENT VIEW
// ============================================
export const UserManagementView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Form states
  const [newUser, setNewUser] = useState({ email: '', name: '', roles: ['user'], groupIds: [] as string[] });
  const [editForm, setEditForm] = useState({ roles: [] as string[], groupIds: [] as string[] });
  
  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      (user.name?.toLowerCase().includes(query)) ||
      user.roles.some(role => role.toLowerCase().includes(query))
    );
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchGroups = async () => {
    try {
      const data = await groupsApi.list();
      setAvailableGroups(data);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);
  
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      roles: user.roles || [],
      groupIds: user.groups ? user.groups.map(g => g.id) : []
    });
    setShowEditModal(true);
  };

  const saveChanges = async () => {
    if (!editingUser) return;
    
    try {
      await usersApi.updateRoles(editingUser.id, editForm.roles);
      fetchUsers();
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err) {
      console.error('Save changes error:', err);
      alert('Failed to save changes');
    }
  };
  
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersApi.create(newUser);
      setShowAddModal(false);
      setNewUser({ email: '', name: '', roles: ['user'], groupIds: [] });
      fetchUsers();
    } catch (err) {
      console.error('Create user error:', err);
      alert('Error creating user');
    }
  };

  const toggleRole = (role: string, current: string[], setCurrent: (r: string[]) => void) => {
    if (current.includes(role)) {
      setCurrent(current.filter(r => r !== role));
    } else {
      setCurrent([...current, role]);
    }
  };

  const availableRoles = ['user', 'admin', 'coach', 'manager', 'protocol_manager', 'retreat_manager'];

  const getRoleBadgeVariant = (role: string): 'primary' | 'success' | 'warning' | 'error' | 'neutral' => {
    switch (role) {
      case 'admin': return 'primary';
      case 'coach': return 'success';
      case 'manager': return 'warning';
      default: return 'neutral';
    }
  };

  // Table columns definition
  const columns: TableColumn<User>[] = [
    {
      key: 'user',
      header: 'User',
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.name || user.email} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate">{user.name || 'Unknown'}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles?.length > 0 ? user.roles.map(role => (
            <Badge key={role} variant={getRoleBadgeVariant(role)}>
              {role}
            </Badge>
          )) : <span className="text-slate-400 text-xs">No roles</span>}
        </div>
      )
    },
    {
      key: 'groups',
      header: 'Groups',
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.groups?.length > 0 ? user.groups.map(group => (
            <Badge key={group.id} variant="neutral">
              {group.name}
            </Badge>
          )) : <span className="text-slate-400 text-xs">No groups</span>}
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      className: 'text-right',
      render: (user) => (
        <DropdownMenu
          trigger={
            <button className="icon-btn icon-btn-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal size={16} />
            </button>
          }
          items={[
            { label: 'Edit user', icon: <UserCog size={14} />, onClick: () => openEditModal(user) },
            { label: 'Send email', icon: <Mail size={14} />, onClick: () => {} },
            { divider: true, label: '' },
            { label: 'Delete user', icon: <Trash2 size={14} />, danger: true, onClick: () => {} },
          ]}
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Users"
        description="Manage user accounts, roles, and permissions"
        actions={
          <>
            <Button variant="outline" leftIcon={<Download size={16} />}>
              Export
            </Button>
            <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>
              Add User
            </Button>
          </>
        }
      />

      {/* Filters Card */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Filter size={16} />}>
              Filters
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm">
            <UsersIcon size={16} className="text-slate-400" />
            <span className="text-slate-600">{users.length} total users</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield size={16} className="text-slate-400" />
            <span className="text-slate-600">{users.filter(u => u.roles?.includes('admin')).length} admins</span>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          data={filteredUsers}
          keyExtractor={(user) => user.id}
          loading={loading}
        emptyMessage={searchQuery ? `No users found matching "${searchQuery}"` : 'No users found'}
          onRowClick={openEditModal}
        />
      </Card>

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} size="lg">
        <ModalHeader>Add New User</ModalHeader>
        <form onSubmit={handleAddUser}>
          <ModalBody className="space-y-5">
            <FormField label="Email Address" required>
              <Input
                type="email"
                required
                value={newUser.email}
                onChange={e => setNewUser({...newUser, email: e.target.value})}
                placeholder="user@example.com"
                leftIcon={<Mail size={16} />}
              />
            </FormField>
            
            <FormField label="Full Name" required>
              <Input
                type="text"
                required
                value={newUser.name}
                onChange={e => setNewUser({...newUser, name: e.target.value})}
                placeholder="John Doe"
              />
            </FormField>
            
            <FormField label="Assign Roles">
              <div className="flex flex-wrap gap-2">
                {availableRoles.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role, newUser.roles, (r) => setNewUser({...newUser, roles: r}))}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                      newUser.roles.includes(role) 
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </FormField>

            {availableGroups.length > 0 && (
              <FormField label="Add to Groups">
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3 space-y-2">
                  {availableGroups.map(group => (
                    <Checkbox
                      key={group.id}
                      label={group.name}
                      checked={newUser.groupIds.includes(group.id)}
                      onChange={() => {
                        const ids = newUser.groupIds.includes(group.id)
                          ? newUser.groupIds.filter(id => id !== group.id)
                          : [...newUser.groupIds, group.id];
                        setNewUser({...newUser, groupIds: ids});
                      }}
                    />
                  ))}
                </div>
              </FormField>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create User
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} size="lg">
        <ModalHeader>Edit User</ModalHeader>
        <ModalBody className="space-y-5">
          {editingUser && (
            <>
              {/* User Info (Read-only) */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <Avatar name={editingUser.name || editingUser.email} size="lg" />
                <div>
                  <p className="font-semibold text-slate-900">{editingUser.name || 'Unknown'}</p>
                  <p className="text-sm text-slate-500">{editingUser.email}</p>
                </div>
              </div>
              
              <FormField label="Roles">
                <div className="flex flex-wrap gap-2">
                  {availableRoles.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role, editForm.roles, (r) => setEditForm({...editForm, roles: r}))}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                        editForm.roles.includes(role) 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      )}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </FormField>

              {availableGroups.length > 0 && (
                <FormField label="Groups">
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3 space-y-2">
                    {availableGroups.map(group => (
                      <Checkbox
                        key={group.id}
                        label={group.name}
                        checked={editForm.groupIds.includes(group.id)}
                        onChange={() => {
                          const ids = editForm.groupIds.includes(group.id)
                            ? editForm.groupIds.filter(id => id !== group.id)
                            : [...editForm.groupIds, group.id];
                          setEditForm({...editForm, groupIds: ids});
                        }}
                      />
                    ))}
                  </div>
                </FormField>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveChanges}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
