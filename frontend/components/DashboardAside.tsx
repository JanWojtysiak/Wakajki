import { useState } from 'react';

interface UserInfo {
  nick: string;
  discordAvatar?: string | null;
  projects: { id: number; name: string }[];
  joinedProjects?: { id: number; name: string }[];
}

interface DashboardAsideProps {
  users: UserInfo[];
}

export default function DashboardAside({ users }: DashboardAsideProps) {
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(
    null,
  );

  return (
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

        <ul className="space-y-2 mt-2 ">
          {users.map((user, index) => (
            <li
              key={index}
              onClick={() =>
                setSelectedUserIndex(
                  selectedUserIndex === index ? null : index,
                )
              }
              className="relative cursor-pointer bg-transparent hover:bg-slate-800 rounded-lg transition-colors overflow-hidden"
            >
              <div
                className={`flex items-center p-2 ${
                  isSidebarHovered ? 'justify-start' : 'justify-center'
                }`}
              >
                <div className="w-10 h-10 shrink-0 bg-discord text-white rounded-full flex items-center justify-center font-bold shadow-sm overflow-hidden border border-slate-700">
                  {user.discordAvatar ? (
                    <img
                      src={user.discordAvatar}
                      alt={user.nick}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.nick.charAt(0).toUpperCase()
                  )}
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
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  selectedUserIndex === index
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                } ${isSidebarHovered ? 'block' : 'hidden'}`}
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
  );
}
