import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Type definition for reusability
interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
}

interface NotificationsProps {
  items?: NotificationItem[];
}
const defaultNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Welcome 🎉',
    description: 'Thanks for checking out the notifications component!',
    time: 'just now',
  },
  {
    id: '2',
    title: 'System Update',
    description: 'We’ve rolled out a new feature for you.',
    time: '1h ago',
  },
  {
    id: '3',
    title: 'Reminder',
    description: 'Don’t forget to finish your profile setup.',
    time: '3h ago',
  },
];

export default function Notifications({
  items = defaultNotifications,
}: NotificationsProps) {
  return (
    <Popover>
      <PopoverTrigger className="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-panel">
        <Bell className="h-5 w-5 text-white hover:text-black transition-colors" />
        {items.length > 0 && (
          <Badge
            variant="default"
            className="absolute -top-1 -right-1 text-xs px-1.5 py-0"
          >
            {items.length}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="center" side="bottom">
        <Card className="max-h-80 overflow-y-auto rounded-lg border-none shadow-none bg-black text-white">
          {items.length === 0 ? (
            <div className="p-4 text-sm text-muted-action text-center">
              No notifications
            </div>
          ) : (
            <ul className="divide-y divide-panel-border">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="p-4 hover:bg-panel-border/50 transition"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">{item.title}</span>
                    <span className="text-xs text-muted-action">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-action leading-relaxed">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </PopoverContent>
    </Popover>
  );
}

// Example usage
// <Notifications
//   items={[
//     { id: "1", title: "New Message", description: "You have a new message from John.", time: "2h ago" },
//     { id: "2", title: "System Alert", description: "Server downtime scheduled at midnight.", time: "5h ago" },
//     { id: "3", title: "Meeting Reminder", description: "Project sync meeting at 3 PM.", time: "1d ago" },
//   ]}
// />
