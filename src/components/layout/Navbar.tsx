import { Home, Compass, Heart, MessageCircle, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { label: 'Home', icon: Home, path: '/swipe' },
  { label: 'Explore', icon: Compass, path: '/explore' },
  { label: 'Likes', icon: Heart, path: '/likes' },
  { label: 'Chats', icon: MessageCircle, path: '/chat' },
  { label: 'Profile', icon: User, path: '/profile' },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-start"
      style={{
        background: '#1a0828',
        borderTop: '1px solid rgba(156, 39, 176, 0.2)',
        paddingTop: 10,
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
      }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center gap-[3px] min-w-[56px] transition-all duration-200 active:scale-[0.88]"
          >
            <tab.icon
              size={22}
              className={`transition-colors duration-200 ${
                isActive ? 'text-brand-pink fill-current' : 'text-slate-500'
              }`}
            />
            <span
              className={`text-[10px] font-semibold tracking-wide transition-colors duration-200 ${
                isActive ? 'text-brand-pink' : 'text-slate-500'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
