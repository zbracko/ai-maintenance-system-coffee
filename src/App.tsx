//app.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Chat from './pages/Chat';
import DataEntry from './pages/DataEntry';
import Admin from './pages/Admin';
import Manuals from './pages/Manuals';
import MaintenanceLogs from './pages/MaintenanceLogs';
import SafeHandling from './pages/SafeHandling';
import Contributors from './pages/Contributors';
import WorkOrders from './pages/WorkOrders';
import Settings from './pages/Settings';
import { Box } from '@mui/material';
import QrTestPage from './components/ChatInterface/QrTestPage';
import ScanPage from './ScanPage';
import VideoManual from './pages/VideoManual';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Box display="flex" flexDirection="column" height="100vh">
          <Navbar />
          <Box flex={1}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/auth-callback" element={<AuthCallback />} />
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Chat />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/scan" element={<ScanPage />} />
                <Route path="/manuals" element={<Manuals />} />
                <Route path="/logs" element={<MaintenanceLogs />} />
                <Route path="/VideoManual" element={<VideoManual />} />
                <Route path="/safe-handling" element={<SafeHandling />} />
                <Route path="/contributors" element={<Contributors />} />
                <Route path="/work-orders" element={<WorkOrders />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/test" element={<QrTestPage />} />
              </Route>
            </Routes>
          </Box>
          <Footer />
        </Box>
      </AuthProvider>
    </Router>
  );
};

export default App;
