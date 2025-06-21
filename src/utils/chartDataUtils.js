import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

// Formatear duración en formato legible
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

// Procesar datos para gráfico de barras por proyecto
export const processProjectTimeData = (timeEntries) => {
  if (!timeEntries || timeEntries.length === 0) return [];

  const projectTotals = {};
  
  timeEntries.forEach(entry => {
    const projectName = entry.project;
    if (!projectTotals[projectName]) {
      projectTotals[projectName] = 0;
    }
    projectTotals[projectName] += entry.totalMinutes || 0;
  });

  return Object.entries(projectTotals)
    .map(([name, time]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      time: Math.round(time),
      fullName: name
    }))
    .sort((a, b) => b.time - a.time)
    .slice(0, 10); // Top 10 proyectos
};

// Procesar datos para gráfico de pastel
export const processTimeDistributionData = (timeEntries) => {
  if (!timeEntries || timeEntries.length === 0) return [];

  const projectTotals = {};
  
  timeEntries.forEach(entry => {
    const projectName = entry.project;
    if (!projectTotals[projectName]) {
      projectTotals[projectName] = 0;
    }
    projectTotals[projectName] += entry.totalMinutes || 0;
  });

  const total = Object.values(projectTotals).reduce((sum, time) => sum + time, 0);
  
  return Object.entries(projectTotals)
    .map(([name, time]) => ({
      name: name.length > 12 ? name.substring(0, 12) + '...' : name,
      value: Math.round(time),
      fullName: name,
      percentage: total > 0 ? Math.round((time / total) * 100) : 0
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Top 6 proyectos para el pastel
};

// Procesar datos para gráfico de tendencias (últimos 7 días)
export const processTimeTrendData = (timeEntries) => {
  if (!timeEntries || timeEntries.length === 0) return [];

  const today = new Date();
  const weekStart = startOfWeek(today, { locale: es });
  const weekEnd = endOfWeek(today, { locale: es });
  
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const dailyTotals = {};
  days.forEach(day => {
    dailyTotals[format(day, 'yyyy-MM-dd')] = 0;
  });

  timeEntries.forEach(entry => {
    if (entry.timestamp) {
      const entryDate = format(entry.timestamp.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp), 'yyyy-MM-dd');
      if (dailyTotals[entryDate] !== undefined) {
        dailyTotals[entryDate] += entry.totalMinutes || 0;
      }
    }
  });

  return Object.entries(dailyTotals).map(([date, time]) => ({
    date: format(new Date(date), 'EEE', { locale: es }),
    time: Math.round(time),
    fullDate: date
  }));
};

// Procesar datos para gráfico de tiempo acumulado
export const processCumulativeTimeData = (timeEntries) => {
  if (!timeEntries || timeEntries.length === 0) return [];

  const sortedEntries = [...timeEntries].sort((a, b) => {
    const dateA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
    const dateB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
    return dateA - dateB;
  });

  let cumulative = 0;
  return sortedEntries.map(entry => {
    cumulative += entry.totalMinutes || 0;
    return {
      date: format(entry.timestamp.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp), 'MMM dd'),
      cumulative: Math.round(cumulative),
      time: entry.totalMinutes || 0
    };
  }).slice(-30); // Últimos 30 registros
};

// Procesar datos para comparación de proyectos
export const processProjectComparisonData = (timeEntries) => {
  if (!timeEntries || timeEntries.length === 0) return [];

  const projectStats = {};
  
  timeEntries.forEach(entry => {
    const projectName = entry.project;
    if (!projectStats[projectName]) {
      projectStats[projectName] = {
        totalTime: 0,
        entries: 0
      };
    }
    projectStats[projectName].totalTime += entry.totalMinutes || 0;
    projectStats[projectName].entries += 1;
  });

  const totalTime = Object.values(projectStats).reduce((sum, stats) => sum + stats.totalTime, 0);
  const averageTime = totalTime / Object.keys(projectStats).length;

  return Object.entries(projectStats)
    .map(([project, stats]) => ({
      project: project.length > 12 ? project.substring(0, 12) + '...' : project,
      time: Math.round(stats.totalTime),
      average: Math.round(averageTime),
      entries: stats.entries,
      fullName: project
    }))
    .sort((a, b) => b.time - a.time)
    .slice(0, 8); // Top 8 proyectos
};

// Calcular estadísticas generales
export const calculateGeneralStats = (timeEntries, projects, registros) => {
  const totalTime = timeEntries.reduce((sum, entry) => sum + (entry.totalMinutes || 0), 0);
  const totalProjects = projects.length;
  const totalEntries = timeEntries.length;
  const activeProjects = projects.filter(p => p.estado === 'En progreso').length;
  
  // Calcular tiempo promedio por día (últimos 7 días)
  const lastWeekEntries = timeEntries.filter(entry => {
    if (!entry.timestamp) return false;
    const entryDate = entry.timestamp.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp);
    const weekAgo = subDays(new Date(), 7);
    return entryDate >= weekAgo;
  });
  
  const lastWeekTime = lastWeekEntries.reduce((sum, entry) => sum + (entry.totalMinutes || 0), 0);
  const averageDailyTime = Math.round(lastWeekTime / 7);

  // Proyecto más activo
  const projectTotals = {};
  timeEntries.forEach(entry => {
    const projectName = entry.project;
    if (!projectTotals[projectName]) {
      projectTotals[projectName] = 0;
    }
    projectTotals[projectName] += entry.totalMinutes || 0;
  });
  
  const mostActiveProject = Object.entries(projectTotals)
    .sort(([,a], [,b]) => b - a)[0];

  return {
    totalTime,
    totalProjects,
    totalEntries,
    activeProjects,
    averageDailyTime,
    mostActiveProject: mostActiveProject ? {
      name: mostActiveProject[0],
      time: mostActiveProject[1]
    } : null
  };
};

// Procesar actividad reciente
export const processRecentActivity = (timeEntries, registros) => {
  const activities = [];
  
  // Agregar entradas de tiempo recientes
  timeEntries.slice(0, 3).forEach(entry => {
    activities.push({
      type: 'tiempo',
      description: `${entry.project} - ${formatDuration(entry.totalMinutes)}`,
      time: format(entry.timestamp.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp), 'HH:mm'),
      timestamp: entry.timestamp
    });
  });
  
  // Agregar registros de asistencia recientes
  if (registros) {
    registros.slice(0, 3).forEach(registro => {
      activities.push({
        type: registro.tipo,
        description: `${registro.proyecto} - ${registro.tipo === 'entrada' ? 'Entrada' : 'Salida'}`,
        time: format(registro.fecha.toDate(), 'HH:mm'),
        timestamp: registro.fecha
      });
    });
  }
  
  // Ordenar por timestamp y tomar los 5 más recientes
  return activities
    .sort((a, b) => {
      const dateA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const dateB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return dateB - dateA;
    })
    .slice(0, 5);
};

// Filtrar datos según los filtros aplicados
export const filterData = (data, filters) => {
  if (!filters || Object.keys(filters).every(key => !filters[key] || filters[key] === 'all')) {
    return data;
  }

  return data.filter(item => {
    // Filtro de búsqueda
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        (item.project && item.project.toLowerCase().includes(searchLower)) ||
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.nombre && item.nombre.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Filtro de proyectos
    if (filters.projects && filters.projects.length > 0) {
      const itemProject = item.project || item.nombre;
      if (!filters.projects.includes(itemProject)) return false;
    }

    // Filtro de estado
    if (filters.status && filters.status !== 'all') {
      if (item.estado !== filters.status) return false;
    }

    // Filtro de tiempo
    if (filters.timeRange && filters.timeRange !== 'all') {
      const minutes = item.totalMinutes || 0;
      switch (filters.timeRange) {
        case 'short':
          if (minutes > 30) return false;
          break;
        case 'medium':
          if (minutes <= 30 || minutes > 120) return false;
          break;
        case 'long':
          if (minutes <= 120) return false;
          break;
      }
    }

    // Filtro de fecha
    if (filters.dateRange && filters.dateRange !== 'all') {
      const itemDate = item.timestamp ? 
        (item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp)) :
        (item.fecha ? item.fecha.toDate() : new Date());
      
      const itemDateStr = format(itemDate, 'yyyy-MM-dd');
      
      if (filters.customDateRange.start && filters.customDateRange.end) {
        if (itemDateStr < filters.customDateRange.start || itemDateStr > filters.customDateRange.end) {
          return false;
        }
      }
    }

    return true;
  });
}; 