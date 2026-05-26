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
import { api, SugarTrendData } from '../services/api'

export default function SugarTrend() {
  const [data, setData] = useState<SugarTrendData[]>([])
  const [days, setDays] = useState(30)
  const [_loading, setLoading] = useState(false)

  const fetchTrend = async () => {
    setLoading(true)
    try {
      const result = await api.getSugarTrend(days)
      setData(result)
    } catch {
      console.error('获取趋势数据失败')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTrend()
  }, [days])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h5">血糖趋势</Typography>
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
        <Alert severity="info">暂无数据，请先添加血糖记录</Alert>
      ) : (
        <Paper sx={{ p: 3 }}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={[0, 20]} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'sugar_value') {
                    return [`${value} mmol/L`, '血糖值']
                  }
                  return [value, name]
                }}
                labelFormatter={(label) => `日期: ${label}`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Legend
                formatter={(value) => {
                  if (value === 'sugar_value') return '血糖值'
                  return value
                }}
              />
              <Line
                type="monotone"
                dataKey="sugar_value"
                stroke="#ff9800"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="sugar_value"
              />
            </LineChart>
          </ResponsiveContainer>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              参考标准（中国标准）：
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: '#4caf50' }}>
                ● 空腹正常: 3.9-6.1 mmol/L
              </Typography>
              <Typography variant="body2" sx={{ color: '#ff9800' }}>
                ● 餐后2小时正常: &lt;7.8 mmol/L
              </Typography>
              <Typography variant="body2" sx={{ color: '#f44336' }}>
                ● 糖尿病诊断: 空腹≥7.0 或 餐后≥11.1
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  )
}