import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Check, Close } from '@mui/icons-material'
import { api, Medication, MedicationLog } from '../services/api'

export default function MedicationLogs() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [activeMeds, setActiveMeds] = useState<Medication[]>([])
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([])
  const [takenCount, setTakenCount] = useState(0)
  const [expectedCount, setExpectedCount] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })

  const defaultForm = {
    status: 'taken' as 'taken' | 'skipped' | 'missed',
    scheduled_time: '',
    notes: '',
  }
  const [form, setForm] = useState(defaultForm)

  const fetchTodayData = async () => {
    try {
      const data = await api.getTodayMedicationLogs()
      setActiveMeds(data.active_meds || [])
      setTodayLogs(data.logs || [])
      setTakenCount(data.taken_count || 0)
      setExpectedCount(data.expected_count || 0)
    } catch {
      setSnackbar({ open: true, message: '获取数据失败', severity: 'error' })
    }
  }

  useEffect(() => {
    fetchTodayData()
  }, [])

  const handleOpenDialog = (med: Medication) => {
    setSelectedMed(med)
    setForm({
      status: 'taken',
      scheduled_time: med.times?.[0] || '',
      notes: '',
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedMed(null)
    setForm(defaultForm)
  }

  const handleSubmit = async () => {
    if (!selectedMed) return

    try {
      await api.createMedicationLog({
        medication_id: selectedMed.id,
        dosage: selectedMed.dosage,
        scheduled_time: form.scheduled_time,
        status: form.status,
        notes: form.notes,
      })
      setSnackbar({ open: true, message: '记录成功', severity: 'success' })
      handleCloseDialog()
      fetchTodayData()
    } catch {
      setSnackbar({ open: true, message: '记录失败', severity: 'error' })
    }
  }

  const quickLog = async (med: Medication, status: 'taken' | 'skipped') => {
    try {
      await api.createMedicationLog({
        medication_id: med.id,
        dosage: med.dosage,
        scheduled_time: med.times?.[0] || '',
        status: status,
      })
      setSnackbar({ open: true, message: status === 'taken' ? '已记录服药' : '已记录漏服', severity: 'success' })
      fetchTodayData()
    } catch {
      setSnackbar({ open: true, message: '记录失败', severity: 'error' })
    }
  }

  const adherenceRate = expectedCount > 0 ? (takenCount / expectedCount) * 100 : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken':
        return 'success'
      case 'skipped':
        return 'warning'
      case 'missed':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'taken':
        return '已服'
      case 'skipped':
        return '跳过'
      case 'missed':
        return '漏服'
      default:
        return status
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>服药打卡</Typography>

      {/* 今日进度 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>今日服药进度</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinearProgress
              variant="determinate"
              value={adherenceRate}
              sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" color="text.secondary">
              {takenCount}/{expectedCount} ({adherenceRate.toFixed(0)}%)
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* 待服药列表 */}
      <Typography variant="h6" sx={{ mb: 2 }}>今日药品</Typography>
      {activeMeds.length === 0 ? (
        <Alert severity="info">暂无需要服用的药品，请先添加用药计划</Alert>
      ) : (
        <Grid container spacing={2}>
          {activeMeds.map((med) => (
            <Grid item xs={12} sm={6} md={4} key={med.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{med.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    剂量: {med.dosage} {med.unit}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    时间: {med.times?.join('、') || '未设置'}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<Check />}
                      onClick={() => quickLog(med, 'taken')}
                    >
                      已服
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<Close />}
                      onClick={() => quickLog(med, 'skipped')}
                    >
                      跳过
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => handleOpenDialog(med)}
                    >
                      详细
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 今日服药记录 */}
      {todayLogs.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>今日记录</Typography>
          {isMobile ? (
            <Grid container spacing={2}>
              {todayLogs.map((log) => (
                <Grid item xs={12} key={log.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1">{log.medication_name}</Typography>
                        <Chip
                          label={getStatusLabel(log.status)}
                          size="small"
                          color={getStatusColor(log.status)}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        剂量: {log.dosage}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        服药时间: {new Date(log.taken_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                      {log.notes && (
                        <Typography variant="body2" color="text.secondary">
                          备注: {log.notes}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>药品</TableCell>
                    <TableCell>剂量</TableCell>
                    <TableCell>计划时间</TableCell>
                    <TableCell>实际时间</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>备注</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todayLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.medication_name}</TableCell>
                      <TableCell>{log.dosage}</TableCell>
                      <TableCell>{log.scheduled_time || '-'}</TableCell>
                      <TableCell>{new Date(log.taken_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell>
                        <Chip label={getStatusLabel(log.status)} size="small" color={getStatusColor(log.status)} />
                      </TableCell>
                      <TableCell>{log.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* 详细记录对话框 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>服药记录 - {selectedMed?.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>服药状态</InputLabel>
                <Select
                  value={form.status}
                  label="服药状态"
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'taken' | 'skipped' | 'missed' })}
                >
                  <MenuItem value="taken">已服用</MenuItem>
                  <MenuItem value="skipped">跳过</MenuItem>
                  <MenuItem value="missed">漏服</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="计划服用时间"
                type="time"
                fullWidth
                value={form.scheduled_time}
                onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="备注"
                fullWidth
                multiline
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}