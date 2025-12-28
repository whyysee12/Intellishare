import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import CaseList from './components/Cases/CaseList';
import CaseDetail from './components/Cases/CaseDetail';
import DataIngestion from './components/Ingestion/DataIngestion';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import SearchModule from './components/Search/SearchModule';
import UserProfile from './components/Profile/UserProfile';
import CriminalRegistry from './components/Criminals/CriminalRegistry';
import InterAgencyShare from './components/Share/InterAgencyShare';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Common/Header';

// Simple wrapper to protect routes
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/cases" element={<ProtectedRoute><CaseList /></ProtectedRoute>} />
            <Route path="/cases/:id" element={<ProtectedRoute><CaseDetail /></ProtectedRoute>} />
            <Route path="/criminals" element={<ProtectedRoute><CriminalRegistry /></ProtectedRoute>} />
            <Route path="/ingest" element={<ProtectedRoute><DataIngestion /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
            <Route path="/analytics/:id" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchModule /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/share" element={<ProtectedRoute><InterAgencyShare /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;