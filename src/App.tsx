import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import UserPortal from './pages/UserPortal';
import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import Packages from './pages/Packages';
import Payments from './pages/Payments';
import { DashboardLayout } from './components/layout/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* User Facing Portal */}
        <Route path="/" element={<UserPortal />} />
        
        {/* Admin Dashboard */}
        <Route path="/admin" element={<DashboardLayout children={<Dashboard />} />} />
        <Route path="/admin/monitoring" element={<DashboardLayout children={<Monitoring />} />} />
        <Route path="/admin/packages" element={<DashboardLayout children={<Packages />} />} />
        <Route path="/admin/payments" element={<DashboardLayout children={<Payments />} />} />
        <Route path="/admin/settings" element={<DashboardLayout children={<div className="p-8 text-center text-slate-500 font-medium">Settings coming soon...</div>} />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </Router>
  );
}

export default App;