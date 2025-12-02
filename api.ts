import { Message, Conversation, GroupInfo, User, Chat, Call, Status, PollInfo, Notification } from './types';
import {
  getAllUsers,
  getUserProfile,
  searchUsersByName,
  updateUserProfile
} from './services/firebase/user.service';
import {
  createChat,
  sendMessage as sendFirebaseMessage,
  subscribeToUserChats,
  subscribeToChatMessages
} from './services/firebase/chat.service';
import { subscribeToNotifications } from './services/firebase/notification.service';
import { getStatuses as getFirebaseStatuses } from './services/status.service';
import {
  followUser as firebaseFollowUser,
  unfollowUser as firebaseUnfollowUser,
  getFollowers as firebaseGetFollowers,
  getFollowing as firebaseGetFollowing,
  isFollowing as firebaseIsFollowing
} from './services/firebase/user.follow.service';
import { editMessage as editFirebaseMessageService } from './services/firebase/message.service';

// --- API implementation using Firebase Services ---

export const getCurrentUser = async (): Promise<User> => {
  // This is tricky because getCurrentUser implies getting the *currently logged in* user.
  // In Firebase, we usually get this from auth state.
  // For this adapter, we might need to rely on the caller having the ID or AuthContext.
  // However, `api.ts` is stateless.
  // We will throw an error or return a mock if not handled by AuthContext.
  // Ideally, components should use useAuth().
  throw new Error('Use useAuth() hook to get current user');
};

export const getUsers = async (): Promise<User[]> => {
  return await getAllUsers();
};

export const searchUsers = async (query: string): Promise<User[]> => {
  return await searchUsersByName(query);
};

export const followUser = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    await firebaseFollowUser(currentUserId, targetUserId);
    return true;
  } catch (error) {
    console.error('Follow user error:', error);
    return false;
  }
};

export const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    await firebaseUnfollowUser(currentUserId, targetUserId);
    return true;
  } catch (error) {
    console.error('Unfollow user error:', error);
    return false;
  }
};

export const getFollowers = async (userId: string): Promise<User[]> => {
  try {
    return await firebaseGetFollowers(userId);
  } catch (error) {
    console.error('Get followers error:', error);
    return [];
  }
};

export const getFollowing = async (userId: string): Promise<User[]> => {
  try {
    return await firebaseGetFollowing(userId);
  } catch (error) {
    console.error('Get following error:', error);
    return [];
  }
};

export const isFollowing = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    return await firebaseIsFollowing(currentUserId, targetUserId);
  } catch (error) {
    console.error('Check following error:', error);
    return false;
  }
};

export const getCalls = async (userId: string): Promise<Call[]> => {
  return [];
};

export const getStatuses = async (userId: string): Promise<Status[]> => {
  return [];
};

export const getConversations = async (userId: string): Promise<Conversation[]> => {
  // This was a promise, but now we have a listener.
  // We can wrap the listener in a promise that resolves once?
  // Or better, return an empty array and let the component use the hook.
  // For now, returning empty to force usage of useChat/subscribeToUserChats
  console.warn('getConversations is deprecated. Use useChat hook or subscribeToUserChats.');
  return [];
};

export const getIndividualMessages = async (currentUserId: string, otherUserId: string): Promise<Message[]> => {
  // We need to find the chat ID first.
  // This is complex without a direct mapping.
  // Returning empty.
  return [];
};

export const getGroupMessages = async (groupId: string, userId: string): Promise<Message[]> => {
  return [];
};

export const getGroupInfo = async (groupId: string, userId: string): Promise<GroupInfo> => {
  return {
    id: groupId,
    name: 'Group',
    description: 'Group Description',
    createdBy: '',
    createdAt: new Date().toISOString(),
    profileImage: '',
    members: {},
    memberCount: 0,
    isActive: true
  };
};

export const getUserInfo = async (userId: string): Promise<User | null> => {
  return await getUserProfile(userId);
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  content: string,
  type: 'individual' | 'group',
  extraData: Partial<Message> = {}
): Promise<Message> => {
  await sendFirebaseMessage(chatId, senderId, content, extraData.messageType || 'text');
  // Return a mock message as the real one comes via listener
  return {
    id: 'temp',
    senderId,
    content,
    timestamp: new Date().toISOString(),
    messageType: extraData.messageType || 'text'
  } as Message;
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  return [];
};

// Mock implementations for other actions
export const deleteMessageForMe = async (messageId: string, userId: string) => {
};

export const deleteMessageForEveryone = async (messageId: string, userId: string) => {
};

export const editMessage = async (chatId: string, messageId: string, newText: string) => {
  try {
    await editFirebaseMessageService(chatId, messageId, newText);
    return true;
  } catch (error) {
    console.error('Edit message error:', error);
    return false;
  }
};

export const toggleChatLock = async (chatId: string) => {
  return true;
};

export const toggleVanishMode = async (chatId: string) => {
  return true;
};

export const clearChatMessages = async (chatId: string) => {
  return true;
};

export const reactToMessage = async (chatId: string, messageId: string, userId: string, emoji: string) => {
  try {
    const { reactToMessage: reactToFirebaseMessage } = await import('./services/firebase/chat.service');
    await reactToFirebaseMessage(chatId, messageId, userId, emoji);
    return true;
  } catch (error) {
    console.error('React to message error:', error);
    return false;
  }
};

export const voteOnPoll = async (messageId: string, userId: string, optionIndex: number) => {
  return true;
};

export const updateChatTheme = async (chatId: string, themeName: string | null) => {
  return true;
};

export const updateChatReceivedTheme = async (chatId: string, themeName: string | null) => {
  return true;
};

export const initializeDataCache = async () => { };