import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './components/Notification';
import AppRoutes from './routes';
import Navbar from './components/Navbar';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <div className="App">
            <Navbar />
            <AppRoutes />
          </div>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
