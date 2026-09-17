import React, { useState, useEffect, useRef } from 'react';
import { Stage, UserAccount } from '../types';
import { mapConfig } from '../data/gameData';
import { sfx } from '../utils/audio';
import { getMediaObjectURL, saveMediaBlob, getAssetCandidates } from '../utils/mediaStore';
import { getOrganelleThumbnail } from './OrganelleThumbnails';
import { ChecklistPhotoManagerModal } from './ChecklistPhotoManagerModal';
import { ProjectMediaManagerModal } from './ProjectMediaManagerModal';
import { 
  Star, 
  MapPin, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Upload, 
  Image as ImageIcon, 
  Info, 
  Camera, 
  Unlock, 
  HardDrive,
  LogOut,
  LogIn,
  Backpack
} from 'lucide-react';

interface GameMapProps {
  stages: Stage[];
  clearedStageIds: Set<string>;
  onSelectStage: (stage: Stage) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetProgress: () => void;
  onOpenHelp: () => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  onOpenLogin?: () => void;
}

interface PathSegment {
  id: string;
  fromStageIndex: number;
  toStageIndex: number;
  d: string;
}

export const GameMap: React.FC<GameMapProps> = ({
  stages,
  clearedStageIds,
  onSelectStage,
  soundEnabled,
  onToggleSound,
  onResetProgress,
  onOpenHelp,
  currentUser = null,
  onLogout,
  onOpenLogin
}) => {
  const [lockedAlert, setLockedAlert] = useState<string | null>(null);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [bgImageError, setBgImageError] = useState(false);
  const [isChecklistManagerOpen, setIsChecklistManagerOpen] = useState(false);
  const [isProjectMediaOpen, setIsProjectMediaOpen] = useState(false);
  const [isFreePlayUnlocked, setIsFreePlayUnlocked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stage0Hotspots = stages.find(s => s.stageIndex === 0)?.hotspotsData?.hotspots || [];

  const candidates = getAssetCandidates(mapConfig.backgroundImage, 'png');

  // Load custom stored map from IndexedDB if present
  useEffect(() => {
    getMediaObjectURL('asset_002').then(url => {
      if (url) {
        setCustomBgUrl(url);
        setBgImageError(false);
      }
    });
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objUrl = URL.createObjectURL(file);
    setCustomBgUrl(objUrl);
    setBgImageError(false);
    sfx.playCorrect();

    await saveMediaBlob('asset_002', file);
  };

  const handleImageError = () => {
    if (customBgUrl) {
      setBgImageError(true);
      return;
    }
    if (candidateIdx < candidates.length - 1) {
      setCandidateIdx(prev => prev + 1);
    } else {
      setBgImageError(true);
    }
  };

  const activeBgSource = customBgUrl || candidates[candidateIdx] || '/assets/asset_002.png';

  // Determine which stages are unlocked
  const isStageUnlocked = (stage: Stage): boolean => {
    // 1. GERBANG LOGIN: Jika belum login, semua tombol level otomatis terkunci
    if (!currentUser) {
      return false;
    }

    // Peran guru: dapat memantau seluruh level desa dalam mode observasi guru
    if (currentUser.role === 'guru') {
      return true;
    }

    if (isFreePlayUnlocked) {
      return true;
    }
    if (clearedStageIds.has(stage.id)) {
      return true;
    }
    if (stage.stageIndex === 0 || stage.stageIndex === 1 || stage.canBeStartStage) {
      return true;
    }
    // Any neighbor that has been cleared
    const hasNeighborCleared = stage.neighbors.some(neighborIdx => {
      const neighborStage = stages.find(s => s.stageIndex === neighborIdx);
      return neighborStage && clearedStageIds.has(neighborStage.id);
    });
    if (hasNeighborCleared) return true;

    // Sequential progression: if the previous stage was cleared, unlock this stage
    const prevStage = stages.find(s => s.stageIndex === stage.stageIndex - 1);
    if (prevStage && clearedStageIds.has(prevStage.id)) {
      return true;
    }

    return false;
  };

  const handleStageClick = (stage: Stage) => {
    // 1. GERBANG LOGIN: Jika belum login, pengguna TIDAK BISA mengklik level manapun
    if (!currentUser) {
      sfx.playWrong();
      setLockedAlert('🔒 Login Wajib: Tombol level terkunci! Silakan masuk dengan akun Siswa atau Guru untuk membuka petualangan.');
      setTimeout(() => setLockedAlert(null), 3500);
      if (onOpenLogin) {
        onOpenLogin();
      }
      return;
    }

    const unlocked = isStageUnlocked(stage);
    if (!unlocked) {
      sfx.playWrong();
      setLockedAlert(`Misi "${stage.label}" masih terkunci! Selesaikan level sebelumnya terlebih dahulu.`);
      setTimeout(() => setLockedAlert(null), 3000);
      return;
    }
    sfx.playClick();
    onSelectStage(stage);
  };

  const totalCleared = stages.filter(s => clearedStageIds.has(s.id)).length;
  const progressPercent = Math.round((totalCleared / stages.length) * 100);

  // Road path segments following the winding village trails on the map:
  // Sequence: Petunjuk -> Peta -> Level 1 -> Level 2 -> Level 3 -> Level 4 -> Level 5 -> Level 6 -> Level 7 -> Level 8
  const trailSegments: PathSegment[] = [
    // 0. Petunjuk (Jarum Kompas) -> Peta Desa Sel
    {
      id: 'petunjuk-to-peta',
      fromStageIndex: 0,
      toStageIndex: 1,
      d: 'M 4.5 65.8 C 6.0 80.0 16.0 90.0 26.8 90.0'
    },
    // 1. Peta -> Level 1 (along the main dirt road curving up to Level 1)
    {
      id: 'peta-to-l1',
      fromStageIndex: 1,
      toStageIndex: 2,
      d: 'M 26.8 90.0 C 21.0 76.0 16.0 57.0 17.5 39.5'
    },
    // 2. Level 1 -> Level 2 (across wooden bridge over river to rice paddies)
    {
      id: 'l1-to-l2',
      fromStageIndex: 2,
      toStageIndex: 3,
      d: 'M 17.5 39.5 C 22.0 48.0 27.5 52.0 32.5 48.0 C 34.5 45.5 35.8 43.5 37.3 42.0'
    },
    // 3. Level 2 -> Level 3 (winding north uphill through terraces to windmill)
    {
      id: 'l2-to-l3',
      fromStageIndex: 3,
      toStageIndex: 4,
      d: 'M 37.3 42.0 C 40.5 34.0 45.0 28.0 52.6 23.0'
    },
    // 4. Level 3 -> Level 4 (downhill forest trail)
    {
      id: 'l3-to-l4',
      fromStageIndex: 4,
      toStageIndex: 5,
      d: 'M 52.6 23.0 C 56.0 30.0 58.5 35.0 60.5 40.0'
    },
    // 5. Level 4 -> Level 5 (trail leading south through forest)
    {
      id: 'l4-to-l5',
      fromStageIndex: 5,
      toStageIndex: 6,
      d: 'M 60.5 40.0 C 56.5 48.0 52.0 54.0 47.7 60.0'
    },
    // 6. Level 5 -> Level 6 (southern road past village houses)
    {
      id: 'l5-to-l6',
      fromStageIndex: 6,
      toStageIndex: 7,
      d: 'M 47.7 60.0 C 54.5 65.0 61.5 69.5 68.4 73.0'
    },
    // 7. Level 6 -> Level 7 (up the wooden cliff stairs)
    {
      id: 'l6-to-l7',
      fromStageIndex: 7,
      toStageIndex: 8,
      d: 'M 68.4 73.0 C 73.0 63.0 76.0 54.0 78.4 45.5'
    },
    // 8. Level 7 -> Level 8 (clifftop road to glowing tree summit)
    {
      id: 'l7-to-l8',
      fromStageIndex: 8,
      toStageIndex: 9,
      d: 'M 78.4 45.5 C 81.5 36.0 83.8 28.5 85.8 23.0'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center select-none">
      {/* Hidden file input for asset_002 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Top Floating Control Bar - UNCHANGED as requested */}
      <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-emerald-900/60 px-4 py-2.5 sticky top-0 z-40 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold font-fredoka text-amber-200 leading-tight">
              Peta Petualangan Desa Sel
            </h1>
            <p className="text-[11px] text-emerald-300 font-medium hidden sm:block">
              BioVillage Simulator — Misi Analogi Biologi Sel
            </p>
          </div>
        </div>

        {/* Progress & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Logged-in Student Account Tag */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-emerald-950/85 border border-emerald-500/60 rounded-xl px-2.5 py-1 text-xs shadow-inner">
              <span className="text-base">{currentUser.avatar || '👦'}</span>
              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="font-bold text-amber-200 text-[11px] max-w-[110px] truncate">
                  {currentUser.fullName || currentUser.username}
                </span>
                <span className="text-[9px] text-emerald-300">
                  {currentUser.className || (currentUser.role === 'guru' ? 'Guru' : 'Siswa')}
                </span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    onLogout();
                  }}
                  className="p-1 rounded-lg text-emerald-400 hover:text-red-300 hover:bg-red-950/60 transition-colors cursor-pointer"
                  title="Keluar / Ganti Akun Siswa"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            onOpenLogin && (
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  onOpenLogin();
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300 transition-all cursor-pointer shadow active:scale-95"
                title="Masuk dengan Akun Siswa"
              >
                <Backpack className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Login Siswa</span>
              </button>
            )
          )}

          {/* Progress Indicator */}
          <div className="flex items-center gap-2.5 bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700">
            <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{totalCleared * 10} Poin</span>
            </div>
            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-300">{totalCleared}/{stages.length}</span>
          </div>

          {/* Project Media Manager (Permanent Storage for All Levels) */}
          <button
            type="button"
            onClick={() => setIsProjectMediaOpen(true)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white border border-teal-400/80 transition-all cursor-pointer shadow active:scale-95"
            title="Kelola & Simpan Permanen Gambar/Media Semua Level ke Folder Proyek"
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden lg:inline">Media Permanen Proyek</span>
            <span className="lg:hidden">Media</span>
          </button>

          {/* Quick Upload Map Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600 transition-all cursor-pointer"
            title="Ganti / Pilih Berkas Gambar Peta (asset_002)"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Peta (asset_002)</span>
          </button>

          {/* Quick Upload Checklist Photos Button */}
          {stage0Hotspots.length > 0 && (
            <button
              type="button"
              onClick={() => setIsChecklistManagerOpen(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400/80 transition-all cursor-pointer shadow active:scale-95"
              title="Upload Foto untuk Setiap Ceklis Petunjuk Peta (1-6)"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Foto Ceklis (1-6)</span>
              <span className="sm:hidden">Foto</span>
            </button>
          )}

          {/* Quick Unlock All Levels Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsFreePlayUnlocked(!isFreePlayUnlocked);
              sfx.playClick();
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isFreePlayUnlocked
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow ring-2 ring-amber-300/60'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={isFreePlayUnlocked ? "Mode Semua Level Terbuka Aktif (Klik untuk kembalikan kunci normal)" : "Buka Kunci Semua Level (Akses Bebas)"}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{isFreePlayUnlocked ? "Semua Terbuka" : "Buka Semua"}</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
            title={soundEnabled ? "Matikan Efek Suara" : "Nyalakan Efek Suara"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            type="button"
            onClick={onOpenHelp}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
            title="Bantuan & Petunjuk Awal"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onResetProgress}
            className="p-2 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-slate-700 cursor-pointer transition-colors"
            title="Reset Seluruh Kemajuan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Locked Alert Toast */}
      {lockedAlert && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-red-950/95 text-red-200 border-2 border-red-500/60 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 text-xs sm:text-sm font-semibold max-w-md text-center">
          <span className="text-base">🔒</span>
          <span>{lockedAlert}</span>
        </div>
      )}

      {/* Map Interactive Canvas Viewport */}
      <main className="w-full max-w-[1704px] p-1 sm:p-3 md:p-4 flex-1 flex flex-col justify-center">
        <div className="relative w-full aspect-[1704/923] rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-amber-900/60 bg-emerald-950/40">
          {/* Layer 1: Village Map Background Image */}
          {!bgImageError ? (
            <img
              key={activeBgSource}
              src={activeBgSource}
              alt="Peta Desa Sel"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
              onError={handleImageError}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-emerald-200 to-amber-100 flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-slate-900/85 text-white p-6 rounded-2xl border-2 border-amber-300 max-w-md shadow-2xl">
                <ImageIcon className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <h4 className="font-bold text-base sm:text-lg text-amber-200 mb-1">Peta Desa Sel (asset_002)</h4>
                <p className="text-xs text-slate-300 mb-4">
                  Letakkan file <code>asset_002.png</code> di <code>/public/assets/</code> atau pilih langsung menggunakan tombol di bawah ini.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow cursor-pointer transition-all active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>Pilih Berkas asset_002.png</span>
                </button>
              </div>
            </div>
          )}

          {/* Layer 2: Dotted Pathway connecting Start -> Petunjuk -> Level 1 -> ... -> Level 8 */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          >
            {trailSegments.map(segment => {
              const destStage = stages.find(s => s.stageIndex === segment.toStageIndex);
              const isCleared = destStage && clearedStageIds.has(destStage.id);

              return (
                <g key={segment.id}>
                  {/* Subtle ground shadow */}
                  <path
                    d={segment.d}
                    fill="none"
                    stroke="rgba(0, 0, 0, 0.45)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                  {/* Dotted pathway line following road */}
                  <path
                    d={segment.d}
                    fill="none"
                    stroke={isCleared ? "rgba(34, 197, 94, 0.95)" : "rgba(254, 240, 138, 0.95)"}
                    strokeWidth="0.6"
                    strokeDasharray="1.2 1.4"
                    strokeLinecap="round"
                    className={isCleared ? "" : "animate-pulse"}
                  />
                </g>
              );
            })}
          </svg>

          {/* Layer 3: Interactive Stage Pins with Biological Cell Thumbnails & 60% Padlocks */}
          {stages.map((stage) => {
            const isCleared = clearedStageIds.has(stage.id);
            const isUnlocked = isStageUnlocked(stage);
            const levelNum = stage.stageIndex >= 2 ? stage.stageIndex - 1 : null;

            return (
              <div
                key={stage.id}
                style={{
                  left: `${stage.telemetry.x}%`,
                  top: `${stage.telemetry.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                className="absolute z-20 flex flex-col items-center justify-center pointer-events-auto group"
              >
                {/* Interactive Node Button with Biological Cell Thumbnail */}
                <button
                  type="button"
                  id={`stage-pin-${stage.stageIndex}`}
                  onClick={() => handleStageClick(stage)}
                  className="relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-115 active:scale-95 focus:outline-none"
                  title={`${stage.label} — ${isCleared ? 'Selesai' : isUnlocked ? 'Tersedia' : 'Terkunci'}`}
                >
                  {/* CASE 1: CLEARED STATE -> Green Star Badge */}
                  {isCleared ? (
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 border-2 sm:border-3 border-white shadow-xl flex items-center justify-center">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-white text-white drop-shadow-sm" />
                    </div>
                  ) : isUnlocked ? (
                    /* CASE 2: UNLOCKED / ACTIVE STATE */
                    stage.stageIndex === 0 || stage.stageIndex === 1 ? (
                      /* Petunjuk and Peta: Clean yellow glowing dot ("hanya tanda titik warna kuning") */
                      <div className="relative w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 flex items-center justify-center">
                        <span className="absolute inset-0 rounded-full bg-amber-400/50 animate-ping" />
                        <div className="relative w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 sm:border-3 border-amber-100 shadow-xl shadow-amber-400/60 p-0.5 overflow-hidden">
                          {getOrganelleThumbnail(stage.stageIndex)}
                        </div>
                      </div>
                    ) : (
                      /* Unlocked Levels (Level 1–8): Biological Cell Thumbnail with glowing border */
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                        <span className="absolute -inset-1 rounded-full bg-amber-400/40 animate-ping" />
                        <div className="relative w-full h-full rounded-full border-2 sm:border-3 border-yellow-200 ring-2 ring-amber-400/90 shadow-xl shadow-amber-400/50 overflow-hidden bg-slate-900">
                          {getOrganelleThumbnail(stage.stageIndex)}
                        </div>
                      </div>
                    )
                  ) : (
                    /* CASE 3: LOCKED STATE -> Biological Cell Thumbnail + Padlock scaled to ~60% */
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 border-amber-400/60 shadow-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                      {/* Biological Cell Thumbnail for this level */}
                      <div className="absolute inset-0 opacity-75 grayscale-[20%]">
                        {getOrganelleThumbnail(stage.stageIndex)}
                      </div>

                      {/* Dark translucent overlay */}
                      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[0.5px]" />

                      {/* Scaled-down 60% Padlock Icon */}
                      <div className="relative z-10 flex items-center justify-center">
                        <svg
                          viewBox="0 0 24 28"
                          className="w-3.5 h-4 sm:w-4 sm:h-4.5 md:w-4.5 md:h-5 drop-shadow-md"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {/* Silver Shackle */}
                          <path
                            d="M6 12V7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7V12"
                            stroke="#F8FAFC"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11"
                            stroke="#94A3B8"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                          {/* Lock Body */}
                          <rect
                            x="3"
                            y="10"
                            width="18"
                            height="16"
                            rx="3.5"
                            fill="url(#lock-grad-small)"
                            stroke="#64748B"
                            strokeWidth="1.5"
                          />
                          {/* Keyhole */}
                          <circle cx="12" cy="16.5" r="1.8" fill="#0F172A" />
                          <path d="M11.2 17.5L10.8 21.5H13.2L12.8 17.5H11.2Z" fill="#0F172A" />

                          <defs>
                            <linearGradient id="lock-grad-small" x1="3" y1="10" x2="21" y2="26" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#F8FAFC" />
                              <stop offset="0.5" stopColor="#CBD5E1" />
                              <stop offset="1" stopColor="#94A3B8" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Level Number Badge (Tetap Terlihat) for Levels 1–8 */}
                  {levelNum !== null && (
                    <div
                      className={`absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-black font-fredoka text-[9px] sm:text-[11px] shadow-md border z-20 ${
                        isCleared
                          ? 'bg-amber-400 text-slate-950 border-white'
                          : isUnlocked
                          ? 'bg-amber-400 text-slate-950 border-white'
                          : 'bg-amber-900/90 text-amber-200 border-amber-400/60'
                      }`}
                    >
                      {levelNum}
                    </div>
                  )}
                </button>

                {/* Interactive Hover Card with Thumbnail & Sublabel */}
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none absolute z-40 w-44 sm:w-52 -bottom-2 translate-y-full left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white rounded-xl border border-amber-300/80 shadow-2xl p-2.5 flex flex-col gap-1.5 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 p-0.5 flex-shrink-0 flex items-center justify-center border border-slate-700 overflow-hidden">
                      {getOrganelleThumbnail(stage.stageIndex)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-fredoka font-bold text-xs text-amber-300 truncate">
                        {stage.label}
                      </div>
                      <div className="text-[10px] text-slate-300 truncate">
                        {stage.subLabel || "Misi Desa Sel"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] pt-1 border-t border-slate-800">
                    <span className={isCleared ? "text-amber-400 font-bold" : isUnlocked ? "text-emerald-400 font-bold" : "text-slate-400 font-medium"}>
                      {isCleared ? '⭐ Selesai' : isUnlocked ? '🔓 Siap Dimainkan' : '🔒 Terkunci'}
                    </span>
                    <span className="text-slate-400">Ketuk untuk buka</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer Navigation Bar */}
      <footer className="w-full bg-slate-900/90 border-t border-emerald-950 px-4 py-2 text-center text-xs text-emerald-400/80 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>🌿 Jalur Desa Sel: Petunjuk → Peta → Level 1 s.d. Level 8 • Sentuh titik untuk membuka misi!</span>
        <span className="text-slate-400">BioVillage Simulator • Kurikulum Merdeka Biologi Sel</span>
      </footer>

      {/* Checklist Photo Manager Modal */}
      {stage0Hotspots.length > 0 && (
        <ChecklistPhotoManagerModal
          hotspots={stage0Hotspots}
          isOpen={isChecklistManagerOpen}
          onClose={() => setIsChecklistManagerOpen(false)}
          title="Upload Foto Ceklis Petunjuk Peta (1 - 6)"
        />
      )}

      {/* Project Media Manager Modal (All Levels) */}
      <ProjectMediaManagerModal
        isOpen={isProjectMediaOpen}
        onClose={() => setIsProjectMediaOpen(false)}
      />
    </div>
  );
};
