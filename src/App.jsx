import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './components/Notification';
import Navbar from './components/Navbar';
import AppRoutes from './routes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-gray-900">
              <Navbar />
              <AppRoutes />
            </div>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
