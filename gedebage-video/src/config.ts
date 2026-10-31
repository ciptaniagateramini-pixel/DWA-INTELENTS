// Data-driven scene configuration. All geography comes from georeferenced sources
// (OpenStreetMap / Wikidata / Wikipedia); see VERIFICATION.md for provenance.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 840; // 28 s

export const COLORS = {
  mustard: '#E6B64C',
  white: '#FFFFFF',
  slate: 'rgba(15, 23, 32, 0.78)',
  slateSolid: '#0F1720',
  sea: '#0B131B',
  land: '#1A2531',
  landStroke: '#2C3A49',
  muted: 'rgba(255,255,255,0.62)',
};

export type LngLat = [number, number];

// Estimated plot outline: screenshot corners mapped onto OSM geometry with a
// 4-point similarity fit (residual <= 4 m). NOT a survey; see VERIFICATION.md.
export const PLOT: LngLat[] = [
  [107.709513, -6.948271],
  [107.709835, -6.948406],
  [107.70963, -6.949327],
  [107.709412, -6.94933],
];
export const PLOT_CENTER: LngLat = [107.709598, -6.948833];

export type Landmark = {
  id: string;
  name: string;
  position: LngLat;
  // Text shown on the card. Verified straight-line distance, or seller claim
  // explicitly labelled as such.
  distanceLabel: string;
  verified: boolean;
  photo: null | {file: string; credit: string};
  // Card slot on the all-landmarks board (top-left corner, px).
  boardSlot: [number, number];
};

export const LANDMARKS: Landmark[] = [
  {
    id: 'aljabbar',
    name: 'Masjid Raya Al Jabbar',
    position: [107.703504, -6.9480938],
    distanceLabel: '± 680 m · garis lurus',
    verified: true,
    photo: null, // planned: assets/photos/masjid_al_jabbar_antaratv_ccby3.jpg
    boardSlot: [40, 600],
  },
  {
    id: 'cimekar',
    name: 'Stasiun Cimekar',
    position: [107.7123851, -6.9490193],
    distanceLabel: '± 310 m · garis lurus',
    verified: true,
    photo: null, // planned: assets/photos/stasiun_cimekar_a2613_ccbysa4.jpg
    boardSlot: [740, 600],
  },
  {
    id: 'gbla',
    name: 'Stadion GBLA',
    position: [107.712046, -6.9575633],
    distanceLabel: '± 1,0 km · garis lurus',
    verified: true,
    photo: null, // planned: assets/photos/stadion_gbla_endedcity_ccbysa3.jpg
    boardSlot: [740, 1120],
  },
  {
    id: 'summarecon',
    name: 'Summarecon Bandung',
    position: [107.6951188, -6.9562197],
    distanceLabel: '± 1 km · menurut penjual',
    verified: false,
    photo: null, // no licensed photo found yet
    boardSlot: [40, 1120],
  },
  {
    id: 'tegalluar',
    name: 'Stasiun Whoosh Tegalluar',
    position: [107.71471, -6.96382],
    distanceLabel: '± 1,8 km · garis lurus',
    verified: true,
    photo: null, // planned: assets/photos/stasiun_tegalluar_nfarras_ccbysa4.jpg
    boardSlot: [390, 1240],
  },
];

export const TEXT = {
  h1: 'Aset Potensial Di kota Bandung ini Mau di jual',
  h2: 'Ini kesempatan kamu untuk bangun bisnis di kota bandung',
  area: 'Luas Tanah 3.200 m²',
  board: 'Satu Lokasi, Banyak Potensi.',
  closingA: '3.200 m² • SHM',
  closingB: 'Rp5,5 Juta/m²',
  cta: 'Hubungi Penjual',
  sellerNote: 'Data luas, SHM & harga: menurut penjual',
  attribution: 'Peta © OpenStreetMap contributors (ODbL) · Natural Earth',
};

// Camera keyframes: center + visible width in km across the 1080 px frame.
export type CameraKey = {frame: number; center: LngLat; widthKm: number};
const CONTEXT_CENTER: LngLat = [107.7065, -6.9545];
export const CAMERA: CameraKey[] = [
  {frame: 0, center: [118.0, -2.6], widthKm: 5200},
  {frame: 120, center: [107.62, -6.93], widthKm: 420},
  {frame: 200, center: [107.64, -6.925], widthKm: 32},
  {frame: 290, center: PLOT_CENTER, widthKm: 0.3},
  {frame: 322, center: PLOT_CENTER, widthKm: 0.27},
  {frame: 352, center: CONTEXT_CENTER, widthKm: 4.6},
  {frame: 720, center: CONTEXT_CENTER, widthKm: 4.6},
  {frame: 775, center: PLOT_CENTER, widthKm: 0.42},
  {frame: 840, center: PLOT_CENTER, widthKm: 0.38},
];

export const T = {
  h1: [0, 120],
  h2: [120, 210],
  plotReveal: [235, 330],
  popupsStart: 330,
  popupEach: 48, // 1.6 s each → 11–19 s
  board: [570, 720],
  closing: [720, 840],
} as const;

// Narration (voice-over). public/narasi.mp3 (18.5 s, from the user's Google Drive) is
// split at its natural pauses (ffmpeg silencedetect) and each sentence is placed on
// its scene. clip = [start, end] in seconds inside the source file; at = video frame.
export const VOICEOVER: string | null = 'narasi.mp3';
export type NarrationLine = {at: number; clip: [number, number]; text: string};
export const NARRATION: NarrationLine[] = [
  {at: 12, clip: [0, 3.39], text: 'Ini waktu yang tepat, untuk para investor!!'},
  {at: 129, clip: [3.39, 8.13], text: 'Kota Bandung, kota unik. Dengan sejuta potensi bisnis…'},
  {at: 339, clip: [8.13, 11.76], text: 'Investasi aset di kota Bandung tinggal selangkah lagi.'},
  {at: 600, clip: [11.76, 15.45], text: 'Sekarang kamu cukup hubungi penjual tangan pertamanya dulu.'},
  {at: 738, clip: [15.45, 18.52], text: 'Tanya-tanya, survei, deal!'},
];
