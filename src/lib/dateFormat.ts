export default function formatDate(dateStr: string, offsetDays = 0): string {
    if (!dateStr) return ''; // handle null gracefully

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

    return `${day}${ordinal} ${month} ${year}`;
}
