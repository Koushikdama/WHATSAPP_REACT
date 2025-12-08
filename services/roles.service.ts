/**
 * Custom group roles and permissions system
 */

export interface CustomRole {
    id: string;
    groupId: string;
    name: string;
    color: string;
    permissions: RolePermissions;
    position: number;
    isDefault: boolean;
    memberCount: number;
}

export interface RolePermissions {
    // Message permissions
    canSendMessages: boolean;
    canDeleteOwnMessages: boolean;
    canDeleteAnyMessages: boolean;
    canEditOwnMessages: boolean;
    canPinMessages: boolean;

    // Media permissions
    canSendMedia: boolean;
    canSendDocuments: boolean;
    canSendVoiceMessages: boolean;

    // Group management
    canAddMembers: boolean;
    canRemoveMembers: boolean;
    canEditGroupInfo: boolean;
    canManageRoles: boolean;

    // Channel permissions
    canCreateChannels: boolean;
    canDeleteChannels: boolean;
    canManageChannels: boolean;

    // Thread permissions
    canCreateThreads: boolean;
    canReplyInThreads: boolean;

    // Advanced
    canMentionEveryone: boolean;
    canChangeNicknames: boolean;
}

const DEFAULT_PERMISSIONS: RolePermissions = {
    canSendMessages: true,
    canDeleteOwnMessages: true,
    canDeleteAnyMessages: false,
    canEditOwnMessages: true,
    canPinMessages: false,
    canSendMedia: true,
    canSendDocuments: true,
    canSendVoiceMessages: true,
    canAddMembers: false,
    canRemoveMembers: false,
    canEditGroupInfo: false,
    canManageRoles: false,
    canCreateChannels: false,
    canDeleteChannels: false,
    canManageChannels: false,
    canCreateThreads: true,
    canReplyInThreads: true,
    canMentionEveryone: false,
    canChangeNicknames: false,
};

const ADMIN_PERMISSIONS: RolePermissions = {
    canSendMessages: true,
    canDeleteOwnMessages: true,
    canDeleteAnyMessages: true,
    canEditOwnMessages: true,
    canPinMessages: true,
    canSendMedia: true,
    canSendDocuments: true,
    canSendVoiceMessages: true,
    canAddMembers: true,
    canRemoveMembers: true,
    canEditGroupInfo: true,
    canManageRoles: true,
    canCreateChannels: true,
    canDeleteChannels: true,
    canManageChannels: true,
    canCreateThreads: true,
    canReplyInThreads: true,
    canMentionEveryone: true,
    canChangeNicknames: true,
};

/**
 * Get default roles for a group
 */
export const getDefaultRoles = (groupId: string): CustomRole[] => {
    return [
        {
            id: 'admin',
            groupId,
            name: 'Admin',
            color: '#ef4444',
            permissions: ADMIN_PERMISSIONS,
            position: 0,
            isDefault: true,
            memberCount: 0,
        },
        {
            id: 'moderator',
            groupId,
            name: 'Moderator',
            color: '#3b82f6',
            permissions: {
                ...DEFAULT_PERMISSIONS,
                canDeleteAnyMessages: true,
                canPinMessages: true,
                canRemoveMembers: true,
                canMentionEveryone: true,
            },
            position: 1,
            isDefault: true,
            memberCount: 0,
        },
        {
            id: 'member',
            groupId,
            name: 'Member',
            color: '#10b981',
            permissions: DEFAULT_PERMISSIONS,
            position: 2,
            isDefault: true,
            memberCount: 0,
        },
    ];
};

/**
 * Create custom role
 */
export const createCustomRole = (
    groupId: string,
    name: string,
    color: string,
    permissions: Partial<RolePermissions> = {}
): CustomRole => {
    return {
        id: `role-${Date.now()}`,
        groupId,
        name,
        color,
        permissions: {
            ...DEFAULT_PERMISSIONS,
            ...permissions,
        },
        position: 99,
        isDefault: false,
        memberCount: 0,
    };
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (
    userRole: CustomRole | null,
    permission: keyof RolePermissions
): boolean => {
    if (!userRole) return false;
    return userRole.permissions[permission];
};

/**
 * Get role by user ID (would integrate with Firebase)
 */
export const getUserRole = (
    roles: CustomRole[],
    userId: string,
    groupMembers: Record<string, string>
): CustomRole | null => {
    const roleId = groupMembers[userId];
    if (!roleId) return null;

    return roles.find(r => r.id === roleId) || null;
};

/**
 * Update role permissions
 */
export const updateRolePermissions = (
    role: CustomRole,
    updates: Partial<RolePermissions>
): CustomRole => {
    return {
        ...role,
        permissions: {
            ...role.permissions,
            ...updates,
        },
    };
};

/**
 * Assign role to user
 */
export const assignRole = (
    groupMembers: Record<string, string>,
    userId: string,
    roleId: string
): Record<string, string> => {
    return {
        ...groupMembers,
        [userId]: roleId,
    };
};

/**
 * Get role hierarchy level
 */
export const getRoleLevel = (role: CustomRole): number => {
    if (role.id === 'admin') return 100;
    if (role.id === 'moderator') return 50;
    if (role.id === 'member') return 10;
    return role.position;
};

/**
 * Check if user can manage another user (based on role hierarchy)
 */
export const canManageUser = (
    managerRole: CustomRole,
    targetRole: CustomRole
): boolean => {
    return getRoleLevel(managerRole) > getRoleLevel(targetRole);
};
