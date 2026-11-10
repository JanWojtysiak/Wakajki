import { useState } from 'react';
import type * as React from 'react';
import type { Project, ProjectFormValues } from '@/types';

interface ProjectFormModalProps {
  project: Project | null;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  onClose: () => void;
}

const labelClass =
  'block text-sm font-medium text-white light:text-slate-900 mb-1';
const inputClass =
  'w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500 text-white light:bg-white light:text-slate-900';

export default function ProjectFormModal({
  project,
  onSubmit,
  onClose,
}: ProjectFormModalProps) {
  const isEditing = project !== null;
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description || '');
  const [peopleNeeded, setPeopleNeeded] = useState(project?.peopleNeeded ?? 2);
  const [isOpen, setIsOpen] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({ name, description, peopleNeeded, isOpen });
      onClose();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-panel light:bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white light:text-slate-900">
          {isEditing ? 'Edytuj projekt' : 'Utwórz nowy projekt'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nazwa projektu</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Np. Aplikacja do planowania wakacji"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Opis</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opisz krótko, czego dotyczy projekt"
              className={inputClass}
              rows={3}
            />
          </div>
          <div>
            <label className={labelClass}>Potrzebne osoby</label>
            <input
              type="number"
              min={1}
              value={peopleNeeded}
              onChange={(e) => setPeopleNeeded(Number(e.target.value))}
              placeholder="Np. 4"
              className={inputClass}
            />
          </div>
          {!isEditing && (
            <div>
              <label className={labelClass}>Dołączanie</label>
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
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-white light:text-slate-900  font-medium cursor-pointer  transition-colors hover:text-black hover:bg-white"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md font-medium cursor-pointer transition-colors hover:text-black hover:bg-white"
            >
              {isEditing ? 'Zapisz zmiany' : 'Utwórz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
