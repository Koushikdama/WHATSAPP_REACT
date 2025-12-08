import { useEffect } from 'react';
import { scheduler } from '../services/scheduler.service';

/**
 * Hook to initialize and manage the scheduler service
 */
export const useScheduler = () => {
    useEffect(() => {
        // Start scheduler when app loads
        scheduler.start();

        // Cleanup on unmount
        return () => {
            scheduler.stop();
        };
    }, []);

    return {
        isRunning: scheduler.isSchedulerRunning(),
    };
};
