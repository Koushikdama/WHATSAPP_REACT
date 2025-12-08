import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/schema';

export interface AnalyticsData {
    totalMessages: number;
    totalMediaFiles: number;
    storageUsed: number; // in MB
    activeChats: number;
    mostActiveChat: { name: string; count: number } | null;
    messagesPerDay: { label: string; value: number }[];
    messagesByType: { individual: number; group: number };
    topChats: { label: string; value: number; color?: string }[];
    mediaDistribution: {
        label: string;
        value: number;
        color: string;
    }[];
}

export const useAnalytics = (timeRange: number = 30, chatType: 'all' | 'individual' | 'group' = 'all') => {
    const { currentUser } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                // Fetch user's chats
                const chatsRef = collection(db, COLLECTIONS.CHATS);
                const chatsQuery = query(
                    chatsRef,
                    where('participants', 'array-contains', currentUser.uid)
                );
                const chatsSnapshot = await getDocs(chatsQuery);

                let totalMessages = 0;
                let totalMediaFiles = 0;
                let storageUsed = 0;
                const chatCounts: Record<string, { name: string; count: number }> = {};
                const messagesByDay: Record<string, number> = {};
                let individualChats = 0;
                let groupChats = 0;
                let imageCount = 0;
                let videoCount = 0;
                let documentCount = 0;
                let audioCount = 0;

                // Calculate date range
                const now = new Date();
                const startDate = new Date(now.getTime() - timeRange * 24 * 60 * 60 * 1000);

                for (const chatDoc of chatsSnapshot.docs) {
                    const chatData = chatDoc.data();
                    const chatId = chatDoc.id;
                    const isGroup = chatData.type === 'group';

                    // Filter by chat type
                    if (chatType === 'individual' && isGroup) continue;
                    if (chatType === 'group' && !isGroup) continue;

                    // Count chat types
                    if (isGroup) groupChats++;
                    else individualChats++;

                    // Fetch messages for this chat
                    const messagesRef = collection(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES);
                    const messagesSnapshot = await getDocs(messagesRef);

                    let chatMessageCount = 0;
                    messagesSnapshot.forEach((msgDoc) => {
                        const msgData = msgDoc.data();
                        const msgDate = new Date(msgData.timestamp);

                        // Only count messages within time range
                        if (msgDate >= startDate) {
                            totalMessages++;
                            chatMessageCount++;

                            // Group by day
                            const dayKey = msgDate.toISOString().split('T')[0];
                            messagesByDay[dayKey] = (messagesByDay[dayKey] || 0) + 1;

                            // Count media
                            if (msgData.messageType && msgData.messageType !== 'text') {
                                totalMediaFiles++;

                                switch (msgData.messageType) {
                                    case 'image':
                                        imageCount++;
                                        storageUsed += msgData.fileInfo?.size || 0.5; // Estimate 0.5MB
                                        break;
                                    case 'video':
                                        videoCount++;
                                        storageUsed += msgData.fileInfo?.size || 5; // Estimate 5MB
                                        break;
                                    case 'document':
                                        documentCount++;
                                        storageUsed += msgData.fileInfo?.size || 1; // Estimate 1MB
                                        break;
                                    case 'audio':
                                        audioCount++;
                                        storageUsed += msgData.fileInfo?.size || 0.3; // Estimate 0.3MB
                                        break;
                                }
                            }
                        }
                    });

                    if (chatMessageCount > 0) {
                        chatCounts[chatId] = {
                            name: chatData.name || 'Unknown',
                            count: chatMessageCount
                        };
                    }
                }

                // Find most active chat
                const mostActiveChat = Object.values(chatCounts).sort((a, b) => b.count - a.count)[0] || null;

                // Format messages per day for line chart (last 7/30 days)
                const daysToShow = Math.min(timeRange, 30);
                const messagesPerDay = [];
                for (let i = daysToShow - 1; i >= 0; i--) {
                    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                    const dayKey = date.toISOString().split('T')[0];
                    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    messagesPerDay.push({
                        label,
                        value: messagesByDay[dayKey] || 0
                    });
                }

                // Top 10 chats
                const topChats = Object.values(chatCounts)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map(chat => ({
                        label: chat.name.length > 15 ? chat.name.substring(0, 15) + '...' : chat.name,
                        value: chat.count,
                        color: '#10b981'
                    }));

                // Media distribution
                const mediaDistribution = [
                    { label: 'Images', value: imageCount, color: '#3b82f6' },
                    { label: 'Videos', value: videoCount, color: '#8b5cf6' },
                    { label: 'Documents', value: documentCount, color: '#f59e0b' },
                    { label: 'Audio', value: audioCount, color: '#10b981' }
                ].filter(item => item.value > 0);

                setData({
                    totalMessages,
                    totalMediaFiles,
                    storageUsed: storageUsed / 1024, // Convert to GB
                    activeChats: chatsSnapshot.docs.length,
                    mostActiveChat,
                    messagesPerDay,
                    messagesByType: { individual: individualChats, group: groupChats },
                    topChats,
                    mediaDistribution
                });
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [currentUser, timeRange, chatType]);

    return { data, loading };
};
