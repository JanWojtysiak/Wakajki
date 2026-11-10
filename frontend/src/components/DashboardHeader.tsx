import { CiSun } from 'react-icons/ci';
import { FiMenu } from 'react-icons/fi';
import Notifications from '@/components/Notifications';
import type { ProjectRequest } from '@/types';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

interface DashboardHeaderProps extends ThemeToggleProps {
  isSidebarHovered: boolean;
  isMobileAsideOpen: boolean;
  onOpenMobileAside: () => void;
  onCreateProject: () => void;
  requests: ProjectRequest[];
  onAnswerRequest: (id: number, action: 'accept' | 'reject') => void;
}

function WeatherIcon() {
  return (
    <div>
      <CiSun
        size={32}
        className="text-white light:text-amber-500 light:drop-shadow-sm"
      />
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

export default function DashboardHeader({
  theme,
  toggleTheme,
  isSidebarHovered,
  isMobileAsideOpen,
  onOpenMobileAside,
  onCreateProject,
  requests,
  onAnswerRequest,
}: DashboardHeaderProps) {
  return (
    <header className="h-16 shrink-0 flex justify-between items-center px-8 border-b border-panel-border light:border-slate-200">
      <div
        className={`flex gap-2 items-center md:transition-transform md:duration-300 md:ease-in-out ${
          isSidebarHovered ? 'md:translate-x-52' : 'md:translate-x-0'
        }`}
      >
        <WeatherIcon />
        <button
          type="button"
          className="md:hidden rounded-lg border border-panel-border p-2 text-white light:border-slate-300 light:text-slate-900 transition-colors hover:text-muted-action"
          aria-label="Otwórz listę użytkowników"
          aria-controls="dashboard-users-drawer"
          aria-expanded={isMobileAsideOpen}
          onClick={onOpenMobileAside}
        >
          <FiMenu size={20} aria-hidden="true" />
        </button>
        <div className="hidden lg:block text-xl font-bold text-white light:text-slate-900 font-inter">
          Wakajki
        </div>
      </div>
      <div className="flex gap-2 md:gap-7 items-center">
        <button
          onClick={onCreateProject}
          className="md:bg-primary text-white light:text-slate-900 md:light:text-white px-3 py-1 md:px-5 md:py-2 rounded-md border border-panel-border light:border-slate-300 md:border-0 font-medium shadow-sm md:cursor-pointer  transition-colors md:hover:text-black md:hover:bg-white"
        >
          +<span className="hidden md:inline"> Nowy projekt</span>
        </button>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <Notifications
          requests={requests}
          onAccept={(id) => onAnswerRequest(id, 'accept')}
          onReject={(id) => onAnswerRequest(id, 'reject')}
        />
      </div>
    </header>
  );
}
