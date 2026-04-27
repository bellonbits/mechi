import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Bot, User, ChevronLeft, Settings, Info, Loader2, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../utils/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const BestiePage = () => {
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [bestieName, setBestieName] = useState(profile?.ai_bestie_name || 'Mechi Bestie');
  const [savingName, setSavingName] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If name is still default, encourage naming
    if (profile && profile.ai_bestie_name === 'Mechi Bestie') {
      setShowSetup(true);
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('ai_bestie_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(30);
      
      if (!error && data) {
        setMessages(data as Message[]);
      }
    };
    fetchHistory();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-bestie', {
        body: { message: userMsg.content }
      });

      if (error) {
        const body = await error.context?.json();
        throw new Error(body?.error || error.message);
      }
      if (data.error) throw new Error(data.error);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Bestie failed:', err);
      let errorContent = `Oops! ${err.message || 'My brain froze for a second.'} Can you say that again?`;
      
      if (err.message?.includes('API Key') || err.message?.includes('401')) {
        errorContent = "I'm missing my API Key! Please check your Supabase secrets (GROQ_API_KEY).";
      } else if (err.message?.includes('Unauthorized')) {
        errorContent = "Your session expired. Please sign in again.";
      }

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!bestieName.trim() || savingName) return;
    setSavingName(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ai_bestie_name: bestieName.trim() })
        .eq('id', user?.id);
      
      if (error) throw error;
      
      if (profile) {
        setProfile({ ...profile, ai_bestie_name: bestieName.trim() });
      }
      setShowSetup(false);
    } catch (err) {
      console.error('Failed to save name:', err);
    } finally {
      setSavingName(false);
    }
  };

  const preference = profile?.interests?.find((i: string) => i.startsWith('PREF:'))?.split(':')[1] || profile?.looking_for;
  const isInterestedInWomen = preference?.toLowerCase().includes('women') || preference?.toLowerCase().includes('everyone');
  const isInterestedInMen = preference?.toLowerCase().includes('men') || preference?.toLowerCase().includes('everyone');
  
  let personalityType = "Your Bestie";
  if (isInterestedInWomen && !isInterestedInMen) personalityType = "Your Wingman";
  else if (isInterestedInMen && !isInterestedInWomen) personalityType = "Your Wingwoman";

  return (
    <div className="min-h-screen pb-nav-scroll app-bg flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-brand-pink/10 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-[20%] left-[-10%] w-[250px] h-[250px] bg-brand-purple/10 blur-[80px] rounded-full -z-10" />

      {/* Header */}
      <div className="pt-safe px-5 pb-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 z-20 bg-app-bg/80">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 active:scale-90 transition-transform">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-tr from-brand-pink to-brand-purple p-[2px]">
              <div className="w-full h-full rounded-full bg-app-surface flex items-center justify-center overflow-hidden">
                <Sparkles size={18} className="text-brand-pink" />
              </div>
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-none">{profile?.ai_bestie_name || 'Bestie'}</h1>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-1 font-bold">{personalityType}</p>
            </div>
          </div>
        </div>
        <button onClick={() => setShowSetup(true)} className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 active:scale-90 transition-transform">
          <Settings size={18} className="text-slate-400" />
        </button>
      </div>

      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-2">
              <Sparkles size={40} className="text-brand-pink" />
            </div>
            <h3 className="text-white font-black text-xl">Meet {profile?.ai_bestie_name || 'your Bestie'}</h3>
            <p className="text-slate-400 text-sm max-w-[260px] leading-relaxed">
              I'm here to help you navigate dating, give advice, and make sure you shine. Ask me anything!
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-[280px] pt-4">
              {["How do I start a conversation?", "What's a good first date idea?", "How can I improve my bio?"].map((suggestion) => (
                <button 
                  key={suggestion} 
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold text-left hover:bg-white/10 active:scale-95 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-brand-pink/20' : 'bg-brand-purple/20'}`}>
                {m.role === 'user' ? <User size={14} className="text-brand-pink" /> : <Bot size={14} className="text-brand-purple" />}
              </div>
              <div 
                className={`px-4 py-3 rounded-[20px] text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-brand-pink text-white rounded-tr-none' 
                    : 'bg-white/5 border border-white/10 text-slate-100 rounded-tl-none'
                }`}
              >
                {m.content}
                <div className={`text-[9px] mt-1.5 opacity-50 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] flex gap-2">
              <div className="shrink-0 w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center">
                <Bot size={14} className="text-brand-purple" />
              </div>
              <div className="px-5 py-4 rounded-[20px] rounded-tl-none bg-white/5 border border-white/10 flex items-center gap-1.5">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-5 pb-safe pt-2">
        <div className="relative flex items-end gap-2 mb-4 bg-white/5 border border-white/10 rounded-[28px] p-2 pr-3 focus-within:border-brand-pink/50 transition-colors">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk to your Bestie..."
            rows={1}
            className="w-full bg-transparent border-none outline-none text-white text-sm py-2 px-3 resize-none max-h-32"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 disabled:scale-100 transition-all"
            style={{ background: 'linear-gradient(135deg, #e91e8c, #9c27b0)' }}
          >
            <Send size={18} className="text-white ml-0.5" />
          </motion.button>
        </div>
      </div>

      {/* Setup / Settings Modal */}
      <AnimatePresence>
        {showSetup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-app-bg/95 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm rounded-[32px] p-8 space-y-6 border border-white/10 relative overflow-hidden"
              style={{ background: '#1a0828' }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/10 blur-[40px] -z-10" />
              
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-pink to-brand-purple flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-pink/20">
                  <Wand2 size={32} className="text-white" />
                </div>
                <h2 className="text-white font-black text-2xl">Name your Bestie</h2>
                <p className="text-slate-400 text-sm">Give your AI friend a name that feels right to you.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Bestie's Name</label>
                  <input 
                    value={bestieName}
                    onChange={(e) => setBestieName(e.target.value)}
                    placeholder="e.g. Wingman X, Sissy, Coach..."
                    maxLength={20}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg focus:border-brand-pink outline-none transition-colors"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3">
                  <Info size={16} className="text-brand-pink shrink-0" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Based on your profile, {bestieName} will talk with <span className="text-white font-bold">{personalityType === "Your Wingman" ? "a male tone (Bro vibes)" : "a lady tone (Sissy vibes)"}</span> to give you the best perspective.
                  </p>
                </div>

                <button 
                  onClick={handleSaveName}
                  disabled={!bestieName.trim() || savingName}
                  className="w-full py-4 rounded-2xl font-black text-white text-base shadow-xl shadow-brand-pink/20 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #e91e8c, #9c27b0)' }}
                >
                  {savingName ? <Loader2 size={20} className="animate-spin" /> : "Save & Start Chatting"}
                </button>
                
                {profile?.ai_bestie_name !== 'Mechi Bestie' && (
                  <button 
                    onClick={() => setShowSetup(false)}
                    className="w-full text-slate-500 text-xs font-bold py-2"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
