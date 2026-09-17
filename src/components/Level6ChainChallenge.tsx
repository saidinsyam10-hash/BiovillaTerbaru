import React, { useState, useEffect } from 'react';
import { resolveMediaPath, sfx } from '../utils/audio';
import { getMediaResolvedURL, onMediaUpdated } from '../utils/mediaStore';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  Maximize2, 
  Star, 
  Lightbulb, 
  ArrowRight,
  Hand,
  Check,
  X,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

interface ChainCard {
  id: string;
  title: string;
  badgeLabel: string;
  badgeType: 'warning' | 'down';
  defaultImg: string;
  assetKey: string;
  correctSlotIndex: number; // 0 for Step 1, 1 for Step 2, 2 for Step 3, 3 for Step 4
}

const CHAIN_CARDS: ChainCard[] = [
  {
    id: 'c1',
    title: 'Mitokondria mengalami gangguan',
    badgeLabel: 'Mitokondria mengalami gangguan',
    badgeType: 'warning',
    defaultImg: '/assets/card_mito_distress.jpg',
    assetKey: 'asset_054',
    correctSlotIndex: 0 // Slot 1
  },
  {
    id: 'c2',
    title: 'Produksi ATP menurun',
    badgeLabel: 'Produksi ATP menurun',
    badgeType: 'down',
    defaultImg: '/assets/card_atp_decrease.jpg',
    assetKey: 'asset_051',
    correctSlotIndex: 1 // Slot 2
  },
  {
    id: 'c3',
    title: 'Ketersediaan energi sel berkurang',
    badgeLabel: 'Ketersediaan energi sel berkurang',
    badgeType: 'down',
    defaultImg: '/assets/card_cell_low_energy.jpg',
    assetKey: 'asset_052',
    correctSlotIndex: 2 // Slot 3
  },
  {
    id: 'c4',
    title: 'Aktivitas sel tertentu terganggu',
    badgeLabel: 'Aktivitas sel tertentu terganggu',
    badgeType: 'down',
    defaultImg: '/assets/card_cell_disruption.jpg',
    assetKey: 'asset_053',
    correctSlotIndex: 3 // Slot 4
  }
];

interface Level6ChainChallengeProps {
  onComplete: () => void;
  isAlreadyCleared?: boolean;
  onPrevSlide?: () => void;
  onNextSlide?: () => void;
  onSelectSlide?: (idx: number) => void;
  currentSlideIdx?: number;
  totalSlides?: number;
}

export const Level6ChainChallenge: React.FC<Level6ChainChallengeProps> = ({
  onComplete,
  isAlreadyCleared = false,
  onPrevSlide,
  onNextSlide,
  onSelectSlide,
  currentSlideIdx = 1,
  totalSlides = 7
}) => {
  // 4 slots: index 0 -> Slot 1, 1 -> Slot 2, 2 -> Slot 3, 3 -> Slot 4
  const [slotPlacements, setSlotPlacements] = useState<(string | null)[]>([
    null, null, null, null
  ]);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [isAllCorrect, setIsAllCorrect] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Background and resolved card images
  const [bgUrl, setBgUrl] = useState<string>('/assets/level6_chain_bg.jpg');
  const [cardImages, setCardImages] = useState<Record<string, string>>({});
  const [characterImg, setCharacterImg] = useState<string>('/assets/level6_explorer_boy.jpg');

  // Load custom media or fallbacks
  useEffect(() => {
    let isMounted = true;
    const loadMedia = async () => {
      // 1. Check background
      const customBg = await getMediaResolvedURL('asset_050') || await getMediaResolvedURL('level6_chain_bg');
      if (isMounted && customBg) {
        setBgUrl(customBg);
      }

      // 2. Check explorer character
      const customChar = await getMediaResolvedURL('level6_explorer_boy');
      if (isMounted && customChar) {
        setCharacterImg(customChar);
      }

      // 3. Check cards
      const imgMap: Record<string, string> = {};
      for (const card of CHAIN_CARDS) {
        const u = await getMediaResolvedURL(card.assetKey) || await getMediaResolvedURL(card.id);
        imgMap[card.id] = u || card.defaultImg;
      }
      if (isMounted) {
        setCardImages(imgMap);
      }
    };

    loadMedia();
    const unsub = onMediaUpdated(() => {
      loadMedia();
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Placed card IDs
  const placedCardIds = new Set(slotPlacements.filter(Boolean));

  // Available cards for bottom tray (order can be shuffled to prompt critical thinking)
  // Initially we display: c2, c3, c1, c4 (as in user screenshot)
  const displayOrder = ['c2', 'c3', 'c1', 'c4'];
  const shelfCards = displayOrder
    .map(id => CHAIN_CARDS.find(c => c.id === id)!)
    .filter(c => !placedCardIds.has(c.id));

  // Card selection
  const handleCardClick = (cardId: string) => {
    if (hasChecked && isAllCorrect) return;
    sfx.playClick();
    if (selectedCardId === cardId) {
      setSelectedCardId(null);
    } else {
      setSelectedCardId(cardId);
      setToastMessage("Ketuk salah satu kotak 1, 2, 3, atau 4 untuk meletakkan kartu ini");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Slot placement via click/tap
  const handleSlotClick = (slotIdx: number) => {
    if (hasChecked && isAllCorrect) return;

    if (selectedCardId) {
      sfx.playClick();
      setSlotPlacements(prev => {
        const next = [...prev];
        // Remove card from any existing slot
        const existingIdx = next.indexOf(selectedCardId);
        if (existingIdx !== -1) {
          next[existingIdx] = null;
        }
        next[slotIdx] = selectedCardId;
        return next;
      });
      setSelectedCardId(null);
      setHasChecked(false);
      setToastMessage(null);
    } else {
      // If clicking occupied slot, return card to shelf
      if (slotPlacements[slotIdx]) {
        sfx.playClick();
        setSlotPlacements(prev => {
          const next = [...prev];
          next[slotIdx] = null;
          return next;
        });
        setHasChecked(false);
      }
    }
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    if (hasChecked && isAllCorrect) return;
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDrop = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    if (hasChecked && isAllCorrect) return;
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId) {
      sfx.playClick();
      setSlotPlacements(prev => {
        const next = [...prev];
        const existingIdx = next.indexOf(cardId);
        if (existingIdx !== -1) {
          next[existingIdx] = null;
        }
        next[slotIdx] = cardId;
        return next;
      });
      setSelectedCardId(null);
      setHasChecked(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Check answers
  const handleVerify = () => {
    sfx.playClick();

    // Check if all 4 are placed
    const filledCount = slotPlacements.filter(Boolean).length;
    if (filledCount < 4) {
      sfx.playWrong();
      setToastMessage("Tarik atau ketuk semua 4 kartu ke dalam kotak urutan 1, 2, 3, dan 4 terlebih dahulu!");
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    // Verify order:
    // Slot 0 -> c1 (Mitokondria gangguan)
    // Slot 1 -> c2 (Produksi ATP menurun)
    // Slot 2 -> c3 (Ketersediaan energi berkurang)
    // Slot 3 -> c4 (Aktivitas sel terganggu)
    const expectedOrder = ['c1', 'c2', 'c3', 'c4'];
    let allRight = true;
    for (let i = 0; i < 4; i++) {
      if (slotPlacements[i] !== expectedOrder[i]) {
        allRight = false;
        break;
      }
    }

    setHasChecked(true);
    setIsAllCorrect(allRight);
    setShowFeedbackModal(true);

    if (allRight) {
      sfx.playCorrect();
    } else {
      sfx.playWrong();
    }
  };

  const handleReset = () => {
    sfx.playClick();
    setSlotPlacements([null, null, null, null]);
    setSelectedCardId(null);
    setHasChecked(false);
    setIsAllCorrect(false);
    setShowFeedbackModal(false);
  };

  const toggleFullScreen = () => {
    sfx.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto">
      {/* Top Header Labels matching screenshot: LEVEL 6 / Misi 1 */}
      <div className="mb-2 px-1 text-slate-800">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-fredoka">
          LEVEL 6
        </h1>
        <p className="text-sm font-semibold text-slate-600 -mt-0.5">
          Misi 1
        </p>
      </div>

      {/* Main Game Frame Container */}
      <div 
        className="relative w-full rounded-3xl overflow-hidden border-4 border-emerald-600/40 shadow-2xl bg-slate-900 select-none flex flex-col justify-between"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '600px'
        }}
      >
        {/* Soft landscape overlay tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 via-transparent to-emerald-950/30 pointer-events-none" />

        {/* Top Bar inside Canvas */}
        <div className="relative z-10 p-3 sm:p-5 flex items-start justify-between gap-3">
          {/* Level 6 Badge (Top-Left) */}
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 border-2 border-amber-200 text-white font-black text-sm sm:text-base shadow-lg tracking-wide">
            <span className="text-amber-100 font-fredoka">Level 6</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block ml-1 shadow-inner" />
          </div>

          {/* Wooden Signboard (Top-Center) */}
          <div className="flex-1 max-w-xl mx-auto text-center relative px-2">
            <div className="relative inline-block w-full bg-gradient-to-b from-[#8c4611] via-[#6d3408] to-[#452003] border-4 border-[#2d1401] rounded-2xl sm:rounded-3xl px-5 sm:px-8 py-2.5 sm:py-3 shadow-2xl">
              {/* Leaves sprouting on left and right */}
              <div className="absolute -left-3 -top-2 text-2xl filter drop-shadow">🍃</div>
              <div className="absolute -right-3 -top-2 text-2xl filter drop-shadow">🌿</div>

              <h2 className="text-lg sm:text-2xl md:text-3xl font-black font-fredoka text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide">
                Lacak Rantai Kerusakan
              </h2>
              <p className="text-xs sm:text-sm font-bold text-amber-200/90 mt-0.5 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                Temukan penyebab, proses, dan dampaknya!
              </p>
            </div>
          </div>

          {/* Advice Bubble with Lightbulb (Top-Right) */}
          <div className="hidden sm:flex items-start gap-2 bg-white/95 rounded-2xl p-2.5 shadow-xl border-2 border-sky-100 max-w-[210px] text-left">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Lightbulb className="w-4 h-4 fill-amber-400 text-amber-600" />
            </div>
            <p className="text-[11px] font-semibold text-slate-800 leading-snug">
              Pahami hubungan setiap langkah, agar kamu dapat menemukan penyebab masalahnya!
            </p>
          </div>
        </div>

        {/* Center Section: Boy Character + Instruction Bar + 4 Drop Targets */}
        <div className="relative z-10 px-3 sm:px-6 my-auto flex flex-col items-center gap-3 sm:gap-4 w-full">
          {/* Instruction Pill */}
          <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 border-2 border-sky-300 shadow-md flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shadow flex-shrink-0">
              <Hand className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-snug">
              <strong className="font-extrabold text-sky-950">Instruksi:</strong> Tarik setiap kartu dan susunlah sesuai urutan terjadinya gangguan dalam sel.
            </p>
          </div>

          {/* Sequence Slots Frame with Explorer Boy */}
          <div className="relative w-full max-w-4xl flex items-center justify-center">
            {/* Explorer Boy Character (left-side decoration) */}
            <div className="hidden md:block absolute -left-12 lg:-left-20 -bottom-8 w-28 lg:w-36 pointer-events-none z-20 drop-shadow-2xl">
              <img 
                src={characterImg} 
                alt="Petualang Cilik" 
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>

            {/* Sequence Drop Zones Container */}
            <div className="w-full bg-sky-50/75 backdrop-blur-sm border-2 border-sky-300/80 rounded-3xl p-3 sm:p-5 shadow-xl grid grid-cols-4 gap-2 sm:gap-3 items-center">
              {[0, 1, 2, 3].map(slotIdx => {
                const placedCardId = slotPlacements[slotIdx];
                const placedCard = placedCardId ? CHAIN_CARDS.find(c => c.id === placedCardId) : null;
                const isCorrect = hasChecked && placedCard && placedCard.correctSlotIndex === slotIdx;
                const isWrong = hasChecked && placedCard && placedCard.correctSlotIndex !== slotIdx;

                return (
                  <div key={slotIdx} className="relative flex items-center">
                    {/* The Slot Box */}
                    <div
                      onDrop={e => handleDrop(e, slotIdx)}
                      onDragOver={handleDragOver}
                      onClick={() => handleSlotClick(slotIdx)}
                      className={`w-full aspect-[4/3] rounded-2xl border-2 transition-all flex flex-col items-center justify-center p-1.5 sm:p-2 cursor-pointer relative overflow-hidden ${
                        placedCard
                          ? isCorrect
                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400'
                            : isWrong
                            ? 'border-rose-400 bg-rose-50 ring-2 ring-rose-300'
                            : 'border-slate-300 bg-white shadow-md'
                          : selectedCardId
                          ? 'border-dashed border-amber-400 bg-amber-50/80 hover:bg-amber-100 animate-pulse'
                          : 'border-dashed border-sky-400 bg-white/70 hover:bg-white/90'
                      }`}
                    >
                      {/* Top Circular Number Badge */}
                      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-sky-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-md">
                        {slotIdx + 1}
                      </div>

                      {/* Content inside Slot */}
                      {placedCard ? (
                        <div className="w-full h-full pt-6 flex flex-col items-center justify-between">
                          <img 
                            src={cardImages[placedCard.id] || placedCard.defaultImg}
                            alt={placedCard.title}
                            className="w-full h-[65%] object-contain rounded-lg"
                          />
                          <p className="text-[9px] sm:text-[11px] font-bold text-slate-800 text-center line-clamp-2 leading-tight px-1 mt-0.5">
                            {placedCard.title}
                          </p>

                          {/* Quick remove indicator on hover */}
                          <div className="absolute top-1 right-1 opacity-60 hover:opacity-100">
                            <span className="text-[10px] text-slate-400 hover:text-red-500 font-black">✕</span>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-6 text-center text-slate-400 flex flex-col items-center justify-center">
                          <span className="text-[10px] sm:text-xs font-semibold text-slate-400">
                            {selectedCardId ? 'Klik untuk pasang' : 'Tarik ke sini'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Connecting Blue Arrow between slots */}
                    {slotIdx < 3 && (
                      <div className="hidden sm:flex absolute -right-3 z-10 items-center justify-center text-sky-500 pointer-events-none drop-shadow">
                        <ArrowRight className="w-5 h-5 text-sky-500 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Shelf of Cards + Big Green Advance Button */}
        <div className="relative z-10 p-3 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-t from-emerald-950/80 via-emerald-900/40 to-transparent pt-4">
          {/* Card Tray */}
          <div className="flex-1 w-full flex items-center justify-center sm:justify-start gap-2 sm:gap-3 overflow-x-auto py-1">
            {shelfCards.length === 0 ? (
              <div className="text-xs sm:text-sm font-bold text-amber-200 bg-black/40 px-4 py-2 rounded-2xl border border-amber-300/30 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Semua kartu telah terpasang di kotak urutan! Klik tombol panah hijau untuk memeriksa.</span>
              </div>
            ) : (
              shelfCards.map(card => {
                const isSelected = selectedCardId === card.id;

                return (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={e => handleDragStart(e, card.id)}
                    onClick={() => handleCardClick(card.id)}
                    className={`w-28 sm:w-36 md:w-40 aspect-[4/3] rounded-2xl bg-white border-2 p-1.5 shadow-xl transition-all cursor-pointer flex flex-col justify-between relative hover:scale-105 active:scale-95 ${
                      isSelected
                        ? 'border-amber-400 ring-4 ring-amber-300/80 scale-105'
                        : 'border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    {/* Top Pill / Badge inside Card */}
                    <div className="flex items-center gap-1 bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md border border-red-200 text-[8px] sm:text-[9px] font-black truncate">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 text-white flex items-center justify-center text-[7px] flex-shrink-0">
                        {card.badgeType === 'warning' ? '!' : '↓'}
                      </span>
                      <span className="truncate">{card.badgeLabel}</span>
                    </div>

                    {/* Card Illustration */}
                    <div className="w-full h-[62%] rounded-lg overflow-hidden my-0.5 bg-slate-50 flex items-center justify-center">
                      <img 
                        src={cardImages[card.id] || card.defaultImg}
                        alt={card.title}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Bottom Title */}
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-800 text-center leading-tight truncate px-0.5">
                      {card.title}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Action Buttons: Reset + Big 3D Green Next Arrow Button */}
          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
            {slotPlacements.some(Boolean) && (
              <button
                type="button"
                onClick={handleReset}
                className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all cursor-pointer"
                title="Atur ulang kartu"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}

            {/* Big 3D Glossy Green Check/Next Button */}
            <button
              type="button"
              onClick={handleVerify}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-green-700 text-white shadow-[0_8px_20px_rgba(0,0,0,0.5)] border-3 border-emerald-200 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all group"
              title="Periksa Urutan Rantai Kerusakan"
            >
              <ArrowRight className="w-8 h-8 text-white stroke-[3] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Toast Guidance Notification */}
        {toastMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-amber-950/90 text-amber-200 px-4 py-2 rounded-2xl border border-amber-400/50 shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Bottom Pagination Bar matching screenshot */}
      <div className="mt-3 flex flex-col gap-2">
        {/* Progress track with dots */}
        <div className="relative w-full h-2.5 bg-slate-400/50 rounded-full flex items-center justify-between px-2 overflow-visible">
          {/* Blue progress track highlight up to current slide */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-blue-500 rounded-full"
            style={{ width: `${((currentSlideIdx + 1) / totalSlides) * 100}%` }}
          />

          {Array.from({ length: totalSlides }).map((_, idx) => {
            const isCurrent = idx === currentSlideIdx;
            const isPast = idx < currentSlideIdx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (onSelectSlide) {
                    sfx.playClick();
                    onSelectSlide(idx);
                  }
                }}
                className={`relative z-10 w-3 h-3 rounded-full border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? 'w-4 h-4 bg-white border-blue-600 ring-2 ring-blue-300 shadow scale-125'
                    : isPast
                    ? 'bg-blue-400 border-white hover:scale-110'
                    : 'bg-slate-300 border-slate-500 hover:scale-110'
                }`}
                title={`Pindah ke Slide ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Slide controls: [ ◀ ]  2 / 7  [ ▶ ] and Fullscreen */}
        <div className="flex items-center justify-between text-slate-700 text-xs sm:text-sm font-bold">
          <div className="flex-1" />

          {/* Centered Pagination Arrows */}
          <div className="flex items-center gap-2 bg-white/80 border border-slate-300 rounded-xl px-2 py-1 shadow-xs">
            <button
              type="button"
              onClick={onPrevSlide}
              disabled={!onPrevSlide || currentSlideIdx === 0}
              className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Slide Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-mono font-bold text-slate-800">
              {currentSlideIdx + 1} / {totalSlides}
            </span>

            <button
              type="button"
              onClick={onNextSlide}
              disabled={!onNextSlide || currentSlideIdx === totalSlides - 1}
              className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Slide Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Fullscreen Button on Right */}
          <div className="flex-1 flex justify-end">
            <button
              type="button"
              onClick={toggleFullScreen}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Layar Penuh"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Result / Verification Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className={`bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 text-center ${
            isAllCorrect ? 'border-emerald-400' : 'border-amber-400'
          }`}>
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white shadow-lg ${
              isAllCorrect ? 'bg-emerald-500' : 'bg-amber-500'
            }`}>
              {isAllCorrect ? (
                <Check className="w-10 h-10 stroke-[3]" />
              ) : (
                <AlertTriangle className="w-10 h-10" />
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black font-fredoka text-slate-900 mb-2">
              {isAllCorrect ? "Hebat Sekali! 🎉" : "Urutan Belum Tepat! 🌱"}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              {isAllCorrect
                ? "Tepat! Kamu berhasil melacak rantai kerusakan dari penyebab (gangguan mitokondria), penurunan ATP, krisis energi sel, hingga disfungsi aktivitas sel!"
                : "Belum tepat, Detektif Sel! Periksa kembali mana yang menjadi sumber masalah utama dan bagaimana dampaknya merambat secara bertahap."}
            </p>

            <div className="flex items-center justify-center gap-3">
              {isAllCorrect ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    onComplete();
                    if (onNextSlide) onNextSlide();
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg cursor-pointer active:scale-95 transition-all"
                >
                  Lanjut ke Misi 2
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow cursor-pointer active:scale-95 transition-all"
                  >
                    Periksa Kembali
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2.5 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                  >
                    Ulangi
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
