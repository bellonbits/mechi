import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Bell, Lock, Eye, Volume2, Globe, 
  ChevronRight, LogOut, ShieldCheck, Moon, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', action: () => navigate('/setup') },
        { icon: Bell, label: 'Push Notifications', type: 'toggle', value: notifications, setter: setNotifications },
        { icon: Lock, label: 'Privacy Settings', action: () => navigate('/privacy') },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Moon, label: 'Dark Mode', type: 'toggle', value: darkMode, setter: setDarkMode },
        { icon: Globe, label: 'Language', sub: 'English (US)', action: () => {} },
        { icon: Volume2, label: 'Sound & Haptics', action: () => {} },
      ]
    },
    {
      title: 'Security',
      items: [
        { icon: ShieldCheck, label: 'Two-Factor Auth', sub: 'Off', action: () => {} },
        { icon: Eye, label: 'Blocked Users', action: () => {} },
      ]
    }
  ];

  return (
    <div className="min-h-screen pb-nav-scroll app-bg overflow-y-auto">
      {/* Header */}
      <div className="pt-safe px-5 pb-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white text-xl font-black tracking-tight">Settings</h1>
      </div>

      <div className="px-5 space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest ml-4 mb-3">
              {section.title}
            </h3>
            <div className="rounded-[24px] overflow-hidden" style={{ background: '#1a0828', border: '1px solid rgba(156,39,176,0.15)' }}>
              {section.items.map((item, i) => (
                <div 
                  key={item.label}
                  className="relative"
                >
                  <button
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-4 px-5 text-left active:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5">
                        <item.icon size={18} className="text-brand-pink" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-[15px]">{item.label}</p>
                        {item.sub && <p className="text-slate-500 text-xs mt-0.5">{item.sub}</p>}
                      </div>
                    </div>

                    {item.type === 'toggle' ? (
                      <div 
                        onClick={(e) => { e.stopPropagation(); item.setter!(!item.value); }}
                        className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${item.value ? 'bg-brand-pink' : 'bg-white/10'}`}
                      >
                        <motion.div 
                          animate={{ x: item.value ? 20 : 0 }}
                          className="w-4 h-4 bg-white rounded-full shadow-lg"
                        />
                      </div>
                    ) : (
                      <ChevronRight size={16} className="text-slate-600" />
                    )}
                  </button>
                  {i < section.items.length - 1 && (
                    <div className="h-[1px] mx-5 bg-white/5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={() => navigate('/profile')}
          className="w-full py-4 rounded-[20px] font-bold text-red-400 flex items-center justify-center gap-2 mt-4"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <LogOut size={18} />
          Sign Out
        </button>

        <p className="text-center text-slate-600 text-[11px] font-medium tracking-wide uppercase">
          Mechi Version 1.0.0
        </p>
      </div>
    </div>
  );
};
