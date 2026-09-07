import { useState, useEffect } from 'react';

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
  projects: { id: number; name: string }[];
  joinedProjects?: { id: number; name: string }[];
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [peopleNeeded, setPeopleNeeded] = useState(2);
  const [joinedProjects, setJoinedProjects] = useState<number[]>([]);

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3000/projects/users', {
        credentials: 'include',
      });
      if (res.ok) {
        const data: UserInfo[] = await res.json();
        setUsers(data);

        if (data.length > 0) {
          const currentUser = data[0];
          if (currentUser && currentUser.joinedProjects) {
            const joinedIds = currentUser.joinedProjects.map((p) => p.id);
            setJoinedProjects(joinedIds);
          }
        }
      }
    } catch (err) {
      console.error('Błąd pobierania użytkowników', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:3000/projects', {
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401)
          throw new Error('Nie jesteś zalogowany (brak ciastka).');
        throw new Error('Wystąpił błąd podczas pobierania projektów.');
      }

      const data: Project[] = await res.json();
      setProjects(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
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
      fetchProjects();
      fetchUsers();
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

      fetchProjects();
      fetchUsers();
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

      fetchProjects();
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      <div className="w-20 shrink-0 h-full hidden md:block"></div>

      <aside
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`bg-slate-900 text-white transition-all duration-300 ease-in-out absolute left-0 top-0 h-full z-40 flex flex-col shadow-2xl ${
          isSidebarHovered ? 'w-72' : 'w-20'
        }`}
      >
        <div className="p-4 h-full overflow-y-auto no-scrollbar">
          <h2
            className={`font-bold mb-6 border-b border-slate-700 pb-2 text-slate-100 whitespace-nowrap transition-all duration-300 ${
              isSidebarHovered
                ? 'text-xl opacity-100'
                : 'text-[0px] opacity-0 border-transparent m-0 p-0'
            }`}
          >
            Użytkownicy serwera
          </h2>

          <ul className="space-y-2 mt-2">
            {users.map((user, index) => (
              <li
                key={index}
                className="relative group cursor-pointer bg-transparent hover:bg-slate-800 rounded-lg transition-colors overflow-hidden"
              >
                <div className="flex items-center p-2">
                  <div className="w-10 h-10 shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                    {user.nick.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`font-medium text-slate-300 whitespace-nowrap transition-all duration-300 ${
                      isSidebarHovered
                        ? 'ml-3 opacity-100 w-auto'
                        : 'ml-0 opacity-0 w-0'
                    }`}
                  >
                    {user.nick}
                  </span>
                </div>

                <div
                  className={`transition-all duration-500 ease-in-out max-h-0 opacity-0 group-hover:max-h-96 group-hover:opacity-100 ${
                    isSidebarHovered ? 'block' : 'hidden'
                  }`}
                >
                  <div className="p-4 pt-0 text-sm">
                    <div className="mb-3">
                      <p className="font-bold text-blue-400 mb-1 border-b border-slate-600 pb-1 text-xs uppercase tracking-wider">
                        Twórca projektów:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {user.projects && user.projects.length > 0 ? (
                          user.projects.map((p) => (
                            <li
                              key={`created-${p.id}`}
                              className="truncate text-slate-200"
                            >
                              {p.name}
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400 italic list-none">
                            Brak
                          </li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <p className="font-bold text-green-400 mb-1 border-b border-slate-600 pb-1 text-xs uppercase tracking-wider">
                        Bierze udział w:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {user.joinedProjects &&
                        user.joinedProjects.length > 0 ? (
                          user.joinedProjects.map((p) => (
                            <li
                              key={`joined-${p.id}`}
                              className="truncate text-slate-200"
                            >
                              {p.name}
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400 italic list-none">
                            Brak
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="p-8 overflow-y-auto flex-1">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Tablica Projektów
              </h1>
              <button
                onClick={openCreateModal}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-medium shadow-sm transition-colors"
              >
                + Nowy Projekt
              </button>
            </div>

            {error ? (
              <p className="text-red-600 text-center text-lg mt-12">{error}</p>
            ) : loading ? (
              <p className="text-gray-500 text-center text-lg mt-12">
                Ładowanie projektów...
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {project.name}
                      </h2>
                      <p className="text-gray-600 mt-3 line-clamp-3">
                        {project.description || 'Brak opisu.'}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        Osoby:{' '}
                        <span className="text-blue-600 font-bold">
                          {project.peopleIn}
                        </span>{' '}
                        / {project.peopleNeeded}
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleToggleJoin(project)}
                          className={`text-sm font-medium hover:underline ${
                            joinedProjects.includes(project.id)
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          {joinedProjects.includes(project.id)
                            ? 'Opuść'
                            : 'Dołącz'}
                        </button>
                        <button
                          onClick={() => openEditModal(project)}
                          className="text-sm text-blue-600 font-medium hover:underline"
                        >
                          Edytuj
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-sm text-red-600 font-medium hover:underline"
                        >
                          Usuń
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
                  <h2 className="text-xl font-bold mb-4 text-gray-900">
                    {editingProjectId
                      ? 'Edytuj projekt'
                      : 'Utwórz nowy projekt'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nazwa projektu
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opis
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Potrzebne osoby
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={peopleNeeded}
                        onChange={(e) =>
                          setPeopleNeeded(Number(e.target.value))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                      >
                        Anuluj
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
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
