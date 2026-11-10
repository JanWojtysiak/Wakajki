import { useState } from 'react';
import DashboardAside from '@/components/DashboardAside';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardProjects from '@/components/DashboardProjects';
import ProjectFormModal from '@/components/ProjectFormModal';
import Welcome from '@/components/Welcome';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { Project } from '@/types';

export default function Dashboard() {
  const {
    projects,
    users,
    requests,
    joinedProjects,
    loading,
    isAuthenticated,
    saveProject,
    deleteProject,
    toggleJoin,
    sendRequest,
    answerRequest,
  } = useDashboardData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isMobileAsideOpen, setIsMobileAsideOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const openProjectModal = (project: Project | null) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  if (loading || isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Sprawdzanie autoryzacji...</p>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return <Welcome />;
  }

  return (
    <div
      className={`flex h-screen bg-app-bg text-white light:bg-slate-50 light:text-slate-900 overflow-hidden relative ${
        theme === 'light' ? 'light' : ''
      }`}
    >
      <div className="w-20 shrink-0 h-full hidden md:block"></div>

      {isMobileAsideOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          aria-hidden="true"
        />
      ) : null}

      <DashboardAside
        users={users}
        isMobileOpen={isMobileAsideOpen}
        onClose={() => setIsMobileAsideOpen(false)}
        isSidebarHovered={isSidebarHovered}
        setIsSidebarHovered={setIsSidebarHovered}
      />

      <div className="flex flex-1 flex-col h-screen min-w-0">
        <DashboardHeader
          theme={theme}
          toggleTheme={toggleTheme}
          isSidebarHovered={isSidebarHovered}
          isMobileAsideOpen={isMobileAsideOpen}
          onOpenMobileAside={() => setIsMobileAsideOpen(true)}
          onCreateProject={() => openProjectModal(null)}
          requests={requests}
          onAnswerRequest={answerRequest}
        />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white light:text-slate-900 font-inter mb-8">
              Tablica Projektów
            </h1>
            <DashboardProjects
              projects={projects}
              joinedProjects={joinedProjects}
              onToggleJoin={toggleJoin}
              onRequest={sendRequest}
              onEdit={openProjectModal}
              onDelete={deleteProject}
            />
            {isModalOpen && (
              <ProjectFormModal
                project={editingProject}
                onSubmit={(values) =>
                  saveProject(values, editingProject?.id ?? null)
                }
                onClose={() => setIsModalOpen(false)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
