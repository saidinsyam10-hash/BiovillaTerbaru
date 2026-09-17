import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Film, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Plus, 
  Search, 
  Map, 
  LogOut, 
  Sparkles, 
  Star, 
  Award, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  X,
  FileCheck,
  Video,
  Image as ImageIcon
} from 'lucide-react';
import { UserAccount, StudentProgressRecord } from '../types';
import { getStudentsList, resetStudentProgress, addStudentRecord, deleteStudentRecord } from '../utils/authStore';
import { sfx } from '../utils/audio';
import { stagesData } from '../data/gameData';

interface TeacherDashboardProps {
  currentUser: UserAccount;
  onLogout: () => void;
  onPreviewMap: () => void;
  onOpenMediaManager: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  onLogout,
  onPreviewMap,
  onOpenMediaManager
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'media' | 'curriculum'>('students');
  const [students, setStudents] = useState<StudentProgressRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<StudentProgressRecord | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // New Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentUsername, setNewStudentUsername] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('Kelas XI IPA 1');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    setStudents(getStudentsList());
  };

  const handleResetProgress = (username: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin me-reset progres belajar untuk ${name}? Capaian bintang dan level akan kembali ke awal.`)) {
      sfx.playClick();
      resetStudentProgress(username);
      loadStudents();
      if (selectedStudentForDetail && selectedStudentForDetail.username === username) {
        setSelectedStudentForDetail(null);
      }
    }
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentUsername.trim() || !newStudentName.trim()) return;

    addStudentRecord({
      id: `std-${Date.now()}`,
      username: newStudentUsername.trim().toLowerCase(),
      fullName: newStudentName.trim(),
      nama: newStudentName.trim(),
      role: 'siswa',
      className: newStudentClass,
      clearedStagesCount: 0,
      totalStages: 8,
      totalStars: 0,
      poin: 0,
      progres: {
        level1: false,
        level2: false,
        level3: false,
        level4: false,
        level5: false,
        level6: false,
        level7: false,
        level8: false
      },
      lastLevel: 'Belum Mulai',
      lastActive: 'Baru ditambahkan',
      status: 'Belum Mulai'
    });

    sfx.playCorrect();
    setShowAddStudentModal(false);
    setNewStudentName('');
    setNewStudentUsername('');
    loadStudents();
  };

  // Filtered students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'all' || s.className === classFilter;
    return matchesSearch && matchesClass;
  });

  // Calculate statistics
  const totalStudents = students.length;
  const completedStudents = students.filter(s => s.clearedStagesCount >= 8 || s.status === 'Tuntas').length;
  const inProgressStudents = students.filter(s => s.clearedStagesCount > 0 && s.clearedStagesCount < 8).length;
  const totalStarsAll = students.reduce((acc, curr) => acc + (curr.totalStars || 0), 0);
  const avgStars = totalStudents > 0 ? (totalStarsAll / totalStudents).toFixed(1) : '0';

  // Mission levels mapping
  const missionLevels = [
    { num: 1, label: 'Pos Penjagaan', organelle: 'Membran Sel', icon: '🛡️', stageIndex: 2 },
    { num: 2, label: 'Observatorium', organelle: 'Retikulum Endoplasma', icon: '🔭', stageIndex: 3 },
    { num: 3, label: 'Protein Express', organelle: 'Badan Golgi', icon: '📦', stageIndex: 4 },
    { num: 4, label: 'Pembangkit Tenaga', organelle: 'Mitokondria', icon: '⚡', stageIndex: 5 },
    { num: 5, label: 'Pusat Daur Ulang', organelle: 'Lisosom & Peroksisom', icon: '♻️', stageIndex: 6 },
    { num: 6, label: 'Gudang Logistik', organelle: 'Vakuola', icon: '🏰', stageIndex: 7 },
    { num: 7, label: 'Kebun Energi Surya', organelle: 'Kloroplas', icon: '☀️', stageIndex: 8 },
    { num: 8, label: 'Balai Desa Utama', organelle: 'Nukleus (Inti Sel)', icon: '🏛️', stageIndex: 9 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-emerald-800/50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Teacher Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md">
              👩‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-amber-200 tracking-tight font-fredoka">
                  Dashboard Pengajar BioVillage
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Peran Guru
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                {currentUser.nama || currentUser.fullName} • NIP/Kode: <code className="text-amber-300 font-mono">{currentUser.username}</code>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                onPreviewMap();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all cursor-pointer active:scale-95 border border-emerald-400/30"
              title="Pratinjau peta dalam mode observasi guru tanpa menjawab kuis"
            >
              <Map className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Pratinjau Peta Desa</span>
              <span className="sm:hidden">Peta</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                onLogout();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:text-red-200 border border-slate-700 hover:border-red-500 text-slate-300 font-semibold text-xs transition-all cursor-pointer active:scale-95"
              title="Keluar dari akun guru"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Mode Guru Notification */}
        <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-200">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Mode Guru Aktif:</strong> Anda dapat memantau perolehan bintang &amp; level seluruh siswa, serta mengelola video dan gambar materi tiap level. Guru tidak mengerjakan tugas siswa.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              onOpenMediaManager();
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer shadow-sm"
          >
            <Video className="w-3.5 h-3.5 text-emerald-950" />
            <span>Kelola Media Level</span>
          </button>
        </div>

        {/* Analytics Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-800/80 border border-emerald-700/40 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Total Siswa</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-fredoka">{totalStudents}</div>
            <p className="text-[11px] text-slate-400 mt-1">Terdaftar di sistem</p>
          </div>

          <div className="bg-slate-800/80 border border-emerald-700/40 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Siswa Tuntas</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300 font-fredoka">{completedStudents}</div>
            <p className="text-[11px] text-emerald-400/80 mt-1">Selesai 8 level penuh</p>
          </div>

          <div className="bg-slate-800/80 border border-emerald-700/40 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Sedang Berjalan</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-sky-300 font-fredoka">{inProgressStudents}</div>
            <p className="text-[11px] text-slate-400 mt-1">Dalam pengerjaan misi</p>
          </div>

          <div className="bg-slate-800/80 border border-emerald-700/40 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Rata-rata Bintang</span>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="text-2xl font-black text-yellow-300 font-fredoka">{avgStars} ⭐</div>
            <p className="text-[11px] text-slate-400 mt-1">Dari total {totalStarsAll} bintang</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700/80 gap-2 sm:gap-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setActiveTab('students');
            }}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'students'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Rekapitulasi Progres Siswa</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
              {students.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setActiveTab('media');
            }}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'media'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Kelola Konten &amp; Media Level</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setActiveTab('curriculum');
            }}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'curriculum'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Panduan Guru &amp; Kurikulum</span>
          </button>
        </div>

        {/* TAB 1: REKAPITULASI PROGRES SISWA */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            {/* Filter and Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari siswa atau username..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <select
                  value={classFilter}
                  onChange={e => setClassFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="all">Semua Kelas</option>
                  <option value="Kelas XI IPA 1">Kelas XI IPA 1</option>
                  <option value="Kelas XI IPA 2">Kelas XI IPA 2</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    setShowAddStudentModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Siswa</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
                    <tr>
                      <th className="py-3.5 px-4">Nama Siswa</th>
                      <th className="py-3.5 px-4">Kelas</th>
                      <th className="py-3.5 px-4">Kemajuan Level</th>
                      <th className="py-3.5 px-4">Poin &amp; Bintang</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Aktivitas</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => {
                        const progressPercent = Math.min(100, Math.round((student.clearedStagesCount / 8) * 100));
                        const isFinished = student.clearedStagesCount >= 8;
                        const studentPoints = student.poin !== undefined ? student.poin : student.totalStars * 10;

                        return (
                          <tr key={student.id || student.username} className="hover:bg-slate-750/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl">{student.username === 'ani' ? '👧' : student.username === 'fauzan' ? '🧑' : student.username === 'citra' ? '👩' : '👦'}</span>
                                <div>
                                  <div className="font-bold text-slate-100">{student.fullName || student.nama}</div>
                                  <div className="text-[11px] text-slate-400 font-mono">@{student.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-300 font-medium">
                              {student.className}
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-1 max-w-[130px]">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-amber-300">{student.clearedStagesCount}/8 Level</span>
                                  <span className="text-slate-400">{progressPercent}%</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      isFinished ? 'bg-amber-400' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 font-bold">
                                <span className="text-amber-300">{studentPoints} Poin</span>
                                <span className="text-yellow-400 text-xs flex items-center">
                                  ({student.totalStars} ⭐)
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isFinished
                                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                  : student.clearedStagesCount > 0
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-slate-700 text-slate-400'
                              }`}>
                                {isFinished ? '✓ Tuntas' : student.clearedStagesCount > 0 ? 'Sedang Berjalan' : 'Belum Mulai'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-400">
                              {student.lastActive}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    sfx.playClick();
                                    setSelectedStudentForDetail(student);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                                  title="Lihat rincian 8 level"
                                >
                                  Detail
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResetProgress(student.username, student.fullName)}
                                  className="p-1 rounded-lg bg-slate-700 hover:bg-red-900/60 text-slate-300 hover:text-red-300 transition-all cursor-pointer"
                                  title="Reset progres siswa"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Tidak ada siswa yang sesuai dengan filter pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KELOLA KONTEN & MEDIA LEVEL */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-amber-200 font-fredoka">
                  Pengelolaan Media Pembelajaran Per Level
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Anda dapat memperbarui video panduan dan foto analogi fasilitas desa untuk masing-masing level misi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  onOpenMediaManager();
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer flex-shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Buka Panel Media Lengkap</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {missionLevels.map(lvl => (
                <div
                  key={lvl.num}
                  className="bg-slate-800/90 rounded-2xl border border-slate-700 p-4 flex flex-col justify-between hover:border-amber-400/50 transition-all shadow-md group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                        Level {lvl.num}
                      </span>
                      <span className="text-2xl">{lvl.icon}</span>
                    </div>

                    <h4 className="font-bold text-slate-100 text-sm">{lvl.label}</h4>
                    <p className="text-xs text-emerald-300 font-medium mt-0.5">
                      Analogi: {lvl.organelle}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                      Modul interaktif dengan media pengamatan mikroskopis dan analogi kehidupan desa sel.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Media Aktif
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sfx.playClick();
                        onOpenMediaManager();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Ubah Media</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PANDUAN GURU & KURIKULUM */}
        {activeTab === 'curriculum' && (
          <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-amber-200 font-fredoka">
                Petunjuk Pelaksanaan Pembelajaran di Kelas
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Panduan untuk guru biologi dalam memanfaatkan BioVillage Simulator pada Kurikulum Merdeka (Fase F - Biologi Sel SMA).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-2">
                <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                  <span>🎯</span>
                  <span>Capaian Pembelajaran (CP)</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Peserta didik mampu menganalisis keterkaitan antara struktur organel sel (membran sel, nukleus, retikulum endoplasma, badan golgi, mitokondria, lisosom, vakuola, kloroplas) dengan fungsinya melalui analogi fungsional tata kelola desa sel.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-2">
                <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                  <span>⭐</span>
                  <span>Kriteria Ketuntasan &amp; Penilaian</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Siswa dinyatakan tuntas apabila menyelesaikan ke-8 level misi dan memperoleh minimal 80% poin pada kuis evaluasi pemahaman organel di Balai Desa Utama (Level 8).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
              <h4 className="font-bold text-sm text-emerald-200 mb-2">Langkah Pembelajaran yang Disarankan:</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                <li>Beri instruksi kepada siswa untuk login menggunakan <strong>NISN / Username</strong> masing-masing.</li>
                <li>Siswa memulai dari <strong>Papan Petunjuk Desa</strong> dan mengeksplorasi peta interaktif.</li>
                <li>Gunakan <strong>Dashboard Guru</strong> untuk memantau progres siswa secara berkala saat kegiatan di kelas/lab.</li>
                <li>Setelah seluruh siswa tuntas, buka sesi refleksi untuk mendiskusikan keterkaitan antar organel sel.</li>
              </ol>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DETAIL SISWA (8 LEVEL) */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-600 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedStudentForDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800 flex items-center justify-center text-2xl">
                🎒
              </div>
              <div>
                <h3 className="font-bold text-lg text-white font-fredoka">
                  {selectedStudentForDetail.fullName}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedStudentForDetail.className} • @{selectedStudentForDetail.username}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800">
                <span className="text-slate-400 block text-[11px]">Level Selesai</span>
                <span className="font-bold text-amber-300 text-sm">
                  {selectedStudentForDetail.clearedStagesCount} dari 8 Level
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800">
                <span className="text-slate-400 block text-[11px]">Total Perolehan</span>
                <span className="font-bold text-yellow-300 text-sm">
                  {(selectedStudentForDetail.poin !== undefined ? selectedStudentForDetail.poin : selectedStudentForDetail.totalStars * 10)} Poin ({selectedStudentForDetail.totalStars} ⭐)
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Status Rincian 8 Level Misi:
              </h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {missionLevels.map(lvl => {
                  const isCleared = (selectedStudentForDetail.clearedStagesCount >= lvl.num) ||
                    (selectedStudentForDetail.progres && selectedStudentForDetail.progres[`level${lvl.num}`]);
                  return (
                    <div
                      key={lvl.num}
                      className={`p-2.5 rounded-xl flex items-center justify-between text-xs border ${
                        isCleared
                          ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lvl.icon}</span>
                        <div>
                          <span className="font-bold">Level {lvl.num}: {lvl.label}</span>
                          <span className="text-[10px] block opacity-70">({lvl.organelle})</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isCleared ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {isCleared ? '✓ Selesai' : 'Belum'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH SISWA BARU */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-600 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowAddStudentModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-bold text-lg text-amber-200 font-fredoka">
                Tambah Akun Siswa Baru
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tambahkan siswa ke daftar pemantauan guru.
              </p>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-amber-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Username / NISN
                </label>
                <input
                  type="text"
                  value={newStudentUsername}
                  onChange={e => setNewStudentUsername(e.target.value)}
                  placeholder="Contoh: rian123"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-amber-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Kelas
                </label>
                <select
                  value={newStudentClass}
                  onChange={e => setNewStudentClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-amber-400 outline-none cursor-pointer"
                >
                  <option value="Kelas XI IPA 1">Kelas XI IPA 1</option>
                  <option value="Kelas XI IPA 2">Kelas XI IPA 2</option>
                  <option value="Kelas XI IPA 3">Kelas XI IPA 3</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
