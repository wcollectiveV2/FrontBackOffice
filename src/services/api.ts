/**
 * ChrisLO Admin - API Service
 * Centralized API communication layer for the admin dashboard
 */

// ============================================
// CONFIGURATION
// ============================================
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  // Ensure no trailing /api so we can control endpoints
  return envUrl.replace(/\/api\/?$/, '');
};

export const API_BASE_URL = getBaseUrl();

// ============================================
// AUTH HELPERS
// ============================================
export const getAuthToken = (): string | null => {
  return localStorage.getItem('adminToken');
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const logout = (): void => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/login';
};

// ============================================
// API ERROR HANDLING
// ============================================
export class ApiError extends Error {
  status: number;
  data: any;
  
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const handleResponse = async <T>(response: Response, autoLogoutOn401 = false): Promise<T> => {
  // Only auto-logout if explicitly requested (e.g., for critical auth-required endpoints)
  // This prevents logout loops when API calls fail during page load
  if (response.status === 401 && autoLogoutOn401) {
    logout();
    throw new ApiError('Session expired. Please login again.', 401);
  }
  
  const data = await response.json().catch(() => null);
  
  if (!response.ok) {
    throw new ApiError(
      data?.message || data?.error || `Request failed with status ${response.status}`,
      response.status,
      data
    );
  }
  
  return data;
};

// ============================================
// BASE REQUEST FUNCTION
// ============================================
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: HeadersInit;
  requireAuth?: boolean;
}

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = 'GET', body, headers = {}, requireAuth = true } = options;
  
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const requestHeaders: HeadersInit = {
    ...(requireAuth ? getAuthHeaders() : { 'Content-Type': 'application/json' }),
    ...headers,
  };
  
  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  return handleResponse<T>(response);
};

// ============================================
// AUTH API
// ============================================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: credentials,
      requireAuth: false,
    });
  },
  
  logout: async (): Promise<void> => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      logout();
    }
  },
  
  refreshToken: async (): Promise<{ accessToken: string }> => {
    return apiRequest('/api/auth/refresh', { method: 'POST' });
  },
};

// ============================================
// USERS API
// ============================================
export interface User {
  id: string;
  email: string;
  name?: string;
  roles: string[];
  groups: Group[];
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  type: string;
}

export interface CreateUserPayload {
  email: string;
  name?: string;
  roles?: string[];
  groupIds?: string[];
}

export const usersApi = {
  list: async (): Promise<User[]> => {
    const data = await apiRequest<User[] | { users: User[] }>('/api/users');
    return Array.isArray(data) ? data : data.users || [];
  },
  
  getById: async (id: string): Promise<User> => {
    return apiRequest<User>(`/api/users/${id}`);
  },
  
  create: async (payload: CreateUserPayload): Promise<User> => {
    return apiRequest<User>('/api/users', {
      method: 'POST',
      body: payload,
    });
  },
  
  updateRoles: async (userId: string, roles: string[]): Promise<User> => {
    return apiRequest<User>(`/api/users/${userId}/roles`, {
      method: 'PUT',
      body: { roles },
    });
  },
  
  updateGroups: async (userId: string, groupIds: string[]): Promise<User> => {
    return apiRequest<User>(`/api/users/${userId}/groups`, {
      method: 'PUT',
      body: { groupIds },
    });
  },
  
  delete: async (userId: string): Promise<void> => {
    return apiRequest(`/api/users/${userId}`, { method: 'DELETE' });
  },
  
  getGroups: async (userId: string): Promise<Group[]> => {
    return apiRequest<Group[]>(`/api/users/${userId}/groups`);
  },
};

// ============================================
// GROUPS API
// ============================================
export const groupsApi = {
  list: async (): Promise<Group[]> => {
    const data = await apiRequest<Group[] | { groups: Group[] }>('/api/groups');
    return Array.isArray(data) ? data : data.groups || [];
  },
  
  getById: async (id: string): Promise<Group> => {
    return apiRequest<Group>(`/api/groups/${id}`);
  },
};

// ============================================
// ORGANIZATIONS API
// ============================================
export interface Organization {
  id: string;
  name: string;
  type?: 'product' | 'company' | string;
  logo_url?: string;
  created_at: string;
  member_count?: number;
  parent_id?: string;
  description?: string;
}

export interface CreateOrganizationPayload {
  name: string;
  type?: 'product' | 'company' | string;
  logo_url?: string;
  parent_id?: string;
  description?: string;
}

export const organizationsApi = {
  list: async (): Promise<Organization[]> => {
    const data = await apiRequest<Organization[] | { organizations: Organization[] }>('/api/organizations');
    return Array.isArray(data) ? data : data.organizations || [];
  },
  
  getById: async (id: string): Promise<Organization> => {
    return apiRequest<Organization>(`/api/organizations/${id}`);
  },
  
  create: async (payload: CreateOrganizationPayload): Promise<Organization> => {
    return apiRequest<Organization>('/api/organizations', {
      method: 'POST',
      body: payload,
    });
  },
  
  update: async (id: string, payload: Partial<CreateOrganizationPayload>): Promise<Organization> => {
    return apiRequest<Organization>(`/api/organizations/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },
  
  delete: async (id: string): Promise<void> => {
    return apiRequest(`/api/organizations/${id}`, { method: 'DELETE' });
  },
  
  getMembers: async (id: string): Promise<User[]> => {
    return apiRequest<User[]>(`/api/organizations/${id}/members`);
  },
};

// ============================================
// ADMIN API
// ============================================
export interface AdminStats {
  totalUsers: number;
  totalOrganizations: number;
  activeChallenges: number;
  activeUsersLast7Days: number;
  organizationsByType?: Record<string, number>;
  usersByRole?: Record<string, number>;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  previous_state: any;
  new_state: any;
  created_at: string;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    return apiRequest<AdminStats>('/api/admin/stats');
  },
  
  listUsers: async (): Promise<User[]> => {
    const data = await apiRequest<{ users: User[] }>('/api/admin/users');
    return data.users || [];
  },
  
  promoteUser: async (userId: string): Promise<User> => {
    return apiRequest<User>(`/api/admin/users/${userId}/promote`, {
      method: 'POST',
    });
  },
  
  demoteUser: async (userId: string): Promise<User> => {
    return apiRequest<User>(`/api/admin/users/${userId}/demote`, {
      method: 'POST',
    });
  },
  
  resetPassword: async (userId: string): Promise<{ tempPassword: string }> => {
    return apiRequest(`/api/admin/users/${userId}/reset-password`, {
      method: 'POST',
    });
  },
  
  setUserRoles: async (userId: string, roles: string[]): Promise<User> => {
    return apiRequest<User>(`/api/admin/users/${userId}/set-roles`, {
      method: 'POST',
      body: { roles },
    });
  },
  
  getAuditLogs: async (page = 1, limit = 50): Promise<{ logs: AuditLog[]; total: number }> => {
    return apiRequest(`/api/admin/audit?page=${page}&limit=${limit}`);
  },
  
  getOrganizationsWithHierarchy: async (): Promise<Organization[]> => {
    return apiRequest<Organization[]>('/api/admin/organizations');
  },
};

// ============================================
// PROTOCOLS API
// ============================================
export interface Protocol {
  id: string;
  name: string;
  description?: string;
  frequency?: string;
  category?: string;
  status: 'active' | 'draft' | 'archived';
  created_at: string;
  user_count?: number;
}

export interface CreateProtocolPayload {
  name: string;
  description?: string;
  frequency?: string;
  category?: string;
  status?: string;
}

export const protocolsApi = {
  list: async (): Promise<Protocol[]> => {
    const data = await apiRequest<Protocol[] | { protocols: Protocol[] }>('/api/protocols');
    return Array.isArray(data) ? data : data.protocols || [];
  },
  
  getById: async (id: string): Promise<Protocol> => {
    return apiRequest<Protocol>(`/api/protocols/${id}`);
  },
  
  create: async (payload: CreateProtocolPayload): Promise<Protocol> => {
    return apiRequest<Protocol>('/api/protocols', {
      method: 'POST',
      body: payload,
    });
  },
  
  update: async (id: string, payload: Partial<CreateProtocolPayload>): Promise<Protocol> => {
    return apiRequest<Protocol>(`/api/protocols/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },
  
  delete: async (id: string): Promise<void> => {
    return apiRequest(`/api/protocols/${id}`, { method: 'DELETE' });
  },
};

// ============================================
// CHALLENGES API
// ============================================
export interface Challenge {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'upcoming' | 'completed' | 'cancelled';
  participant_count?: number;
  created_at: string;
}

export const challengesApi = {
  list: async (): Promise<Challenge[]> => {
    const data = await apiRequest<Challenge[] | { challenges: Challenge[] }>('/api/challenges');
    return Array.isArray(data) ? data : data.challenges || [];
  },
  
  getById: async (id: string): Promise<Challenge> => {
    return apiRequest<Challenge>(`/api/challenges/${id}`);
  },
};

// ============================================
// HEALTH CHECK API
// ============================================
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services?: Record<string, { status: string; latency?: number }>;
}

export const healthApi = {
  check: async (): Promise<HealthStatus> => {
    return apiRequest<HealthStatus>('/health', { requireAuth: false });
  },
};

// ============================================
// EXPORT ALL
// ============================================
export default {
  auth: authApi,
  users: usersApi,
  groups: groupsApi,
  organizations: organizationsApi,
  admin: adminApi,
  protocols: protocolsApi,
  challenges: challengesApi,
  health: healthApi,
};
