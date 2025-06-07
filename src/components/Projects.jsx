import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([
    { id: 1, name: 'Proyecto A', description: 'Descripción del proyecto A', status: 'En progreso' },
    { id: 2, name: 'Proyecto B', description: 'Descripción del proyecto B', status: 'Completado' },
    { id: 3, name: 'Proyecto C', description: 'Descripción del proyecto C', status: 'Pendiente' },
  ]);

  const [newProject, setNewProject] = useState({ name: '', description: '', status: 'Pendiente' });
  const [isAddingProject, setIsAddingProject] = useState(false);

  const handleAddProject = () => {
    if (newProject.name.trim()) {
      setProjects([...projects, { ...newProject, id: Date.now() }]);
      setNewProject({ name: '', description: '', status: 'Pendiente' });
      setIsAddingProject(false);
    }
  };

  const handleDeleteProject = (id) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'En progreso':
        return 'text-[#00ffff]';
      case 'Completado':
        return 'text-[#00ff88]';
      case 'Pendiente':
        return 'text-[#ff66cc]';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="bg-[#1a1a1a] p-8 rounded-[20px] shadow-[0_0_25px_rgba(0,255,255,0.05)]">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl bg-gradient-to-r from-[#ff66cc] to-[#00ffff] bg-clip-text text-transparent">
              Gestión de Proyectos
            </h1>
            <button
              onClick={() => setIsAddingProject(true)}
              className="btn"
            >
              Nuevo Proyecto
            </button>
          </div>

          {isAddingProject && (
            <div className="bg-[#2a2a2a] p-6 rounded-xl mb-8">
              <h2 className="text-2xl text-[#00ffff] mb-4">Añadir Nuevo Proyecto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Nombre del proyecto"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="history-input"
                />
                <input
                  type="text"
                  placeholder="Descripción"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="history-input"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsAddingProject(false)}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddProject}
                  className="btn-success"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-[#2a2a2a] p-6 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-400 mb-4">{project.description}</p>
                <div className="flex justify-between items-center">
                  <span className={`${getStatusColor(project.status)} font-medium`}>
                    {project.status}
                  </span>
                  <button className="btn-edit">
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects; 