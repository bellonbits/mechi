import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Smartphone, ArrowLeft, Loader2, Sparkles, Heart, Rocket, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useSubscription } from '../hooks/useSubscription';

export const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isPremium, refetch } = useSubscription();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  // Realtime subscription listener
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('subscription_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Realtime Update:', payload);
          if (payload.new.status === 'active') {
            setStatus('success');
            setLoading(false);
            refetch();
          } else if (payload.new.status === 'failed') {
            setStatus('error');
            setLoading(false);
            setError('Payment failed. Please try again.');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  const handleUpgrade = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid M-Pesa phone number');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('checking');

    try {
      const { data, error: functionError } = await supabase.functions.invoke('initiate-payment', {
        body: { phoneNumber, amount: 100 },
      });

      if (functionError) throw new Error(functionError.message || 'Payment initiation failed');
      if (data?.error) throw new Error(data.error);

      // STK push sent — stay in "checking" state and wait for the realtime
      // subscription update triggered by the Lipana webhook
      console.log('STK push sent:', data?.transactionId);

    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
      setStatus('error');
    }
  };

  const features = [
    { icon: <Heart className="w-5 h-5" />, text: "See who liked you" },
    { icon: <Rocket className="w-5 h-5" />, text: "Unlimited swipes" },
    { icon: <Eye className="w-5 h-5" />, text: "Priority visibility" },
    { icon: <Sparkles className="w-5 h-5" />, text: "Premium badge" },
  ];

  if (isPremium && status !== 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Sparkles className="w-16 h-16 text-yellow-400 mb-6" />
        <h1 className="text-3xl font-bold mb-2">You're already Premium!</h1>
        <p className="text-slate-400 mb-8">Enjoy your ultimate dating experience.</p>
        <button 
          onClick={() => navigate('/swipe')}
          className="premium-gradient px-12 py-4 rounded-full font-bold shadow-xl active:scale-95 transition-transform"
        >
          Start Swiping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-32 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-pink/10 blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-brand-purple/10 blur-[100px] -z-10" />

      <div className="p-8 safe-top">
        <button onClick={() => navigate(-1)} className="p-3 glass rounded-full mb-8 hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <header className="mb-10 px-2">
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 mb-2 leading-tight">
            Mechi Premium
          </h1>
          <p className="text-slate-400 text-lg font-medium">Unlock your true potential today</p>
        </header>

        {/* Pricing Card */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass p-10 rounded-[2.5rem] mb-12 relative border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 right-8 -translate-y-1/2 bg-brand-pink px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            Best Value
          </div>
          
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-black">KES 100</span>
            <span className="text-slate-400">/ week</span>
          </div>

          <ul className="space-y-4 mb-8">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="p-1 bg-brand-pink/20 rounded-full text-brand-pink">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-slate-200">{f.text}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-500 ml-1 font-bold uppercase tracking-widest flex items-center gap-2">
                <Smartphone className="w-3 h-3" /> M-Pesa Phone Number
              </label>
              <input
                type="tel"
                placeholder="0712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-brand-pink transition-all text-lg font-medium tracking-wider"
              />
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full premium-gradient py-5 rounded-3xl font-black text-xl shadow-2xl shadow-brand-pink/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Boost My Dating Life"}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
        </motion.div>

        {/* Status Overlays */}
        <AnimatePresence>
          {status === 'checking' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="relative mb-8">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 rounded-full border-4 border-brand-pink border-t-transparent"
                />
                <Smartphone className="w-10 h-10 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Checkout your phone!</h2>
              <p className="text-slate-400 max-w-[250px]">
                We've sent an M-Pesa STK Push to <span className="text-white font-bold">{phoneNumber}</span>. Enter your PIN to complete.
              </p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-500/50"
              >
                <Check className="w-12 h-12 text-white stroke-[4px]" />
              </motion.div>
              <h2 className="text-4xl font-black mb-4">Welcome to Premium!</h2>
              <p className="text-slate-300 text-lg mb-12">
                Your account is now active. Go find your perfect match!
              </p>
              <button 
                onClick={() => navigate('/swipe')}
                className="premium-gradient w-full py-5 rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-transform"
              >
                Let's Go!
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
