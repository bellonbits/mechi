import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/useAuthStore';

interface IncomingCall {
  callerName: string;
  callerImage: string;
  callerId: string;
  conversationId: string;
}

export const CallListener = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`incoming-call-${user.id}`)
      .on('broadcast', { event: 'call-request' }, (payload) => {
        setIncomingCall(payload.payload as IncomingCall);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const accept = () => {
    if (!incomingCall) return;
    navigate('/video-call', {
      state: {
        name: incomingCall.callerName,
        image: incomingCall.callerImage,
        targetUserId: incomingCall.callerId,
        conversationId: incomingCall.conversationId,
        isCaller: false,
      },
    });
    setIncomingCall(null);
  };

  const decline = () => setIncomingCall(null);

  return (
    <AnimatePresence>
      {incomingCall && (
        <motion.div
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -80 }}
          className="fixed top-0 left-0 right-0 z-50 px-4"
          style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
        >
          <div
            className="rounded-3xl p-4 flex items-center gap-3 shadow-2xl"
            style={{
              background: 'rgba(15, 5, 32, 0.96)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(233,30,140,0.3)',
            }}
          >
            <img
              src={incomingCall.callerImage}
              className="w-14 h-14 rounded-full object-cover shrink-0"
              alt={incomingCall.callerName}
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">{incomingCall.callerName}</p>
              <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                <Video size={10} /> Incoming video call...
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={decline}
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: '#ef4444' }}
              >
                <PhoneOff size={16} className="text-white" />
              </button>
              <button
                onClick={accept}
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: '#22c55e' }}
              >
                <Phone size={16} className="text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
