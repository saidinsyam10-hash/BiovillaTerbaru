export interface HotspotContent {
  type: 'image' | 'audio' | 'video' | 'text';
  filePath?: string;
  alt?: string;
  title?: string;
}

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  title?: string;
  contents: HotspotContent[];
  size?: 'large' | 'small';
}

export interface SingleChoiceQuestion {
  id: string;
  question: string;
  answers: string[]; // First answer is usually correct in H5P single choice set
  feedback?: string;
}

export interface DragItem {
  id: string;
  title: string;
  image?: string;
  alt?: string;
}

export interface DropZone {
  id: string;
  label: string;
  correctElementIds: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  image?: string;
  description?: string;
}

export interface DragDropTask {
  backgroundImage?: string;
  elements: DragItem[];
  dropZones: DropZone[];
  feedbackSuccess?: string;
  feedbackFail?: string;
}

export interface MultiChoiceOption {
  text: string;
  correct: boolean;
  feedback?: string;
}

export interface MultiChoiceQuestion {
  id: string;
  question: string;
  options: MultiChoiceOption[];
  feedbackSuccess?: string;
  feedbackFail?: string;
}

export interface FillBlankWord {
  id: string;
  correct: string;
  userAnswer?: string;
}

export type StageType = 'hotspot' | 'presentation' | 'dragdrop';

export interface Stage {
  id: string;
  stageIndex: number;
  label: string;
  subLabel?: string;
  telemetry: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  neighbors: number[];
  canBeStartStage: boolean;
  stageType: StageType;
  icon?: string;
  // Specific stage data
  hotspotsData?: {
    image: string;
    hotspots: Hotspot[];
  };
  dragDropData?: DragDropTask;
  presentationData?: {
    slides: PresentationSlide[];
  };
}

export interface PresentationSlide {
  id: string;
  title?: string;
  backgroundImage?: string;
  videoSource?: string;
  imageSource?: string;
  hasSingleChoiceSet?: boolean;
  singleChoiceQuestions?: SingleChoiceQuestion[];
  hasMultiChoice?: boolean;
  multiChoiceQuestion?: MultiChoiceQuestion;
  hasDragDrop?: boolean;
  dragDropTask?: DragDropTask;
  hasFillBlanks?: boolean;
  fillBlanksText?: string;
  nextButtonTitle?: string;
}

export interface GameProgress {
  clearedStages: string[]; // stage ids
  scores: Record<string, number>;
  totalStars: number;
  soundEnabled: boolean;
  hasSeenIntro: boolean;
}

export type UserRole = 'siswa' | 'guru';

export interface UserAccount {
  username: string;
  password?: string;
  role: UserRole;
  fullName: string;
  nama?: string;
  className?: string;
  avatar?: string;
  clearedStagesCount?: number;
  totalStars?: number;
  currentLevelLabel?: string;
  lastActive?: string;
  progres?: Record<string, boolean>;
  poin?: number;
  savedAnswers?: Record<string, any>;
}

export interface StudentProgressRecord {
  id: string;
  username: string;
  fullName: string;
  nama?: string;
  role: 'siswa';
  className: string;
  clearedStagesCount: number;
  totalStages: number;
  totalStars: number;
  poin?: number;
  lastLevel: string;
  lastActive: string;
  status: 'Tuntas' | 'Sedang Berjalan' | 'Belum Mulai';
  progres?: Record<string, boolean>;
}
