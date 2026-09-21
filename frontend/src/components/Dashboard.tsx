import { useEffect, useState } from 'react';
import { CiSun } from 'react-icons/ci';
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
}

interface UserInfo {
  nick: string;
  discordAvatar?: string | null;
  projects: { id: number; name: string }[];
  joinedProjects?: { id: number; name: string }[];
}

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

function WeatherIcon() {
  return (
    <div>
      <CiSun size={32} color="white" />
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
  const [joinedProjects, setJoinedProjects] = useState<number[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

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
        body: JSON.stringify({ name, description, peopleNeeded }),
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
    <div className="flex h-screen bg-app-bg overflow-hidden relative">
      <div className="w-20 shrink-0 h-full hidden md:block"></div>

      <DashboardAside users={users} />

      <div className="flex flex-1 flex-col h-screen min-w-0">
        <header className="h-16 shrink-0 flex justify-between items-center px-8 border-b border-panel-border">
          <div className="flex gap-2 items-center">
            <WeatherIcon></WeatherIcon>
            <div className="text-xl font-bold text-white font-inter">
              Wakajki
            </div>
          </div>
          <div className="flex gap-7 items-center">
            <button
              onClick={openCreateModal}
              className="bg-primary text-white px-5 py-2 rounded-md font-medium shadow-sm cursor-pointer  transition-colors hover:text-black hover:bg-white"
            >
              + Nowy projekt
            </button>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <Notifications></Notifications>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white font-inter mb-8">
              Tablica Projektów
            </h1>
            <DashboardProjects
              projects={projects}
              joinedProjects={joinedProjects}
              onToggleJoin={handleToggleJoin}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
            {isModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-panel rounded-xl p-6 max-w-md w-full shadow-lg">
                  <h2 className="text-xl font-bold mb-4 text-white">
                    {editingProjectId
                      ? 'Edytuj projekt'
                      : 'Utwórz nowy projekt'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Nazwa projektu
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Np. Aplikacja do planowania wakacji"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Opis
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Opisz krótko, czego dotyczy projekt"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500 text-white"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
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
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500 text-white"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-white  font-medium cursor-pointer  transition-colors hover:text-black hover:bg-white"
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
