// ============================================================================
// TYPES - USERS MODULE
// ============================================================================

export type UserStatus = 'pendiente' | 'activo' | 'inactivo' | 'bloqueado';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  empresa: string;
  phone?: string;
  cargo?: string;
  roleId: string;
  departmentId?: string;
  status: UserStatus;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  lastLogin?: string;
  lastLoginIp?: string;
  totalLogins: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  role: Role;
  department?: Department;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
  _count?: {
    users: number;
  };
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
  module: string;
  resource: string;
  action: string;
  createdAt: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: string;
  role: Role;
  permission: Permission;
}

// ============================================================================
// DTOs - USERS
// ============================================================================

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  empresa: string;
  phone?: string;
  cargo?: string;
  roleId: string;
  departmentId?: string;
  status?: UserStatus;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  empresa?: string;
  phone?: string;
  cargo?: string;
  roleId?: string;
  departmentId?: string;
  status?: UserStatus;
}

export interface UserFilterDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: UserStatus;
  departmentId?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// ============================================================================
// DTOs - ROLES
// ============================================================================

export interface CreateRoleDto {
  name: string;
  description: string;
  level: number;
  isSystem?: boolean;
  permissions?: string[]; // Array de permission IDs
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  level?: number;
  permissions?: string[];
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface RoleWithPermissions extends Role {
  rolePermissions?: RolePermission[];
  userCount?: number;
}

export interface RolesListResponse {
  data: Role[];
  total: number;
}
