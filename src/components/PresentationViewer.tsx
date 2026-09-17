import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PresentationSlide } from '../types';
import { resolveMediaPath, sfx } from '../utils/audio';
import { 
  getMediaResolvedURL, 
  saveMediaBlob, 
  deleteMediaBlob, 
  deleteCustomMediaUrl,
  onMediaUpdated 
} from '../utils/mediaStore';
import { QuizSingleChoice } from './QuizSingleChoice';
import { QuizMultiChoice } from './QuizMultiChoice';
import { DragDropActivity } from './DragDropActivity';
import { FillBlanksActivity } from './FillBlanksActivity';
import { Level3MediaModal } from './Level3MediaModal';
import { Level3Challenge } from './Level3Challenge';
import { Level6ChainChallenge } from './Level6ChainChallenge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  Film, 
  Image as ImageIcon, 
  Sparkles, 
  Upload, 
  RotateCcw, 
  Link as LinkIcon,
  Layers,
  Video
} from 'lucide-react';

interface PresentationViewerProps {
  slides: PresentationSlide[];
  onComplete: () => void;
  isAlreadyCleared?: boolean;
}

export const PresentationViewer: React.FC<PresentationViewerProps> = ({
  slides,
  onComplete,
  isAlreadyCleared = false
}) => {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [completedSlides, setCompletedSlides] = useState<Set<number>>(new Set());
  const [videoError, setVideoError] = useState<Record<number, boolean>>({});
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  // Custom media management
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaModalTab, setMediaModalTab] = useState<'video' | 'image' | 'dragdrop'>('video');
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(null);
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);
  const [hasCustomVideo, setHasCustomVideo] = useState(false);
  const [hasCustomImage, setHasCustomImage] = useState(false);

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const curSlide = slides[currentSlideIdx];
  const isLevel3 = slides.some(s => s.id?.includes('lvl3') || s.videoSource?.includes('035') || s.imageSource?.includes('036'));
  const isLevel6Chain = curSlide?.id === 'lvl6-s1' || 
                        curSlide?.title?.includes('Rantai Sebab-Akibat') || 
                        (curSlide?.hasDragDrop && curSlide?.dragDropTask?.dropZones?.some(z => z.id.includes('chain')));

  // Update media paths whenever slide changes or media updates
  const updateSlideMedia = useCallback(async () => {
    if (curSlide.videoSource) {
      const customUrl = await getMediaResolvedURL(curSlide.videoSource);
      if (customUrl) {
        setResolvedVideoUrl(customUrl);
        setHasCustomVideo(true);
        setVideoError(prev => ({ ...prev, [currentSlideIdx]: false }));
      } else {
        setResolvedVideoUrl(resolveMediaPath(curSlide.videoSource));
        setHasCustomVideo(false);
      }
    } else {
      setResolvedVideoUrl(null);
    }

    if (curSlide.imageSource) {
      const customImg = await getMediaResolvedURL(curSlide.imageSource);
      if (customImg) {
        setResolvedImageUrl(customImg);
        setHasCustomImage(true);
        setImageError(prev => ({ ...prev, [curSlide.id || currentSlideIdx.toString()]: false }));
      } else {
        setResolvedImageUrl(resolveMediaPath(curSlide.imageSource));
        setHasCustomImage(false);
      }
    } else {
      setResolvedImageUrl(null);
    }
  }, [curSlide.videoSource, curSlide.imageSource, curSlide.id, currentSlideIdx]);

  useEffect(() => {
    updateSlideMedia();
    const unsub = onMediaUpdated(() => {
      updateSlideMedia();
    });
    return unsub;
  }, [updateSlideMedia]);

  const handleNextSlide = () => {
    sfx.playClick();
    setCompletedSlides(prev => new Set(prev).add(currentSlideIdx));
    if (currentSlideIdx < slides.length - 1) {
      setCurrentSlideIdx(prev => prev + 1);
    } else {
      sfx.playStageComplete();
      onComplete();
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIdx > 0) {
      sfx.playClick();
      setCurrentSlideIdx(prev => prev - 1);
    }
  };

  const markCurrentSlideCompleted = () => {
    setCompletedSlides(prev => new Set(prev).add(currentSlideIdx));
  };

  // Quick Inline Video upload
  const handleQuickVideoUpload = async (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      alert('Mohon pilih berkas video yang valid (MP4, WebM, MOV).');
      return;
    }
    sfx.playClick();
    await saveMediaBlob('asset_035.mp4', file);
    await saveMediaBlob('asset_035', file);
    if (curSlide.videoSource) {
      await saveMediaBlob(curSlide.videoSource.replace('__MEDIA__', ''), file);
    }
    deleteCustomMediaUrl('asset_035.mp4');
    deleteCustomMediaUrl('asset_035');
    setVideoError(prev => ({ ...prev, [currentSlideIdx]: false }));
    await updateSlideMedia();
  };

  const handleResetCurrentVideo = async () => {
    sfx.playClick();
    await deleteMediaBlob('asset_035.mp4');
    await deleteMediaBlob('asset_035');
    deleteCustomMediaUrl('asset_035.mp4');
    deleteCustomMediaUrl('asset_035');
    setVideoError(prev => ({ ...prev, [currentSlideIdx]: false }));
    await updateSlideMedia();
  };

  // Quick Inline Image upload
  const handleQuickImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih berkas gambar yang valid (PNG, JPG, WEBP).');
      return;
    }
    sfx.playClick();
    await saveMediaBlob('asset_036.png', file);
    await saveMediaBlob('asset_036', file);
    if (curSlide.imageSource) {
      await saveMediaBlob(curSlide.imageSource.replace('__MEDIA__', ''), file);
    }
    deleteCustomMediaUrl('asset_036.png');
    deleteCustomMediaUrl('asset_036');
    setImageError(prev => ({ ...prev, [curSlide.id || currentSlideIdx.toString()]: false }));
    await updateSlideMedia();
  };

  const handleResetCurrentImage = async () => {
    sfx.playClick();
    await deleteMediaBlob('asset_036.png');
    await deleteMediaBlob('asset_036');
    deleteCustomMediaUrl('asset_036.png');
    deleteCustomMediaUrl('asset_036');
    setImageError(prev => ({ ...prev, [curSlide.id || currentSlideIdx.toString()]: false }));
    await updateSlideMedia();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hidden file inputs for quick inline uploads */}
      <input
        ref={videoFileInputRef}
        type="file"
        accept="video/*,.mp4,.webm,.mov"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleQuickVideoUpload(f);
          if (videoFileInputRef.current) videoFileInputRef.current.value = '';
        }}
      />
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleQuickImageUpload(f);
          if (imageFileInputRef.current) imageFileInputRef.current.value = '';
        }}
      />

      {/* Slide Navigation Top Bar */}
      {!isLevel6Chain && (
        <div className="bg-emerald-900/90 text-white rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md border border-emerald-500/30">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              disabled={currentSlideIdx === 0}
              onClick={handlePrevSlide}
              className={`p-1.5 rounded-lg transition-colors ${
                currentSlideIdx > 0
                  ? 'hover:bg-emerald-800 text-white cursor-pointer active:scale-95'
                  : 'text-emerald-500/40 cursor-not-allowed'
              }`}
              title="Slide Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-xs sm:text-sm font-bold tracking-wide">
              Slide {currentSlideIdx + 1} / {slides.length}
              {curSlide.title && (
                <span className="hidden sm:inline text-emerald-200 font-normal ml-2">
                  • {curSlide.title}
                </span>
              )}
            </span>

            <button
              type="button"
              disabled={currentSlideIdx === slides.length - 1 && !isAlreadyCleared && !completedSlides.has(currentSlideIdx)}
              onClick={handleNextSlide}
              className={`p-1.5 rounded-lg transition-colors ${
                currentSlideIdx < slides.length - 1
                  ? 'hover:bg-emerald-800 text-white cursor-pointer active:scale-95'
                  : 'text-emerald-500/40 cursor-not-allowed'
              }`}
              title="Slide Selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons: Media Manager + Progress Dots + Quick Complete */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Level 3 Media Manager Trigger Button (Only shown on Level 3) */}
            {isLevel3 && (
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  if (currentSlideIdx === 0) setMediaModalTab('video');
                  else if (currentSlideIdx === 1) setMediaModalTab('image');
                  else setMediaModalTab('dragdrop');
                  setIsMediaModalOpen(true);
                }}
                className="px-2.5 sm:px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                title="Buka menu untuk memasukkan video dan gambar ke Level 3"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-950" />
                <span className="hidden sm:inline">Masukkan Video &amp; Gambar</span>
                <span className="sm:hidden">Media</span>
              </button>
            )}

            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    setCurrentSlideIdx(idx);
                  }}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === currentSlideIdx
                      ? 'w-7 bg-amber-400'
                      : completedSlides.has(idx) || isAlreadyCleared
                      ? 'w-2.5 bg-emerald-400'
                      : 'w-2.5 bg-emerald-700/80 hover:bg-emerald-600'
                  }`}
                  title={`Ke Slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                sfx.playStageComplete();
                onComplete();
              }}
              className="px-2.5 sm:px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Selesaikan pengerjaan level ini dan buka kunci level selanjutnya"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
              <span className="hidden sm:inline">Selesai Misi</span>
            </button>
          </div>
        </div>
      )}

      {/* Slide Content Display */}
      <div className="relative min-h-[400px]">
        {/* Type A: Video Slide (Slide 1 Level 3) */}
        {curSlide.videoSource && (
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {/* Inline Quick Media Control Toolbar */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold flex-shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-fredoka flex items-center gap-1.5">
                    Fitur Video Slide 1: Simulasi Produksi Protein
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {hasCustomVideo ? (
                      <span className="text-emerald-700 font-semibold">
                        ✅ Video khusus buatanmu aktif diputar
                      </span>
                    ) : (
                      "Format: MP4, WebM, atau MOV (dapat diganti kapan saja)"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <button
                  type="button"
                  onClick={() => videoFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all"
                  title="Unggah berkas video dari komputer / HP Anda"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMediaModalTab('video');
                    setIsMediaModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Atur link URL atau opsi video lainnya"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Atur</span>
                </button>

                {hasCustomVideo && (
                  <button
                    type="button"
                    onClick={handleResetCurrentVideo}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                    title="Kembalikan ke video bawaan sistem"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Video Player Display Container */}
            <div className="relative rounded-3xl overflow-hidden border-4 border-amber-200 shadow-2xl bg-slate-950 aspect-video flex items-center justify-center">
              {resolvedVideoUrl && !videoError[currentSlideIdx] ? (
                <video
                  key={resolvedVideoUrl}
                  src={resolvedVideoUrl}
                  controls
                  className="w-full h-full object-contain"
                  onError={() => setVideoError(prev => ({ ...prev, [currentSlideIdx]: true }))}
                >
                  Browser Anda tidak mendukung tag video.
                </video>
              ) : (
                /* Interactive Drag & Drop / Click to Upload Dropzone */
                <div 
                  onClick={() => videoFileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleQuickVideoUpload(f);
                  }}
                  className="p-8 text-center text-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-900 transition-colors w-full h-full group"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white mb-1">
                    {isLevel3 ? "Masukkan Video Simulasi Protein" : `Video: ${curSlide.title || "Materi Pembelajaran"}`}
                  </h4>
                  <p className="text-xs text-amber-200 max-w-sm mb-3">
                    {isLevel3
                      ? "Klik atau seret berkas video (MP4 / WebM) ke area ini untuk memutar video Anda di Level 3"
                      : "Klik atau seret berkas video (MP4 / WebM) ke area ini untuk memutar video materi"}
                  </p>
                  <span className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-md">
                    Pilih Berkas Video
                  </span>
                </div>
              )}
            </div>

            {/* Next Step Action Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNextSlide}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-lg cursor-pointer active:scale-95 transition-transform"
              >
                <span>{curSlide.nextButtonTitle || "Lanjut ke Misi Berikutnya"}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Type B: Image Presentation Slide (Slide 2 Level 3) */}
        {curSlide.imageSource && !curSlide.hasSingleChoiceSet && !curSlide.hasMultiChoice && !curSlide.hasFillBlanks && (
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {/* Inline Quick Media Control Toolbar */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold flex-shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-fredoka flex items-center gap-1.5">
                    Fitur Gambar Slide 2: Skema Perjalanan Molekul Protein
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {hasCustomImage ? (
                      <span className="text-emerald-700 font-semibold">
                        ✅ Gambar khusus buatanmu aktif ditampilkan
                      </span>
                    ) : (
                      "Format: PNG, JPG, WEBP (dapat diganti kapan saja)"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <button
                  type="button"
                  onClick={() => imageFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all"
                  title="Unggah berkas gambar dari komputer / HP Anda"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah Gambar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMediaModalTab('image');
                    setIsMediaModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Atur link URL atau opsi gambar lainnya"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Atur</span>
                </button>

                {hasCustomImage && (
                  <button
                    type="button"
                    onClick={handleResetCurrentImage}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                    title="Kembalikan ke gambar bawaan sistem"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Image Viewer Display Container */}
            <div className="rounded-3xl overflow-hidden border-4 border-amber-200 shadow-2xl bg-white p-2">
              {resolvedImageUrl && !imageError[curSlide.id || currentSlideIdx.toString()] ? (
                <div className="relative group">
                  <img
                    key={resolvedImageUrl}
                    src={resolvedImageUrl}
                    alt={curSlide.title || "Slide Penjelasan"}
                    className="w-full h-auto max-h-[520px] object-contain mx-auto rounded-2xl"
                    onError={() => {
                      setImageError(prev => ({ ...prev, [curSlide.id || currentSlideIdx.toString()]: true }));
                    }}
                  />
                  <div 
                    onClick={() => imageFileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center cursor-pointer"
                  >
                    <span className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Ganti Gambar Ini
                    </span>
                  </div>
                </div>
              ) : (
                /* Interactive Drag & Drop / Click to Upload Dropzone for Image */
                <div 
                  onClick={() => imageFileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleQuickImageUpload(f);
                  }}
                  className="p-8 text-center text-slate-600 flex flex-col items-center justify-center bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-300 cursor-pointer hover:bg-amber-100/50 transition-colors group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-xs group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mb-1 font-fredoka">
                    Masukkan Gambar Skema Protein
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mb-3">
                    Klik atau seret file gambar (PNG / JPG) ke sini untuk langsung menampilkan poster / skema buatanmu
                  </p>
                  <span className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md">
                    Pilih Berkas Gambar
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNextSlide}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-lg cursor-pointer active:scale-95 transition-transform"
              >
                <span>{curSlide.nextButtonTitle || "Misi Selanjutnya"}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Type C: Single Choice Set */}
        {curSlide.hasSingleChoiceSet && curSlide.singleChoiceQuestions && (
          <div className="flex flex-col gap-6">
            {curSlide.imageSource && (
              <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md bg-white">
                {!imageError[`sc-${curSlide.id || currentSlideIdx}`] ? (
                  <img
                    src={resolveMediaPath(curSlide.imageSource)}
                    alt="Ilustrasi Soal"
                    className="w-full h-auto max-h-48 object-contain mx-auto"
                    onError={() => {
                      setImageError(prev => ({ ...prev, [`sc-${curSlide.id || currentSlideIdx}`]: true }));
                    }}
                  />
                ) : (
                  <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 flex items-center justify-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <span>Slot Media: <code>{curSlide.imageSource.replace('__MEDIA__', '')}</code></span>
                  </div>
                )}
              </div>
            )}
            <QuizSingleChoice
              questions={curSlide.singleChoiceQuestions}
              onComplete={(score) => {
                markCurrentSlideCompleted();
                handleNextSlide();
              }}
            />
          </div>
        )}

        {/* Type D: Multiple Choice (Reflection Level 8) */}
        {curSlide.hasMultiChoice && curSlide.multiChoiceQuestion && (
          <div className="flex flex-col gap-6">
            {curSlide.imageSource && (
              <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md bg-white">
                {!imageError[`mc-${curSlide.id || currentSlideIdx}`] ? (
                  <img
                    src={resolveMediaPath(curSlide.imageSource)}
                    alt="Ilustrasi Refleksi"
                    className="w-full h-auto max-h-56 object-contain mx-auto"
                    onError={() => {
                      setImageError(prev => ({ ...prev, [`mc-${curSlide.id || currentSlideIdx}`]: true }));
                    }}
                  />
                ) : (
                  <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 flex items-center justify-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <span>Slot Media: <code>{curSlide.imageSource.replace('__MEDIA__', '')}</code></span>
                  </div>
                )}
              </div>
            )}
            <QuizMultiChoice
              question={curSlide.multiChoiceQuestion}
              nextButtonLabel={curSlide.nextButtonTitle || "Lanjut"}
              onAnswerSubmit={() => {
                markCurrentSlideCompleted();
                handleNextSlide();
              }}
            />
          </div>
        )}

        {/* Type E: Drag and Drop Task inside Slide (Slide 3 Level 3 & Level 6 Chain) */}
        {curSlide.hasDragDrop && curSlide.dragDropTask && (
          <div className="flex flex-col gap-4">
            {isLevel3 ? (
              <Level3Challenge
                onComplete={() => {
                  markCurrentSlideCompleted();
                  if (currentSlideIdx < slides.length - 1) {
                    handleNextSlide();
                  } else {
                    onComplete();
                  }
                }}
                isAlreadyCleared={isAlreadyCleared}
                onPrevSlide={currentSlideIdx > 0 ? handlePrevSlide : undefined}
                onNextSlide={currentSlideIdx < slides.length - 1 ? handleNextSlide : undefined}
                currentSlideIdx={currentSlideIdx}
                totalSlides={slides.length}
                onOpenMediaModal={() => {
                  setMediaModalTab('dragdrop');
                  setIsMediaModalOpen(true);
                }}
              />
            ) : isLevel6Chain ? (
              <Level6ChainChallenge
                onComplete={() => {
                  markCurrentSlideCompleted();
                  if (currentSlideIdx < slides.length - 1) {
                    handleNextSlide();
                  } else {
                    onComplete();
                  }
                }}
                isAlreadyCleared={isAlreadyCleared}
                onPrevSlide={currentSlideIdx > 0 ? handlePrevSlide : undefined}
                onNextSlide={currentSlideIdx < slides.length - 1 ? handleNextSlide : undefined}
                onSelectSlide={(idx) => setCurrentSlideIdx(idx)}
                currentSlideIdx={currentSlideIdx}
                totalSlides={slides.length}
              />
            ) : (
              <DragDropActivity
                task={curSlide.dragDropTask}
                title={curSlide.title}
                isAlreadyCleared={isAlreadyCleared}
                onComplete={() => {
                  markCurrentSlideCompleted();
                  handleNextSlide();
                }}
              />
            )}
          </div>
        )}

        {/* Type F: Fill in the Blanks inside Slide */}
        {curSlide.hasFillBlanks && curSlide.fillBlanksText && (
          <FillBlanksActivity
            rawText={curSlide.fillBlanksText}
            isAlreadyCleared={isAlreadyCleared}
            onComplete={() => {
              markCurrentSlideCompleted();
              handleNextSlide();
            }}
          />
        )}
      </div>

      {/* Level 3 Media Manager Modal */}
      <Level3MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        initialTab={mediaModalTab}
      />
    </div>
  );
};

