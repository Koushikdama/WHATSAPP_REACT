import { GroupInfo } from '../types';

export interface GroupPermissions {
    // Capabilities
    canAddMembers: boolean;
    canRemoveMember: (targetUserId: string) => boolean;
    canPromoteToCoAdmin: boolean;
    canDemoteFromCoAdmin: boolean;
    canChangeGroupInfo: boolean;
    canChangeGroupSettings: boolean;
    canDeleteGroup: boolean;
    canPin: boolean; // Can pin messages
    canManageMessages: boolean; // Can manage all messages
    canDeleteMessage: (messageAuthorId: string) => boolean;

    // Role checks
    isAdmin: boolean;
    isCoAdmin: boolean;
    isMember: boolean;
    isAdminOrCoAdmin: boolean;
    currentUserRole: 'ADMIN' | 'CO_ADMIN' | 'MEMBER' | undefined;
}

export const useGroupPermissions = (
    groupInfo: GroupInfo | null,
    currentUserId: string
): GroupPermissions => {
    const currentUserRole = groupInfo?.members[currentUserId];

    const isAdmin = currentUserRole === 'ADMIN';
    const isCoAdmin = currentUserRole === 'CO_ADMIN';
    const isMember = currentUserRole === 'MEMBER';
    const isAdminOrCoAdmin = isAdmin || isCoAdmin;

    return {
        // Capabilities
        canAddMembers: isAdminOrCoAdmin,

        canRemoveMember: (targetUserId: string) => {
            if (!groupInfo) return false;
            if (isAdmin) return true;
            if (isCoAdmin) {
                const targetRole = groupInfo.members[targetUserId];
                // Co-admins can only remove regular members
                return targetRole === 'MEMBER';
            }
            return false;
        },

        canPromoteToCoAdmin: isAdmin,
        canDemoteFromCoAdmin: isAdmin,
        canChangeGroupInfo: isAdminOrCoAdmin,
        canChangeGroupSettings: isAdmin,
        canDeleteGroup: isAdmin,

        canDeleteMessage: (messageAuthorId: string) => {
            if (!groupInfo) return messageAuthorId === currentUserId;
            if (isAdmin) return true;
            if (isCoAdmin) {
                const authorRole = groupInfo.members[messageAuthorId];
                // Co-admins can delete messages from members or their own
                return authorRole === 'MEMBER' || messageAuthorId === currentUserId;
            }
            // Members can only delete their own messages
            return messageAuthorId === currentUserId;
        },

        canPin: isAdminOrCoAdmin, // Admins and co-admins can pin
        canManageMessages: isAdminOrCoAdmin,

        // Role checks
        isAdmin,
        isCoAdmin,
        isMember,
        isAdminOrCoAdmin,
        currentUserRole,
    };
};