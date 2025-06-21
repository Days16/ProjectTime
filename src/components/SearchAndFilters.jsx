import React, { useState, useEffect, useCallback } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const SearchAndFilters = ({ 
  onFiltersChange, 
  projects = [], 
  showDateFilter = true, 
  showProjectFilter = true,
  showStatusFilter = false,
  showTimeFilter = false,
  placeholder = "Buscar..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [dateRange, setDateRange] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [timeRange, setTimeRange] = useState('all');

  // Memoizar la función de callback para evitar recreaciones
  const handleFiltersChange = useCallback(() => {
    const filters = {
      searchTerm: searchTerm.trim(),
      projects: selectedProjects,
      dateRange,
      customDateRange,
      status: selectedStatus,
      timeRange
    };
    onFiltersChange(filters);
  }, [searchTerm, selectedProjects, dateRange, customDateRange, selectedStatus, timeRange, onFiltersChange]);

  useEffect(() => {
    handleFiltersChange();
  }, [handleFiltersChange]);

  const handleProjectToggle = (projectName) => {
    setSelectedProjects(prev => 
      prev.includes(projectName)
        ? prev.filter(p => p !== projectName)
        : [...prev, projectName]
    );
  };

  const handleSelectAllProjects = () => {
    setSelectedProjects(projects.map(p => p.nombre || p.project || p));
  };

  const handleClearAllProjects = () => {
    setSelectedProjects([]);
  };

  const getDateRangeDates = (range) => {
    const today = new Date();
    switch (range) {
      case 'today':
        return { start: format(today, 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') };
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return { start: format(yesterday, 'yyyy-MM-dd'), end: format(yesterday, 'yyyy-MM-dd') };
      case 'week':
        return { 
          start: format(startOfWeek(today, { locale: es }), 'yyyy-MM-dd'), 
          end: format(endOfWeek(today, { locale: es }), 'yyyy-MM-dd') 
        };
      case 'month':
        return { 
          start: format(startOfMonth(today), 'yyyy-MM-dd'), 
          end: format(endOfMonth(today), 'yyyy-MM-dd') 
        };
      case 'lastWeek':
        const lastWeekStart = startOfWeek(subDays(today, 7), { locale: es });
        const lastWeekEnd = endOfWeek(subDays(today, 7), { locale: es });
        return { 
          start: format(lastWeekStart, 'yyyy-MM-dd'), 
          end: format(lastWeekEnd, 'yyyy-MM-dd') 
        };
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        return { 
          start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'), 
          end: format(endOfMonth(lastMonth), 'yyyy-MM-dd') 
        };
      default:
        return { start: '', end: '' };
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedProjects([]);
    setDateRange('all');
    setCustomDateRange({ start: '', end: '' });
    setSelectedStatus('all');
    setTimeRange('all');
  };

  const hasActiveFilters = searchTerm || selectedProjects.length > 0 || dateRange !== 'all' || 
                          customDateRange.start || customDateRange.end || selectedStatus !== 'all' || timeRange !== 'all';

  return (
    <div className="bg-[#2a2a2a] p-6 rounded-xl mb-6">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Búsqueda y Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-[#00ffff] hover:text-[#00cccc] transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl text-white focus:outline-none focus:border-[#00ffff] transition-all duration-300"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Filtro de Proyectos */}
        {showProjectFilter && projects.length > 0 && (
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Proyectos ({selectedProjects.length}/{projects.length})
            </label>
            <div className="max-h-32 overflow-y-auto bg-[#1a1a1a] rounded-lg p-2">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={handleSelectAllProjects}
                  className="text-xs bg-[#00ffff]/20 text-[#00ffff] px-2 py-1 rounded hover:bg-[#00ffff]/30 transition-colors"
                >
                  Seleccionar todos
                </button>
                <button
                  onClick={handleClearAllProjects}
                  className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/30 transition-colors"
                >
                  Limpiar
                </button>
              </div>
              {projects.map((project, index) => {
                const projectName = project.nombre || project.project || project;
                return (
                  <label key={index} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white cursor-pointer p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(projectName)}
                      onChange={() => handleProjectToggle(projectName)}
                      className="rounded border-[#3a3a3a] bg-[#2a2a2a] text-[#00ffff] focus:ring-[#00ffff]"
                    />
                    <span className="truncate">{projectName}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Filtro de Fechas */}
        {showDateFilter && (
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Rango de Fechas
            </label>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                if (e.target.value !== 'custom') {
                  setCustomDateRange(getDateRangeDates(e.target.value));
                }
              }}
              className="w-full p-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl text-white focus:outline-none focus:border-[#00ffff] transition-all duration-300"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="yesterday">Ayer</option>
              <option value="week">Esta semana</option>
              <option value="lastWeek">Semana pasada</option>
              <option value="month">Este mes</option>
              <option value="lastMonth">Mes pasado</option>
              <option value="custom">Rango personalizado</option>
            </select>
            
            {dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="p-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded text-white text-sm focus:outline-none focus:border-[#00ffff]"
                />
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="p-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded text-white text-sm focus:outline-none focus:border-[#00ffff]"
                />
              </div>
            )}
          </div>
        )}

        {/* Filtro de Estado */}
        {showStatusFilter && (
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Estado
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl text-white focus:outline-none focus:border-[#00ffff] transition-all duration-300"
            >
              <option value="all">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="Completado">Completado</option>
            </select>
          </div>
        )}

        {/* Filtro de Tiempo */}
        {showTimeFilter && (
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Duración
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full p-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl text-white focus:outline-none focus:border-[#00ffff] transition-all duration-300"
            >
              <option value="all">Cualquier duración</option>
              <option value="short">Corta (0-30 min)</option>
              <option value="medium">Media (30 min - 2h)</option>
              <option value="long">Larga (2h+)</option>
            </select>
          </div>
        )}
      </div>

      {/* Resumen de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-[#1a1a1a] rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Filtros activos:</p>
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="text-xs bg-[#00ffff]/20 text-[#00ffff] px-2 py-1 rounded">
                Búsqueda: "{searchTerm}"
              </span>
            )}
            {selectedProjects.length > 0 && (
              <span className="text-xs bg-[#ff66cc]/20 text-[#ff66cc] px-2 py-1 rounded">
                {selectedProjects.length} proyecto(s) seleccionado(s)
              </span>
            )}
            {dateRange !== 'all' && (
              <span className="text-xs bg-[#00ff88]/20 text-[#00ff88] px-2 py-1 rounded">
                {dateRange === 'custom' ? 'Rango personalizado' : dateRange}
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="text-xs bg-[#ffaa00]/20 text-[#ffaa00] px-2 py-1 rounded">
                Estado: {selectedStatus}
              </span>
            )}
            {timeRange !== 'all' && (
              <span className="text-xs bg-[#aa00ff]/20 text-[#aa00ff] px-2 py-1 rounded">
                Duración: {timeRange}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters; 