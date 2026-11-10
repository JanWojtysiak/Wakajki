import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type {
  Project,
  ProjectFormValues,
  ProjectRequest,
  UserInfo,
} from '@/types';

const API_URL = 'http://localhost:3000';

async function postOrThrow(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    ...init,
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || 'Wystąpił błąd');
  }
}

function withAlert<Args extends unknown[]>(
  action: (...args: Args) => Promise<void>,
) {
  return async (...args: Args) => {
    try {
      await action(...args);
    } catch (err: any) {
      alert(err.message);
    }
  };
}

export function useDashboardData() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const refresh = async () => {
    try {
      const resProjects = await fetch(`${API_URL}/projects`, {
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

      const resUsers = await fetch(`${API_URL}/projects/users`, {
        credentials: 'include',
      });

      if (resUsers.ok) {
        const userData: UserInfo[] = await resUsers.json();
        setUsers(userData);
      }

      const resRequests = await fetch(`${API_URL}/projects/requests`, {
        credentials: 'include',
      });

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
    refresh();

    const socket = io(API_URL, {
      withCredentials: true,
    });

    socket.on('projectsUpdated', () => {
      refresh();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const saveProject = async (
    values: ProjectFormValues,
    editingProjectId: number | null,
  ) => {
    const { name, description, peopleNeeded, isOpen } = values;
    const res = await fetch(
      editingProjectId
        ? `${API_URL}/projects/${editingProjectId}`
        : `${API_URL}/projects`,
      {
        method: editingProjectId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(
          editingProjectId
            ? { name, description, peopleNeeded }
            : { name, description, peopleNeeded, isOpen },
        ),
      },
    );

    if (!res.ok) throw new Error('Nie udało się zapisać projektu');

    refresh();
  };

  const deleteProject = withAlert(async (id: number) => {
    if (!confirm('Czy na pewno chcesz usunąć ten projekt?')) return;

    const res = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Nie udało się usunąć projektu');

    refresh();
  });

  const toggleJoin = withAlert(async (project: Project) => {
    const isJoined = joinedProjects.includes(project.id);

    await postOrThrow(
      `/projects/${project.id}/${isJoined ? 'leave' : 'join'}`,
    );

    if (isJoined) {
      setJoinedProjects(joinedProjects.filter((id) => id !== project.id));
    } else {
      setJoinedProjects([...joinedProjects, project.id]);
    }

    refresh();
  });

  const sendRequest = withAlert(async (project: Project, message: string) => {
    await postOrThrow(`/projects/${project.id}/request`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    refresh();
  });

  const answerRequest = withAlert(
    async (id: number, action: 'accept' | 'reject') => {
      await postOrThrow(`/projects/requests/${id}/${action}`);

      refresh();
    },
  );

  return {
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
  };
}
