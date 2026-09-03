export default {
  // Abbreviate a time relative to now for example: now, 30s 1h, 1d, 1w, 1mo, 1y
  abbreviateTime: (dateTime: Date): string => {
    const now = new Date();
    const seconds = Math.round((now.getTime() - dateTime.getTime()) / 1000);

    const intervals = [
      { label: 'y', seconds: 31536000 },
      { label: 'mo', seconds: 2592000 },
      { label: 'w', seconds: 604800 },
      { label: 'd', seconds: 86400 },
      { label: 'h', seconds: 3600 },
      { label: 'm', seconds: 60 },
      { label: 's', seconds: 1 }
    ];

    const interval = intervals.find(i => Math.floor(seconds / i.seconds) >= 1);

    if (interval) {
      const count = Math.floor(seconds / interval.seconds);
      return `${count}${interval.label}`;
    }

    return 'now';
  }
};
