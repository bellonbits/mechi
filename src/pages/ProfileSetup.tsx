import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Check, ChevronRight, Loader2, Shield, Star, X, AlertCircle, Info } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/useAuthStore';

const INTERESTS = [
  '☕ Coffee', '✈️ Travel', '🎵 Music', '🏋️ Fitness', '📚 Reading',
  '🍕 Foodie', '🎮 Gaming', '🎨 Art', '🏕️ Hiking', '🎭 Theater',
  '🐶 Pets', '📷 Photography', '🍷 Wine', '🧘 Yoga', '🌍 Languages',
  '💻 Tech', '🎸 Guitar', '🏄 Surfing', '🎬 Movies', '🌱 Vegan',
];

const GENDERS = ['Man', 'Woman', 'Non-binary', 'Prefer not to say'];
const LOOKING_FOR = ['Men', 'Women', 'Everyone'];

const STEPS = [
  { id: 1, title: 'Who are you?', sub: 'Your real name builds trust' },
  { id: 2, title: 'About you', sub: 'Help others find the right match' },
  { id: 3, title: 'Your story', sub: 'Authentic bios get 3× more matches' },
  { id: 4, title: 'Your photos', sub: '2 real photos = Verified badge' },
  { id: 5, title: 'Your interests', sub: 'Connect over what you love' },
];

export const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const { user, setProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState({
    name: user?.user_metadata?.full_name || '',
    age: '',
    gender: '',
    lookingFor: '',
    bio: '',
    photos: [] as string[],
    interests: [] as string[],
    location: '',
  });

  useEffect(() => {
    if (!user) return;
    // Attempt to get location automatically
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
          const json = await res.json();
          const city = json.address?.city || json.address?.town || json.address?.village || json.address?.county || '';
          const country = json.address?.country || '';
          if (city) {
            setData(d => ({ ...d, location: `${city}, ${country}` }));
          }
        } catch (e) {
          console.error("Location fetch failed", e);
        }
      }, null, { enableHighAccuracy: false, timeout: 10000 });
    }
  }, [user]);

  const set = (k: string, v: unknown) => setData((d) => ({ ...d, [k]: v }));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (data.photos.length >= 2) return;
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      set('photos', [...data.photos, publicUrl]);
    } catch {
      const reader = new FileReader();
      reader.onload = () => set('photos', [...data.photos, reader.result as string]);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (i: number) => set('photos', data.photos.filter((_, idx) => idx !== i));
  const toggleInterest = (item: string) =>
    set('interests', data.interests.includes(item) ? data.interests.filter((x) => x !== item) : data.interests.length < 8 ? [...data.interests, item] : data.interests);

  const canNext = () => {
    if (step === 1) return data.name.trim().length >= 2;
    if (step === 2) return data.age && parseInt(data.age) >= 18 && data.gender && data.lookingFor;
    if (step === 3) return data.bio.trim().length >= 30;
    if (step === 4) return data.photos.length >= 1;
    return data.interests.length >= 3;
  };

  const handleFinish = async () => {
    setSaving(true);
    setError('');
    try {
      const isVerified = data.photos.length >= 2;
      const profileData = {
        id: user?.id as string,
        full_name: data.name,
        age: parseInt(data.age),
        gender: data.gender,
        looking_for: data.lookingFor,
        bio: data.bio,
        location: data.location || 'Unknown',
        avatar_url: data.photos[0] || null,
        photos: data.photos,
        interests: data.interests,
        is_verified: isVerified,
        profile_complete: true,
        updated_at: new Date().toISOString(),
      };
      const { error: dbErr } = await supabase.from('profiles').upsert(profileData);
      if (dbErr) throw dbErr;
      setProfile({ ...profileData, is_premium: false } as any);
      navigate('/explore', { replace: true });
    } catch {
      setError('Could not save profile. Continuing anyway...');
      setTimeout(() => navigate('/explore', { replace: true }), 1500);
    } finally {
      setSaving(false);
    }
  };

  const next = () => step < 5 ? setStep(step + 1) : handleFinish();
  const prev = () => step > 1 && setStep(step - 1);

  const isVerifiedPreview = data.photos.length >= 2;

  return (
    <div className="screen-full flex flex-col overflow-hidden" style={{ background: 'linear-gradient(160deg,#2a0845 0%,#1a0828 45%,#0d0614 100%)' }}>
      {/* Header */}
      <div className="shrink-0 px-5 flex items-center justify-between" style={{ paddingTop: 'max(52px,env(safe-area-inset-top))', paddingBottom: 12 }}>
        <button onClick={prev} disabled={step === 1}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity"
          style={{ background: '#220f38', opacity: step === 1 ? 0 : 1 }}>
          <ChevronRight size={18} className="text-white rotate-180" />
        </button>
        <div className="flex items-center gap-1.5">
          {STEPS.map((s) => (
            <motion.div key={s.id} animate={{ width: s.id === step ? 20 : 7, background: s.id <= step ? '#e91e8c' : 'rgba(255,255,255,0.18)' }}
              transition={{ duration: 0.28 }} style={{ height: 7, borderRadius: 4 }} />
          ))}
        </div>
        <button onClick={() => navigate('/explore', { replace: true })} className="text-slate-500 text-xs font-semibold px-2">Skip</button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-3">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <div className="mb-6 mt-2">
              <p className="text-brand-pink text-xs font-bold tracking-widest uppercase mb-1">{step} / {STEPS.length}</p>
              <h2 className="text-white text-2xl font-black">{STEPS[step - 1].title}</h2>
              <p className="text-slate-400 text-sm mt-1">{STEPS[step - 1].sub}</p>
            </div>

            {/* ── Step 1: Name ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl flex items-start gap-3" style={{ background: 'rgba(233,30,140,0.08)', border: '1px solid rgba(233,30,140,0.2)' }}>
                  <Info size={15} className="text-brand-pink mt-0.5 shrink-0" />
                  <p className="text-slate-300 text-xs leading-relaxed">Use your real first name. Profiles with real names get <strong className="text-white">54% more matches</strong> and build lasting trust.</p>
                </div>
                <div>
                  <label className="text-slate-300 text-xs font-semibold tracking-wide uppercase mb-2 block">First Name</label>
                  <input value={data.name} onChange={(e) => set('name', e.target.value)} placeholder="Your real first name" maxLength={30}
                    className="w-full px-4 py-3.5 rounded-2xl text-white text-base outline-none"
                    style={{ background: '#220f38', border: '1.5px solid rgba(156,39,176,0.25)', fontSize: 18, fontWeight: 700 }} />
                  <p className="text-slate-500 text-xs mt-2 text-right">{data.name.length}/30</p>
                </div>
              </div>
            )}

            {/* ── Step 2: Age + Gender ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="text-slate-300 text-xs font-semibold tracking-wide uppercase mb-2 block">Your Age</label>
                  <input type="number" value={data.age} onChange={(e) => set('age', e.target.value)} placeholder="Must be 18+" min={18} max={100}
                    className="w-full px-4 py-3.5 rounded-2xl text-white text-base outline-none"
                    style={{ background: '#220f38', border: '1.5px solid rgba(156,39,176,0.25)' }} />
                  {data.age && parseInt(data.age) < 18 && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />Must be 18 or older</p>}
                </div>
                <div>
                  <label className="text-slate-300 text-xs font-semibold tracking-wide uppercase mb-2 block">I am a</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GENDERS.map((g) => (
                      <button key={g} onClick={() => set('gender', g)}
                        className="py-3 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: data.gender === g ? '#e91e8c' : '#220f38', color: data.gender === g ? '#fff' : '#94a3b8', border: `1.5px solid ${data.gender === g ? '#e91e8c' : 'rgba(156,39,176,0.2)'}` }}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-slate-300 text-xs font-semibold tracking-wide uppercase mb-2 block">Looking for</label>
                  <div className="flex gap-2">
                    {LOOKING_FOR.map((l) => (
                      <button key={l} onClick={() => set('lookingFor', l)}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: data.lookingFor === l ? '#e91e8c' : '#220f38', color: data.lookingFor === l ? '#fff' : '#94a3b8', border: `1.5px solid ${data.lookingFor === l ? '#e91e8c' : 'rgba(156,39,176,0.2)'}` }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Bio ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl flex items-start gap-3" style={{ background: 'rgba(233,30,140,0.08)', border: '1px solid rgba(233,30,140,0.2)' }}>
                  <Star size={15} className="text-brand-pink mt-0.5 shrink-0" />
                  <p className="text-slate-300 text-xs leading-relaxed">Be genuine. Share your real passions, what makes you laugh, and what you're looking for. Authentic bios get <strong className="text-white">3× more matches</strong>.</p>
                </div>
                <div>
                  <label className="text-slate-300 text-xs font-semibold tracking-wide uppercase mb-2 block">About Me</label>
                  <textarea value={data.bio} onChange={(e) => set('bio', e.target.value)} placeholder="e.g. Outdoor enthusiast who loves Sunday farmers markets and spontaneous road trips. Looking for someone who can keep up with my energy and appreciate a good homemade meal…" maxLength={500} rows={6}
                    className="w-full px-4 py-3.5 rounded-2xl text-white text-sm outline-none resize-none leading-relaxed"
                    style={{ background: '#220f38', border: '1.5px solid rgba(156,39,176,0.25)' }} />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs" style={{ color: data.bio.length >= 30 ? '#22c55e' : '#94a3b8' }}>{data.bio.length >= 30 ? '✓ Great bio!' : `${30 - data.bio.length} more chars needed`}</p>
                    <p className="text-slate-500 text-xs">{data.bio.length}/500</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Photos ── */}
            {step === 4 && (
              <div className="space-y-4">
                {/* Verified badge preview */}
                <div className="p-4 rounded-2xl" style={{ background: isVerifiedPreview ? 'rgba(34,197,94,0.1)' : 'rgba(233,30,140,0.08)', border: `1px solid ${isVerifiedPreview ? 'rgba(34,197,94,0.3)' : 'rgba(233,30,140,0.2)'}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: isVerifiedPreview ? 'rgba(34,197,94,0.2)' : 'rgba(233,30,140,0.2)' }}>
                      <Shield size={18} style={{ color: isVerifiedPreview ? '#22c55e' : '#e91e8c' }} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">{isVerifiedPreview ? '🎉 Verified badge earned!' : 'Upload 2 photos → Get Verified'}</p>
                      <p className="text-slate-400 text-xs">{isVerifiedPreview ? 'Your profile shows a blue ✓ badge to everyone.' : 'Verified profiles get 2× more likes and trust.'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {data.photos.map((url, i) => (
                    <div key={i} className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      {i === 0 && <div className="absolute top-2 left-2 bg-brand-pink text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Main</div>}
                      {i === 1 && <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"><Shield size={9} />Verified</div>}
                      <button onClick={() => removePhoto(i)} className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                        <X size={13} className="text-white" />
                      </button>
                    </div>
                  ))}

                  {data.photos.length < 2 && (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => fileRef.current?.click()}
                      className="rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer"
                      style={{ aspectRatio: '3/4', background: '#220f38', border: '2px dashed rgba(233,30,140,0.35)' }}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(233,30,140,0.15)' }}>
                        <Camera size={22} className="text-brand-pink" />
                      </div>
                      <p className="text-slate-400 text-xs text-center font-medium px-4">{data.photos.length === 0 ? 'Add main photo' : 'Add 2nd photo\n(for badge)'}</p>
                    </motion.button>
                  )}
                </div>

                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <p className="text-slate-500 text-xs text-center">Real photos only. Fake photos result in instant account removal.</p>
              </div>
            )}

            {/* ── Step 5: Interests ── */}
            {step === 5 && (
              <div className="space-y-4">
                <p className="text-slate-400 text-sm">Pick 3–8 interests. This helps us find your best matches.</p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((item) => {
                    const on = data.interests.includes(item);
                    return (
                      <motion.button key={item} whileTap={{ scale: 0.93 }} onClick={() => toggleInterest(item)}
                        className="px-3.5 py-2 rounded-full text-sm font-semibold transition-all"
                        style={{ background: on ? '#e91e8c' : '#220f38', color: on ? '#fff' : '#94a3b8', border: `1.5px solid ${on ? '#e91e8c' : 'rgba(156,39,176,0.2)'}` }}>
                        {item}
                      </motion.button>
                    );
                  })}
                </div>
                <p className="text-slate-500 text-xs">{data.interests.length}/8 selected</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="shrink-0 px-5 pt-3" style={{ paddingBottom: 'max(24px,env(safe-area-inset-bottom))' }}>
        {error && <p className="text-amber-400 text-xs text-center mb-2">{error}</p>}
        <motion.button whileTap={{ scale: 0.96 }} onClick={next} disabled={!canNext() || saving}
          className="w-full rounded-2xl font-black text-white text-base flex items-center justify-center gap-2"
          style={{ height: 52, background: canNext() ? 'linear-gradient(135deg,#e91e8c,#9c27b0)' : '#220f38', boxShadow: canNext() ? '0 0 30px rgba(233,30,140,0.4)' : 'none', color: canNext() ? '#fff' : '#475569', transition: 'all 0.2s' }}>
          {saving ? <Loader2 size={20} className="animate-spin" /> : step === 5 ? <><Check size={18} />Complete Profile</> : <>Continue<ChevronRight size={18} /></>}
        </motion.button>
      </div>
    </div>
  );
};
