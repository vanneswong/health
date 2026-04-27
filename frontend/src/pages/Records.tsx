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
  Pagination,
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
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { api, BPRecord } from '../services/api'
import { getHealthLevel, getHealthColor, formatDateTime } from '../utils/health'

export default function Records() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [records, setRecords] = useState<BPRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<BPRecord | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [_loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' })

  const defaultForm = {
    systolic: '',
    diastolic: '',
    pulse: '',
    measured_at: new Date().toISOString().slice(0, 16),
    medication: '',
    notes: '',
  }
  const [form, setForm] = useState(defaultForm)

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const data = await api.getRecords(page, pageSize)
      setRecords(data.records)
      setTotal(data.total)
    } catch (err) {
      setSnackbar({ open: true, message: '获取数据失败', severity: 'error' })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRecords()
  }, [page])

  const handleOpenDialog = (record?: BPRecord) => {
    if (record) {
      setEditingRecord(record)
      setForm({
        systolic: record.systolic.toString(),
        diastolic: record.diastolic.toString(),
        pulse: record.pulse.toString(),
        measured_at: new Date(record.measured_at).toISOString().slice(0, 16),
        medication: record.medication || '',
        notes: record.notes || '',
      })
    } else {
      setEditingRecord(null)
      setForm(defaultForm)
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingRecord(null)
    setForm(defaultForm)
  }

  const handleSubmit = async () => {
    const systolic = parseInt(form.systolic)
    const diastolic = parseInt(form.diastolic)
    const pulse = parseInt(form.pulse)

    if (!systolic || !diastolic || !pulse) {
      setSnackbar({ open: true, message: '请填写血压和脉搏', severity: 'error' })
      return
    }

    try {
      const data = {
        systolic,
        diastolic,
        pulse,
        measured_at: new Date(form.measured_at).toISOString(),
        medication: form.medication,
        notes: form.notes,
      }

      if (editingRecord) {
        await api.updateRecord(editingRecord.id, data)
        setSnackbar({ open: true, message: '更新成功', severity: 'success' })
      } else {
        await api.createRecord(data)
        setSnackbar({ open: true, message: '添加成功', severity: 'success' })
      }
      handleCloseDialog()
      fetchRecords()
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
      await api.deleteRecord(deletingId)
      setSnackbar({ open: true, message: '删除成功', severity: 'success' })
      setDeleteDialogOpen(false)
      if (records.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        fetchRecords()
      }
    } catch (err) {
      setSnackbar({ open: true, message: '删除失败', severity: 'error' })
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">血压记录</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          添加记录
        </Button>
      </Box>

      {isMobile ? (
        <Grid container spacing={2}>
          {records.map((record) => (
            <Grid item xs={12} key={record.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDateTime(record.measured_at)}
                    </Typography>
                    <Chip
                      label={getHealthLevel(record.systolic, record.diastolic)}
                      size="small"
                      sx={{ bgcolor: getHealthColor(getHealthLevel(record.systolic, record.diastolic)), color: 'white' }}
                    />
                  </Box>
                  <Typography variant="h6">
                    高压{record.systolic}/低压{record.diastolic} mmHg
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    (收缩压{record.systolic}/舒张压{record.diastolic})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    脉搏: {record.pulse} 次/分钟
                  </Typography>
                  {record.medication && (
                    <Typography variant="body2" color="text.secondary">
                      用药: {record.medication}
                    </Typography>
                  )}
                  {record.notes && (
                    <Typography variant="body2" color="text.secondary">
                      备注: {record.notes}
                    </Typography>
                  )}
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton size="small" onClick={() => handleOpenDialog(record)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDeleteDialog(record.id)}>
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
                <TableCell>测量时间</TableCell>
                <TableCell>高压(收缩压) mmHg</TableCell>
                <TableCell>低压(舒张压) mmHg</TableCell>
                <TableCell>脉搏(次/分钟)</TableCell>
                <TableCell>用药</TableCell>
                <TableCell>备注</TableCell>
                <TableCell>健康状态</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDateTime(record.measured_at)}</TableCell>
                  <TableCell>{record.systolic}</TableCell>
                  <TableCell>{record.diastolic}</TableCell>
                  <TableCell>{record.pulse}</TableCell>
                  <TableCell>{record.medication || '-'}</TableCell>
                  <TableCell>{record.notes || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getHealthLevel(record.systolic, record.diastolic)}
                      size="small"
                      sx={{ bgcolor: getHealthColor(getHealthLevel(record.systolic, record.diastolic)), color: 'white' }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(record)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDeleteDialog(record.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* 添加/编辑对话框 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRecord ? '编辑记录' : '添加记录'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="高压(收缩压) mmHg"
                type="number"
                fullWidth
                value={form.systolic}
                onChange={(e) => setForm({ ...form, systolic: e.target.value })}
                inputProps={{ min: 60, max: 250 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="低压(舒张压) mmHg"
                type="number"
                fullWidth
                value={form.diastolic}
                onChange={(e) => setForm({ ...form, diastolic: e.target.value })}
                inputProps={{ min: 40, max: 150 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="脉搏(次/分钟)"
                type="number"
                fullWidth
                value={form.pulse}
                onChange={(e) => setForm({ ...form, pulse: e.target.value })}
                inputProps={{ min: 30, max: 200 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="测量时间"
                type="datetime-local"
                fullWidth
                value={form.measured_at}
                onChange={(e) => setForm({ ...form, measured_at: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="用药"
                fullWidth
                value={form.medication}
                onChange={(e) => setForm({ ...form, medication: e.target.value })}
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

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>确定要删除这条记录吗？此操作不可撤销。</Typography>
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