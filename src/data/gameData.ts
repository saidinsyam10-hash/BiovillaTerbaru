import { Stage } from '../types';

export const titleScreenData = {
  title: "Misi Petualangan Desa Sel",
  subtitle: "BioVillage Simulator — Petualangan Edukasi Biologi Sel",
  video: "asset 001",
  introduction: `
<p><strong>Selamat datang di Misi Petualangan Desa Sel!</strong></p>

<p>Tahukah kamu bahwa setiap bagian kecil dalam unit kehidupan saling bekerja sama untuk menjaga kelangsungan hidup? Sama seperti sebuah desa yang memiliki balai desa, pelabuhan, hingga pusat pengolahan sampah, setiap organel dalam sel memiliki peran vitalnya masing-masing. Jika salah satu fungsinya terganggu, seluruh kehidupan sel dapat terancam.</p>

<p>Dalam petualangan ini, kamu akan menjadi <strong>Pengelola Desa Sel</strong>. Jelajahi setiap fasilitas, pecahkan tantangan menarik, dan temukan bagaimana seluruh organel berkolaborasi membentuk kehidupan yang harmonis.</p>

<p><strong>Selesaikan misi dalam petualangan ini, dan kamu akan mampu:</strong></p>

<ul>
\t<li>🌿 Menganalisis peran membran sel sebagai gerbang pengatur lalu lintas zat masuk dan keluar.</li>
\t<li>🏛️ Mengidentifikasi fungsi inti sel (nukleus) sebagai pusat komando dan penyimpan informasi genetik.</li>
\t<li>🚢 Memahami sistem transportasi dan pengolahan molekul pada retikulum endoplasma dan badan golgi.</li>
\t<li>⚡ Menjelaskan proses pembentukan energi kehidupan pada mitokondria dan kloroplas.</li>
\t<li>♻️ Memprediksi dampak gangguan pengelolaan limbah seluler oleh lisosom dan peroksisom.</li>
\t<li>🌱 Menunjukkan pemahaman yang utuh mengenai hubungan analogi antara fasilitas desa dan organel sel.</li>
</ul>

<p><strong>Selamat belajar dan selamat berpetualang!</strong></p>
`
};

export const mapConfig = {
  backgroundImage: "asset_002",
  width: 1704,
  height: 923,
  visual: {
    colorStageAvailable: "rgba(250, 223, 10, 0.85)", // Tersedia: emas cerah
    colorStageLocked: "rgba(153, 0, 0, 0.75)",     // Terkunci: merah tua
    colorStageCleared: "rgba(0, 130, 0, 0.85)",    // Selesai: hijau subur
    colorPath: "rgba(0, 0, 0, 0.6)",
    colorPathCleared: "rgba(0, 130, 0, 0.85)"
  }
};

export const stagesData: Stage[] = [
  {
    id: "7a92d5f3-d732-4c72-90a3-368062e075e3",
    stageIndex: 0,
    label: "Petunjuk",
    subLabel: "Panduan Dasar Desa Sel",
    telemetry: {
      x: 4.5,
      y: 65.8,
      width: 4.5,
      height: 8.0
    },
    neighbors: [1],
    canBeStartStage: true,
    stageType: 'hotspot',
    icon: 'compass',
    hotspotsData: {
      image: "__MEDIA__asset_015.jpeg",
      hotspots: [
        {
          id: "hotspot-0-0",
          x: 38.0,
          y: 21.5,
          title: "1. Jelajahi Peta Desa",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_003.png", alt: "1. Jelajahi peta desa" }
          ]
        },
        {
          id: "hotspot-0-1",
          x: 38.0,
          y: 33.5,
          title: "2. Selesaikan Misi Tiap Warga",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_005.png", alt: "2. Selesaikan misi tiap warga" }
          ]
        },
        {
          id: "hotspot-0-2",
          x: 38.0,
          y: 45.5,
          title: "3. Gunakan Petunjuk Jika Ragu",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_007.png", alt: "3. Gunakan petunjuk jika ragu" }
          ]
        },
        {
          id: "hotspot-0-3",
          x: 38.0,
          y: 57.5,
          title: "4. Kumpulkan Bintang",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_009.png", alt: "4. Kumpulkan bintang" }
          ]
        },
        {
          id: "hotspot-0-4",
          x: 38.0,
          y: 69.5,
          title: "5. Ingat, Semua Warga Saling Terhubung",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_011.png", alt: "5. Ingat, semua warga saling terhubung" }
          ]
        },
        {
          id: "hotspot-0-5",
          x: 38.0,
          y: 81.5,
          title: "6. Siap Memulai?",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_013.png", alt: "6. Siap memulai?" }
          ]
        }
      ]
    }
  },
  {
    id: "eabd9795-c135-46b7-b597-801fb6b8f80f",
    stageIndex: 1,
    label: "Peta",
    subLabel: "Analogi Organel & Fasilitas Desa",
    telemetry: {
      x: 26.8,
      y: 90.0,
      width: 4.5,
      height: 8.0
    },
    neighbors: [0, 2],
    canBeStartStage: true,
    stageType: 'hotspot',
    icon: 'map',
    hotspotsData: {
      image: "__MEDIA__asset_027.jpeg",
      hotspots: [
        {
          id: "hotspot-1-0",
          x: 10.4,
          y: 87.69,
          title: "Petunjuk",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_016.png", alt: "Petunjuk", title: "Petunjuk" }
          ]
        },
        {
          id: "hotspot-1-1",
          x: 22.0,
          y: 75.85,
          title: "Pelabuhan Desa - Retikulum Endoplasma",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_017.jpeg", alt: "Pelabuhan Desa - Retikulum Endoplasma", title: "Pelabuhan Desa - Retikulum Endoplasma" }
          ]
        },
        {
          id: "hotspot-1-2",
          x: 17.6,
          y: 61.10,
          title: "Pusat Kesehatan - Peroksisom",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_018.png", alt: "Pusat Kesehatan - Peroksisom", title: "Pusat Kesehatan - Peroksisom" }
          ]
        },
        {
          id: "hotspot-1-3",
          x: 23.6,
          y: 45.18,
          title: "Pasar Desa - Badan Golgi",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_019.png", alt: "Pasar Desa - Badan Golgi", title: "Pasar Desa - Badan Golgi" }
          ]
        },
        {
          id: "hotspot-1-4",
          x: 24.8,
          y: 28.68,
          title: "Pusat Fotosintesis - Kloroplas",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_020.png", alt: "Pusat Fotosintesis - Kloroplas", title: "Pusat Fotosintesis - Kloroplas" }
          ]
        },
        {
          id: "hotspot-1-5",
          x: 47.2,
          y: 20.93,
          title: "Balai Desa - Inti Sel (Nukleus)",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_021.jpeg", alt: "Balai Desa - Inti Sel (Nukleus)", title: "Balai Desa - Inti Sel (Nukleus)" }
          ]
        },
        {
          id: "hotspot-1-6",
          x: 68.8,
          y: 23.68,
          title: "Pusat Produksi - Ribosom",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_022.png", alt: "Ribosom - Pusat Produksi", title: "Ribosom - Pusat Produksi" }
          ]
        },
        {
          id: "hotspot-1-7",
          x: 88.0,
          y: 30.52,
          title: "Pembangkit Energi - Mitokondria",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_023.png", alt: "Pembangkit Energi - Mitokondria", title: "Pembangkit Energi - Mitokondria" }
          ]
        },
        {
          id: "hotspot-1-8",
          x: 71.2,
          y: 70.62,
          title: "Pengelolaan Sampah - Lisosom",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_024.jpeg", alt: "Pengelolaan Sampah - Lisosom", title: "Pengelolaan Sampah - Lisosom" }
          ]
        },
        {
          id: "hotspot-1-9",
          x: 46.8,
          y: 54.70,
          title: "Lahan Pertanian - Kloroplas",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_025.jpeg", alt: "Lahan Pertanian - Kloroplas", title: "Lahan Pertanian - Kloroplas" }
          ]
        },
        {
          id: "hotspot-1-10",
          x: 51.2,
          y: 78.46,
          title: "Membran Sel",
          contents: [
            { type: 'image', filePath: "__MEDIA__asset_026.jpeg", alt: "Membran Sel", title: "Membran Sel" }
          ]
        }
      ]
    }
  },
  {
    id: "8750aa92-5349-4151-ac2e-7ff14c281eb0",
    stageIndex: 2,
    label: "Level 1",
    subLabel: "Mengenal Warga Desa Sel",
    telemetry: {
      x: 17.5,
      y: 39.5,
      width: 4.5,
      height: 8.0
    },
    neighbors: [1, 3],
    canBeStartStage: true,
    stageType: 'presentation',
    icon: 'star',
    presentationData: {
      slides: [
        {
          id: "lvl1-s0",
          title: "Tantangan Warga Desa Sel",
          imageSource: "__MEDIA__asset_028.jpeg",
          hasSingleChoiceSet: true,
          singleChoiceQuestions: [
            {
              id: "q1-1",
              question: "Di Desa Sel, terdapat seorang warga yang mengatur berbagai kegiatan penting dan menyimpan informasi yang menjadi pedoman bagi seluruh desa. Siapakah warga tersebut?",
              answers: ["Nukleus", "Vakuola", "Ribosom", "Badan Golgi"]
            },
            {
              id: "q1-2",
              question: "Suatu bagian sel memiliki peran dalam menghasilkan protein. Jika bagian ini mengalami gangguan, proses pembentukan protein dapat terganggu. Organel yang dimaksud adalah …",
              answers: ["Ribosom", "Lisosom", "Mitokondria", "Kloroplas"]
            },
            {
              id: "q1-3",
              question: "Seorang warga Desa Sel bertugas menghasilkan energi yang digunakan untuk mendukung berbagai aktivitas kehidupan sel. Warga tersebut adalah …",
              answers: ["Mitokondria", "Badan Golgi", "Nukleus", "Vakuola"]
            },
            {
              id: "q1-4",
              question: "Sebuah fasilitas dalam Desa Sel bertugas menerima, mengolah, dan mengirimkan berbagai bahan ke tujuan yang sesuai. Organel yang memiliki fungsi serupa adalah …",
              answers: ["Badan Golgi", "Ribosom", "Nukleus", "Membran sel"]
            },
            {
              id: "q1-5",
              question: "Di Desa Sel, terdapat jalur pengangkutan yang membantu memindahkan bahan dari satu tempat ke tempat lain. Sebagian jalur tersebut memiliki ribosom yang menempel pada permukaannya. Organel yang dimaksud adalah …",
              answers: ["Retikulum endoplasma kasar", "Retikulum endoplasma halus", "Lisosom", "Vakuola"]
            },
            {
              id: "q1-6",
              question: "Suatu bagian sel membantu menghasilkan lipid dan berperan dalam proses detoksifikasi zat tertentu. Organel yang sesuai adalah …",
              answers: ["Retikulum endoplasma halus", "Retikulum endoplasma kasar", "Ribosom", "Nukleus"]
            },
            {
              id: "q1-7",
              question: "Dalam Desa Sel, terdapat bagian yang mengatur keluar dan masuknya berbagai zat sehingga kondisi di dalam sel tetap terjaga. Organel yang memiliki fungsi tersebut adalah …",
              answers: ["Membran sel", "Mitokondria", "Dinding sel", "Kloroplas"]
            },
            {
              id: "q1-8",
              question: "Sebuah fasilitas pada sel tumbuhan membantu memberikan bentuk dan kekuatan sehingga sel tidak mudah berubah bentuk. Bagian sel yang dimaksud adalah …",
              answers: ["Dinding sel", "Vakuola", "Badan Golgi", "Ribosom"]
            },
            {
              id: "q1-9",
              question: "Seorang warga Desa Sel berfungsi menyimpan air, zat terlarut, dan berbagai bahan yang dibutuhkan oleh sel tumbuhan. Organel tersebut adalah …",
              answers: ["Vakuola", "Nukleus", "Lisosom", "Sentriol"]
            },
            {
              id: "q1-10",
              question: "Pada sel tumbuhan terdapat fasilitas yang berperan dalam menangkap energi cahaya dan menggunakannya untuk membantu proses pembentukan bahan organik. Organel yang dimaksud adalah …",
              answers: ["Kloroplas", "Ribosom", "Mitokondria", "Lisosom"]
            }
          ]
        }
      ]
    }
  },
  {
    id: "ccfe0b99-7c5f-4c26-baab-7fe4af206478",
    stageIndex: 3,
    label: "Level 2",
    subLabel: "Cocokkan Organel & Perannya",
    telemetry: {
      x: 37.3,
      y: 42.0,
      width: 4.5,
      height: 8.0
    },
    neighbors: [2, 4],
    canBeStartStage: false,
    stageType: 'dragdrop',
    icon: 'puzzle',
    dragDropData: {
      backgroundImage: "__MEDIA__asset_029.png",
      feedbackSuccess: "Hebat! Kamu telah menguasai pemetaan organel sel dan menjaga Desa Sel beroperasi dengan harmonis!",
      feedbackFail: "Hampir berhasil! Masih ada beberapa fasilitas desa yang belum terhubung dengan organel yang tepat. Mari ulangi lagi!",
      elements: [
        { id: "0", title: "Nukleus", alt: "Nukleus" },
        { id: "1", title: "Mitokondria", alt: "Mitokondria" },
        { id: "2", title: "Retikulum Endoplasma", alt: "Retikulum Endoplasma" },
        { id: "3", title: "Membran Sel", alt: "Membran Sel" },
        { id: "4", title: "Badan Golgi", alt: "Badan Golgi" }
      ],
      dropZones: [
        {
          id: "dz-0",
          label: "Pusat Komando Sel",
          description: "Mengatur seluruh kegiatan sel dan menyimpan materi genetik (DNA).",
          image: "__MEDIA__asset_030.png",
          correctElementIds: ["0"],
          x: 36.6,
          y: 13.3,
          width: 22,
          height: 16
        },
        {
          id: "dz-1",
          label: "Pembangkit Energi (ATP)",
          description: "Menghasilkan energi sel melalui respirasi seluler untuk seluruh aktivitas sel.",
          image: "__MEDIA__asset_031.png",
          correctElementIds: ["1"],
          x: 78.3,
          y: 22.1,
          width: 20,
          height: 16
        },
        {
          id: "dz-2",
          label: "Jalur Transportasi Internal",
          description: "Membantu sintesis protein & lipid serta transportasi internal zat dalam sel.",
          image: "__MEDIA__asset_032.png",
          correctElementIds: ["2"],
          x: 11.3,
          y: 73.1,
          width: 24,
          height: 16
        },
        {
          id: "dz-3",
          label: "Pusat Sortir & Pengemasan",
          description: "Memodifikasi, menyortir, dan mengemas molekul untuk sekresi atau penggunaan internal.",
          image: "__MEDIA__asset_034.png",
          correctElementIds: ["4"],
          x: 13.9,
          y: 37.6,
          width: 22,
          height: 16
        },
        {
          id: "dz-4",
          label: "Gerbang Pelindung Sel",
          description: "Mengatur lalu lintas zat yang masuk dan keluar secara selektif permeabel.",
          image: "__MEDIA__asset_033.png",
          correctElementIds: ["3"],
          x: 40.4,
          y: 73.1,
          width: 22,
          height: 16
        }
      ]
    }
  },
  {
    id: "cce89a17-aa67-403a-8010-7ff8b0884e72",
    stageIndex: 4,
    label: "Level 3",
    subLabel: "Alur Produksi & Ekspor Protein",
    telemetry: {
      x: 52.6,
      y: 23.0,
      width: 4.5,
      height: 8.0
    },
    neighbors: [3, 5],
    canBeStartStage: false,
    stageType: 'presentation',
    icon: 'play-circle',
    presentationData: {
      slides: [
        {
          id: "lvl3-s0",
          title: "Simulasi Produksi Protein",
          videoSource: "__MEDIA__asset_035.mp4",
          nextButtonTitle: "Lanjut ke Penjelasan"
        },
        {
          id: "lvl3-s1",
          title: "Skema Perjalanan Molekul Protein",
          imageSource: "__MEDIA__asset_036.png",
          nextButtonTitle: "Misi Selanjutnya"
        },
        {
          id: "lvl3-s2",
          title: "Urutkan Tahapan Produksi Protein",
          backgroundImage: "__MEDIA__asset_037.png",
          hasDragDrop: true,
          dragDropTask: {
            backgroundImage: "__MEDIA__asset_037.png",
            feedbackSuccess: "Hebat! Kamu berhasil menyusun urutan produksi protein.",
            feedbackFail: "Terus berlatih! Periksa kembali urutan proses produksi protein.",
            elements: [
              { id: "0", title: "Badan Golgi", image: "__MEDIA__asset_038.jpeg", alt: "Badan Golgi" },
              { id: "1", title: "Vesikel Transport", image: "__MEDIA__asset_039.jpeg", alt: "Vesikel" },
              { id: "2", title: "Membran Sel", image: "__MEDIA__asset_040.jpeg", alt: "Membran Sel" },
              { id: "3", title: "RE Kasar", image: "__MEDIA__asset_041.jpeg", alt: "RE Kasar" },
              { id: "4", title: "Ribosom", image: "__MEDIA__asset_042.jpeg", alt: "Ribosom" }
            ],
            dropZones: [
              { id: "dz-3-0", label: "1. Sintesis Awal (Ribosom)", correctElementIds: ["4"], x: 8.0, y: 74.2, width: 16, height: 18 },
              { id: "dz-3-2", label: "2. Pemrosesan di Jalur (RE Kasar)", correctElementIds: ["3"], x: 25.8, y: 74.2, width: 16, height: 18 },
              { id: "dz-3-4", label: "3. Kurir Antar (Vesikel Transport)", correctElementIds: ["1"], x: 43.5, y: 74.2, width: 16, height: 18 },
              { id: "dz-3-3", label: "4. Sortir & Kemas (Badan Golgi)", correctElementIds: ["0"], x: 62.9, y: 74.2, width: 16, height: 18 },
              { id: "dz-3-1", label: "5. Pelepasan / Sekresi (Membran Sel)", correctElementIds: ["2"], x: 80.6, y: 74.2, width: 16, height: 18 }
            ]
          }
        },
        {
          id: "lvl3-s3",
          title: "Kesimpulan: Harmoni Produksi Protein",
          imageSource: "__MEDIA__asset_036.png",
          nextButtonTitle: "Selesaikan & Buka Level 4"
        }
      ]
    }
  },
  {
    id: "2a93031d-a62d-4f6a-b497-68c3d35dcd57",
    stageIndex: 5,
    label: "Level 4",
    subLabel: "Krisis Energi Desa Sel",
    telemetry: {
      x: 60.5,
      y: 40.0,
      width: 4.5,
      height: 8.0
    },
    neighbors: [4, 6],
    canBeStartStage: false,
    stageType: 'presentation',
    icon: 'zap',
    presentationData: {
      slides: [
        {
          id: "lvl4-s0",
          title: "Krisis Energi di Desa Sel",
          videoSource: "__MEDIA__asset_043.mp4",
          nextButtonTitle: "Selesaikan Misi"
        }
      ]
    }
  },
  {
    id: "b3b31e26-6fd0-4b79-b4cd-5bae7b5950da",
    stageIndex: 6,
    label: "Level 5",
    subLabel: "Krisis Distribusi Desa Sel",
    telemetry: {
      x: 47.7,
      y: 60.0,
      width: 4.5,
      height: 8.0
    },
    neighbors: [5, 7],
    canBeStartStage: false,
    stageType: 'presentation',
    icon: 'truck',
    presentationData: {
      slides: [
        {
          id: "lvl5-s0",
          title: "Inspeksi Jalur Distribusi",
          videoSource: "__MEDIA__asset_047.mp4",
          nextButtonTitle: "Mulai Tantangan"
        },
        {
          id: "lvl5-s1",
          title: "Penyelesaian Krisis Logistik",
          imageSource: "__MEDIA__asset_048.png",
          hasSingleChoiceSet: true,
          singleChoiceQuestions: [
            {
              id: "q5-1",
              question: "Sebuah bahan telah selesai dibuat di dalam sel, tetapi bahan tersebut belum dapat digunakan oleh bagian lain. Proses apa yang perlu diperiksa?",
              answers: ["Pengolahan dan pengemasan bahan", "Pengaturan informasi genetik", "Penghasilan energi", "Pengaturan keluar masuk zat"]
            },
            {
              id: "q5-2",
              question: "Jika jalur pengiriman bahan di dalam sel mengalami gangguan, dampak yang paling mungkin terjadi adalah ...",
              answers: ["Bahan tidak sampai ke tempat tujuan", "Sel langsung kehilangan seluruh DNA", "Sel tidak memiliki membran", "Semua organel berubah menjadi energi"]
            },
            {
              id: "q5-3",
              question: "Perhatikan hubungan berikut: Jalur pengangkutan bahan → bagian sel yang berperan dalam transportasi. Organel yang paling sesuai dengan fungsi tersebut adalah ...",
              answers: ["Retikulum endoplasma", "Nukleus", "Mitokondria", "Kloroplas"]
            },
            {
              id: "q5-4",
              question: "Desa Sel memiliki bahan yang berlebih dan perlu disimpan untuk digunakan kembali. Bagian sel yang berkaitan dengan penyimpanan adalah ...",
              answers: ["Vakuola", "Ribosom", "Nukleus", "Lisosom"]
            },
            {
              id: "q5-5",
              question: "Setelah bahan digunakan, terdapat sisa atau bagian yang tidak diperlukan. Jika sisa tersebut tidak dikelola dengan baik, apa yang dapat terjadi?",
              answers: ["Sisa menumpuk dan mengganggu kerja sel", "Sel menghasilkan energi tanpa batas", "Informasi genetik bertambah sendiri", "Semua organel berhenti membelah"]
            }
          ]
        }
      ]
    }
  },
  {
    id: "cec98aeb-8f61-4858-aeeb-3f652c9085a5",
    stageIndex: 7,
    label: "Level 6",
    subLabel: "Detektif Kerusakan Sistem Sel",
    telemetry: {
      x: 68.4,
      y: 73.0,
      width: 4.5,
      height: 8.0
    },
    neighbors: [6, 8],
    canBeStartStage: false,
    stageType: 'presentation',
    icon: 'search',
    presentationData: {
      slides: [
        {
          id: "lvl6-s0",
          title: "Laporan Kerusakan Sistem",
          videoSource: "__MEDIA__asset_049.mp4",
          nextButtonTitle: "Lanjut ke Misi 1"
        },
        {
          id: "lvl6-s1",
          title: "Misi 1: Rantai Sebab-Akibat Gangguan Energi",
          backgroundImage: "__MEDIA__asset_050.png",
          hasDragDrop: true,
          dragDropTask: {
            backgroundImage: "__MEDIA__asset_050.png",
            feedbackSuccess: "Tepat! Kamu berhasil melacak rantai kerusakan dari penyebab hingga dampaknya.",
            feedbackFail: "Belum tepat. Periksa kembali mana yang menjadi penyebab dan mana yang menjadi akibat.",
            elements: [
              { id: "c1", title: "Mitokondria mengalami gangguan", image: "__MEDIA__asset_054.png" },
              { id: "c2", title: "Produksi ATP menurun", image: "__MEDIA__asset_051.png" },
              { id: "c3", title: "Ketersediaan energi sel berkurang", image: "__MEDIA__asset_052.png" },
              { id: "c4", title: "Aktivitas sel tertentu terganggu", image: "__MEDIA__asset_053.png" }
            ],
            dropZones: [
              { id: "chain-1", label: "Langkah 1: Sumber Masalah", correctElementIds: ["c1"], x: 16.1, y: 35.5, width: 18, height: 18 },
              { id: "chain-2", label: "Langkah 2: Akibat Pertama", correctElementIds: ["c2"], x: 35.5, y: 35.5, width: 18, height: 18 },
              { id: "chain-3", label: "Langkah 3: Akibat Lanjutan", correctElementIds: ["c3"], x: 56.5, y: 35.5, width: 18, height: 18 },
              { id: "chain-4", label: "Langkah 4: Dampak Akhir", correctElementIds: ["c4"], x: 75.8, y: 35.5, width: 18, height: 18 }
            ]
          },
          nextButtonTitle: "Lanjut ke Misi 2"
        },
        {
          id: "lvl6-s2",
          title: "Misi 2: Hubungkan Kerusakan & Dampaknya",
          backgroundImage: "__MEDIA__asset_056.png",
          hasDragDrop: true,
          dragDropTask: {
            backgroundImage: "__MEDIA__asset_056.png",
            feedbackSuccess: "Tepat sekali! Kamu berhasil memetakan dampak gangguan setiap organel.",
            feedbackFail: "Misi belum sempurna, Kepala Desa! 🌱 Masih ada pasangan yang belum tepat. Periksa kembali fungsi setiap organel.",
            elements: [
              { id: "fx-atp", title: "Produksi ATP menurun" },
              { id: "fx-protein", title: "Sintesis protein menurun" },
              { id: "fx-transport", title: "Transport atau pemrosesan bahan tertentu terganggu" },
              { id: "fx-golgi", title: "Modifikasi, penyortiran, dan pengemasan bahan terganggu" }
            ],
            dropZones: [
              { id: "dz-mito", label: "Mitokondria terganggu", correctElementIds: ["fx-atp"], x: 12, y: 25, width: 76, height: 14 },
              { id: "dz-ribo", label: "Ribosom terganggu", correctElementIds: ["fx-protein"], x: 12, y: 42, width: 76, height: 14 },
              { id: "dz-re", label: "Retikulum Endoplasma terganggu", correctElementIds: ["fx-transport"], x: 12, y: 59, width: 76, height: 14 },
              { id: "dz-golgi", label: "Badan Golgi terganggu", correctElementIds: ["fx-golgi"], x: 12, y: 76, width: 76, height: 14 }
            ]
          },
          nextButtonTitle: "Lanjut ke Misi 3"
        },
        {
          id: "lvl6-s3",
          title: "Misi 3: Mitokondria vs Ribosom",
          imageSource: "__MEDIA__asset_058.png",
          hasSingleChoiceSet: true,
          nextButtonTitle: "Lanjut ke Misi 4",
          singleChoiceQuestions: [
            {
              id: "q6-3",
              question: "Apa perbedaan dampak gangguan mitokondria dan gangguan ribosom?",
              answers: [
                "Gangguan mitokondria menurunkan produksi ATP, sedangkan gangguan ribosom menurunkan sintesis protein.",
                "Gangguan mitokondria menurunkan sintesis protein, sedangkan gangguan ribosom meningkatkan ATP",
                "Gangguan mitokondria dan ribosom sama-sama berfungsi menghasilkan energi.",
                "Gangguan mitokondria hanya memengaruhi bentuk sel, sedangkan ribosom mengatur keluar-masuk zat."
              ]
            }
          ]
        },
        {
          id: "lvl6-s4",
          title: "Misi 4: Analisis Penurunan Protein & Energi",
          imageSource: "__MEDIA__asset_059.png",
          hasSingleChoiceSet: true,
          nextButtonTitle: "Lanjut ke Misi 5",
          singleChoiceQuestions: [
            {
              id: "q6-4",
              question: "Pusat Produksi Desa Sel mulai menghasilkan lebih sedikit protein. Pada saat yang sama, Pembangkit Energi juga mengalami penurunan aktivitas. Apakah pasti ribosom yang rusak?",
              answers: [
                "Tidak selalu, karena sintesis protein membutuhkan energi (ATP), sehingga gangguan mitokondria juga dapat menurunkan produksi protein.",
                "Ya, karena semua masalah protein pasti disebabkan oleh ribosom.",
                "Ya, karena mitokondria tidak berhubungan dengan sintesis protein.",
                "Tidak, karena ribosom hanya berfungsi menghasilkan ATP."
              ]
            }
          ]
        },
        {
          id: "lvl6-s5",
          title: "Misi 5: Sifat Kerjasama Sel",
          imageSource: "__MEDIA__asset_060.png",
          hasSingleChoiceSet: true,
          singleChoiceQuestions: [
            {
              id: "q6-5",
              question: "Jika satu organel mengalami gangguan, apakah seluruh sel pasti langsung berhenti bekerja?",
              answers: [
                "Tidak, dampaknya bergantung pada jenis organel, tingkat kerusakan, dan fungsi yang terganggu.",
                "Ya, semua organel harus bekerja sempurna setiap saat.",
                "Ya, satu organel yang terganggu pasti langsung menghentikan seluruh aktivitas sel.",
                "Tidak, karena setiap organel bekerja sendiri dan tidak saling berhubungan."
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: "a433c8a8-1198-4923-8d6e-c86cef3a4b35",
    stageIndex: 8,
    label: "Level 7",
    subLabel: "Laporan Darurat Desa Sel",
    telemetry: {
      x: 78.4,
      y: 45.5,
      width: 4.5,
      height: 8.0
    },
    neighbors: [7, 9],
    canBeStartStage: false,
    stageType: 'presentation',
    icon: 'file-text',
    presentationData: {
      slides: [
        {
          id: "lvl7-s0",
          title: "Panggilan Darurat Kepala Desa",
          videoSource: "__MEDIA__asset_061.mp4",
          nextButtonTitle: "Buka Laporan Darurat"
        },
        {
          id: "lvl7-s1",
          title: "Lengkapi Laporan Investigasi",
          imageSource: "__MEDIA__asset_062.jpeg",
          hasFillBlanks: true,
          fillBlanksText: `Darurat terjadi di Desa Sel! Beberapa fasilitas mulai mengalami gangguan sehingga aktivitas sel tidak berjalan dengan baik. Pembangkit energi desa yang dianalogikan sebagai organel *mitokondria* mengalami penurunan aktivitas. Akibatnya, produksi *ATP* menjadi menurun dan ketersediaan energi di dalam sel berkurang. Kondisi ini menyebabkan beberapa kegiatan sel menjadi lebih lambat. Pada saat yang sama, Pusat Produksi Protein yang dianalogikan sebagai *ribosom* mulai menghasilkan protein dalam jumlah yang lebih sedikit. Jalur transportasi bahan yang dianalogikan sebagai *retikulum endoplasma* juga mengalami gangguan sehingga bahan-bahan tertentu tidak dapat dipindahkan atau diproses dengan baik. Selain itu, Pusat Pengemasan Desa Sel yang dianalogikan sebagai *badan Golgi* mengalami kesulitan dalam melakukan modifikasi, penyortiran, dan pengemasan bahan. Sebagai Kepala Desa Sel, kamu harus menyelidiki setiap gangguan dengan teliti. Ingatlah bahwa setiap organel memiliki fungsi yang berbeda, tetapi semuanya saling berhubungan dan bekerja sama. Gangguan pada satu organel dapat memengaruhi proses lain secara bertahap. Oleh karena itu, kamu harus menganalisis hubungan antara fungsi *organel*, penyebab gangguan, dan dampak yang ditimbulkan sebelum mengambil keputusan. Pilihlah tindakan yang paling tepat agar sistem Desa Sel dapat kembali bekerja dengan baik dan seluruh aktivitas sel dapat berlangsung secara *normal*.`
        }
      ]
    }
  },
  {
    id: "c96ddc7d-03ed-4c23-a9b4-bba9fd0a0ec4",
    stageIndex: 9,
    label: "Level 8",
    subLabel: "Harmoni Alam & Refleksi Nilai",
    telemetry: {
      x: 85.8,
      y: 23.0,
      width: 4.5,
      height: 8.0
    },
    neighbors: [8],
    canBeStartStage: false,
    stageType: 'presentation',
    icon: 'heart',
    presentationData: {
      slides: [
        {
          id: "lvl8-s0",
          title: "Pohon Kehidupan Desa Sel",
          imageSource: "__MEDIA__asset_063.png",
          nextButtonTitle: "Mulai Refleksi Nilai"
        },
        {
          id: "lvl8-s1",
          title: "Refleksi 1: Tanda Kebesaran",
          imageSource: "__MEDIA__asset_064.jpeg",
          hasMultiChoice: true,
          nextButtonTitle: "Refleksi Selanjutnya",
          multiChoiceQuestion: {
            id: "mc8-1",
            question: "Allah berfirman dalam QS. Ali ‘Imran ayat 190–191 bahwa penciptaan langit dan bumi merupakan tanda-tanda kebesaran Allah bagi orang yang berpikir. Seorang siswa mempelajari bahwa membran sel, nukleus, mitokondria, dan badan Golgi memiliki fungsi berbeda tetapi saling bekerja sama. Kesimpulan yang paling tepat adalah ....",
            options: [
              { text: "Keteraturan sel dapat menjadi sarana merenungkan kebesaran Allah", correct: true },
              { text: "Semua organel memiliki fungsi yang sama", correct: false },
              { text: "Sel tidak perlu dipelajari karena ukurannya sangat kecil", correct: false },
              { text: "Organel bekerja tanpa hubungan satu sama lain", correct: false }
            ]
          }
        },
        {
          id: "lvl8-s2",
          title: "Refleksi 2: Amanah & Tanggung Jawab",
          imageSource: "__MEDIA__asset_065.jpeg",
          hasMultiChoice: true,
          nextButtonTitle: "Refleksi Selanjutnya",
          multiChoiceQuestion: {
            id: "mc8-2",
            question: "Dalam Desa Sel, setiap organel memiliki tugas masing-masing. Jika satu bagian tidak menjalankan tugasnya, keseimbangan desa terganggu. Hal tersebut paling sesuai dengan nilai Islam tentang ....",
            options: [
              { text: "Amanah dan tanggung jawab", correct: true },
              { text: "Kebebasan tanpa batas", correct: false },
              { text: "Persaingan tanpa aturan", correct: false },
              { text: "Mengutamakan kepentingan pribadi", correct: false }
            ]
          }
        },
        {
          id: "lvl8-s3",
          title: "Refleksi 3: Menyaring Informasi (Tabayyun)",
          imageSource: "__MEDIA__asset_066.jpeg",
          hasMultiChoice: true,
          nextButtonTitle: "Refleksi Selanjutnya",
          multiChoiceQuestion: {
            id: "mc8-3",
            question: "Membran sel berfungsi mengatur zat yang masuk dan keluar. Dalam kehidupan manusia, fungsi tersebut dapat dianalogikan dengan kemampuan menyaring informasi. Jika seorang siswa menerima berita yang belum jelas kebenarannya, tindakan yang paling sesuai dengan fungsi membran sel dan ajaran Islam adalah ....",
            options: [
              { text: "Memeriksa kebenaran informasi sebelum menyebarkannya", correct: true },
              { text: "Langsung menyebarkan berita", correct: false },
              { text: "Mempercayai semua informasi", correct: false },
              { text: "Menyebarkan berita jika banyak orang menyukainya", correct: false }
            ]
          }
        },
        {
          id: "lvl8-s4",
          title: "Refleksi 4: Memanfaatkan Energi untuk Kebaikan",
          imageSource: "__MEDIA__asset_067.jpeg",
          hasMultiChoice: true,
          nextButtonTitle: "Refleksi Selanjutnya",
          multiChoiceQuestion: {
            id: "mc8-4",
            question: "Mitokondria menghasilkan energi untuk menjalankan aktivitas sel. Dalam kehidupan manusia, energi dan kesehatan seharusnya digunakan untuk ....",
            options: [
              { text: "Melakukan kegiatan yang bermanfaat", correct: true },
              { text: "Mengganggu orang lain", correct: false },
              { text: "Bermalas-malasan sepanjang waktu", correct: false },
              { text: "Merusak lingkungan", correct: false }
            ]
          }
        },
        {
          id: "lvl8-s5",
          title: "Refleksi 5: Harmoni Ilmu dan Iman",
          imageSource: "__MEDIA__asset_068.jpeg",
          hasMultiChoice: true,
          nextButtonTitle: "Selesaikan Petualangan",
          multiChoiceQuestion: {
            id: "mc8-5",
            question: "Setelah menyelesaikan seluruh misi Desa Sel, seorang siswa menyadari bahwa kehidupan tersusun secara teratur dan saling bergantung. Tindakan yang paling mencerminkan pemahaman Biologi sekaligus nilai agama adalah ....",
            options: [
              { text: "Menggunakan ilmu untuk menjaga kesehatan, kebersihan, dan lingkungan", correct: true },
              { text: "Menganggap manusia bebas merusak alam", correct: false },
              { text: "Menghafal fungsi organel tanpa menerapkannya", correct: false },
              { text: "Menganggap ilmu agama dan ilmu Biologi tidak berhubungan", correct: false }
            ]
          }
        }
      ]
    }
  }
];

export const endScreenData = {
  title: "Desa Sel Telah Berhasil Diselamatkan!",
  badge: "PENGELOLA DESA TELADAN",
  description: `Selamat! Kamu telah menyelesaikan seluruh misi di Desa Sel. Berkat kepemimpinan dan pemahamanmu tentang kerja sama antar organel — mulai dari komando Nukleus, sintesis Ribosom, pengolahan Badan Golgi, energi Mitokondria & Kloroplas, hingga proteksi Membran Sel — keseimbangan dan kehidupan Desa Sel kembali berjalan dengan harmonis!`
};
