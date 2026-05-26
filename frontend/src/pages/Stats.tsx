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
  Opacity,
} from '@mui/icons-material'
import { api, Summary, SugarSummary } from '../services/api'
import { getHealthColor, getSugarHealthColor } from '../utils/health'

export default function Stats() {
  const [bpSummary, setBpSummary] = useState<Summary | null>(null)
  const [sugarSummary, setSugarSummary] = useState<SugarSummary | null>(null)
  const [days, setDays] = useState(30)

  const fetchSummary = async () => {
    try {
      const bpResult = await api.getSummary(days)
      setBpSummary(bpResult)
    } catch {
      console.error('获取血压统计数据失败')
    }

    try {
      const sugarResult = await api.getSugarSummary(days)
      setSugarSummary(sugarResult)
    } catch {
      console.error('获取血糖统计数据失败')
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [days])

  const hasData = (bpSummary?.count ?? 0) > 0 || (sugarSummary?.count ?? 0) > 0

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

      {!hasData ? (
        <Alert severity="info">暂无数据，请先添加血压或血糖记录</Alert>
      ) : (
        <Grid container spacing={3}>
          {/* 血压统计 */}
          {bpSummary && bpSummary.count > 0 && (
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>血压统计</Typography>

              <Card sx={{ mb: 2, bgcolor: getHealthColor(bpSummary.healthLevel), color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Favorite sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h5">{bpSummary.healthLevel}</Typography>
                      <Typography variant="body2">{bpSummary.healthAdvice}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <ShowChart sx={{ fontSize: 24, color: 'primary.main' }} />
                    <Typography variant="h6" color="primary">
                      {bpSummary.avgSystolic}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      平均高压
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <ShowChart sx={{ fontSize: 24, color: 'secondary.main' }} />
                    <Typography variant="h6" color="secondary">
                      {bpSummary.avgDiastolic}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      平均低压
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <Favorite sx={{ fontSize: 24, color: 'success.main' }} />
                    <Typography variant="h6" color="success.main">
                      {bpSummary.avgPulse}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      平均脉搏
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp color="error" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">高压最高</Typography>
                        <Typography variant="body1">{bpSummary.maxSystolic}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingDown color="success" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">高压最低</Typography>
                        <Typography variant="body1">{bpSummary.minSystolic}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp color="error" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">低压最高</Typography>
                        <Typography variant="body1">{bpSummary.maxDiastolic}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingDown color="success" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">低压最低</Typography>
                        <Typography variant="body1">{bpSummary.minDiastolic}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  近 {days} 天记录 {bpSummary.count} 次
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* 血糖统计 */}
          {sugarSummary && sugarSummary.count > 0 && (
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>血糖统计</Typography>

              <Card sx={{ mb: 2, bgcolor: getSugarHealthColor(sugarSummary.healthLevel), color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Opacity sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h5">{sugarSummary.healthLevel}</Typography>
                      <Typography variant="body2">{sugarSummary.healthAdvice}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <Opacity sx={{ fontSize: 24, color: 'warning.main' }} />
                    <Typography variant="h6" color="warning.main">
                      {sugarSummary.avgSugar?.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      平均血糖
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <TrendingUp sx={{ fontSize: 24, color: 'error.main' }} />
                    <Typography variant="h6" color="error.main">
                      {sugarSummary.maxSugar?.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      最高血糖
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <TrendingDown sx={{ fontSize: 24, color: 'success.main' }} />
                    <Typography variant="h6" color="success.main">
                      {sugarSummary.minSugar?.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      最低血糖
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  血糖标准参考
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption">空腹正常: 3.9-6.1</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption">餐后2h正常: &lt;7.8</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  近 {days} 天记录 {sugarSummary.count} 次
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  )
}