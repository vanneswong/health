import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Menu as MenuIcon,
  ListAlt,
  ShowChart,
  Analytics,
  Logout,
  Person,
  Lock,
  AccountCircle,
  Opacity,
  Timeline,
  Medication,
  CheckCircle,
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import PasswordDialog from './PasswordDialog'
import { api } from '../services/api'

const drawerWidth = 240

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [displayName, setDisplayName] = useState<string>('')
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await api.getProfile()
      if (response.profile?.name) {
        setDisplayName(response.profile.name)
      } else {
        setDisplayName(user?.username || '')
      }
    } catch {
      setDisplayName(user?.username || '')
    }
  }

  const menuItems = [
    // 血压模块
    { type: 'header', label: '血压管理' },
    { path: '/records', label: '血压记录', icon: <ListAlt /> },
    { path: '/trend', label: '血压趋势', icon: <ShowChart /> },
    // 血糖模块
    { type: 'header', label: '血糖管理' },
    { path: '/sugar/records', label: '血糖记录', icon: <Opacity /> },
    { path: '/sugar/trend', label: '血糖趋势', icon: <Timeline /> },
    // 用药模块
    { type: 'header', label: '用药管理' },
    { path: '/medication/plans', label: '用药计划', icon: <Medication /> },
    { path: '/medication/logs', label: '服药打卡', icon: <CheckCircle /> },
    // 综合统计
    { type: 'header', label: '综合统计' },
    { path: '/stats', label: '统计汇总', icon: <Analytics /> },
  ]

  const pathLabels: Record<string, string> = {
    '/records': '血压记录',
    '/trend': '血压趋势',
    '/sugar/records': '血糖记录',
    '/sugar/trend': '血糖趋势',
    '/medication/plans': '用药计划',
    '/medication/logs': '服药打卡',
    '/stats': '统计汇总',
    '/profile': '个人资料',
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleLogout = () => {
    handleUserMenuClose()
    logout()
    navigate('/login')
  }

  const handlePasswordChange = () => {
    handleUserMenuClose()
    setPasswordDialogOpen(true)
  }

  const handleProfile = () => {
    handleUserMenuClose()
    navigate('/profile')
    if (isMobile) setMobileOpen(false)
  }

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" color="primary">
          健康助手
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item, index) => (
          item.type === 'header' ? (
            <Typography key={index} sx={{ px: 2, py: 1, fontSize: '0.75rem', color: 'text.secondary', fontWeight: 'bold' }}>
              {item.label}
            </Typography>
          ) : (
            item.path && (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path)
                    if (isMobile) setMobileOpen(false)
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            )
          )
        ))}
      </List>
      <Divider />
      <Box
        sx={{ p: 2, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={handleUserMenuOpen}
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          <Person />
        </Avatar>
        <Typography sx={{ ml: 1 }}>{displayName}</Typography>
      </Box>
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          个人资料
        </MenuItem>
        <MenuItem onClick={handlePasswordChange}>
          <ListItemIcon>
            <Lock fontSize="small" />
          </ListItemIcon>
          修改密码
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          退出登录
        </MenuItem>
      </Menu>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {pathLabels[location.pathname] || '健康助手'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        {children}
      </Box>
      <PasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
      />
    </Box>
  )
}