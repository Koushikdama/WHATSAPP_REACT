/**
 * Group items by time periods (Today, This Week, Earlier)
 * Useful for notifications, messages, activity feeds, etc.
 */
export interface TimeGroupedItems<T> {
    today: T[];
    thisWeek: T[];
    earlier: T[];
}

export function groupByTime<T>(
    items: T[],
    getTimestamp: (item: T) => any
): TimeGroupedItems<T> {
    const today: T[] = [];
    const thisWeek: T[] = [];
    const earlier: T[] = [];

    const now = new Date();

    items.forEach((item) => {
        const timestamp = getTimestamp(item);
        const date = timestamp?.toDate?.() || new Date(timestamp);
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            today.push(item);
        } else if (diffInDays < 7) {
            thisWeek.push(item);
        } else {
            earlier.push(item);
        }
    });

    return { today, thisWeek, earlier };
}
