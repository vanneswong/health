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
    { path: '/records', label: '血压记录', icon: <ListAlt /> },
    { path: '/trend', label: '趋势图表', icon: <ShowChart /> },
    { path: '/stats', label: '统计汇总', icon: <Analytics /> },
  ]

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
          血压宝
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
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
            {menuItems.find((item) => item.path === location.pathname)?.label ||
              (location.pathname === '/profile' ? '个人资料' : '血压宝')}
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