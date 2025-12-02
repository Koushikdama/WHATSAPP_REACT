export const requestNotificationPermission = async (): Promise<boolean> => {
    console.log('Mock requestNotificationPermission');
    return true;
};

export const getFCMToken = async (): Promise<string | null> => {
    console.log('Mock getFCMToken');
    return 'mock-fcm-token';
};

export const saveFCMTokenToFirestore = async (
    userId: string,
    token: string
): Promise<void> => {
    console.log('Mock saveFCMTokenToFirestore', { userId, token });
};

export const setupMessageListener = (
    callback: (payload: any) => void
): (() => void) => {
    console.log('Mock setupMessageListener');
    return () => { };
};

export const initializeNotifications = async (
    userId: string,
    onForegroundMessage: (payload: any) => void
): Promise<void> => {
    console.log('Mock initializeNotifications', { userId });
};

export const showBrowserNotification = (
    title: string,
    options?: NotificationOptions
): void => {
    console.log('Mock showBrowserNotification', { title, options });
};

export const areNotificationsSupported = (): boolean => {
    return true;
};

export const getNotificationPermission = (): NotificationPermission => {
    return 'granted';
};