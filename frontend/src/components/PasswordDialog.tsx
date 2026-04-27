import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Snackbar,
} from '@mui/material'
import { useAuth } from '../hooks/useAuth'

interface PasswordDialogProps {
  open: boolean
  onClose: () => void
}

export default function PasswordDialog({ open, onClose }: PasswordDialogProps) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { changePassword } = useAuth()

  const handleSubmit = async () => {
    setError('')
    if (!oldPassword || !newPassword) {
      setError('请填写所有字段')
      return
    }
    if (newPassword.length < 4) {
      setError('新密码长度至少4位')
      return
    }
    try {
      await changePassword(oldPassword, newPassword)
      setSuccess(true)
      setOldPassword('')
      setNewPassword('')
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || '修改失败')
    }
  }

  const handleClose = () => {
    setOldPassword('')
    setNewPassword('')
    setError('')
    onClose()
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>修改密码</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="旧密码"
            type="password"
            fullWidth
            variant="outlined"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <TextField
            margin="dense"
            label="新密码"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">确认</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success">密码修改成功</Alert>
      </Snackbar>
    </>
  )
}