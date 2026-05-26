import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Records from './pages/Records'
import Trend from './pages/Trend'
import Stats from './pages/Stats'
import Profile from './pages/Profile'
import SugarRecords from './pages/SugarRecords'
import SugarTrend from './pages/SugarTrend'
import MedicationPlans from './pages/MedicationPlans'
import MedicationLogs from './pages/MedicationLogs'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Layout>{children}</Layout>
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Records /></ProtectedRoute>} />
          {/* 血压模块 */}
          <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
          <Route path="/trend" element={<ProtectedRoute><Trend /></ProtectedRoute>} />
          {/* 血糖模块 */}
          <Route path="/sugar/records" element={<ProtectedRoute><SugarRecords /></ProtectedRoute>} />
          <Route path="/sugar/trend" element={<ProtectedRoute><SugarTrend /></ProtectedRoute>} />
          {/* 用药模块 */}
          <Route path="/medication/plans" element={<ProtectedRoute><MedicationPlans /></ProtectedRoute>} />
          <Route path="/medication/logs" element={<ProtectedRoute><MedicationLogs /></ProtectedRoute>} />
          {/* 综合 */}
          <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App