import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProjectRequest {
  id: number;
  discordNick: string;
  message: string | null;
  projectId: number;
  projectName: string;
}

interface NotificationsProps {
  requests: ProjectRequest[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}

export default function Notifications({
  requests,
  onAccept,
  onReject,
}: NotificationsProps) {
  return (
    <Popover>
      <PopoverTrigger className="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-panel light:hover:bg-slate-100">
        <Bell className="h-5 w-5 text-white light:text-black hover:text-black transition-colors" />
        {requests.length > 0 && (
          <Badge
            variant="default"
            className="absolute -top-1 -right-1 text-xs px-1.5 py-0"
          >
            {requests.length}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="center" side="bottom">
        <Card className="max-h-80 overflow-y-auto rounded-lg border-none shadow-none bg-black text-white">
          {requests.length === 0 ? (
            <div className="p-4 text-sm text-muted-action text-center">
              Brak powiadomień
            </div>
          ) : (
            <ul className="divide-y divide-panel-border">
              {requests.map((request) => (
                <li
                  key={request.id}
                  className="p-4 hover:bg-panel-border/50 transition"
                >
                  <div className="mb-1 text-sm">
                    <span className="font-medium">{request.discordNick}</span>{' '}
                    chce dołączyć do{' '}
                    <span className="font-medium">{request.projectName}</span>
                  </div>
                  <p className="text-xs text-muted-action leading-relaxed break-words">
                    {request.message || 'Brak wiadomości.'}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onAccept(request.id)}
                      className="rounded-lg px-3 py-1 text-xs font-bold bg-success/20 text-success hover:bg-success hover:text-white transition-colors"
                    >
                      Akceptuj
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(request.id)}
                      className="rounded-lg px-3 py-1 text-xs font-bold bg-danger/20 text-danger hover:bg-danger hover:text-white transition-colors"
                    >
                      Odrzuć
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </PopoverContent>
    </Popover>
  );
}
