import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Crown, Shield, Search, Filter, MoreVertical, CheckCircle, TrendingUp, BarChart3, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/useAuthStore';
import type { Profile } from '../hooks/useProfiles';

interface Analytics {
  total_users: number;
  total_matches: number;
  premium_users: number;
  total_swipes: number;
}

export const AdminPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!profile?.is_admin) {
      navigate('/explore');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      
      // Fetch Analytics
      const { data: analyticsData } = await supabase.from('admin_analytics').select('*').single();
      if (analyticsData) setAnalytics(analyticsData);

      // Fetch Users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (usersData) setUsers(usersData as Profile[]);
      
      setLoading(false);
    };

    fetchData();
  }, [profile, navigate]);

  const toggleVerify = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: !currentStatus })
      .eq('id', userId);
    
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: !currentStatus } : u));
    }
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_premium: !currentStatus })
      .eq('id', userId);
    
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_premium: !currentStatus } : u));
    }
  };

  if (!profile?.is_admin) return null;

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.includes(searchTerm)
  );

  return (
    <div className="min-h-screen pb-nav-scroll app-bg flex flex-col relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-pink/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-purple/5 blur-[120px] rounded-full -z-10" />

      {/* Header */}
      <div className="pt-safe px-6 pb-6 border-b border-white/5 backdrop-blur-md sticky top-0 z-20 bg-app-bg/80">
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div>
              <h1 className="text-white text-2xl font-black tracking-tight">Admin Console</h1>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-1 flex items-center gap-2">
                <Shield size={12} className="text-brand-pink" /> 
                System Oversight
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-brand-pink/10 border border-brand-pink/20 text-brand-pink text-[10px] font-black uppercase">
              Live
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Total Users', value: analytics?.total_users || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Total Matches', value: analytics?.total_matches || 0, icon: Heart, color: 'text-pink-400', bg: 'bg-pink-400/10' },
            { label: 'Premium Users', value: analytics?.premium_users || 0, icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            { label: 'Total Swipes', value: analytics?.total_swipes || 0, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-3xl bg-white/5 border border-white/5 relative overflow-hidden group"
            >
              <div className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-white text-2xl font-black mt-1">{stat.value.toLocaleString()}</h3>
              <div className="absolute top-2 right-2 opacity-5">
                <BarChart3 size={40} className="text-white" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* User Management Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-white font-black text-lg">User Directory</h2>
            <div className="flex items-center gap-2">
               <button className="p-2 rounded-xl bg-white/5 text-slate-400"><Filter size={18}/></button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-brand-pink/50 transition-colors"
            />
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />
              </div>
            ) : filteredUsers.map((u, i) => (
              <motion.div 
                key={u.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all"
              >
                <div 
                  className="flex items-center gap-4 cursor-pointer flex-1"
                  onClick={() => navigate('/public-profile', { state: { profile: u } })}
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 relative">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold">
                        {u.full_name?.charAt(0)}
                      </div>
                    )}
                    {u.online && <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-app-surface" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-white font-bold text-sm group-hover:text-brand-pink transition-colors">{u.full_name || 'Incomplete Profile'}</h4>
                      {u.is_verified && <CheckCircle size={12} className="text-brand-pink" />}
                      {u.is_premium && <Crown size={12} className="text-yellow-400" />}
                    </div>
                    <p className="text-slate-500 text-[10px] font-medium">{u.id.substring(0, 13)}...</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                  <button 
                    onClick={() => toggleVerify(u.id, u.is_verified)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${u.is_verified ? 'bg-brand-pink/20 text-brand-pink' : 'bg-white/5 text-slate-500'}`}
                    title="Toggle Verification"
                  >
                    <CheckCircle size={18} />
                  </button>
                  <button 
                    onClick={() => togglePremium(u.id, u.is_premium)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${u.is_premium ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/5 text-slate-500'}`}
                    title="Toggle Premium"
                  >
                    <Crown size={18} />
                  </button>
                  <button className="w-9 h-9 rounded-xl bg-white/5 text-slate-500 flex items-center justify-center">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </motion.div>
            ))}

            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-20 text-slate-500 text-sm">
                No users found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
