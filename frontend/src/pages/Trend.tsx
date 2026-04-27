import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
} from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { api, TrendData } from '../services/api'

export default function Trend() {
  const [data, setData] = useState<TrendData[]>([])
  const [days, setDays] = useState(30)
  const [_loading, setLoading] = useState(false)

  const fetchTrend = async () => {
    setLoading(true)
    try {
      const result = await api.getTrend(days)
      setData(result)
    } catch (err) {
      console.error('获取趋势数据失败', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTrend()
  }, [days])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h5">趋势图表</Typography>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>时间范围</InputLabel>
          <Select
            value={days}
            label="时间范围"
            onChange={(e) => setDays(e.target.value as number)}
          >
            <MenuItem value={7}>近7天</MenuItem>
            <MenuItem value={30}>近30天</MenuItem>
            <MenuItem value={90}>近90天</MenuItem>
            <MenuItem value={365}>近1年</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {data.length === 0 ? (
        <Alert severity="info">暂无数据，请先添加血压记录</Alert>
      ) : (
        <Paper sx={{ p: 3 }}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={[40, 200]} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const units: Record<string, string> = {
                    systolic: 'mmHg',
                    diastolic: 'mmHg',
                    pulse: '次/分钟',
                  }
                  const labels: Record<string, string> = {
                    systolic: '高压(收缩压)',
                    diastolic: '低压(舒张压)',
                    pulse: '脉搏',
                  }
                  return [`${value} ${units[name] || ''}`, labels[name] || name]
                }}
                labelFormatter={(label) => `日期: ${label}`}
              />
              <Legend
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    systolic: '高压(收缩压)',
                    diastolic: '低压(舒张压)',
                    pulse: '脉搏',
                  }
                  return labels[value] || value
                }}
              />
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="#f44336"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="systolic"
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="#2196f3"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="diastolic"
              />
              <Line
                type="monotone"
                dataKey="pulse"
                stroke="#4caf50"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="pulse"
              />
            </LineChart>
          </ResponsiveContainer>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              参考标准：
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: '#4caf50' }}>
                ● 正常: 高压&lt;120(收缩压), 低压&lt;80(舒张压)
              </Typography>
              <Typography variant="body2" sx={{ color: '#ff9800' }}>
                ● 正常高值: 高压120-139, 低压80-89
              </Typography>
              <Typography variant="body2" sx={{ color: '#f44336' }}>
                ● 高血压: 高压≥140 或 低压≥90
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  )
}