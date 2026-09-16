import { useState, useEffect } from 'react';
import DashboardAside from './DashboardAside';
import DashboardProjects from './DashboardProjects';
import Welcome from './Welcome';

interface Project {
  id: number;
  name: string;
  description: string | null;
  peopleNeeded: number;
  peopleIn: number;
  participants?: string;
}

interface UserInfo {
  nick: string;
  discordAvatar?: string | null;
  projects: { id: number; name: string }[];
  joinedProjects?: { id: number; name: string }[];
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp(
      '(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)',
    ),
  );
  return match ? decodeURIComponent(match[1]) : null;
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

        const myNick = getCookie('myNick');
        if (myNick) {
          const joined = projData
            .filter((p) => {
              try {
                const participants: string[] = JSON.parse(
                  p.participants || '[]',
                );
                return participants.includes(myNick);
              } catch {
                return false;
              }
            })
            .map((p) => p.id);
          setJoinedProjects(joined);
        }
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

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="p-8 overflow-y-auto flex-1">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white font-inter">
                Tablica Projektów
              </h1>
              <button
                onClick={openCreateModal}
                className="bg-primary text-white px-5 py-2 rounded-md font-medium shadow-sm cursor-pointer"
              >
                + Nowy Projekt
              </button>
            </div>

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
                        className="px-4 py-2 border border-gray-300 rounded-md text-white  font-medium cursor-pointer"
                      >
                        Anuluj
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md font-medium cursor-pointer"
                      >
                        {editingProjectId ? 'Zapisz zmiany' : 'Utwórz'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
