import { useState, useEffect } from 'react';

interface Project {
  id: number;
  name: string;
  description: string | null;
  peopleNeeded: number;
  peopleIn: number;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

        const data = await res.json();
        setProjects(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tablica Projektów
          </h1>
          <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-medium shadow-sm transition-colors">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    Ekipa:{' '}
                    <span className="text-blue-600 font-bold">
                      {project.peopleIn}
                    </span>{' '}
                    / {project.peopleNeeded}
                  </span>
                  <button className="text-sm text-blue-600 font-medium hover:underline">
                    Edytuj
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
