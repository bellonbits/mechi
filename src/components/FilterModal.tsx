import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  setFilters: (f: any) => void;
}

export const FilterModal = ({ isOpen, onClose, filters, setFilters }: FilterModalProps) => {
  const lookingForOptions = ['Serious Dating', 'Casual Dating', 'New Friends', 'Something Short-term'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[101] flex flex-col rounded-t-[40px] overflow-hidden"
            style={{ 
              background: '#1a0828', 
              borderTop: '1px solid rgba(156,39,176,0.3)',
              maxHeight: '85vh',
            }}
          >
            {/* Header */}
            <div className="p-6 pb-2 shrink-0">
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-center">
                <h2 className="text-white text-2xl font-black">Filters</h2>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 active:scale-90 transition-transform"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
              {/* Distance */}
              <div>
                <div className="flex justify-between mb-4">
                  <span className="text-white font-bold text-sm tracking-tight">Max Distance</span>
                  <span className="text-brand-pink font-bold">{filters.distance} km</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={filters.distance}
                  onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
                  className="w-full accent-brand-pink h-1.5 rounded-full appearance-none bg-white/10"
                />
              </div>

              {/* Age Range */}
              <div>
                <div className="flex justify-between mb-4">
                  <span className="text-white font-bold text-sm tracking-tight">Age Preference</span>
                  <span className="text-brand-pink font-bold">{filters.minAge} - {filters.maxAge}</span>
                </div>
                <div className="flex items-center gap-4">
                  <input 
                    type="number"
                    value={filters.minAge}
                    onChange={(e) => setFilters({ ...filters, minAge: parseInt(e.target.value) })}
                    className="w-full bg-white/5 py-4 px-4 rounded-2xl text-white outline-none focus:border-brand-pink border border-transparent font-bold text-center"
                  />
                  <div className="w-4 h-0.5 bg-white/20" />
                  <input 
                    type="number"
                    value={filters.maxAge}
                    onChange={(e) => setFilters({ ...filters, maxAge: parseInt(e.target.value) })}
                    className="w-full bg-white/5 py-4 px-4 rounded-2xl text-white outline-none focus:border-brand-pink border border-transparent font-bold text-center"
                  />
                </div>
              </div>

              {/* Looking for */}
              <div>
                <span className="text-white font-bold text-sm tracking-tight block mb-4">Looking For</span>
                <div className="grid grid-cols-1 gap-3">
                  {lookingForOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFilters({ ...filters, lookingFor: opt })}
                      className={`p-5 rounded-2xl text-sm font-bold transition-all flex items-center justify-between ${
                        filters.lookingFor === opt ? 'bg-brand-pink text-white shadow-[0_0_20px_rgba(233,30,140,0.3)]' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {opt}
                      {filters.lookingFor === opt && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Extra spacing for bottom scroll */}
              <div className="h-10" />
            </div>

            {/* Sticky Footer */}
            <div className="p-6 pt-2 shrink-0 bg-[#1a0828] border-t border-white/5 pb-[calc(env(safe-area-inset-bottom,20px)+16px)]">
              <button 
                onClick={onClose}
                className="w-full py-5 rounded-2xl bg-brand-pink text-white font-black uppercase tracking-widest text-sm active:scale-95 transition-transform"
                style={{ boxShadow: '0 8px 32px rgba(233,30,140,0.4)' }}
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
