export function formatDuration(ms) {
  if (!ms || isNaN(ms)) return '00:00';
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  const pad = (num) => String(num).padStart(2, '0');
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function createProgressBar(current, total, size = 15) {
  if (!total || total <= 0) return '🔘' + '▬'.repeat(size - 1);
  const progress = Math.min(Math.max(current / total, 0), 1);
  const progressIndex = Math.round(size * progress);
  const emptyProgress = size - progressIndex;

  const line = '▬'.repeat(Math.max(0, progressIndex - 1));
  const emptyLine = '▬'.repeat(Math.max(0, emptyProgress));
  return `${line}🔘${emptyLine}`;
}

export default { formatDuration, createProgressBar };
