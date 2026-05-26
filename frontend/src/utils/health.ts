export function getHealthLevel(systolic: number, diastolic: number): string {
  if (systolic < 120 && diastolic < 80) {
    return '正常'
  } else if (systolic < 140 && diastolic < 90) {
    return '正常高值'
  } else if (systolic < 160 && diastolic < 100) {
    return '高血压1级'
  } else if (systolic < 180 && diastolic < 110) {
    return '高血压2级'
  } else {
    return '高血压3级'
  }
}

export function getHealthColor(level: string): string {
  switch (level) {
    case '正常':
      return '#4caf50'
    case '正常高值':
      return '#ff9800'
    case '高血压1级':
      return '#f44336'
    case '高血压2级':
      return '#d32f2f'
    case '高血压3级':
      return '#b71c1c'
    default:
      return '#757575'
  }
}

// 血糖健康等级判断（中国标准）
export function getSugarHealthLevel(sugarValue: number, measureType: string): string {
  switch (measureType) {
    case 'fasting':
      // 空腹血糖标准: 正常 3.9-6.1
      if (sugarValue < 3.9) return '偏低'
      if (sugarValue <= 6.1) return '正常'
      if (sugarValue < 7.0) return '偏高'
      if (sugarValue < 10.0) return '较高'
      return '严重偏高'
    case 'postmeal_2h':
      // 餐后2小时标准: 正常 <7.8
      if (sugarValue < 7.8) return '正常'
      if (sugarValue < 11.1) return '偏高'
      if (sugarValue < 16.0) return '较高'
      return '严重偏高'
    default:
      if (sugarValue < 7.8) return '正常'
      if (sugarValue < 11.1) return '偏高'
      return '较高'
  }
}

export function getSugarHealthColor(level: string): string {
  switch (level) {
    case '正常':
      return '#4caf50'
    case '偏低':
      return '#2196f3'
    case '偏高':
      return '#ff9800'
    case '较高':
      return '#f44336'
    case '严重偏高':
      return '#b71c1c'
    default:
      return '#757575'
  }
}

export function getMeasureTypeLabel(type: string): string {
  switch (type) {
    case 'fasting':
      return '空腹'
    case 'postmeal_2h':
      return '餐后2小时'
    case 'random':
      return '随机'
    case 'before_sleep':
      return '睡前'
    default:
      return type
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatForInput(date: Date): string {
  // 使用本地时间格式（北京时间）
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hour}:${minute}`
}

export function formatLocalDateTime(date: Date): string {
  // 格式化为本地时间ISO格式（用于发送到后端）
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  // 返回带有时区偏移的ISO格式
  const offset = -date.getTimezoneOffset()
  const offsetHours = Math.floor(Math.abs(offset) / 60)
  const offsetMinutes = Math.abs(offset) % 60
  const offsetSign = offset >= 0 ? '+' : '-'
  return `${year}-${month}-${day}T${hour}:${minute}:${second}${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`
}

export function formatLocalDate(date: Date): string {
  // 格式化为本地日期（YYYY-MM-DD）
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseInputDateTime(dateTimeStr: string): Date {
  // 解析datetime-local输入值（本地时间）
  return new Date(dateTimeStr)
}