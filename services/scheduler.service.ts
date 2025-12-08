import { getDueScheduledMessages, markScheduledMessageAsSent, markScheduledMessageAsFailed } from './firebase/scheduledMessage.service';
import { sendMessage } from './firebase/chat.service';
import { ScheduledMessage } from '../types/workflow.types';

/**
 * Scheduler Service
 * Polls for and executes scheduled messages
 */
class SchedulerService {
    private intervalId: NodeJS.Timeout | null = null;
    private isRunning: boolean = false;
    private checkInterval: number = 60 * 1000; // Check every minute

    /**
     * Start the scheduler
     */
    start(): void {
        if (this.isRunning) {
            console.log('Scheduler already running');
            return;
        }

        this.isRunning = true;
        console.log('📅 Scheduler started');

        // Run immediately
        this.checkAndExecuteScheduledMessages();

        // Then run periodically
        this.intervalId = setInterval(() => {
            this.checkAndExecuteScheduledMessages();
        }, this.checkInterval);
    }

    /**
     * Stop the scheduler
     */
    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('📅 Scheduler stopped');
    }

    /**
     * Check for and execute due scheduled messages
     */
    private async checkAndExecuteScheduledMessages(): Promise<void> {
        try {
            const dueMessages = await getDueScheduledMessages();

            if (dueMessages.length > 0) {
                console.log(`📅 Found ${dueMessages.length} scheduled messages to send`);
            }

            for (const message of dueMessages) {
                await this.executeScheduledMessage(message);
            }
        } catch (error) {
            console.error('Error checking scheduled messages:', error);
        }
    }

    /**
     * Execute a single scheduled message
     */
    private async executeScheduledMessage(message: ScheduledMessage): Promise<void> {
        try {
            console.log(`📤 Sending scheduled message ${message.id}`);

            // Send the message
            await sendMessage(
                message.chatId,
                message.userId,
                message.content,
                message.messageType,
                message.fileInfo
            );

            // Mark as sent
            await markScheduledMessageAsSent(message.id);

            console.log(`✅ Scheduled message ${message.id} sent successfully`);

            // Handle recurring messages
            if (message.recurring) {
                await this.handleRecurringMessage(message);
            }
        } catch (error) {
            console.error(`❌ Failed to send scheduled message ${message.id}:`, error);
            await markScheduledMessageAsFailed(message.id, (error as Error).message);
        }
    }

    /**
     * Handle recurring message scheduling
     */
    private async handleRecurringMessage(message: ScheduledMessage): Promise<void> {
        if (!message.recurring) return;

        const { frequency, endDate } = message.recurring;
        const currentScheduledTime = new Date(message.scheduledFor);

        // Calculate next scheduled time
        let nextScheduledTime: Date;
        switch (frequency) {
            case 'daily':
                nextScheduledTime = new Date(currentScheduledTime.getTime() + 24 * 60 * 60 * 1000);
                break;
            case 'weekly':
                nextScheduledTime = new Date(currentScheduledTime.getTime() + 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                nextScheduledTime = new Date(currentScheduledTime);
                nextScheduledTime.setMonth(nextScheduledTime.getMonth() + 1);
                break;
            default:
                return;
        }

        // Check if we should schedule again
        if (endDate && nextScheduledTime > new Date(endDate)) {
            console.log(`Recurring message ${message.id} has reached end date`);
            return;
        }

        // Create new scheduled message for next occurrence
        const { scheduleMessage } = await import('./firebase/scheduledMessage.service');
        await scheduleMessage({
            userId: message.userId,
            chatId: message.chatId,
            content: message.content,
            messageType: message.messageType,
            fileInfo: message.fileInfo,
            scheduledFor: nextScheduledTime.toISOString(),
            recurring: message.recurring,
        });

        console.log(`📅 Scheduled recurring message for ${nextScheduledTime.toISOString()}`);
    }

    /**
     * Check if scheduler is running
     */
    isSchedulerRunning(): boolean {
        return this.isRunning;
    }

    /**
     * Set check interval (in milliseconds)
     */
    setCheckInterval(intervalMs: number): void {
        this.checkInterval = intervalMs;

        // Restart if currently running
        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }
}

// Export singleton instance
export const scheduler = new SchedulerService();
