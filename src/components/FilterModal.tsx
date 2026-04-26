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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-6 rounded-t-[32px] overflow-hidden"
            style={{ background: '#1a0828', borderTop: '1px solid rgba(156,39,176,0.3)' }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
            
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-white text-2xl font-black">Filters</h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="space-y-8 pb-10">
              {/* Distance */}
              <div>
                <div className="flex justify-between mb-4">
                  <span className="text-white font-bold">Max Distance</span>
                  <span className="text-brand-pink font-bold">{filters.distance} km</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={filters.distance}
                  onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
                  className="w-full accent-brand-pink"
                />
              </div>

              {/* Age Range */}
              <div>
                <div className="flex justify-between mb-4">
                  <span className="text-white font-bold">Age Preference</span>
                  <span className="text-brand-pink font-bold">{filters.minAge} - {filters.maxAge}</span>
                </div>
                {/* Simplified age range for UI demonstration */}
                <div className="flex items-center gap-4">
                  <input 
                    type="number"
                    value={filters.minAge}
                    onChange={(e) => setFilters({ ...filters, minAge: parseInt(e.target.value) })}
                    className="w-full bg-white/5 py-3 px-4 rounded-xl text-white outline-none focus:border-brand-pink border border-transparent"
                  />
                  <div className="w-4 h-0.5 bg-white/20" />
                  <input 
                    type="number"
                    value={filters.maxAge}
                    onChange={(e) => setFilters({ ...filters, maxAge: parseInt(e.target.value) })}
                    className="w-full bg-white/5 py-3 px-4 rounded-xl text-white outline-none focus:border-brand-pink border border-transparent"
                  />
                </div>
              </div>

              {/* Looking for */}
              <div>
                <span className="text-white font-bold block mb-4">Looking For</span>
                <div className="grid grid-cols-2 gap-3">
                  {lookingForOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFilters({ ...filters, lookingFor: opt })}
                      className={`p-3.5 rounded-2xl text-xs font-bold transition-all text-left flex items-center justify-between ${
                        filters.lookingFor === opt ? 'bg-brand-pink text-white border-brand-pink' : 'bg-white/5 text-slate-400 border-white/5'
                      }`}
                      style={{ border: '1px solid currentColor' }}
                    >
                      {opt}
                      {filters.lookingFor === opt && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-brand-pink text-white font-black uppercase text-sm mb-safe"
              style={{ boxShadow: '0 8px 32px rgba(233,30,140,0.4)' }}
            >
              Apply Filters
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
