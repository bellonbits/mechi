import { motion } from 'framer-motion';
import { 
  Bell, Heart, MessageSquare, Star, 
  ChevronRight, ArrowLeft, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, clearAll } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'match': return { icon: Heart, color: '#e91e8c', title: "It's a Match!" };
      case 'like': return { icon: Star, color: '#ffb300', title: 'Someone liked you' };
      case 'message': return { icon: MessageSquare, color: '#2196f3', title: 'New Message' };
      default: return { icon: Bell, color: '#94a3b8', title: 'Notification' };
    }
  };

  const getTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  const handleAction = (notif: any) => {
    markAsRead(notif.id);
    if (notif.type === 'match' || notif.type === 'message') {
      navigate('/chat');
    }
  };

  return (
    <div className="min-h-screen pb-nav-scroll app-bg overflow-y-auto">
      {/* Header */}
      <div className="pt-safe px-5 pb-4 flex items-center justify-between sticky top-0 bg-[#0d0614]/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 active:scale-95 transition-transform"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white text-xl font-black tracking-tight">Activity</h1>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={clearAll}
            className="text-slate-500 text-xs font-bold uppercase tracking-widest px-2 py-1 active:text-white"
          >
            Clear
          </button>
        )}
      </div>

      <div className="px-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="text-brand-pink animate-spin" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const { icon: Icon, color, title } = getIcon(notif.type);
              const isUnread = !notif.read_at;
              
              return (
                <motion.div
                  key={notif.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAction(notif)}
                  className="relative p-4 rounded-[22px] flex items-start gap-4 transition-all cursor-pointer"
                  style={{ 
                    background: isUnread ? 'rgba(233, 30, 140, 0.05)' : '#1a0828',
                    border: `1px solid ${isUnread ? 'rgba(233, 30, 140, 0.15)' : 'rgba(255,255,255,0.05)'}` 
                  }}
                >
                  {isUnread && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-pink shadow-[0_0_8px_#e91e8c]" />
                  )}
                  
                  <div className="relative shrink-0">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: `${color}22` }}
                    >
                      {notif.actor?.avatar_url ? (
                        <img src={notif.actor.avatar_url} className="w-full h-full object-cover rounded-2xl" alt="" />
                      ) : (
                        <Icon size={20} style={{ color }} />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1a0828] flex items-center justify-center" style={{ background: color }}>
                      <Icon size={10} className="text-white" />
                    </div>
                  </div>

                  <div className="flex-1 pr-2">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="text-white font-bold text-[15px]">{title}</h3>
                      <span className="text-slate-500 text-[10px] whitespace-nowrap">{getTime(notif.created_at)}</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-snug line-clamp-2">
                      {notif.actor?.full_name ? `${notif.actor.full_name}: ${notif.content}` : notif.content}
                    </p>
                  </div>

                  <div className="flex items-center self-center text-slate-700">
                    <ChevronRight size={18} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Bell size={32} className="text-slate-600" />
            </div>
            <h3 className="text-white font-black text-lg mb-2">No activity yet</h3>
            <p className="text-slate-500 text-sm max-w-[200px]">
              When people like you or you get a match, we'll notify you here!
            </p>
          </div>
        )}

        {/* Dynamic Tip */}
        <div className="mt-8 p-6 rounded-[28px] relative overflow-hidden" style={{ background: '#1a0828', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Heart size={80} className="text-brand-pink" />
          </div>
          <h4 className="text-white font-black mb-1 relative z-10">Safety First</h4>
          <p className="text-slate-400 text-xs leading-relaxed relative z-10">
            Never send money to someone you just met. Report suspicious profiles to help keep Mechi safe.
          </p>
          <button 
            onClick={() => navigate('/help-support')}
            className="mt-4 text-brand-pink font-bold text-xs uppercase tracking-widest flex items-center gap-1"
          >
            Learn More <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
