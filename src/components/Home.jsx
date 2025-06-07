import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import MainMenu from './MainMenu';
import Timer from './Timer';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <div className="content-container">
        {user ? (
          <div className="logged-in-container">
            <MainMenu />
            <Timer />
          </div>
        ) : (
          <div className="app-container">
            <h1 className="text-4xl bg-gradient-to-r from-[#ff66cc] to-[#00ffff] bg-clip-text text-transparent mb-8">
              Time Tracker
            </h1>
            <p className="text-gray-400 mb-8">Por favor, inicia sesión para continuar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 