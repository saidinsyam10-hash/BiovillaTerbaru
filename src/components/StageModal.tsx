import React, { useState } from 'react';
import { Stage, UserAccount } from '../types';
import { HotspotViewer } from './HotspotViewer';
import { DragDropActivity } from './DragDropActivity';
import { PresentationViewer } from './PresentationViewer';
import { Level3MediaModal } from './Level3MediaModal';
import { Level4EnergyCrisis } from './Level4EnergyCrisis';
import { sfx } from '../utils/audio';
import { X, ArrowLeft, CheckCircle, Sparkles, Video, ShieldCheck } from 'lucide-react';
import { getCurrentUser, saveTemporaryAnswer } from '../utils/authStore';

interface StageModalProps {
  stage: Stage;
  onClose: () => void;
  onStageComplete: (stageId: string) => void;
  isAlreadyCleared: boolean;
  currentUser?: UserAccount | null;
  onRequireLogin?: () => void;
}

export const StageModal: React.FC<StageModalProps> = ({
  stage,
  onClose,
  onStageComplete,
  isAlreadyCleared,
  currentUser = null,
  onRequireLogin
}) => {
  const [showLevel3Media, setShowLevel3Media] = useState(false);
  const isLevel3 = stage.stageIndex === 4 || stage.label.includes('Level 3');
  const isLevel4 = stage.stageIndex === 5 || stage.label.includes('Level 4') || stage.id === '2a93031d-a62d-4f6a-b497-68c3d35dcd57';
  const isTeacher = currentUser?.role === 'guru';

  const handleComplete = () => {
    // Check session before proceeding
    const active = getCurrentUser();
    if (!active) {
      saveTemporaryAnswer(stage.id, {
        stageId: stage.id,
        stageIndex: stage.stageIndex,
        stageCleared: true,
        timestamp: Date.now()
      });
      if (onRequireLogin) onRequireLogin();
      return;
    }

    if (active.role === 'guru') {
      // Guru is in observation mode and doesn't submit student solutions
      onClose();
      return;
    }

    sfx.playStageComplete();
    onStageComplete(stage.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 md:p-8 flex items-center justify-center animate-in fade-in duration-200">
      <div 
        className="bg-amber-50/95 rounded-3xl shadow-2xl border-4 border-amber-300 max-w-5xl w-full overflow-hidden flex flex-col my-auto max-h-[94vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <header className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 p-4 sm:p-5 text-white flex items-center justify-between shadow-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer active:scale-95"
              title="Kembali ke Peta"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-bold font-fredoka text-amber-200">
                  {stage.label}
                </h2>
                {isAlreadyCleared && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/30 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Selesai
                  </span>
                )}
              </div>
              {stage.subLabel && (
                <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                  {stage.subLabel}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLevel3 && (
              <button
                type="button"
                onClick={() => setShowLevel3Media(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                title="Masukkan video dan gambar kustom untuk Level 3"
              >
                <Sparkles className="w-4 h-4 text-emerald-900" />
                <span className="hidden sm:inline">Kelola Video &amp; Gambar</span>
                <span className="sm:hidden">Media</span>
              </button>
            )}

            {isTeacher ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 text-amber-200 border border-amber-300/40 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Mode Observasi Guru</span>
              </span>
            ) : !isAlreadyCleared ? (
              <button
                type="button"
                onClick={handleComplete}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                title="Selesaikan pengerjaan dan buka kunci level selanjutnya di peta"
              >
                <CheckCircle className="w-4 h-4 text-emerald-800" />
                <span className="hidden sm:inline">Selesai &amp; Buka Level</span>
                <span className="sm:hidden">Selesai</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Tutup Jendela"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Modal Content Body */}
        <main className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
          {isLevel4 ? (
            <Level4EnergyCrisis
              onComplete={handleComplete}
              onClose={onClose}
              isAlreadyCleared={isAlreadyCleared}
              currentUser={currentUser}
            />
          ) : (
            <>
              {stage.stageType === 'hotspot' && stage.hotspotsData && (
                <HotspotViewer
                  image={stage.hotspotsData.image}
                  hotspots={stage.hotspotsData.hotspots}
                  isAlreadyCleared={isAlreadyCleared}
                  onComplete={handleComplete}
                  onClose={onClose}
                />
              )}

              {stage.stageType === 'dragdrop' && stage.dragDropData && (
                <DragDropActivity
                  task={stage.dragDropData}
                  title={stage.subLabel || stage.label}
                  isAlreadyCleared={isAlreadyCleared}
                  onComplete={handleComplete}
                />
              )}

              {stage.stageType === 'presentation' && stage.presentationData && (
                <PresentationViewer
                  slides={stage.presentationData.slides}
                  isAlreadyCleared={isAlreadyCleared}
                  onComplete={handleComplete}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Level 3 Media Modal */}
      {isLevel3 && (
        <Level3MediaModal
          isOpen={showLevel3Media}
          onClose={() => setShowLevel3Media(false)}
        />
      )}
    </div>
  );
};
