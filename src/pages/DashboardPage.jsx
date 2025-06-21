// src/components/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../config/firebase";
import { useNotification } from '../components/Notification';
import SearchAndFilters from '../components/SearchAndFilters';
import {
  ProjectTimeBarChart,
  TimeDistributionPieChart,
  TimeTrendLineChart,
  CumulativeTimeAreaChart,
  ProjectComparisonChart,
  StatsWidget,
  RecentActivityWidget
} from '../components/DashboardCharts';
import {
  processProjectTimeData,
  processTimeDistributionData,
  processTimeTrendData,
  processCumulativeTimeData,
  processProjectComparisonData,
  calculateGeneralStats,
  processRecentActivity,
  filterData,
  formatDuration
} from '../utils/chartDataUtils';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState({
    timeEntries: [],
    projects: [],
    registros: []
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    // Aplicar filtros cuando cambien
    const filtered = {
      timeEntries: filterData(timeEntries, filters),
      projects: filterData(projects, filters),
      registros: filterData(registros, filters)
    };
    setFilteredData(filtered);
  }, [timeEntries, projects, registros, filters]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar entradas de tiempo
      const timeEntriesRef = collection(db, 'timeEntries');
      const timeQuery = query(
        timeEntriesRef,
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const timeSnapshot = await getDocs(timeQuery);
      const timeData = timeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));
      setTimeEntries(timeData);

      // Cargar proyectos
      const projectsRef = collection(db, 'proyectos');
      const projectsQuery = query(
        projectsRef,
        where('ownerId', '==', user.uid)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectsData);

      // Cargar registros de asistencia
      const registrosRef = collection(db, 'registros');
      const registrosQuery = query(
        registrosRef,
        where('userId', '==', user.uid),
        orderBy('fecha', 'desc')
      );
      const registrosSnapshot = await getDocs(registrosQuery);
      const registrosData = registrosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRegistros(registrosData);

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      addNotification('Error al cargar los datos del dashboard', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-[#00ffff] animate-pulse">Cargando...</div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;

  // Calcular estadísticas
  const stats = calculateGeneralStats(timeEntries, projects, registros);
  const recentActivity = processRecentActivity(timeEntries, registros);

  // Procesar datos para gráficos
  const projectTimeData = processProjectTimeData(filteredData.timeEntries);
  const timeDistributionData = processTimeDistributionData(filteredData.timeEntries);
  const timeTrendData = processTimeTrendData(filteredData.timeEntries);
  const cumulativeTimeData = processCumulativeTimeData(filteredData.timeEntries);
  const projectComparisonData = processProjectComparisonData(filteredData.timeEntries);

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="bg-[#1a1a1a] p-8 rounded-[20px] shadow-[0_0_25px_rgba(0,255,255,0.05)]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl bg-gradient-to-r from-[#ff66cc] to-[#00ffff] bg-clip-text text-transparent mb-4">
              Dashboard
            </h1>
            <p className="text-gray-400">
              Bienvenido de vuelta, {user?.email}. Aquí tienes un resumen de tu actividad.
            </p>
          </div>

          {/* Filtros */}
          <SearchAndFilters
            onFiltersChange={handleFiltersChange}
            projects={projects}
            showDateFilter={true}
            showProjectFilter={true}
            showStatusFilter={true}
            showTimeFilter={true}
            placeholder="Buscar en proyectos, descripciones..."
          />

          {/* Widgets de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsWidget
              title="Tiempo Total"
              value={formatDuration(stats.totalTime)}
              subtitle="Tiempo registrado"
              icon="⏱️"
              color="#00ffff"
            />
            <StatsWidget
              title="Proyectos"
              value={stats.totalProjects}
              subtitle={`${stats.activeProjects} activos`}
              icon="📁"
              color="#ff66cc"
            />
            <StatsWidget
              title="Registros"
              value={stats.totalEntries}
              subtitle="Entradas de tiempo"
              icon="📝"
              color="#00ff88"
            />
            <StatsWidget
              title="Promedio Diario"
              value={formatDuration(stats.averageDailyTime)}
              subtitle="Últimos 7 días"
              icon="📊"
              color="#ffaa00"
            />
          </div>

          {/* Gráficos principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ProjectTimeBarChart data={projectTimeData} />
            <TimeDistributionPieChart data={timeDistributionData} />
          </div>

          {/* Gráficos de tendencias */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <TimeTrendLineChart data={timeTrendData} />
            <CumulativeTimeAreaChart data={cumulativeTimeData} />
          </div>

          {/* Comparación de proyectos y actividad reciente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ProjectComparisonChart data={projectComparisonData} />
            <RecentActivityWidget activities={recentActivity} />
          </div>

          {/* Proyecto más activo */}
          {stats.mostActiveProject && (
            <div className="bg-[#2a2a2a] p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-white mb-4">Proyecto Más Activo</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-[#00ffff]">
                    {stats.mostActiveProject.name}
                  </p>
                  <p className="text-gray-400">
                    {formatDuration(stats.mostActiveProject.time)} de tiempo total
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Proyecto con más tiempo registrado</p>
                </div>
              </div>
            </div>
          )}

          {/* Estado cuando no hay datos */}
          {timeEntries.length === 0 && projects.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                ¡Bienvenido a ProjectTime!
              </h3>
              <p className="text-gray-400 mb-6">
                Comienza creando proyectos y registrando tu tiempo para ver estadísticas increíbles aquí.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => window.location.href = '/proyectos'}
                  className="btn"
                >
                  Crear Proyecto
                </button>
                <button
                  onClick={() => window.location.href = '/horas'}
                  className="btn-secondary"
                >
                  Registrar Tiempo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
