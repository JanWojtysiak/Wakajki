interface Project {
  id: number;
  name: string;
  description: string | null;
  peopleNeeded: number;
  peopleIn: number;
  participants?: string;
}

interface DashboardProjectsProps {
  projects: Project[];
  joinedProjects: number[];
  onToggleJoin: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
}

export default function DashboardProjects({
  projects,
  joinedProjects,
  onToggleJoin,
  onEdit,
  onDelete,
}: DashboardProjectsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-panel p-6 rounded-xl shadow-sm border-4 border-panel-border hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <h2 className="text-xl font-bold text-white">{project.name}</h2>
            <p className="text-gray-300 mt-3 line-clamp-3">
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
                onClick={() => onToggleJoin(project)}
                className={`text-sm font-medium transition-colors ${
                  joinedProjects.includes(project.id)
                    ? 'text-muted-action hover:text-warning'
                    : 'text-muted-action hover:text-success'
                }`}
              >
                {joinedProjects.includes(project.id) ? 'Opuść' : 'Dołącz'}
              </button>
              <button
                onClick={() => onEdit(project)}
                className="text-sm text-muted-action hover:text-discord font-medium transition-colors"
              >
                Edytuj
              </button>
              <button
                onClick={() => onDelete(project.id)}
                className="text-sm font-medium text-muted-action hover:text-danger transition-colors"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
