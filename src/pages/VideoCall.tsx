import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, RotateCcw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/useAuthStore';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

type CallState = 'connecting' | 'ringing' | 'connected' | 'ended';

const ControlBtn = ({
  icon: Icon, active, onClick, danger,
}: {
  icon: React.ElementType; active?: boolean; onClick?: () => void; danger?: boolean;
}) => (
  <motion.button
    whileTap={{ scale: 0.84 }}
    onClick={onClick}
    className={`rounded-full flex items-center justify-center ${danger ? 'w-16 h-16' : 'w-14 h-14'}`}
    style={{
      background: danger ? '#ef4444' : active ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(12px)',
      border: danger ? 'none' : '1px solid rgba(255,255,255,0.18)',
      boxShadow: danger ? '0 0 32px rgba(239,68,68,0.55)' : '0 4px 16px rgba(0,0,0,0.3)',
    }}
  >
    <Icon size={danger ? 26 : 21} className="text-white" />
  </motion.button>
);

export const VideoCallPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const state = (location.state as {
    name?: string;
    image?: string;
    targetUserId?: string;
    conversationId?: string;
    isCaller?: boolean;
  } | null) || {};

  const contactName = state.name || 'Match';
  const contactImage =
    state.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(contactName)}&background=1a0828&color=fff`;
  const targetUserId = state.targetUserId || '';
  const isCaller = state.isCaller ?? true;

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);
  const remoteDescSet = useRef(false);

  const [callState, setCallState] = useState<CallState>('connecting');
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const channelName = [user?.id, targetUserId].filter(Boolean).sort().join('-');

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerConnectionRef.current?.close();
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    peerConnectionRef.current = null;
    localStreamRef.current = null;
    channelRef.current = null;
    remoteDescSet.current = false;
    iceCandidateQueue.current = [];
  }, []);

  const drainIceQueue = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;
    while (iceCandidateQueue.current.length > 0) {
      const cand = iceCandidateQueue.current.shift()!;
      try { await pc.addIceCandidate(new RTCIceCandidate(cand)); } catch { /* ignore stale */ }
    }
  }, []);

  useEffect(() => {
    if (!user || !targetUserId) {
      navigate(-1);
      return;
    }

    let mounted = true;

    const setupCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }

        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        peerConnectionRef.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (!mounted || !remoteVideoRef.current || !event.streams[0]) return;
          remoteVideoRef.current.srcObject = event.streams[0];
        };

        pc.onconnectionstatechange = () => {
          if (!mounted) return;
          if (pc.connectionState === 'connected') setCallState('connected');
          else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') setCallState('ended');
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && channelRef.current) {
            channelRef.current.send({
              type: 'broadcast',
              event: 'ice-candidate',
              payload: { candidate: event.candidate.toJSON() },
            });
          }
        };

        const channel = supabase
          .channel(`video-${channelName}`)
          .on('broadcast', { event: 'callee-ready' }, async () => {
            // Caller receives this and sends offer
            if (!mounted || !isCaller) return;
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              channel.send({ type: 'broadcast', event: 'offer', payload: { sdp: offer } });
            } catch (e) { console.error('offer error:', e); }
          })
          .on('broadcast', { event: 'offer' }, async (payload) => {
            // Callee receives offer, sends answer
            if (!mounted || isCaller) return;
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.payload.sdp));
              remoteDescSet.current = true;
              await drainIceQueue();
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              channel.send({ type: 'broadcast', event: 'answer', payload: { sdp: answer } });
            } catch (e) { console.error('offer handler error:', e); }
          })
          .on('broadcast', { event: 'answer' }, async (payload) => {
            // Caller receives answer
            if (!mounted || !isCaller) return;
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.payload.sdp));
              remoteDescSet.current = true;
              await drainIceQueue();
            } catch (e) { console.error('answer handler error:', e); }
          })
          .on('broadcast', { event: 'ice-candidate' }, async (payload) => {
            if (!mounted || !payload.payload.candidate) return;
            if (remoteDescSet.current && peerConnectionRef.current) {
              try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.payload.candidate));
              } catch { /* ignore */ }
            } else {
              iceCandidateQueue.current.push(payload.payload.candidate);
            }
          })
          .on('broadcast', { event: 'call-end' }, () => {
            if (!mounted) return;
            setCallState('ended');
            cleanup();
            setTimeout(() => navigate(-1), 1500);
          })
          .subscribe((status) => {
            if (!mounted || status !== 'SUBSCRIBED') return;
            setCallState('ringing');
            if (!isCaller) {
              // Callee signals readiness so caller can send the offer
              channel.send({ type: 'broadcast', event: 'callee-ready', payload: {} });
            }
          });

        channelRef.current = channel;
      } catch (err: any) {
        if (!mounted) return;
        if (err.name === 'NotAllowedError') setError('Camera/microphone permission denied');
        else if (err.name === 'NotFoundError') setError('No camera or microphone found');
        else setError(err.message || 'Could not start video call');
        setCallState('ended');
      }
    };

    setupCall();
    return () => { mounted = false; cleanup(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (callState !== 'connected') return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [callState]);

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMuted(m => !m);
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setVideoOff(v => !v);
  };

  const switchCamera = async () => {
    const stream = localStreamRef.current;
    const pc = peerConnectionRef.current;
    if (!stream || !pc) return;
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: newFacing }, audio: false });
      const newVideoTrack = newStream.getVideoTracks()[0];
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) await sender.replaceTrack(newVideoTrack);
      stream.getVideoTracks().forEach(t => t.stop());
      const merged = new MediaStream([newVideoTrack, ...stream.getAudioTracks()]);
      localStreamRef.current = merged;
      if (localVideoRef.current) localVideoRef.current.srcObject = merged;
      setFacingMode(newFacing);
    } catch (e) { console.error('camera switch failed:', e); }
  };

  const endCall = () => {
    channelRef.current?.send({ type: 'broadcast', event: 'call-end', payload: {} });
    cleanup();
    navigate(-1);
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="screen-full relative overflow-hidden bg-black">
      {/* Remote video stream */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ display: callState === 'connected' ? 'block' : 'none' }}
      />

      {/* Placeholder until connected */}
      {callState !== 'connected' && (
        <img
          src={contactImage}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.4)' }}
          alt={contactName}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

      {/* Draggable local video PiP */}
      <motion.div
        drag
        dragConstraints={{ top: 0, left: -220, right: 0, bottom: 380 }}
        className="absolute z-20 rounded-2xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
        style={{
          top: 'max(56px, env(safe-area-inset-top))',
          right: 16,
          width: 112,
          height: 148,
          border: '2px solid rgba(255,255,255,0.28)',
        }}
      >
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        {videoOff && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#0d0614' }}>
            <VideoOff size={24} className="text-slate-400" />
          </div>
        )}
      </motion.div>

      {/* Status / callee info */}
      <AnimatePresence>
        {callState !== 'connected' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-10 pb-32"
          >
            {callState === 'connecting' && (
              <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin mb-6" />
            )}
            <h2 className="text-white text-3xl font-bold drop-shadow-xl mb-3">{contactName}</h2>
            {callState === 'ringing' && (
              <p className="text-white/60 text-base">
                {isCaller ? 'Calling...' : 'Connecting...'}
              </p>
            )}
            {callState === 'ended' && <p className="text-white/60 text-base">Call ended</p>}
            {error && <p className="text-red-400 text-sm mt-3 px-8 text-center">{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer (connected state) */}
      {callState === 'connected' && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute left-0 right-0 flex flex-col items-center z-20"
          style={{ top: 'max(56px, env(safe-area-inset-top))' }}
        >
          <h2 className="text-white text-xl font-bold drop-shadow-xl mb-1">{contactName}</h2>
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)' }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white text-sm font-mono">{fmt(seconds)}</span>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="absolute left-0 right-0 flex justify-center items-center gap-4 z-20"
        style={{ bottom: 'max(32px, env(safe-area-inset-bottom))' }}
      >
        <ControlBtn icon={muted ? MicOff : Mic} active={muted} onClick={toggleMute} />
        <ControlBtn icon={RotateCcw} onClick={switchCamera} />
        <ControlBtn icon={videoOff ? VideoOff : Video} active={videoOff} onClick={toggleVideo} />
        <ControlBtn icon={Phone} danger onClick={endCall} />
      </motion.div>
    </div>
  );
};
