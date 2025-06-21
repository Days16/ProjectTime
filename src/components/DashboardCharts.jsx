import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
  Legend, ComposedChart
} from 'recharts';

// Colores para los gráficos
const COLORS = ['#ff66cc', '#00ffff', '#00ff88', '#ffaa00', '#aa00ff', '#ff4444'];

// Gráfico de barras para tiempo por proyecto
export const ProjectTimeBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#2a2a2a] p-6 rounded-xl text-center">
        <p className="text-gray-400">No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-[#2a2a2a] p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Tiempo por Proyecto</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
          <XAxis 
            dataKey="name" 
            stroke="#ffffff" 
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#ffffff" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid #3a3a3a',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            formatter={(value) => [`${value} min`, 'Tiempo']}
          />
          <Bar dataKey="time" fill="#00ffff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Gráfico de pastel para distribución de tiempo
export const TimeDistributionPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#2a2a2a] p-6 rounded-xl text-center">
        <p className="text-gray-400">No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-[#2a2a2a] p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Distribución de Tiempo</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid #3a3a3a',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            formatter={(value) => [`${value} min`, 'Tiempo']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Gráfico de línea para tendencias de tiempo
export const TimeTrendLineChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#2a2a2a] p-6 rounded-xl text-center">
        <p className="text-gray-400">No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-[#2a2a2a] p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Tendencia de Tiempo</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
          <XAxis 
            dataKey="date" 
            stroke="#ffffff" 
            fontSize={12}
          />
          <YAxis stroke="#ffffff" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid #3a3a3a',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            formatter={(value) => [`${value} min`, 'Tiempo']}
          />
          <Line 
            type="monotone" 
            dataKey="time" 
            stroke="#00ffff" 
            strokeWidth={3}
            dot={{ fill: '#00ffff', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Gráfico de área para tiempo acumulado
export const CumulativeTimeAreaChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#2a2a2a] p-6 rounded-xl text-center">
        <p className="text-gray-400">No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-[#2a2a2a] p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Tiempo Acumulado</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
          <XAxis 
            dataKey="date" 
            stroke="#ffffff" 
            fontSize={12}
          />
          <YAxis stroke="#ffffff" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid #3a3a3a',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            formatter={(value) => [`${value} min`, 'Tiempo Acumulado']}
          />
          <Area 
            type="monotone" 
            dataKey="cumulative" 
            stroke="#00ffff" 
            fill="#00ffff" 
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Gráfico combinado para comparar proyectos
export const ProjectComparisonChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#2a2a2a] p-6 rounded-xl text-center">
        <p className="text-gray-400">No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-[#2a2a2a] p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Comparación de Proyectos</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
          <XAxis 
            dataKey="project" 
            stroke="#ffffff" 
            fontSize={12}
          />
          <YAxis stroke="#ffffff" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid #3a3a3a',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            formatter={(value, name) => [`${value} min`, name]}
          />
          <Legend />
          <Bar dataKey="time" fill="#00ffff" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="average" stroke="#ff66cc" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// Widget de estadísticas
export const StatsWidget = ({ title, value, subtitle, icon, color = "#00ffff" }) => {
  return (
    <div className="bg-[#2a2a2a] p-6 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <span style={{ color }} className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

// Widget de actividad reciente
export const RecentActivityWidget = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-[#2a2a2a] p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h3>
        <p className="text-gray-400 text-center">No hay actividad reciente</p>
      </div>
    );
  }

  return (
    <div className="bg-[#2a2a2a] p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h3>
      <div className="space-y-3">
        {activities.slice(0, 5).map((activity, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg">
            <div className={`w-2 h-2 rounded-full ${activity.type === 'entrada' ? 'bg-[#ff66cc]' : 'bg-[#00ffff]'}`}></div>
            <div className="flex-1">
              <p className="text-white text-sm">{activity.description}</p>
              <p className="text-gray-500 text-xs">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 