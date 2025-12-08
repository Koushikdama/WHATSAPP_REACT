export interface User {
  id: string;
  name: string;
  avatar: string;
  statusText?: string;
  bio?: string;
  about?: string;
  email?: string;
  phone?: string;
  lastSeen: string | null;
  isOnline: boolean;
  online?: boolean;
  followers?: string[];
  following?: string[];
  isPrivate?: boolean;
  followerCount?: number;
  followingCount?: number;
  isFollowedByCurrentUser?: boolean;
  isFollowingCurrentUser?: boolean;
  fcmToken?: string;
  // Privacy settings
  hideFollowers?: boolean;
  hideFollowing?: boolean;
  // User settings object
  settings?: UserSettings;
}

export interface UserSettings {
  // Privacy
  hideFollowers: boolean;
  hideFollowing: boolean;
  readReceipts: boolean;
  lastSeenVisibility: 'everyone' | 'contacts' | 'nobody';
  profilePhotoVisibility: 'everyone' | 'contacts' | 'nobody';

  // Chat
  defaultTheme: string | null;
  enterToSend: boolean;
  mediaAutoDownload: boolean;
  chatLockPin: string | null; // Master PIN for locking chats

  // Notifications
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showPreviews: boolean;

  // Appearance
  fontSize: 'small' | 'medium' | 'large';
  wallpaper: string | null;

  // Theme & UI Settings (stored in Firebase for cross-device sync)
  themeSettings?: ThemeSettings;

  // Security & Passcode Settings (stored in Firebase for cross-device sync)
  passcodeSettings?: PasscodeSettings;
  lockedDates?: Record<string, string[]>; // { [chatId]: [date1, date2, ...] }
}

export interface PollOption {
  text: string;
  voters: string[];
}

export interface PollInfo {
  question: string;
  options: PollOption[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  channelId?: string; // Phase 2: Channel ID for topic channels
  senderName?: string;
  content: string;
  timestamp: string;
  messageType: 'text' | 'image' | 'video' | 'document' | 'voice' | 'call' | 'security' | 'poll';
  status?: 'sent' | 'delivered' | 'read';
  replyMessageId?: string;
  replyMessageContent?: string;
  replyMessageSender?: string;
  fileInfo?: {
    name: string;
    size: string;
    url: string;
  };
  duration?: string;
  deleteForEveryone?: boolean;
  isEdited?: boolean;
  editedAt?: string; // Timestamp when message was last edited
  isSeen?: boolean;
  deleteFor?: string;
  isDeleted?: boolean;
  reactions?: { [emoji: string]: string[] };
  pollInfo?: PollInfo;

  // Phase 1: Message enhancements
  isSilent?: boolean; // Send without notification
  isPinned?: boolean; // Pinned message
  pinnedBy?: string; // User ID who pinned
  pinnedAt?: string; // When it was pinned
  isBookmarked?: boolean; // Saved/bookmarked by current user
  bookmarkedBy?: string[]; // Array of user IDs who bookmarked
  isMarkedUnread?: boolean; // Mark as unread flag per user
  markedUnreadBy?: string[]; // Users who marked as unread

  // Phase 2: Threaded replies & collaboration
  threadId?: string; // Parent thread ID if this is a thread reply
  threadCount?: number; // Number of replies in this thread
  lastThreadReply?: {
    senderId: string;
    senderName: string;
    timestamp: string;
    preview: string;
  };
  isThreadStarter?: boolean; // True if this message has thread replies
  threadParticipants?: string[]; // Users who replied in thread
}

// Phase 2: Thread interface
export interface Thread {
  id: string;
  parentMessageId: string;
  chatId: string;
  channelId?: string;
  participants: string[]; // Users who participated in thread
  replyCount: number;
  lastReplyAt: string;
  lastReplyBy: string;
  isFollowing?: boolean; // User is following this thread
}

// Phase 2: Channel interface (Discord-style topics)
export interface Channel {
  id: string;
  groupId: string;
  name: string;
  description?: string;
  type: 'text' | 'voice' | 'announcement';
  createdBy: string;
  createdAt: string;
  position: number; // Display order
  permissions?: {
    canPost: string[]; // User IDs or role IDs who can post
    canRead: string[]; // User IDs or role IDs who can read
  };
}

export interface Chat {
  id: string;
  type: 'individual' | 'group';
  participants: string[];
  name?: string;
  avatar?: string;
  admins?: string[];
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;

  // Phase 2: Group collaboration features
  channels?: Channel[]; // Topic channels for groups
  activeChannelId?: string; // Currently selected channel
  hasThreads?: boolean; // Group supports threaded replies
  unreadCount?: number;
  isMuted?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
  theme?: string | null;
  receivedTheme?: string | null;
  isVanishMode?: boolean;
  customWallpaper?: string | null;
}

export interface Conversation {
  id: string;
  conversationType: 'INDIVIDUAL' | 'GROUP';
  name: string;
  profileImage: string;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageType: string;
  lastMessageSentById: string;
  lastMessageSentByName: string;
  unreadCount: number;
  userPosition?: string;
  isOnline?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
  isVanishMode?: boolean;
  theme?: string;
  receivedTheme?: string;
  participants?: string[];
  typing?: string[];
}

export interface Call {
  id: string;
  callId: string;
  contactId: string; // The other user
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'VIDEO' | 'AUDIO';
  status: 'INITIATED' | 'RINGING' | 'ACTIVE' | 'ENDED' | 'MISSED' | 'REJECTED';
  startedAt: string;
  endedAt?: string;
  duration?: number;
  durationFormatted?: string;
  initiatorId: string;
  participantIds: string[];
}

export interface StatusUpdate {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  type: 'image' | 'video' | 'audio' | 'text';
  url?: string;
  content?: string;
  timestamp: string;
  caption?: string;
  reactions?: string[];
  viewers?: string[];
  expiresAt?: string;
  createdAt?: string;

  // Phase 4: Enhanced status features
  music?: {
    title: string;
    artist: string;
    albumArt?: string;
    previewUrl?: string;
    spotifyId?: string;
  };
  interactiveStickers?: InteractiveSticker[];
  isHighlight?: boolean;
  highlightCategory?: string;
  closeFriendsOnly?: boolean;
  viewerList?: StatusView[];
  views?: string[];
}

export interface InteractiveSticker {
  id: string;
  type: 'poll' | 'question' | 'countdown' | 'quiz' | 'slider';
  position: { x: number; y: number };
  data: PollStickerData | QuestionStickerData | CountdownStickerData | QuizStickerData | SliderStickerData;
}

export interface PollStickerData {
  question: string;
  options: string[];
  votes: Record<string, number>;
}

export interface QuestionStickerData {
  question: string;
  responses: Array<{ userId: string; userName: string; answer: string }>;
}

export interface CountdownStickerData {
  title: string;
  targetDate: string;
}

export interface QuizStickerData {
  question: string;
  options: string[];
  correctAnswer: number;
  responses: Record<string, number>;
}

export interface SliderStickerData {
  question: string;
  emoji: string;
  responses: Record<string, number>;
}

export interface StatusView {
  userId: string;
  userName: string;
  viewedAt: string;
}

export interface Status {
  id: string;
  userId: string;
  updates: StatusUpdate[];
  expiresAt?: string;
  user?: User; // Expanded user info
}

export enum ChatFilter {
  All = 'All',
  Chat = 'Chat',
  Group = 'Group',
  Notifications = 'Notifications'
}

export interface GroupInfo {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  profileImage: string;
  members: Record<string, 'ADMIN' | 'MEMBER' | 'CO_ADMIN'>;
  memberCount: number;
  isActive: boolean;
}

export interface ThemeSettings {
  themeColor: { name: string; from: string; to: string };
  toggleOnColor: { name: string; from: string; to: string };
  toggleOffColor: { name: string; color: string };
  chatBackground: string;
  uiStyle: 'normal' | 'glossy';
  animationsEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  headerAnimation: 'none' | 'shine' | 'wave';
  swipeSensitivity: number;
  wallpaperQuality?: 'low' | 'medium' | 'high';
  statusDuration?: number;
}

export interface PasscodeSettings {
  lockedChats: { enabled: boolean; passcode: string };
  vanishMode: { enabled: boolean; passcode: string };
  dailyChatLock: { enabled: boolean; passcode: string };
}

export interface InAppNotification {
  id: number;
  type: 'message' | 'call';
  title: string;
  body: string;
}

export interface WebSocketMessage {
  type: 'USER_NOTIFICATION' | 'CALL_NOTIFICATION' | string;
  userId: string;
  payload: {
    type: 'MESSAGE' | 'CALL' | string;
    payload: any;
  };
}

export type NotificationType =
  | 'follow_request'
  | 'follow_accepted'
  | 'new_follower'
  | 'message'
  | 'call_missed'
  | 'status_reaction'
  | 'general'
  | 'call'
  | 'bulk';

export type FollowRequestStatus = 'pending' | 'accepted' | 'rejected';

export type FollowButtonState = 'follow' | 'following' | 'follow_back' | 'requested';

export interface Notification {
  id: string;
  type: NotificationType;
  fromUserId: string;
  toUserId: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    requestId?: string;
    chatId?: string;
    statusId?: string;
    emoji?: string;
    messageContent?: string;
    title?: string;
    body?: string;
    callId?: string;
    [key: string]: any;
  };
}

export interface FollowRequest {
  id: string;
  from: string;
  to: string;
  status: FollowRequestStatus;
  createdAt: any;
  respondedAt?: any;
}
