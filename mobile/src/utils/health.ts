export function getHealthLevel(systolic: number, diastolic: number): string {
  if (systolic < 120 && diastolic < 80) {
    return '正常';
  } else if (systolic < 140 && diastolic < 90) {
    return '偏高';
  } else if (systolic < 160 && diastolic < 100) {
    return '高血压1级';
  } else if (systolic < 180 && diastolic < 110) {
    return '高血压2级';
  } else {
    return '高血压3级';
  }
}

export function getHealthColor(level: string): string {
  switch (level) {
    case '正常':
      return '#4caf50';
    case '偏高':
    case '正常高值':
      return '#ff9800';
    case '高血压1级':
      return '#f44336';
    case '高血压2级':
      return '#d32f2f';
    case '高血压3级':
      return '#b71c1c';
    default:
      return '#757575';
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatForInput(date: Date): string {
  return date.toISOString().slice(0, 16);
}