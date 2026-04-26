import { motion } from 'framer-motion';
import { 
  Bell, Heart, MessageSquare, Star, 
  ChevronRight, Trash2, ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage = () => {
  const navigate = useNavigate();

  // Mock notifications for UI demonstration
  const notifications = [
    {
      id: 1,
      type: 'match',
      title: 'It\'s a Match!',
      desc: 'You and Sarah just matched. Say hi!',
      time: '2m ago',
      icon: Heart,
      color: '#e91e8c',
      unread: true
    },
    {
      id: 2,
      type: 'like',
      title: 'Someone liked you',
      desc: 'A new person has liked your profile.',
      time: '1h ago',
      icon: Star,
      color: '#ffb300',
      unread: true
    },
    {
      id: 3,
      type: 'message',
      title: 'New Message',
      desc: 'David sent you a photo.',
      time: '3h ago',
      icon: MessageSquare,
      color: '#2196f3',
      unread: false
    }
  ];

  return (
    <div className="min-h-screen pb-nav-scroll app-bg overflow-y-auto">
      {/* Header */}
      <div className="pt-safe px-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white text-xl font-black tracking-tight">Activity</h1>
        </div>
        <button className="text-slate-500 text-xs font-bold uppercase tracking-widest px-2 py-1">
          Clear
        </button>
      </div>

      <div className="px-5">
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                whileTap={{ scale: 0.98 }}
                className="relative p-4 rounded-[22px] flex items-start gap-4 transition-all"
                style={{ 
                  background: notif.unread ? 'rgba(233, 30, 140, 0.05)' : '#1a0828',
                  border: `1px solid ${notif.unread ? 'rgba(233, 30, 140, 0.15)' : 'rgba(255,255,255,0.05)'}` 
                }}
              >
                {notif.unread && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-pink" />
                )}
                
                <div 
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${notif.color}1a` }}
                >
                  <notif.icon size={20} style={{ color: notif.color }} />
                </div>

                <div className="flex-1 pr-4">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="text-white font-bold text-[15px]">{notif.title}</h3>
                    <span className="text-slate-500 text-[10px] whitespace-nowrap">{notif.time}</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-snug line-clamp-2">
                    {notif.desc}
                  </p>
                </div>

                <div className="flex items-center self-center">
                  <ChevronRight size={16} className="text-slate-700" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Bell size={32} className="text-slate-600" />
            </div>
            <h3 className="text-white font-black text-lg mb-2">No notifications yet</h3>
            <p className="text-slate-500 text-sm max-w-[200px]">
              When you get matches or likes, they'll show up here.
            </p>
          </div>
        )}

        {/* Suggestion Card */}
        <div className="mt-8 p-6 rounded-[28px] relative overflow-hidden" style={{ background: '#1a0828' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Heart size={80} className="text-brand-pink" />
          </div>
          <h4 className="text-white font-black mb-1 relative z-10">Matching Tip</h4>
          <p className="text-slate-400 text-xs leading-relaxed relative z-10">
            Profiles with more than 3 photos get 70% more matches on Mechi.
          </p>
          <button 
            onClick={() => navigate('/setup')}
            className="mt-4 text-brand-pink font-bold text-xs uppercase tracking-widest flex items-center gap-1"
          >
            Add Photos <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
