export default function formatDateTime(dateStr: string, offsetDays = 0): string {
    if (!dateStr) return ''; // handle null gracefully

    // Handle time-only input (e.g., "09:00")
    const timeOnlyRegex = /^(?:[01]?\d|2[0-3]):[0-5]\d$/;
    if (timeOnlyRegex.test(dateStr)) {
        const [hours, minutes] = dateStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        return date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }

    // Remove the bracketed timezone part if present (e.g., [Asia/Calcutta])
    const cleanStr = dateStr.replace(/\[.*\]$/, '');
    const date = new Date(cleanStr);

    if (isNaN(date.getTime())) return ''; // handle invalid date safely

    // subtract or add days
    date.setDate(date.getDate() + offsetDays);

    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    const ordinal =
        day % 10 === 1 && day !== 11 ? 'st'
            : day % 10 === 2 && day !== 12 ? 'nd'
                : day % 10 === 3 && day !== 13 ? 'rd'
                    : 'th';

    // format time in hh:mm AM/PM
    const time = date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    return `${day}${ordinal} ${month} ${year}, ${time}`;
}
