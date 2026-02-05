import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Pencil, Trash2, Plus, Globe, Calendar, Users, MoreHorizontal, Search, ExternalLink } from 'lucide-react';
import { 
  Card, 
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
  Select,
  SearchInput,
  PageHeader,
  Skeleton,
  DropdownMenu,
  EmptyState,
  cn 
} from '../components/ui/index';
import { organizationsApi, Organization, ApiError } from '../services/api';

// ============================================
// TYPES
// ============================================
// Organization type imported from api service

// ============================================
// ORGANIZATION CARD COMPONENT
// ============================================
interface OrgCardProps {
  org: Organization;
  onEdit: () => void;
  onDelete: () => void;
  onViewMembers: () => void;
}

const OrgCard = ({ org, onEdit, onDelete, onViewMembers }: OrgCardProps) => (
  <Card hoverable className="group relative overflow-hidden">
    <CardBody className="p-5">
      {/* Actions dropdown */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu
          trigger={
            <button className="icon-btn icon-btn-sm bg-white shadow-sm">
              <MoreHorizontal size={16} />
            </button>
          }
          items={[
            { label: 'Edit organization', icon: <Pencil size={14} />, onClick: onEdit },
            { label: 'View members', icon: <Users size={14} />, onClick: onViewMembers },
            { divider: true, label: '' },
            { label: 'Delete organization', icon: <Trash2 size={14} />, danger: true, onClick: onDelete },
          ]}
        />
      </div>
      
      {/* Logo & Info */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {org.logo_url ? (
            <img src={org.logo_url} className="w-full h-full object-cover" alt={org.name}/>
          ) : (
            <Building2 size={24} className="text-slate-400" />
          )}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-base font-semibold text-slate-900 truncate pr-8" title={org.name}>
            {org.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <Calendar size={12} />
            <span>Created {new Date(org.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-slate-400" />
          <span className="text-sm text-slate-600">
            {org.member_count || 0} members
          </span>
        </div>
        <Badge variant="success" size="sm" dot>Active</Badge>
      </div>
    </CardBody>
  </Card>
);

// ============================================
// SKELETON CARD
// ============================================
const OrgCardSkeleton = () => (
  <Card className="p-5">
    <div className="flex items-start gap-4">
      <Skeleton width={56} height={56} className="rounded-xl" />
      <div className="space-y-2 flex-1">
        <Skeleton width="70%" height={20} />
        <Skeleton width="50%" height={14} />
      </div>
    </div>
    <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100">
      <Skeleton width={80} height={16} />
      <Skeleton width={60} height={20} className="rounded-full" />
    </div>
  </Card>
);

// ============================================
// ORGANIZATION MANAGEMENT VIEW
// ============================================
export const OrganizationManagementView = () => {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', logo_url: '', type: 'company', parent_id: '' });

  const filteredOrgs = orgs.filter(org => {
    if (!searchQuery.trim()) return true;
    return org.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const data = await organizationsApi.list();
      setOrgs(data);
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const openCreateModal = () => {
    setEditingOrg(null);
    setFormData({ name: '', logo_url: '', type: 'company', parent_id: '' });
    setShowModal(true);
  };

  const openEditModal = (org: Organization) => {
    setEditingOrg(org);
    setFormData({ 
      name: org.name, 
      logo_url: org.logo_url || '',
      type: org.type || 'company',
      parent_id: org.parent_id || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOrg(null);
    setFormData({ name: '', logo_url: '', type: 'company', parent_id: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingOrg) {
        await organizationsApi.update(editingOrg.id, formData);
      } else {
        await organizationsApi.create(formData);
      }
      closeModal();
      fetchOrgs();
    } catch (err) {
      console.error('Save organization error:', err);
      alert(`Failed to ${editingOrg ? 'update' : 'create'} organization`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) return;
    
    try {
      await organizationsApi.delete(id);
      fetchOrgs();
    } catch (err) {
      console.error('Delete organization error:', err);
      alert('Failed to delete organization');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Organizations"
        description="Manage partner organizations and their settings"
        actions={
          <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreateModal}>
            New Organization
          </Button>
        }
      />

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Building2 size={16} />
            <span>{orgs.length} organizations</span>
          </div>
        </div>
      </Card>

      {/* Organizations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <OrgCardSkeleton />
          <OrgCardSkeleton />
          <OrgCardSkeleton />
        </div>
      ) : filteredOrgs.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={<Building2 size={48} />}
            title={searchQuery ? 'No organizations found' : 'No organizations yet'}
            description={searchQuery 
              ? `No organizations matching "${searchQuery}"` 
              : 'Create your first organization to get started'
            }
            action={!searchQuery && (
              <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreateModal}>
                Create Organization
              </Button>
            )}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrgs.map(org => (
            <OrgCard 
              key={org.id} 
              org={org} 
              onEdit={() => openEditModal(org)}
              onDelete={() => handleDelete(org.id)}
              onViewMembers={() => navigate(`/users?organizationId=${org.id}`)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} size="md">
        <ModalHeader>
          {editingOrg ? 'Edit Organization' : 'Create Organization'}
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody className="space-y-5">
            <FormField label="Organization Name" required>
              <Input
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Acme Corporation"
                leftIcon={<Building2 size={16} />}
              />
            </FormField>
            
            <FormField label="Type" required>
              <Select
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="company">Company (Parent)</option>
                <option value="product">Product (Child)</option>
              </Select>
            </FormField>

            {formData.type === 'product' && (
              <FormField label="Parent Company" required>
                <Select
                  value={formData.parent_id}
                  onChange={e => setFormData({...formData, parent_id: e.target.value})}
                  required
                >
                  <option value="">Select a company...</option>
                  {orgs
                    .filter(o => (o.type === 'company' || !o.type) && o.id !== editingOrg?.id)
                    .map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))
                  }
                </Select>
              </FormField>
            )}
            
            <FormField 
              label="Logo URL" 
              hint="Enter the URL of the organization's logo image"
            >
              <Input
                type="url"
                value={formData.logo_url}
                onChange={e => setFormData({...formData, logo_url: e.target.value})}
                placeholder="https://example.com/logo.png"
                leftIcon={<Globe size={16} />}
              />
            </FormField>

            {/* Logo Preview */}
            {formData.logo_url && (
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-white">
                  <img 
                    src={formData.logo_url} 
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="text-sm text-slate-600">Logo Preview</div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingOrg ? 'Save Changes' : 'Create Organization'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};
