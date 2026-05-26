import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material'
import { Save, Edit, Cancel } from '@mui/icons-material'
import { api, Profile } from '../services/api'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    age: 0,
    height: 0,
    weight: 0,
    gender: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await api.getProfile()
      if (response.profile) {
        setProfile(response.profile)
        // 无资料时自动进入编辑模式
        if (!response.profile.name && !response.profile.age && !response.profile.height && !response.profile.weight) {
          setEditing(true)
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await api.updateProfile(profile)
      setMessage({ type: 'success', text: '资料保存成功' })
      setEditing(false)
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败，请重试' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    loadProfile()
    setEditing(false)
  }

  const handleChange = (field: keyof Profile, value: string | number) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const hasProfile = profile.name || profile.age || profile.height || profile.weight

  const genderLabel = (gender: string) => {
    if (gender === 'male') return '男'
    if (gender === 'female') return '女'
    return '未设置'
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>加载中...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">个人资料</Typography>
        {hasProfile && !editing && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setEditing(true)}
          >
            编辑
          </Button>
        )}
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {!editing && hasProfile ? (
        // 查看模式
        <Card>
          <CardContent>
            <List>
              <ListItem>
                <ListItemText primary="姓名" secondary={profile.name || '未设置'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="性别" secondary={genderLabel(profile.gender)} />
              </ListItem>
              <ListItem>
                <ListItemText primary="年龄" secondary={profile.age ? `${profile.age} 岁` : '未设置'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="身高" secondary={profile.height ? `${profile.height} cm` : '未设置'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="体重" secondary={profile.weight ? `${profile.weight} kg` : '未设置'} />
              </ListItem>
            </List>
            {profile.height && profile.weight && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  BMI 指数
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  <Chip
                    label={(() => {
                      const bmi = profile.weight / ((profile.height / 100) ** 2)
                      return bmi.toFixed(1)
                    })()}
                    color={(() => {
                      const bmi = profile.weight / ((profile.height / 100) ** 2)
                      if (bmi < 18.5) return 'warning'
                      if (bmi < 24) return 'success'
                      if (bmi < 28) return 'warning'
                      return 'error'
                    })()}
                  />
                  {(() => {
                    const bmi = profile.weight / ((profile.height / 100) ** 2)
                    if (bmi < 18.5) return ' 偏瘦'
                    if (bmi < 24) return ' 正常'
                    if (bmi < 28) return ' 超重'
                    return ' 肥胖'
                  })()}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      ) : (
        // 编辑模式
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="姓名"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="请输入姓名"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>性别</InputLabel>
                  <Select
                    value={profile.gender}
                    label="性别"
                    onChange={(e) => handleChange('gender', e.target.value)}
                  >
                    <MenuItem value="">未设置</MenuItem>
                    <MenuItem value="male">男</MenuItem>
                    <MenuItem value="female">女</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="年龄"
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 150 }}
                  placeholder="请输入年龄"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="身高 (cm)"
                  type="number"
                  value={profile.height || ''}
                  onChange={(e) => handleChange('height', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 300 }}
                  placeholder="请输入身高"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="体重 (kg)"
                  type="number"
                  value={profile.weight || ''}
                  onChange={(e) => handleChange('weight', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 500 }}
                  placeholder="请输入体重"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? '保存中...' : '保存'}
                  </Button>
                  {hasProfile && (
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      取消
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}