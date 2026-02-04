import { useState, useEffect } from 'react';
import { 
  Plus, UserPlus, Trophy, List, Activity, Building2, Trash2, Edit, Star, 
  Hash, Timer, Type, CheckSquare, ChevronRight, MoreHorizontal, Users,
  Calendar, Target, Award, Search, Filter
} from 'lucide-react';
import { 
  Card, 
  CardHeader,
  CardBody,
  Button, 
  Badge, 
  Avatar,
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  FormField,
  Input,
  Textarea,
  Select,
  SearchInput,
  Checkbox,
  Tabs,
  Skeleton,
  DropdownMenu,
  EmptyState,
  ProgressBar,
  cn 
} from '../components/ui/index';
import { API_BASE_URL, getAuthHeaders } from '../services/api';

// ============================================
// TYPES
// ============================================
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

// API URL helper
const API_URL = `${API_BASE_URL}/api`;

// ============================================
// HELPER COMPONENTS
// ============================================
const ElementTypeIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    check: <CheckSquare size={16} />,
    number: <Hash size={16} />,
    range: <Activity size={16} />,
    timer: <Timer size={16} />,
    text: <Type size={16} />,
  };
  return <>{icons[type] || <CheckSquare size={16} />}</>;
};

const ElementTypeLabel = ({ type }: { type: string }) => {
  const labels: Record<string, string> = {
    check: 'Checkbox',
    number: 'Number',
    range: 'Range',
    timer: 'Timer',
    text: 'Text',
  };
  return <>{labels[type] || type}</>;
};

// ============================================
// PROTOCOL CARD COMPONENT
// ============================================
interface ProtocolCardProps {
  protocol: Protocol;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const ProtocolCard = ({ protocol, isSelected, onSelect, onDelete }: ProtocolCardProps) => (
  <div
    onClick={onSelect}
    className={cn(
      'p-4 rounded-xl border-2 cursor-pointer transition-all group',
      isSelected 
        ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' 
        : 'border-transparent bg-white hover:border-slate-200 hover:shadow-sm'
    )}
  >
    <div className="flex items-start gap-3">
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
        isSelected ? 'bg-indigo-100' : 'bg-slate-100'
      )}>
        <Target size={20} className={isSelected ? 'text-indigo-600' : 'text-slate-500'} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 truncate">{protocol.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-1">{protocol.description || 'No description'}</p>
        {protocol.organizationName && (
          <div className="flex items-center gap-1 mt-2 text-xs text-indigo-600">
            <Building2 size={12} />
            <span>{protocol.organizationName}</span>
          </div>
        )}
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
      >
        <Trash2 size={16} />
      </button>
    </div>
    <div className="flex items-center gap-2 mt-3">
      <Badge variant="neutral" size="sm">
        {protocol.elements?.length || 0} elements
      </Badge>
      {protocol.status === 'active' && <Badge variant="success" size="sm" dot>Active</Badge>}
    </div>
  </div>
);

// ============================================
// ELEMENT CARD COMPONENT
// ============================================
interface ElementCardProps {
  element: ProtocolElement;
  onDelete: () => void;
}

const ElementCard = ({ element, onDelete }: ElementCardProps) => (
  <Card className="group">
    <CardBody className="p-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
          <ElementTypeIcon type={element.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-900">{element.title}</h4>
            {element.isRequired && (
              <span className="text-red-500 text-sm">*</span>
            )}
          </div>
          {element.description && (
            <p className="text-sm text-slate-500 mt-0.5">{element.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="neutral" size="sm">
              <ElementTypeLabel type={element.type} />
            </Badge>
            <Badge variant="neutral" size="sm">{element.frequency}</Badge>
            {element.goal && (
              <Badge variant="primary" size="sm">
                Goal: {element.goal} {element.unit}
              </Badge>
            )}
            {element.minValue !== undefined && element.maxValue !== undefined && (
              <Badge variant="primary" size="sm">
                Range: {element.minValue}-{element.maxValue}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
            <Star size={14} />
            {element.points || 10}
          </div>
          <button 
            onClick={onDelete}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </CardBody>
  </Card>
);

// ============================================
// LEADERBOARD ROW COMPONENT
// ============================================
const LeaderboardRow = ({ entry }: { entry: LeaderboardEntry }) => {
  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-amber-100 text-amber-700 border-amber-300';
    if (rank === 2) return 'bg-slate-100 text-slate-600 border-slate-300';
    if (rank === 3) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-slate-50 text-slate-500 border-slate-200';
  };

  return (
    <div className={cn(
      'flex items-center gap-4 p-4 border-b border-slate-100 last:border-0',
      entry.isCurrentUser && 'bg-indigo-50/50'
    )}>
      <div className={cn(
        'w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm',
        getRankStyle(entry.rank)
      )}>
        {entry.rank <= 3 ? <Trophy size={16} /> : entry.rank}
      </div>
      <Avatar name={entry.name} src={entry.avatarUrl} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{entry.name}</span>
          {entry.isCurrentUser && <Badge variant="primary" size="sm">You</Badge>}
        </div>
        <p className="text-xs text-slate-500">{entry.activeDays} active days</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-slate-900">{entry.totalPoints.toLocaleString()}</p>
        <p className="text-xs text-slate-500">points</p>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const ProtocolManagementView = () => {
  // State
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState('elements');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'all' | 'monthly' | 'weekly' | 'daily'>('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddElementModal, setShowAddElementModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Forms
  const [newProtocol, setNewProtocol] = useState({ name: '', description: '', organization_id: '', icon: 'checklist' });
  const [newElement, setNewElement] = useState<Partial<ProtocolElement>>({ 
    title: '', description: '', type: 'check', frequency: 'daily', points: 10, isRequired: true
  });
  const [assignForm, setAssignForm] = useState({ type: 'organization', targetId: '', assignToMembers: true });

  const filteredProtocols = protocols.filter(p => {
    if (!searchQuery.trim()) return true;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Data fetching
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
    setLoading(true);
    fetch(`${API_URL}/protocols?status=all`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        setProtocols(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchProtocolDetails = (id: number) => {
    fetch(`${API_URL}/protocols/${id}`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => setSelectedProtocol(data))
      .catch(console.error);
  };

  const fetchUsers = () => {
    fetch(`${API_URL}/users`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);
  };

  const fetchOrganizations = () => {
    fetch(`${API_URL}/organizations`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(setOrganizations)
      .catch(console.error);
  };

  const fetchLeaderboard = (id: number) => {
    fetch(`${API_URL}/protocols/${id}/leaderboard?period=${leaderboardPeriod}&limit=50`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => setLeaderboard(data.leaderboard || []))
      .catch(console.error);
  };

  // Handlers
  const handleCreateProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/protocols`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...newProtocol,
          organization_id: newProtocol.organization_id ? parseInt(newProtocol.organization_id) : null
        })
      });
      const data = await res.json();
      setProtocols([data, ...protocols]);
      setNewProtocol({ name: '', description: '', organization_id: '', icon: 'checklist' });
      setSelectedProtocol(data);
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddElement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProtocol) return;

    try {
      await fetch(`${API_URL}/protocols/${selectedProtocol.id}/elements`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...newElement,
          min_value: newElement.minValue,
          max_value: newElement.maxValue,
          display_order: selectedProtocol.elements?.length || 0,
          is_required: newElement.isRequired
        })
      });
      fetchProtocolDetails(selectedProtocol.id);
      setNewElement({ title: '', description: '', type: 'check', frequency: 'daily', points: 10, isRequired: true });
      setShowAddElementModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteElement = async (elementId: number) => {
    if (!selectedProtocol || !confirm('Delete this element?')) return;

    try {
      await fetch(`${API_URL}/protocols/${selectedProtocol.id}/elements/${elementId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      fetchProtocolDetails(selectedProtocol.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProtocol = async (id: number) => {
    if (!confirm('Delete this protocol? This action cannot be undone.')) return;

    try {
      await fetch(`${API_URL}/protocols/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      setProtocols(protocols.filter(p => p.id !== id));
      if (selectedProtocol?.id === id) {
        setSelectedProtocol(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProtocol || !assignForm.targetId) return;

    const endpoint = assignForm.type === 'organization' 
      ? `${API_URL}/protocols/${selectedProtocol.id}/assign-organization`
      : `${API_URL}/protocols/${selectedProtocol.id}/assign`;

    const body = assignForm.type === 'organization'
      ? { organization_id: parseInt(assignForm.targetId), assign_to_all_members: assignForm.assignToMembers }
      : { targetType: 'USER', targetId: assignForm.targetId };

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });
      fetchProtocolDetails(selectedProtocol.id);
      setAssignForm({ type: 'organization', targetId: '', assignToMembers: true });
      setShowAssignModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'elements', label: 'Elements', icon: <Activity size={16} />, count: selectedProtocol?.elements?.length },
    { id: 'assignments', label: 'Assignments', icon: <UserPlus size={16} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar - Protocol List */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Protocols</h2>
            <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowCreateModal(true)}>
              New
            </Button>
          </div>
          <SearchInput
            placeholder="Search protocols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Skeleton width={40} height={40} className="rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton width="80%" height={16} />
                    <Skeleton width="60%" height={14} />
                  </div>
                </div>
              </div>
            ))
          ) : filteredProtocols.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <List size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No protocols found</p>
            </div>
          ) : (
            filteredProtocols.map(protocol => (
              <ProtocolCard
                key={protocol.id}
                protocol={protocol}
                isSelected={selectedProtocol?.id === protocol.id}
                onSelect={() => setSelectedProtocol(protocol)}
                onDelete={() => handleDeleteProtocol(protocol.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedProtocol ? (
          <>
            {/* Protocol Header */}
            <Card className="flex-shrink-0 mb-6">
              <CardBody className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Target size={28} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-semibold text-slate-900">{selectedProtocol.name}</h1>
                    <p className="text-slate-500 mt-0.5">{selectedProtocol.description}</p>
                    <div className="flex items-center flex-wrap gap-2 mt-3">
                      {selectedProtocol.organizationName && (
                        <Badge variant="primary" leftIcon={<Building2 size={12} />}>
                          {selectedProtocol.organizationName}
                        </Badge>
                      )}
                      {selectedProtocol.assignedOrganizations?.map(org => (
                        <Badge key={org.id} variant="success" size="sm" leftIcon={<Building2 size={12} />}>
                          {org.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <DropdownMenu
                    trigger={
                      <button className="icon-btn icon-btn-sm">
                        <MoreHorizontal size={18} />
                      </button>
                    }
                    items={[
                      { label: 'Edit protocol', icon: <Edit size={14} />, onClick: () => {} },
                      { label: 'Duplicate', icon: <Plus size={14} />, onClick: () => {} },
                      { divider: true, label: '' },
                      { label: 'Delete', icon: <Trash2 size={14} />, danger: true, onClick: () => handleDeleteProtocol(selectedProtocol.id) },
                    ]}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Tabs */}
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              className="mb-6"
            />

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'elements' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      {selectedProtocol.elements?.length || 0} elements in this protocol
                    </p>
                    <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowAddElementModal(true)}>
                      Add Element
                    </Button>
                  </div>

                  {selectedProtocol.elements?.length ? (
                    <div className="space-y-3">
                      {selectedProtocol.elements.map((element, idx) => (
                        <ElementCard
                          key={element.id || idx}
                          element={element}
                          onDelete={() => element.id && handleDeleteElement(element.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="p-12">
                      <EmptyState
                        icon={<Activity size={48} />}
                        title="No elements yet"
                        description="Add your first element to define actions users need to complete"
                        action={
                          <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setShowAddElementModal(true)}>
                            Add Element
                          </Button>
                        }
                      />
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'assignments' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Assign this protocol to users or organizations</p>
                    <Button variant="primary" size="sm" leftIcon={<UserPlus size={14} />} onClick={() => setShowAssignModal(true)}>
                      Assign Protocol
                    </Button>
                  </div>

                  {selectedProtocol.assignedOrganizations?.length ? (
                    <Card>
                      <CardHeader>
                        <h3 className="font-semibold text-slate-900">Assigned Organizations</h3>
                      </CardHeader>
                      <CardBody className="divide-y divide-slate-100">
                        {selectedProtocol.assignedOrganizations.map(org => (
                          <div key={org.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                <Building2 size={18} className="text-slate-500" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{org.name}</p>
                                <p className="text-xs text-slate-500">
                                  Assigned {new Date(org.assigned_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant="success" size="sm">Active</Badge>
                          </div>
                        ))}
                      </CardBody>
                    </Card>
                  ) : (
                    <Card className="p-12">
                      <EmptyState
                        icon={<Users size={48} />}
                        title="No assignments yet"
                        description="Assign this protocol to organizations or individual users"
                        action={
                          <Button variant="primary" leftIcon={<UserPlus size={16} />} onClick={() => setShowAssignModal(true)}>
                            Assign Protocol
                          </Button>
                        }
                      />
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'leaderboard' && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="text-amber-500" size={20} />
                      <h3 className="font-semibold text-slate-900">Leaderboard</h3>
                    </div>
                    <div className="flex gap-1">
                      {(['all', 'monthly', 'weekly', 'daily'] as const).map(period => (
                        <button
                          key={period}
                          onClick={() => setLeaderboardPeriod(period)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                            leaderboardPeriod === period
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          )}
                        >
                          {period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                      ))}
                    </div>
                  </CardHeader>
                  <CardBody className="p-0">
                    {leaderboard.length > 0 ? (
                      leaderboard.map(entry => (
                        <LeaderboardRow key={entry.userId} entry={entry} />
                      ))
                    ) : (
                      <div className="p-12 text-center text-slate-400">
                        <Award size={48} className="mx-auto mb-3 opacity-50" />
                        <p>No ranking data yet</p>
                        <p className="text-sm">Users will appear here once they start logging</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}
            </div>
          </>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={<List size={64} />}
              title="Select a protocol"
              description="Choose a protocol from the sidebar to view details, or create a new one"
              action={
                <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
                  Create Protocol
                </Button>
              }
            />
          </Card>
        )}
      </div>

      {/* Create Protocol Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} size="md">
        <ModalHeader>Create Protocol</ModalHeader>
        <form onSubmit={handleCreateProtocol}>
          <ModalBody className="space-y-5">
            <FormField label="Protocol Name" required>
              <Input
                required
                value={newProtocol.name}
                onChange={e => setNewProtocol({...newProtocol, name: e.target.value})}
                placeholder="Morning Routine"
              />
            </FormField>
            <FormField label="Description">
              <Textarea
                value={newProtocol.description}
                onChange={e => setNewProtocol({...newProtocol, description: e.target.value})}
                placeholder="A healthy morning routine to start your day"
                rows={3}
              />
            </FormField>
            <FormField label="Organization" hint="Leave empty for a global protocol">
              <Select
                value={newProtocol.organization_id}
                onChange={e => setNewProtocol({...newProtocol, organization_id: e.target.value})}
              >
                <option value="">No Organization (Global)</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </Select>
            </FormField>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Protocol
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Add Element Modal */}
      <Modal isOpen={showAddElementModal} onClose={() => setShowAddElementModal(false)} size="lg">
        <ModalHeader>Add Element</ModalHeader>
        <form onSubmit={handleAddElement}>
          <ModalBody className="space-y-5">
            <FormField label="Title" required>
              <Input
                required
                value={newElement.title}
                onChange={e => setNewElement({...newElement, title: e.target.value})}
                placeholder="e.g., Drink 8 glasses of water"
              />
            </FormField>
            <FormField label="Description">
              <Input
                value={newElement.description || ''}
                onChange={e => setNewElement({...newElement, description: e.target.value})}
                placeholder="Optional description"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Type">
                <Select
                  value={newElement.type}
                  onChange={e => setNewElement({...newElement, type: e.target.value as any})}
                >
                  <option value="check">Checkbox (Done/Not Done)</option>
                  <option value="number">Number (Enter a value)</option>
                  <option value="range">Range (Min-Max)</option>
                  <option value="timer">Timer (Duration)</option>
                  <option value="text">Text (Free input)</option>
                </Select>
              </FormField>
              <FormField label="Frequency">
                <Select
                  value={newElement.frequency}
                  onChange={e => setNewElement({...newElement, frequency: e.target.value as any})}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Points">
                <Input
                  type="number"
                  value={newElement.points || 10}
                  onChange={e => setNewElement({...newElement, points: Number(e.target.value)})}
                  leftIcon={<Star size={16} />}
                />
              </FormField>
              <FormField label="Required">
                <div className="h-10 flex items-center">
                  <Checkbox
                    label="This element is required"
                    checked={newElement.isRequired}
                    onChange={(e) => setNewElement({...newElement, isRequired: e.target.checked})}
                  />
                </div>
              </FormField>
            </div>

            {(newElement.type === 'number' || newElement.type === 'timer') && (
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Goal">
                  <Input
                    type="number"
                    value={newElement.goal || ''}
                    onChange={e => setNewElement({...newElement, goal: Number(e.target.value)})}
                    placeholder="e.g., 8"
                  />
                </FormField>
                <FormField label="Unit">
                  <Input
                    value={newElement.unit || ''}
                    onChange={e => setNewElement({...newElement, unit: e.target.value})}
                    placeholder="e.g., glasses, minutes"
                  />
                </FormField>
              </div>
            )}

            {newElement.type === 'range' && (
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Min Value">
                  <Input
                    type="number"
                    value={newElement.minValue || ''}
                    onChange={e => setNewElement({...newElement, minValue: Number(e.target.value)})}
                  />
                </FormField>
                <FormField label="Max Value">
                  <Input
                    type="number"
                    value={newElement.maxValue || ''}
                    onChange={e => setNewElement({...newElement, maxValue: Number(e.target.value)})}
                  />
                </FormField>
                <FormField label="Unit">
                  <Input
                    value={newElement.unit || ''}
                    onChange={e => setNewElement({...newElement, unit: e.target.value})}
                    placeholder="e.g., level"
                  />
                </FormField>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" type="button" onClick={() => setShowAddElementModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!newElement.title}>
              Add Element
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Assign Protocol Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} size="md">
        <ModalHeader>Assign Protocol</ModalHeader>
        <form onSubmit={handleAssign}>
          <ModalBody className="space-y-5">
            <FormField label="Assign To">
              <Select
                value={assignForm.type}
                onChange={e => setAssignForm({...assignForm, type: e.target.value, targetId: ''})}
              >
                <option value="organization">Organization</option>
                <option value="user">Individual User</option>
              </Select>
            </FormField>

            {assignForm.type === 'organization' ? (
              <>
                <FormField label="Select Organization">
                  <Select
                    value={assignForm.targetId}
                    onChange={e => setAssignForm({...assignForm, targetId: e.target.value})}
                  >
                    <option value="">Select organization...</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </Select>
                </FormField>
                <Checkbox
                  label="Also assign to all current members"
                  checked={assignForm.assignToMembers}
                  onChange={(e) => setAssignForm({...assignForm, assignToMembers: e.target.checked})}
                />
              </>
            ) : (
              <FormField label="Select User">
                <Select
                  value={assignForm.targetId}
                  onChange={e => setAssignForm({...assignForm, targetId: e.target.value})}
                >
                  <option value="">Select user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name || user.email}</option>
                  ))}
                </Select>
              </FormField>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" type="button" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!assignForm.targetId}>
              Assign
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};
