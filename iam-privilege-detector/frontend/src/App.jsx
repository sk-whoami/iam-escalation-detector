import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Network, AlertTriangle, Upload, FileText } from 'lucide-react';
import Dashboard from './components/Dashboard';
import GraphView from './components/GraphView';
import RiskAnalysis from './components/RiskAnalysis';
import UploadPage from './components/UploadPage';
import './App.css';

function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/upload', label: 'Upload Data', icon: Upload },
    { path: '/graph', label: 'Graph View', icon: Network },
    { path: '/risks', label: 'Risk Analysis', icon: AlertTriangle },
  ];
  
  return (
    <div className="sidebar">
      <div className="logo">
        <h1>
          <div className="logo-icon">
            <Shield size={20} />
          </div>
          IAM Guardian
        </h1>
      </div>
      <nav className="nav">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)' }}>
        <div style={{ marginBottom: '8px' }}>Cybersecurity Hackerton 2026</div>
        <div>Privilege Escalation Detector</div>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/graph" element={<GraphView />} />
          <Route path="/risks" element={<RiskAnalysis />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
