import { Home, BookOpen, MessageCircle, Target, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/tutor', icon: MessageCircle, label: 'Ask Doubt' },
  { to: '/practice', icon: Target, label: 'Practice' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[60px]",
                active && "bg-indigo-50"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-all",
                active && "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/30"
              )}>
                <item.icon className={cn(
                  'h-5 w-5 transition-colors',
                  active ? 'text-white' : 'text-muted-foreground'
                )} />
              </div>
              <span className={cn(
                'text-[10px] font-medium transition-colors',
                active ? 'text-indigo-600' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
