import { useState, useEffect } from 'react';
import { Plus, UserPlus, Trophy, List, Activity, Save, Building2, Trash2, Edit, ChevronDown, Star, Hash, Timer, Type, CheckSquare } from 'lucide-react';

interface Protocol {
  id: number;
  name: string;
  description: string;
  icon?: string;
  status?: string;
  creatorId: string;
  organizationId?: number;
  organizationName?: string;
  createdAt: string;
  elements?: ProtocolElement[];
  assignedOrganizations?: { id: number; name: string; assigned_at: string }[];
}

interface ProtocolElement {
  id?: number;
  title: string;
  description?: string;
  type: 'check' | 'number' | 'range' | 'timer' | 'text';
  unit?: string;
  goal?: number;
  minValue?: number;
  maxValue?: number;
  points?: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  displayOrder?: number;
  isRequired?: boolean;
}

interface User {
   id: string;
   email: string;
   name?: string;
   role: string;
}

interface Organization {
  id: number;
  name: string;
  logo_url?: string;
  type?: string;
}

interface LeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    avatarUrl?: string;
    totalPoints: number;
    activeDays: number;
    isCurrentUser: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const HABIT_SERVICE_URL = `${API_URL}/api`;
const USER_SERVICE_URL = `${API_URL}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const ElementTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'check': return <CheckSquare size={16} />;
    case 'number': return <Hash size={16} />;
    case 'range': return <ChevronDown size={16} />;
    case 'timer': return <Timer size={16} />;
    case 'text': return <Type size={16} />;
    default: return <CheckSquare size={16} />;
  }
};

export const ProtocolManagementView = () => {
    // State
    const [protocols, setProtocols] = useState<Protocol[]>([]);
    const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [activeTab, setActiveTab] = useState<'elements' | 'assignments' | 'leaderboard'>('elements');
    const [leaderboardPeriod, setLeaderboardPeriod] = useState<'all' | 'monthly' | 'weekly' | 'daily'>('all');

    // Forms
    const [newProtocol, setNewProtocol] = useState({ name: '', description: '', organization_id: '', icon: 'checklist' });
    const [newElement, setNewElement] = useState<Partial<ProtocolElement>>({ 
        title: '', 
        description: '',
        type: 'check', 
        frequency: 'daily',
        points: 10,
        isRequired: true
    });
    const [assignTarget, setAssignTarget] = useState({ type: 'USER', id: '' });
    const [orgAssignment, setOrgAssignment] = useState({ organization_id: '', assign_to_all_members: true });
    const [editingElement, setEditingElement] = useState<ProtocolElement | null>(null);

    // Fetching
    useEffect(() => {
        fetchProtocols();
        fetchUsers();
        fetchOrganizations();
    }, []);

    useEffect(() => {
        if (selectedProtocol) {
            fetchProtocolDetails(selectedProtocol.id);
        }
    }, [selectedProtocol?.id]);
    
    useEffect(() => {
        if (selectedProtocol && activeTab === 'leaderboard') {
            fetchLeaderboard(selectedProtocol.id);
        }
    }, [selectedProtocol?.id, activeTab, leaderboardPeriod]);

    const fetchProtocols = () => {
        fetch(`${HABIT_SERVICE_URL}/protocols?status=all`, {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(setProtocols)
            .catch(console.error);
    };

    const fetchProtocolDetails = (id: number) => {
        fetch(`${HABIT_SERVICE_URL}/protocols/${id}`, {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => setSelectedProtocol(data))
            .catch(console.error);
    };

    const fetchUsers = () => {
        fetch(`${USER_SERVICE_URL}/users`, {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(setUsers)
            .catch(console.error);
    };
    
    const fetchOrganizations = () => {
        fetch(`${USER_SERVICE_URL}/organizations`, {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(setOrganizations)
            .catch(console.error);
    };

    const fetchLeaderboard = (id: number) => {
        fetch(`${HABIT_SERVICE_URL}/protocols/${id}/leaderboard?period=${leaderboardPeriod}&limit=50`, {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => setLeaderboard(data.leaderboard || []))
            .catch(console.error);
    };

    // Handlers
    const handleCreateProtocol = (e: React.FormEvent) => {
        e.preventDefault();
        fetch(`${HABIT_SERVICE_URL}/protocols`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                ...newProtocol, 
                organization_id: newProtocol.organization_id ? parseInt(newProtocol.organization_id) : null
            })
        })
        .then(res => res.json())
        .then(data => {
            setProtocols([data, ...protocols]);
            setNewProtocol({ name: '', description: '', organization_id: '', icon: 'checklist' });
            setSelectedProtocol(data);
        });
    };

    const handleAddElement = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProtocol) return;
        
        const elementData = {
            ...newElement,
            min_value: newElement.minValue,
            max_value: newElement.maxValue,
            display_order: selectedProtocol.elements?.length || 0,
            is_required: newElement.isRequired
        };
        
        fetch(`${HABIT_SERVICE_URL}/protocols/${selectedProtocol.id}/elements`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(elementData)
        })
        .then(res => res.json())
        .then(() => {
            fetchProtocolDetails(selectedProtocol.id);
            setNewElement({ title: '', description: '', type: 'check', frequency: 'daily', points: 10, isRequired: true });
        });
    };
    
    const handleDeleteElement = (elementId: number) => {
        if (!selectedProtocol || !confirm('Delete this element?')) return;
        
        fetch(`${HABIT_SERVICE_URL}/protocols/${selectedProtocol.id}/elements/${elementId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
        .then(() => fetchProtocolDetails(selectedProtocol.id))
        .catch(console.error);
    };

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProtocol) return;
        fetch(`${HABIT_SERVICE_URL}/protocols/${selectedProtocol.id}/assign`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ targetType: assignTarget.type, targetId: assignTarget.id })
        })
        .then(res => res.json())
        .then(() => {
            alert('Assigned successfully!');
            setAssignTarget({ type: 'USER', id: '' });
        })
        .catch(console.error);
    };
    
    const handleAssignToOrganization = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProtocol || !orgAssignment.organization_id) return;
        
        fetch(`${HABIT_SERVICE_URL}/protocols/${selectedProtocol.id}/assign-organization`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                organization_id: parseInt(orgAssignment.organization_id),
                assign_to_all_members: orgAssignment.assign_to_all_members
            })
        })
        .then(res => res.json())
        .then(() => {
            alert('Protocol assigned to organization!');
            fetchProtocolDetails(selectedProtocol.id);
            setOrgAssignment({ organization_id: '', assign_to_all_members: true });
        })
        .catch(console.error);
    };
    
    const handleDeleteProtocol = (id: number) => {
        if (!confirm('Delete this protocol? This action cannot be undone.')) return;
        
        fetch(`${HABIT_SERVICE_URL}/protocols/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
        .then(() => {
            setProtocols(protocols.filter(p => p.id !== id));
            if (selectedProtocol?.id === id) {
                setSelectedProtocol(null);
            }
        })
        .catch(console.error);
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        if (rank === 2) return 'bg-gray-100 text-gray-700 border-gray-300';
        if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
        return 'bg-gray-50 text-gray-600 border-gray-200';
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar List */}
            <div className="w-1/3 bg-white border-r p-4 overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <List size={20} /> Protocols
                </h2>
                
                {/* Create Form */}
                <form onSubmit={handleCreateProtocol} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <input 
                        className="w-full mb-2 p-2 border rounded"
                        placeholder="Protocol Name"
                        value={newProtocol.name}
                        onChange={e => setNewProtocol({...newProtocol, name: e.target.value})}
                        required
                    />
                    <textarea 
                        className="w-full mb-2 p-2 border rounded"
                        placeholder="Description"
                        value={newProtocol.description}
                        onChange={e => setNewProtocol({...newProtocol, description: e.target.value})}
                    />
                    <select
                        className="w-full mb-2 p-2 border rounded"
                        value={newProtocol.organization_id}
                        onChange={e => setNewProtocol({...newProtocol, organization_id: e.target.value})}
                    >
                        <option value="">No Organization (Global)</option>
                        {organizations.map(org => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </select>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded flex items-center justify-center gap-2 hover:bg-blue-700">
                        <Plus size={16} /> Create Protocol
                    </button>
                </form>

                {/* List */}
                <div className="space-y-2">
                    {protocols.map(p => (
                        <div 
                            key={p.id}
                            className={`p-3 rounded-lg cursor-pointer transition group ${selectedProtocol?.id === p.id ? 'bg-blue-100 border-l-4 border-blue-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <div className="flex items-start justify-between" onClick={() => setSelectedProtocol(p)}>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">{p.icon || 'checklist'}</span>
                                        {p.name}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">{p.description}</div>
                                    {p.organizationName && (
                                        <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                            <Building2 size={12} />
                                            {p.organizationName}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteProtocol(p.id); }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {protocols.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            No protocols yet. Create one above.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="w-2/3 p-6 overflow-y-auto">
                {selectedProtocol ? (
                    <div>
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-blue-600">{selectedProtocol.icon || 'checklist'}</span>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">{selectedProtocol.name}</h1>
                                    <p className="text-gray-600">{selectedProtocol.description}</p>
                                </div>
                            </div>
                            {selectedProtocol.organizationName && (
                                <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                    <Building2 size={14} />
                                    {selectedProtocol.organizationName}
                                </div>
                            )}
                            {selectedProtocol.assignedOrganizations && selectedProtocol.assignedOrganizations.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {selectedProtocol.assignedOrganizations.map(org => (
                                        <span key={org.id} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                            <Building2 size={12} />
                                            {org.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex mb-6 border-b">
                            <button 
                                onClick={() => setActiveTab('elements')}
                                className={`px-4 py-2 border-b-2 font-medium transition ${activeTab === 'elements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <Activity size={16} className="inline mr-2" />
                                Elements ({selectedProtocol.elements?.length || 0})
                            </button>
                            <button 
                                onClick={() => setActiveTab('assignments')}
                                className={`px-4 py-2 border-b-2 font-medium transition ${activeTab === 'assignments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <UserPlus size={16} className="inline mr-2" />
                                Assignments
                            </button>
                            <button 
                                onClick={() => setActiveTab('leaderboard')}
                                className={`px-4 py-2 border-b-2 font-medium transition ${activeTab === 'leaderboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <Trophy size={16} className="inline mr-2" />
                                Leaderboard
                            </button>
                        </div>

                        {/* Elements Tab */}
                        {activeTab === 'elements' && (
                            <div className="space-y-6">
                                {/* Add Element Form */}
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="font-bold mb-4 flex items-center gap-2"><Activity size={18}/> Add Action/Element</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <input 
                                                placeholder="Title (e.g., Drink water, Morning meditation)" 
                                                className="w-full p-2 border rounded"
                                                value={newElement.title}
                                                onChange={e => setNewElement({...newElement, title: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input 
                                                placeholder="Description (optional)" 
                                                className="w-full p-2 border rounded"
                                                value={newElement.description || ''}
                                                onChange={e => setNewElement({...newElement, description: e.target.value})}
                                            />
                                        </div>
                                        <select 
                                            className="p-2 border rounded"
                                            value={newElement.type}
                                            onChange={e => setNewElement({...newElement, type: e.target.value as any})}
                                        >
                                            <option value="check">✓ Check (Done/Not Done)</option>
                                            <option value="number"># Number (Enter a value)</option>
                                            <option value="range">↕ Range (Select from options)</option>
                                            <option value="timer">⏱ Timer (Duration)</option>
                                            <option value="text">✎ Text (Free input)</option>
                                        </select>
                                        <div className="flex items-center gap-2">
                                            <Star size={16} className="text-yellow-500" />
                                            <input 
                                                type="number"
                                                placeholder="Points" 
                                                className="flex-1 p-2 border rounded"
                                                value={newElement.points || 10}
                                                onChange={e => setNewElement({...newElement, points: Number(e.target.value)})}
                                            />
                                        </div>
                                        
                                        {(newElement.type === 'number' || newElement.type === 'timer') && (
                                            <>
                                                <input 
                                                    type="number"
                                                    placeholder="Goal (e.g., 8, 30)" 
                                                    className="p-2 border rounded"
                                                    value={newElement.goal || ''}
                                                    onChange={e => setNewElement({...newElement, goal: Number(e.target.value)})}
                                                />
                                                <input 
                                                    placeholder="Unit (e.g., glasses, minutes)" 
                                                    className="p-2 border rounded"
                                                    value={newElement.unit || ''}
                                                    onChange={e => setNewElement({...newElement, unit: e.target.value})}
                                                />
                                            </>
                                        )}
                                        
                                        {newElement.type === 'range' && (
                                            <>
                                                <input 
                                                    type="number"
                                                    placeholder="Min value (e.g., 1)" 
                                                    className="p-2 border rounded"
                                                    value={newElement.minValue || ''}
                                                    onChange={e => setNewElement({...newElement, minValue: Number(e.target.value)})}
                                                />
                                                <input 
                                                    type="number"
                                                    placeholder="Max value (e.g., 8)" 
                                                    className="p-2 border rounded"
                                                    value={newElement.maxValue || ''}
                                                    onChange={e => setNewElement({...newElement, maxValue: Number(e.target.value)})}
                                                />
                                                <input 
                                                    placeholder="Unit (e.g., glasses)" 
                                                    className="p-2 border rounded"
                                                    value={newElement.unit || ''}
                                                    onChange={e => setNewElement({...newElement, unit: e.target.value})}
                                                />
                                            </>
                                        )}
                                        
                                        <select 
                                            className="p-2 border rounded"
                                            value={newElement.frequency}
                                            onChange={e => setNewElement({...newElement, frequency: e.target.value as any})}
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                        
                                        <label className="flex items-center gap-2 p-2">
                                            <input 
                                                type="checkbox"
                                                checked={newElement.isRequired}
                                                onChange={e => setNewElement({...newElement, isRequired: e.target.checked})}
                                            />
                                            Required
                                        </label>
                                    </div>
                                    <button 
                                        onClick={handleAddElement}
                                        disabled={!newElement.title}
                                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus size={16} /> Add Element
                                    </button>
                                </div>

                                {/* List Elements */}
                                <div className="space-y-2">
                                    {selectedProtocol.elements?.map((el, idx) => (
                                        <div key={el.id || idx} className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500 group">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                                        <ElementTypeIcon type={el.type} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold flex items-center gap-2">
                                                            {el.title}
                                                            {el.isRequired && <span className="text-red-500 text-sm">*</span>}
                                                        </h4>
                                                        {el.description && (
                                                            <p className="text-sm text-gray-500">{el.description}</p>
                                                        )}
                                                        <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-2">
                                                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                                                                {el.type}
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                                                                {el.frequency}
                                                            </span>
                                                            {el.goal && (
                                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                                                    Goal: {el.goal} {el.unit}
                                                                </span>
                                                            )}
                                                            {el.minValue !== undefined && el.maxValue !== undefined && (
                                                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                                                    Range: {el.minValue}-{el.maxValue} {el.unit}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium">
                                                        <Star size={14} />
                                                        {el.points || 10} pts
                                                    </span>
                                                    <button 
                                                        onClick={() => handleDeleteElement(el.id!)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded transition"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedProtocol.elements || selectedProtocol.elements.length === 0) && (
                                        <div className="text-gray-500 text-center py-8 bg-white rounded-lg">
                                            No elements added yet. Add your first action above.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Assignments Tab */}
                        {activeTab === 'assignments' && (
                            <div className="space-y-6">
                                {/* Assign to Organization */}
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="font-bold mb-4 flex items-center gap-2">
                                        <Building2 size={18}/> Assign to Organization
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Organization</label>
                                            <select 
                                                className="w-full p-2 border rounded"
                                                value={orgAssignment.organization_id}
                                                onChange={e => setOrgAssignment({...orgAssignment, organization_id: e.target.value})}
                                            >
                                                <option value="">Select organization...</option>
                                                {organizations.map(org => (
                                                    <option key={org.id} value={org.id}>{org.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <label className="flex items-center gap-2">
                                            <input 
                                                type="checkbox"
                                                checked={orgAssignment.assign_to_all_members}
                                                onChange={e => setOrgAssignment({...orgAssignment, assign_to_all_members: e.target.checked})}
                                            />
                                            <span className="text-sm">Also assign to all current members</span>
                                        </label>
                                        <button 
                                            onClick={handleAssignToOrganization}
                                            disabled={!orgAssignment.organization_id}
                                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Assign to Organization
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Assign to Individual User */}
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="font-bold mb-4 flex items-center gap-2"><UserPlus size={18}/> Assign to Individual User</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Select User</label>
                                            <select 
                                                className="w-full p-2 border rounded"
                                                value={assignTarget.id}
                                                onChange={e => setAssignTarget({...assignTarget, type: 'USER', id: e.target.value})}
                                            >
                                                <option value="">Select user...</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button 
                                            onClick={handleAssign}
                                            disabled={!assignTarget.id}
                                            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Assign to User
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Leaderboard Tab */}
                        {activeTab === 'leaderboard' && (
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="text-yellow-500" /> 
                                        <span className="font-bold">Leaderboard</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {(['all', 'monthly', 'weekly', 'daily'] as const).map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setLeaderboardPeriod(p)}
                                                className={`px-3 py-1 rounded text-sm transition ${
                                                    leaderboardPeriod === p 
                                                        ? 'bg-blue-600 text-white' 
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 text-left w-16">Rank</th>
                                            <th className="p-3 text-left">User</th>
                                            <th className="p-3 text-right">Points</th>
                                            <th className="p-3 text-right">Active Days</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map((entry) => (
                                            <tr key={entry.userId} className={`border-t ${entry.isCurrentUser ? 'bg-blue-50' : ''}`}>
                                                <td className="p-3">
                                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold text-sm ${getRankBadge(entry.rank)}`}>
                                                        {entry.rank <= 3 ? (
                                                            <Trophy size={14} />
                                                        ) : (
                                                            `#${entry.rank}`
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-3">
                                                        {entry.avatarUrl ? (
                                                            <img src={entry.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                                👤
                                                            </div>
                                                        )}
                                                        <span className="font-medium">
                                                            {entry.name}
                                                            {entry.isCurrentUser && (
                                                                <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">You</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-right font-bold text-lg">{entry.totalPoints.toLocaleString()}</td>
                                                <td className="p-3 text-right text-gray-600">{entry.activeDays}</td>
                                            </tr>
                                        ))}
                                        {leaderboard.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                                    No ranking data yet. Users will appear here once they start logging.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <List size={64} className="mb-4 opacity-50" />
                        <p className="text-lg">Select a protocol to view details</p>
                        <p className="text-sm">Or create a new one from the sidebar</p>
                    </div>
                )}
            </div>
        </div>
    );
};
                                    <div>
                                        <label className="block mb-1">Select Target</label>
                                        <select 
                                            className="w-full p-2 border rounded"
                                            value={assignTarget.id}
                                            onChange={e => setAssignTarget({...assignTarget, id: e.target.value})}
                                        >
                                            <option value="">Select...</option>
                                            {/* Logic for Groups vs Users */}
                                            {assignTarget.type === 'USER' && users.map(u => (
                                                <option key={u.id} value={u.id}>{u.email}</option>
                                            ))}
                                            {/* Mock for Groups */}
                                            {assignTarget.type !== 'USER' && (
                                                <>
                                                    <option value="g1">Group Alpha</option>
                                                    <option value="g2">Group Beta</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <button 
                                        onClick={handleAssign}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded"
                                    >
                                        Assign Protocol
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Leaderboard Tab */}
                        {activeTab === 'leaderboard' && (
                            <div className="bg-white rounded shadow overflow-hidden">
                                <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                                    <Trophy className="text-yellow-500" /> Leaderboard
                                </div>
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 text-left">Rank</th>
                                            <th className="p-3 text-left">User</th>
                                            <th className="p-3 text-right">Score</th>
                                            <th className="p-3 text-right">Completions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map((entry, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="p-3 font-bold text-gray-500">#{idx + 1}</td>
                                                <td className="p-3">
                                                    {users.find(u => u.id === entry.userId)?.email || `User ${entry.userId}`}
                                                </td>
                                                <td className="p-3 text-right font-bold">{entry.score}</td>
                                                <td className="p-3 text-right text-gray-600">{entry.completionCount}</td>
                                            </tr>
                                        ))}
                                        {leaderboard.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-gray-500">No data found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        Select a protocol to view details
                    </div>
                )}
            </div>
        </div>
    );
};
