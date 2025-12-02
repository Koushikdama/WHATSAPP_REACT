/**
 * Notification Testing Utilities
 * Helper functions to test and verify notification functionality
 */

/**
 * Check if notifications are supported
 */
export const checkNotificationSupport = (): {
    supported: boolean;
    details: {
        notificationAPI: boolean;
        serviceWorker: boolean;
    };
} => {
    const hasNotificationAPI = 'Notification' in window;
    const hasServiceWorker = 'serviceWorker' in navigator;

    return {
        supported: hasNotificationAPI && hasServiceWorker,
        details: {
            notificationAPI: hasNotificationAPI,
            serviceWorker: hasServiceWorker,
        },
    };
};

/**
 * Get current notification permission
 */
export const getPermissionStatus = (): NotificationPermission => {
    if ('Notification' in window) {
        return Notification.permission;
    }
    return 'default';
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<{
    granted: boolean;
    permission: NotificationPermission;
}> => {
    if (!('Notification' in window)) {
        return {
            granted: false,
            permission: 'denied',
        };
    }

    try {
        const permission = await Notification.requestPermission();
        return {
            granted: permission === 'granted',
            permission,
        };
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return {
            granted: false,
            permission: Notification.permission,
        };
    }
};

/**
 * Show a test notification
 */
export const showTestNotification = (title: string = 'Test Notification', body: string = 'This is a test notification from WhatsApp Clone'): void => {
    if (!('Notification' in window)) {
        console.error('Notifications not supported');
        return;
    }

    if (Notification.permission !== 'granted') {
        console.error('Notification permission not granted');
        return;
    }

    const notification = new Notification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'test-notification',
    });

    notification.onclick = () => {
        console.log('Test notification clicked');
        notification.close();
    };

    setTimeout(() => {
        notification.close();
    }, 5000);
};

/**
 * Check if service worker is registered
 */
export const checkServiceWorkerRegistration = async (): Promise<{
    registered: boolean;
    registration?: ServiceWorkerRegistration;
    error?: string;
}> => {
    if (!('serviceWorker' in navigator)) {
        return {
            registered: false,
            error: 'Service Workers not supported',
        };
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        return {
            registered: !!registration,
            registration,
        };
    } catch (error: any) {
        return {
            registered: false,
            error: error.message,
        };
    }
};

/**
 * Run comprehensive notification diagnostics
 */
export const runNotificationDiagnostics = async (): Promise<{
    browserSupport: ReturnType<typeof checkNotificationSupport>;
    permission: NotificationPermission;
    serviceWorker: Awaited<ReturnType<typeof checkServiceWorkerRegistration>>;
}> => {
    console.log('🔔 Running Notification Diagnostics...');

    const browserSupport = checkNotificationSupport();
    console.log('✓ Browser Support:', browserSupport);

    const permission = getPermissionStatus();
    console.log('✓ Permission:', permission);

    const serviceWorker = await checkServiceWorkerRegistration();
    console.log('✓ Service Worker:', serviceWorker);

    const results = {
        browserSupport,
        permission,
        serviceWorker,
    };

    console.log('✅ Notification Diagnostics Complete:', results);
    return results;
};

/**
 * Print diagnostic summary to console
 */
export const printNotificationDiagnosticSummary = (
    diagnostics: Awaited<ReturnType<typeof runNotificationDiagnostics>>
): void => {
    console.group('📊 Notification Diagnostic Summary');

    console.log('Browser Support:', diagnostics.browserSupport.supported ? '✅' : '❌');
    console.log('  - Notification API:', diagnostics.browserSupport.details.notificationAPI ? '✅' : '❌');
    console.log('  - Service Worker:', diagnostics.browserSupport.details.serviceWorker ? '✅' : '❌');

    console.log('\nPermission:', diagnostics.permission);
    switch (diagnostics.permission) {
        case 'granted':
            console.log('  ✅ Notifications enabled');
            break;
        case 'denied':
            console.log('  ❌ Notifications blocked');
            break;
        case 'default':
            console.log('  ⚠️ Permission not requested yet');
            break;
    }

    console.log('\nService Worker:', diagnostics.serviceWorker.registered ? '✅ Registered' : '❌ Not registered');
    if (diagnostics.serviceWorker.error) {
        console.log('  - Error:', diagnostics.serviceWorker.error);
    }

    console.groupEnd();
};

/**
 * Test complete notification flow
 */
export const testNotificationFlow = async (): Promise<void> => {
    console.group('🧪 Testing Notification Flow');

    // 1. Check support
    const support = checkNotificationSupport();
    console.log('1. Support check:', support.supported ? '✅' : '❌');

    if (!support.supported) {
        console.error('❌ Notifications not supported');
        console.groupEnd();
        return;
    }

    // 2. Check current permission
    const currentPermission = getPermissionStatus();
    console.log('2. Current permission:', currentPermission);

    // 3. Request permission if needed
    if (currentPermission !== 'granted') {
        console.log('3. Requesting permission...');
        const result = await requestNotificationPermission();
        console.log('   Permission result:', result);

        if (!result.granted) {
            console.error('❌ Permission not granted');
            console.groupEnd();
            return;
        }
    } else {
        console.log('3. Permission already granted ✅');
    }

    // 4. Show test notification
    console.log('4. Showing test notification...');
    showTestNotification();

    console.log('✅ Notification flow test complete');
    console.groupEnd();
};

// Export for use in browser console
if (typeof window !== 'undefined') {
    (window as any).notificationTest = {
        checkSupport: checkNotificationSupport,
        getPermission: getPermissionStatus,
        requestPermission: requestNotificationPermission,
        showTest: showTestNotification,
        checkServiceWorker: checkServiceWorkerRegistration,
        runDiagnostics: runNotificationDiagnostics,
        printSummary: printNotificationDiagnosticSummary,
        testFlow: testNotificationFlow,
    };
    console.log('💡 Notification test utilities available at window.notificationTest');
}