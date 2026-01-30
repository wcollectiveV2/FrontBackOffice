import { useState, useEffect } from 'react';
import { Plus, UserPlus, Trophy, List, Activity, Save } from 'lucide-react';

interface Protocol {
  id: number;
  name: string;
  description: string;
  creatorId: string;
  createdAt: string;
  elements?: ProtocolElement[];
}

interface ProtocolElement {
  id?: number;
  title: string;
  type: 'check' | 'number' | 'timer' | 'text';
  unit?: string;
  goal?: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
}

interface User {
   id: string; // Changed from number to string (UUID)
   email: string;
   role: string;
}

interface LeaderboardEntry {
    userId: string; // Changed from number to string
    score: number;
    completionCount: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const HABIT_SERVICE_URL = `${API_URL}/api`;
const USER_SERVICE_URL = `${API_URL}/api`;

export const ProtocolManagementView = () => {
    // State
    const [protocols, setProtocols] = useState<Protocol[]>([]);
    const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [activeTab, setActiveTab] = useState<'elements' | 'assignments' | 'leaderboard'>('elements');

    // Forms
    const [newProtocol, setNewProtocol] = useState({ name: '', description: '' });
    const [newElement, setNewElement] = useState<Partial<ProtocolElement>>({ 
        title: '', type: 'check', frequency: 'daily' 
    });
    const [assignTarget, setAssignTarget] = useState({ type: 'USER', id: '' });

    // Fetching
    useEffect(() => {
        fetchProtocols();
        fetchUsers();
    }, []);

    useEffect(() => {
        if (selectedProtocol) {
            fetchProtocolDetails(selectedProtocol.id);
            if (activeTab === 'leaderboard') fetchLeaderboard(selectedProtocol.id);
        }
    }, [selectedProtocol?.id, activeTab]);

    const fetchProtocols = () => {
        fetch(`${HABIT_SERVICE_URL}/protocols`)
            .then(res => res.json())
            .then(setProtocols)
            .catch(console.error);
    };

    const fetchProtocolDetails = (id: number) => {
        fetch(`${HABIT_SERVICE_URL}/protocols/${id}`)
            .then(res => res.json())
            .then(data => setSelectedProtocol(data)) // Updates with elements
            .catch(console.error);
    };

    const fetchUsers = () => {
        fetch(`${USER_SERVICE_URL}/users`)
            .then(res => res.json())
            .then(setUsers)
            .catch(console.error);
    };

    const fetchLeaderboard = (id: number) => {
        fetch(`${HABIT_SERVICE_URL}/protocols/${id}/leaderboard`)
            .then(res => res.json())
            .then(setLeaderboard)
            .catch(console.error);
    };

    // Handlers
    const handleCreateProtocol = (e: React.FormEvent) => {
        e.preventDefault();
        fetch(`${HABIT_SERVICE_URL}/protocols`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newProtocol, creatorId: 1, isPublic: true })
        })
        .then(res => res.json())
        .then(data => {
            setProtocols([data, ...protocols]);
            setNewProtocol({ name: '', description: '' });
        });
    };

    const handleAddElement = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProtocol) return;
        fetch(`${HABIT_SERVICE_URL}/protocols/${selectedProtocol.id}/elements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newElement)
        })
        .then(res => res.json())
        .then(() => {
            fetchProtocolDetails(selectedProtocol.id);
            setNewElement({ title: '', type: 'check', frequency: 'daily' });
        });
    };

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProtocol) return;
        fetch(`${HABIT_SERVICE_URL}/protocols/${selectedProtocol.id}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetType: assignTarget.type, targetId: assignTarget.id })
        })
        .then(res => res.json())
        .then(() => alert('Assigned successfully!'))
        .catch(console.error);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar List */}
            <div className="w-1/3 bg-white border-r p-4 overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <List size={20} /> Protocols
                </h2>
                
                {/* Create Form */}
                <form onSubmit={handleCreateProtocol} className="mb-6 p-4 bg-gray-50 rounded">
                    <input 
                        className="w-full mb-2 p-2 border rounded"
                        placeholder="Protocol Name"
                        value={newProtocol.name}
                        onChange={e => setNewProtocol({...newProtocol, name: e.target.value})}
                    />
                    <textarea 
                        className="w-full mb-2 p-2 border rounded"
                        placeholder="Description"
                        value={newProtocol.description}
                        onChange={e => setNewProtocol({...newProtocol, description: e.target.value})}
                    />
                    <button className="w-full bg-blue-600 text-white p-2 rounded flex items-center justify-center gap-2">
                        <Plus size={16} /> Create Protocol
                    </button>
                </form>

                {/* List */}
                <div className="space-y-2">
                    {protocols.map(p => (
                        <div 
                            key={p.id}
                            onClick={() => setSelectedProtocol(p)}
                            className={`p-3 rounded cursor-pointer transition ${selectedProtocol?.id === p.id ? 'bg-blue-100 border-l-4 border-blue-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <div className="font-semibold">{p.name}</div>
                            <div className="text-sm text-gray-500 truncate">{p.description}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="w-2/3 p-6 overflow-y-auto">
                {selectedProtocol ? (
                    <div>
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-2">{selectedProtocol.name}</h1>
                            <p className="text-gray-600">{selectedProtocol.description}</p>
                        </div>

                        {/* Tabs */}
                        <div className="flex mb-6 border-b">
                            <button 
                                onClick={() => setActiveTab('elements')}
                                className={`px-4 py-2 border-b-2 ${activeTab === 'elements' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}
                            >
                                Routine Elements
                            </button>
                            <button 
                                onClick={() => setActiveTab('assignments')}
                                className={`px-4 py-2 border-b-2 ${activeTab === 'assignments' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}
                            >
                                Assignments
                            </button>
                            <button 
                                onClick={() => setActiveTab('leaderboard')}
                                className={`px-4 py-2 border-b-2 ${activeTab === 'leaderboard' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}
                            >
                                Leaderboard
                            </button>
                        </div>

                        {/* Elements Tab */}
                        {activeTab === 'elements' && (
                            <div className="space-y-6">
                                {/* Add Element Form */}
                                <div className="bg-white p-4 rounded shadow">
                                    <h3 className="font-bold mb-4 flex items-center gap-2"><Activity size={18}/> Add Routine/Action</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input 
                                            placeholder="Title (e.g., Morning Run)" 
                                            className="p-2 border rounded"
                                            value={newElement.title}
                                            onChange={e => setNewElement({...newElement, title: e.target.value})}
                                        />
                                        <select 
                                            className="p-2 border rounded"
                                            value={newElement.type}
                                            onChange={e => setNewElement({...newElement, type: e.target.value as any})}
                                        >
                                            <option value="check">Check (Done/Not Done)</option>
                                            <option value="number">Number (Count)</option>
                                            <option value="timer">Timer (Duration)</option>
                                            <option value="text">Text (Input)</option>
                                        </select>
                                        <input 
                                            placeholder="Unit (e.g., km, mins)" 
                                            className="p-2 border rounded"
                                            value={newElement.unit || ''}
                                            onChange={e => setNewElement({...newElement, unit: e.target.value})}
                                        />
                                        <input 
                                            type="number"
                                            placeholder="Goal (e.g., 10)" 
                                            className="p-2 border rounded"
                                            value={newElement.goal || ''}
                                            onChange={e => setNewElement({...newElement, goal: Number(e.target.value)})}
                                        />
                                        <select 
                                            className="p-2 border rounded"
                                            value={newElement.frequency}
                                            onChange={e => setNewElement({...newElement, frequency: e.target.value as any})}
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                    <button 
                                        onClick={handleAddElement}
                                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                                    >
                                        <Plus size={16} /> Add Element
                                    </button>
                                </div>

                                {/* List Elements */}
                                <div className="space-y-2">
                                    {selectedProtocol.elements?.map((el, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded shadow border-l-4 border-indigo-500">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold">{el.title}</h4>
                                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">{el.frequency}</span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Type: {el.type} {el.goal ? `| Goal: ${el.goal} ${el.unit}` : ''}
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedProtocol.elements || selectedProtocol.elements.length === 0) && (
                                        <div className="text-gray-500 text-center py-8">No elements added yet.</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Assignments Tab */}
                        {activeTab === 'assignments' && (
                            <div className="bg-white p-6 rounded shadow">
                                <h3 className="font-bold mb-4 flex items-center gap-2"><UserPlus size={18}/> Assign Protocol</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block mb-1">Target Type</label>
                                        <select 
                                            className="w-full p-2 border rounded"
                                            value={assignTarget.type}
                                            onChange={e => setAssignTarget({...assignTarget, type: e.target.value})}
                                        >
                                            <option value="USER">User</option>
                                            <option value="USER_GROUP">User Group</option>
                                            <option value="CLIENT_GROUP">Client Group</option>
                                        </select>
                                    </div>
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
