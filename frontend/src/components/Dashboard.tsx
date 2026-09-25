import { useEffect, useState } from 'react';
import type * as React from 'react';
import { CiSun } from 'react-icons/ci';
import { FiMenu } from 'react-icons/fi';
import DashboardAside from '@/components/DashboardAside';
import DashboardProjects from '@/components/DashboardProjects';
import Welcome from '@/components/Welcome';
import Notifications from '@/components/Notifications';

interface Project {
  id: number;
  name: string;
  description: string | null;
  peopleNeeded: number;
  peopleIn: number;
  participants?: string;
  isJoined: boolean;
  ownerNick: string | null;
  isOwner: boolean;
  isOpen: boolean;
  hasRequested: boolean;
}

interface UserInfo {
  nick: string;
  discordAvatar?: string | null;
  projects: { id: number; name: string }[];
  joinedProjects?: { id: number; name: string }[];
}

interface ProjectRequest {
  id: number;
  discordNick: string;
  message: string | null;
  projectId: number;
  projectName: string;
}

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

function WeatherIcon() {
  return (
    <div>
      <CiSun size={32} className="text-white light:text-amber-500 light:drop-shadow-sm" />
    </div>
  );
}

function ThemeToggle({ theme, toggleTheme }: ThemeToggleProps) {
  return (
    <button type="button" onClick={toggleTheme} aria-label="Switch theme">
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [peopleNeeded, setPeopleNeeded] = useState(2);
  const [isOpen, setIsOpen] = useState(true);
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<number[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isMobileAsideOpen, setIsMobileAsideOpen] = useState(false);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const checkAuthAndFetchData = async () => {
    try {
      const resProjects = await fetch('http://localhost:3000/projects', {
        credentials: 'include',
      });

      if (resProjects.status === 401) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      if (resProjects.ok) {
        const projData: Project[] = await resProjects.json();
        setProjects(projData);
        setIsAuthenticated(true);
        setJoinedProjects(
          projData.filter((project) => project.isJoined).map((p) => p.id),
        );
      }

      const resUsers = await fetch('http://localhost:3000/projects/users', {
        credentials: 'include',
      });

      if (resUsers.ok) {
        const userData: UserInfo[] = await resUsers.json();
        setUsers(userData);
      }

      const resRequests = await fetch(
        'http://localhost:3000/projects/requests',
        { credentials: 'include' },
      );

      if (resRequests.ok) {
        const requestData: ProjectRequest[] = await resRequests.json();
        setRequests(requestData);
      }
    } catch (err) {
      console.error('Błąd połączenia z backendem', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProjectId(null);
    setName('');
    setDescription('');
    setPeopleNeeded(2);
    setIsOpen(true);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProjectId(project.id);
    setName(project.name);
    setDescription(project.description || '');
    setPeopleNeeded(project.peopleNeeded);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProjectId
        ? `http://localhost:3000/projects/${editingProjectId}`
        : 'http://localhost:3000/projects';

      const method = editingProjectId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(
          editingProjectId
            ? { name, description, peopleNeeded }
            : { name, description, peopleNeeded, isOpen },
        ),
      });

      if (!res.ok) throw new Error('Nie udało się zapisać projektu');

      setIsModalOpen(false);
      checkAuthAndFetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Czy na pewno chcesz usunąć ten projekt?')) return;

    try {
      const res = await fetch(`http://localhost:3000/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Nie udało się usunąć projektu');

      checkAuthAndFetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleJoin = async (project: Project) => {
    const isJoined = joinedProjects.includes(project.id);
    const endpoint = isJoined ? 'leave' : 'join';

    try {
      const res = await fetch(
        `http://localhost:3000/projects/${project.id}/${endpoint}`,
        {
          method: 'POST',
          credentials: 'include',
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Wystąpił błąd');
      }

      if (isJoined) {
        setJoinedProjects(joinedProjects.filter((id) => id !== project.id));
      } else {
        setJoinedProjects([...joinedProjects, project.id]);
      }

      checkAuthAndFetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRequest = async (project: Project, message: string) => {
    try {
      const res = await fetch(
        `http://localhost:3000/projects/${project.id}/request`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ message }),
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Wystąpił błąd');
      }

      checkAuthAndFetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAnswerRequest = async (id: number, action: 'accept' | 'reject') => {
    try {
      const res = await fetch(
        `http://localhost:3000/projects/requests/${id}/${action}`,
        {
          method: 'POST',
          credentials: 'include',
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Wystąpił błąd');
      }

      checkAuthAndFetchData();
    } catch (err: any) {
      alert(err.message);
    }
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
      />

      <div className="flex flex-1 flex-col h-screen min-w-0">
        <header className="h-16 shrink-0 flex justify-between items-center px-8 border-b border-panel-border light:border-slate-200">
          <div className="flex gap-2 items-center">
            <WeatherIcon></WeatherIcon>
            <button
              type="button"
              className="md:hidden rounded-lg border border-panel-border p-2 text-white light:border-slate-300 light:text-slate-900 transition-colors hover:text-muted-action"
              aria-label="Otwórz listę użytkowników"
              aria-controls="dashboard-users-drawer"
              aria-expanded={isMobileAsideOpen}
              onClick={() => setIsMobileAsideOpen(true)}
            >
              <FiMenu size={20} aria-hidden="true" />
            </button>
            <div className="hidden lg:block text-xl font-bold text-white light:text-slate-900 font-inter">
              Wakajki
            </div>
          </div>
          <div className="flex gap-2 md:gap-7 items-center">
            <button
              onClick={openCreateModal}
              className="md:bg-primary text-white light:text-slate-900 md:light:text-white px-3 py-1 md:px-5 md:py-2 rounded-md border border-panel-border light:border-slate-300 md:border-0 font-medium shadow-sm md:cursor-pointer  transition-colors md:hover:text-black md:hover:bg-white"
            >
              +<span className="hidden md:inline"> Nowy projekt</span>
            </button>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <Notifications
              requests={requests}
              onAccept={(id) => handleAnswerRequest(id, 'accept')}
              onReject={(id) => handleAnswerRequest(id, 'reject')}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white light:text-slate-900 font-inter mb-8">
              Tablica Projektów
            </h1>
            <DashboardProjects
              projects={projects}
              joinedProjects={joinedProjects}
              onToggleJoin={handleToggleJoin}
              onRequest={handleRequest}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
            {isModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-panel light:bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
                  <h2 className="text-xl font-bold mb-4 text-white light:text-slate-900">
                    {editingProjectId
                      ? 'Edytuj projekt'
                      : 'Utwórz nowy projekt'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white light:text-slate-900 mb-1">
                        Nazwa projektu
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Np. Aplikacja do planowania wakacji"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500 text-white light:bg-white light:text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white light:text-slate-900 mb-1">
                        Opis
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Opisz krótko, czego dotyczy projekt"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500 text-white light:bg-white light:text-slate-900"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white light:text-slate-900 mb-1">
                        Potrzebne osoby
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={peopleNeeded}
                        onChange={(e) =>
                          setPeopleNeeded(Number(e.target.value))
                        }
                        placeholder="Np. 4"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500 text-white light:bg-white light:text-slate-900"
                      />
                    </div>
                    {!editingProjectId && (
                      <div>
                        <label className="block text-sm font-medium text-white light:text-slate-900 mb-1">
                          Dołączanie
                        </label>
                        <div className="flex gap-4 text-white light:text-slate-900">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={isOpen}
                              onChange={() => setIsOpen(true)}
                            />
                            Otwarty
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={!isOpen}
                              onChange={() => setIsOpen(false)}
                            />
                            Na prośbę
                          </label>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-white light:text-slate-900  font-medium cursor-pointer  transition-colors hover:text-black hover:bg-white"
                      >
                        Anuluj
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md font-medium cursor-pointer transition-colors hover:text-black hover:bg-white"
                      >
                        {editingProjectId ? 'Zapisz zmiany' : 'Utwórz'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
