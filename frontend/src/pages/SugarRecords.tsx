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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { api, SugarRecord, MeasureType } from '../services/api'
import { getSugarHealthLevel, getSugarHealthColor, getMeasureTypeLabel, formatDateTime, formatForInput, formatLocalDateTime } from '../utils/health'

export default function SugarRecords() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [records, setRecords] = useState<SugarRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<SugarRecord | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [_loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })

  const defaultForm = {
    sugar_value: '',
    measure_type: 'fasting' as MeasureType,
    measure_at: formatForInput(new Date()),
    meal_context: '',
    medication: '',
    notes: '',
  }
  const [form, setForm] = useState(defaultForm)

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const data = await api.getSugarRecords(page, pageSize)
      setRecords(data.records)
      setTotal(data.total)
    } catch {
      setSnackbar({ open: true, message: '获取数据失败', severity: 'error' })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRecords()
  }, [page])

  const handleOpenDialog = (record?: SugarRecord) => {
    if (record) {
      setEditingRecord(record)
      setForm({
        sugar_value: record.sugar_value.toString(),
        measure_type: record.measure_type,
        measure_at: formatForInput(new Date(record.measure_at)),
        meal_context: record.meal_context || '',
        medication: record.medication || '',
        notes: record.notes || '',
      })
    } else {
      setEditingRecord(null)
      setForm({
        ...defaultForm,
        measure_at: formatForInput(new Date()),
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingRecord(null)
    setForm(defaultForm)
  }

  const handleSubmit = async () => {
    const sugarValue = parseFloat(form.sugar_value)

    if (!sugarValue) {
      setSnackbar({ open: true, message: '请填写血糖值', severity: 'error' })
      return
    }

    try {
      const data = {
        sugar_value: sugarValue,
        measure_type: form.measure_type,
        measure_at: formatLocalDateTime(new Date(form.measure_at)),
        meal_context: form.meal_context,
        medication: form.medication,
        notes: form.notes,
      }

      if (editingRecord) {
        await api.updateSugarRecord(editingRecord.id, data)
        setSnackbar({ open: true, message: '更新成功', severity: 'success' })
      } else {
        await api.createSugarRecord(data)
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
      await api.deleteSugarRecord(deletingId)
      setSnackbar({ open: true, message: '删除成功', severity: 'success' })
      setDeleteDialogOpen(false)
      if (records.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        fetchRecords()
      }
    } catch {
      setSnackbar({ open: true, message: '删除失败', severity: 'error' })
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">血糖记录</Typography>
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
                      {formatDateTime(record.measure_at)}
                    </Typography>
                    <Chip
                      label={getSugarHealthLevel(record.sugar_value, record.measure_type)}
                      size="small"
                      sx={{ bgcolor: getSugarHealthColor(getSugarHealthLevel(record.sugar_value, record.measure_type)), color: 'white' }}
                    />
                  </Box>
                  <Typography variant="h6">
                    {record.sugar_value} mmol/L
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    类型: {getMeasureTypeLabel(record.measure_type)}
                  </Typography>
                  {record.meal_context && (
                    <Typography variant="body2" color="text.secondary">
                      餐食备注: {record.meal_context}
                    </Typography>
                  )}
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
                <TableCell>血糖值 (mmol/L)</TableCell>
                <TableCell>测量类型</TableCell>
                <TableCell>餐食备注</TableCell>
                <TableCell>用药</TableCell>
                <TableCell>备注</TableCell>
                <TableCell>健康状态</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDateTime(record.measure_at)}</TableCell>
                  <TableCell>{record.sugar_value}</TableCell>
                  <TableCell>{getMeasureTypeLabel(record.measure_type)}</TableCell>
                  <TableCell>{record.meal_context || '-'}</TableCell>
                  <TableCell>{record.medication || '-'}</TableCell>
                  <TableCell>{record.notes || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getSugarHealthLevel(record.sugar_value, record.measure_type)}
                      size="small"
                      sx={{ bgcolor: getSugarHealthColor(getSugarHealthLevel(record.sugar_value, record.measure_type)), color: 'white' }}
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
            <Grid item xs={12} sm={6}>
              <TextField
                label="血糖值 (mmol/L)"
                type="number"
                fullWidth
                value={form.sugar_value}
                onChange={(e) => setForm({ ...form, sugar_value: e.target.value })}
                inputProps={{ min: 1, max: 40, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>测量类型</InputLabel>
                <Select
                  value={form.measure_type}
                  label="测量类型"
                  onChange={(e) => setForm({ ...form, measure_type: e.target.value as MeasureType })}
                >
                  <MenuItem value="fasting">空腹</MenuItem>
                  <MenuItem value="postmeal_2h">餐后2小时</MenuItem>
                  <MenuItem value="random">随机</MenuItem>
                  <MenuItem value="before_sleep">睡前</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="测量时间"
                type="datetime-local"
                fullWidth
                value={form.measure_at}
                onChange={(e) => setForm({ ...form, measure_at: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="餐前/餐后备注"
                fullWidth
                value={form.meal_context}
                onChange={(e) => setForm({ ...form, meal_context: e.target.value })}
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