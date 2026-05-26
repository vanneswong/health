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
  IconButton,
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
  Switch,
  FormControlLabel,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { api, Medication, FrequencyType } from '../services/api'
import { formatLocalDate } from '../utils/health'

const frequencyLabels: Record<FrequencyType, string> = {
  daily: '每天一次',
  twice_daily: '每天两次',
  three_daily: '每天三次',
  weekly: '每周',
  custom: '自定义',
}

export default function MedicationPlans() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [medications, setMedications] = useState<Medication[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingMed, setEditingMed] = useState<Medication | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })

  const defaultForm = {
    name: '',
    dosage: '',
    unit: '片',
    frequency: 'daily' as FrequencyType,
    times: ['08:00'],
    duration: 0,
    start_date: formatLocalDate(new Date()),
    notes: '',
    is_active: true,
  }
  const [form, setForm] = useState(defaultForm)

  const fetchMedications = async () => {
    try {
      const data = await api.getMedications()
      setMedications(data.medications || [])
    } catch {
      setSnackbar({ open: true, message: '获取数据失败', severity: 'error' })
    }
  }

  useEffect(() => {
    fetchMedications()
  }, [])

  const handleOpenDialog = (med?: Medication) => {
    if (med) {
      setEditingMed(med)
      setForm({
        name: med.name,
        dosage: med.dosage,
        unit: med.unit || '片',
        frequency: med.frequency,
        times: med.times || ['08:00'],
        duration: med.duration,
        start_date: med.start_date.slice(0, 10),
        notes: med.notes || '',
        is_active: med.is_active,
      })
    } else {
      setEditingMed(null)
      setForm(defaultForm)
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingMed(null)
    setForm(defaultForm)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.dosage) {
      setSnackbar({ open: true, message: '请填写药品名称和剂量', severity: 'error' })
      return
    }

    try {
      const data = {
        name: form.name,
        dosage: form.dosage,
        unit: form.unit,
        frequency: form.frequency,
        times: form.times,
        duration: form.duration,
        start_date: form.start_date,
        notes: form.notes,
        is_active: form.is_active,
      }

      if (editingMed) {
        await api.updateMedication(editingMed.id, data)
        setSnackbar({ open: true, message: '更新成功', severity: 'success' })
      } else {
        await api.createMedication(data)
        setSnackbar({ open: true, message: '添加成功', severity: 'success' })
      }
      handleCloseDialog()
      fetchMedications()
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.error || '操作失败', severity: 'error' })
    }
  }

  const handleOpenDeleteDialog = (id: number) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await api.deleteMedication(deletingId)
      setSnackbar({ open: true, message: '删除成功', severity: 'success' })
      setDeleteDialogOpen(false)
      fetchMedications()
    } catch {
      setSnackbar({ open: true, message: '删除失败', severity: 'error' })
    }
  }

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...form.times]
    newTimes[index] = value
    setForm({ ...form, times: newTimes })
  }

  const addTimeSlot = () => {
    setForm({ ...form, times: [...form.times, '12:00'] })
  }

  const removeTimeSlot = (index: number) => {
    const newTimes = form.times.filter((_, i) => i !== index)
    setForm({ ...form, times: newTimes.length > 0 ? newTimes : ['08:00'] })
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">用药计划</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          添加药品
        </Button>
      </Box>

      {medications.length === 0 ? (
        <Alert severity="info">暂无用药计划，请添加您的药品</Alert>
      ) : isMobile ? (
        <Grid container spacing={2}>
          {medications.map((med) => (
            <Grid item xs={12} key={med.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6">{med.name}</Typography>
                    <Chip
                      label={med.is_active ? '正在使用' : '已停用'}
                      size="small"
                      color={med.is_active ? 'success' : 'default'}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    剂量: {med.dosage} {med.unit}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    频率: {frequencyLabels[med.frequency]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    服用时间: {med.times?.join('、') || '未设置'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    开始日期: {med.start_date.slice(0, 10)}
                  </Typography>
                  {med.duration > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      用药天数: {med.duration}天
                    </Typography>
                  )}
                  {med.notes && (
                    <Typography variant="body2" color="text.secondary">
                      备注: {med.notes}
                    </Typography>
                  )}
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton size="small" onClick={() => handleOpenDialog(med)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDeleteDialog(med.id)}>
                      <Delete />
                    </IconButton>
                  </Box>
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
                <TableCell>药品名称</TableCell>
                <TableCell>剂量</TableCell>
                <TableCell>频率</TableCell>
                <TableCell>服用时间</TableCell>
                <TableCell>开始日期</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medications.map((med) => (
                <TableRow key={med.id}>
                  <TableCell>{med.name}</TableCell>
                  <TableCell>{med.dosage} {med.unit}</TableCell>
                  <TableCell>{frequencyLabels[med.frequency]}</TableCell>
                  <TableCell>{med.times?.join('、') || '-'}</TableCell>
                  <TableCell>{med.start_date.slice(0, 10)}</TableCell>
                  <TableCell>
                    <Chip
                      label={med.is_active ? '正在使用' : '已停用'}
                      size="small"
                      color={med.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(med)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDeleteDialog(med.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 添加/编辑对话框 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMed ? '编辑药品' : '添加药品'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="药品名称"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="剂量"
                fullWidth
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                placeholder="如：10mg"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="单位"
                fullWidth
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>服用频率</InputLabel>
                <Select
                  value={form.frequency}
                  label="服用频率"
                  onChange={(e) => setForm({ ...form, frequency: e.target.value as FrequencyType })}
                >
                  <MenuItem value="daily">每天一次</MenuItem>
                  <MenuItem value="twice_daily">每天两次</MenuItem>
                  <MenuItem value="three_daily">每天三次</MenuItem>
                  <MenuItem value="weekly">每周</MenuItem>
                  <MenuItem value="custom">自定义</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>服用时间点</Typography>
              {form.times.map((time, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    size="small"
                  />
                  {form.times.length > 1 && (
                    <Button size="small" color="error" onClick={() => removeTimeSlot(index)}>
                      删除
                    </Button>
                  )}
                </Box>
              ))}
              <Button size="small" onClick={addTimeSlot}>添加时间点</Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="用药天数"
                type="number"
                fullWidth
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })}
                helperText="0表示长期用药"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="开始日期"
                type="date"
                fullWidth
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
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
            {editingMed && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />}
                  label="正在使用"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>确定要删除这个药品计划吗？此操作不可撤销。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={handleDelete} variant="contained" color="error">删除</Button>
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