import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Paper,
  Alert,
} from '@mui/material'
import {
  Favorite,
  TrendingUp,
  TrendingDown,
  ShowChart,
} from '@mui/icons-material'
import { api, Summary } from '../services/api'
import { getHealthColor } from '../utils/health'

export default function Stats() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [days, setDays] = useState(30)

  const fetchSummary = async () => {
    try {
      const result = await api.getSummary(days)
      setSummary(result)
    } catch (err) {
      console.error('获取统计数据失败', err)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [days])

  if (!summary) return null

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h5">统计汇总</Typography>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>统计周期</InputLabel>
          <Select
            value={days}
            label="统计周期"
            onChange={(e) => setDays(e.target.value as number)}
          >
            <MenuItem value={7}>近7天</MenuItem>
            <MenuItem value={30}>近30天</MenuItem>
            <MenuItem value={90}>近90天</MenuItem>
            <MenuItem value={365}>近1年</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {summary.count === 0 ? (
        <Alert severity="info">暂无数据，请先添加血压记录</Alert>
      ) : (
        <>
          <Card sx={{ mb: 3, bgcolor: getHealthColor(summary.healthLevel), color: 'white' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Favorite sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{summary.healthLevel}</Typography>
                      <Typography variant="body2">健康状态</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="body1">{summary.healthAdvice}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <ShowChart sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h5" color="primary">
                  {summary.avgSystolic}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  平均高压(收缩压) mmHg
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <ShowChart sx={{ fontSize: 32, color: 'secondary.main' }} />
                <Typography variant="h5" color="secondary">
                  {summary.avgDiastolic}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  平均低压(舒张压) mmHg
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Favorite sx={{ fontSize: 32, color: 'success.main' }} />
                <Typography variant="h5" color="success.main">
                  {summary.avgPulse}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  平均脉搏 (次/分钟)
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>高压(收缩压)</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp color="error" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">最高值</Typography>
                        <Typography variant="h6">{summary.maxSystolic}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingDown color="success" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">最低值</Typography>
                        <Typography variant="h6">{summary.minSystolic}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>低压(舒张压)</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp color="error" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">最高值</Typography>
                        <Typography variant="h6">{summary.maxDiastolic}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingDown color="success" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">最低值</Typography>
                        <Typography variant="h6">{summary.minDiastolic}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>脉搏</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp color="error" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">最高值</Typography>
                        <Typography variant="h6">{summary.maxPulse}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingDown color="success" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">最低值</Typography>
                        <Typography variant="h6">{summary.minPulse}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">
                  近 {days} 天共记录 {summary.count} 次
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}