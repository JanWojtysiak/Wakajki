import { useState } from 'react';

interface Project {
  id: number;
  name: string;
  description: string | null;
  peopleNeeded: number;
  peopleIn: number;
  participants?: string;
  isJoined: boolean;
  ownerNick: string | null;
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
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="relative bg-panel p-6 rounded-xl shadow-sm border-4 border-panel-border hover:shadow-md transition-shadow flex flex-col justify-between min-h-56"
          >
            <div>
              <h2 className="text-xl font-bold text-white pr-12">
                {project.name}
              </h2>
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
              <button
                type="button"
                onClick={() => setPreviewProject(project)}
                className="right-4 bottom-4 h-12 w-12 rounded-2xl bg-discord/20 border border-discord/40 text-discord hover:bg-discord hover:text-white transition-colors flex items-center justify-center shadow-lg"
                aria-label={`Podgląd projektu ${project.name}`}
              >
                <span className="text-2xl leading-none">→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[40vw] max-h-[90vh] overflow-y-auto rounded-3xl border-4 border-panel-border bg-panel p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-widest text-muted-action">
                  Podgląd projektu
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white">
                  {previewProject.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProject(null)}
                className="rounded-full px-3 py-1 text-xl text-muted-action hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Zamknij podgląd projektu"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div className="rounded-2xl bg-black/20 border border-white/10 p-5 min-h-[130px]">
                <p className="text-sm font-semibold text-gray-400">Opis</p>
                <p className="mt-2 max-h-60 overflow-y-auto pr-2 text-gray-200 leading-relaxed break-words">
                  {previewProject.description || 'Brak opisu.'}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-black/20 border border-white/10 p-5">
                  <p className="text-sm font-semibold text-gray-400">
                    Właściciel
                  </p>
                  <p className="mt-2 text-lg font-bold text-white">
                    {previewProject.ownerNick || 'Nieznany'}
                  </p>
                </div>
                <div className="rounded-2xl bg-black/20 border border-white/10 p-5">
                  <p className="text-sm font-semibold text-gray-400">
                    Uczestnicy
                  </p>
                  <p className="mt-2 text-lg font-bold text-white">
                    {previewProject.peopleIn} / {previewProject.peopleNeeded}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => onToggleJoin(previewProject)}
                className={`rounded-xl px-5 py-3 text-sm font-bold transition-colors ${
                  joinedProjects.includes(previewProject.id)
                    ? 'bg-warning/20 text-warning hover:bg-warning hover:text-white'
                    : 'bg-success/20 text-success hover:bg-success hover:text-white'
                }`}
              >
                {joinedProjects.includes(previewProject.id)
                  ? 'Opuść'
                  : 'Dołącz'}
              </button>
              <button
                type="button"
                onClick={() => onEdit(previewProject)}
                className="rounded-xl bg-discord/20 px-5 py-3 text-sm font-bold text-discord hover:bg-discord hover:text-white transition-colors"
              >
                Edytuj
              </button>
              <button
                type="button"
                onClick={() => onDelete(previewProject.id)}
                className="rounded-xl bg-danger/20 px-5 py-3 text-sm font-bold text-danger hover:bg-danger hover:text-white transition-colors"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
