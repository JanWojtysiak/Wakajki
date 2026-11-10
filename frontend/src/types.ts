export interface Project {
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
  requestStatus: 'pending' | 'accepted' | 'rejected' | null;
}

export interface UserInfo {
  nick: string;
  discordAvatar?: string | null;
  projects: { id: number; name: string }[];
  joinedProjects?: { id: number; name: string }[];
}

export interface ProjectRequest {
  id: number;
  discordNick: string;
  message: string | null;
  projectId: number;
  projectName: string;
}

export interface ProjectFormValues {
  name: string;
  description: string;
  peopleNeeded: number;
  isOpen: boolean;
}
