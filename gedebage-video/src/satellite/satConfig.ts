// Style 2 — "satellite like Google Earth" with roadmap tours.
// Visuals are AI illustrations supplied by the user (Drive "Motion grapich/Aset");
// distances are the seller's listing. Directions follow the real bearings found in
// VERIFICATION.md so the illustration points the right way.

export const SAT_DURATION = 1420; // 47.3 s @ 30 fps

export type XY = [number, number];

// World = public/sat/area.png (941×1672 px). ~3.2 m per px (illustrative scale).
export const AREA = {src: 'sat/area.png', w: 941, h: 1672, mPerPx: 3.2};
export const PLOT_IN_AREA: XY = [520, 960];

// Close-up = public/sat/close.png (941×1672 px); plot polygon traced on the image.
export const CLOSE = {
  src: 'sat/close.png',
  w: 941,
  h: 1672,
  plot: [
    [478, 600],
    [615, 645],
    [600, 1035],
    [465, 1030],
  ] as XY[],
  plotCenter: [540, 828] as XY,
};

export type SatLandmark = {
  id: string;
  name: string;
  distance: string; // seller's listing
  meters: number;
  bearing: number; // degrees from north (real bearing, nudged for readability)
  img: string;
  about: string;
};

export const SAT_LANDMARKS: SatLandmark[] = [
  {
    id: 'aljabbar',
    name: 'Masjid Raya Al Jabbar',
    distance: '500 M',
    meters: 500,
    bearing: 272,
    img: 'pop/aljabbar.png',
    about: 'Masjid raya Jawa Barat yang lagi hits di Bandung — favorit untuk ibadah & wisata religi.',
  },
  {
    id: 'cimekar',
    name: 'Stasiun Cimekar',
    distance: '200 M',
    meters: 200,
    bearing: 100,
    img: 'pop/cimekar.png',
    about: 'Stasiun KRL Commuter Line Bandung Raya. Akses kereta harian ke pusat kota.',
  },
  {
    id: 'gbla',
    name: 'Stadion GBLA',
    distance: '500 M',
    meters: 500,
    bearing: 150,
    img: 'pop/gbla.png',
    about: 'Gelora Bandung Lautan Api, kandang Persib. Ramai saat laga & event besar.',
  },
  {
    id: 'tegalluar',
    name: 'Stasiun KCIC Tegalluar',
    distance: '1,5 KM',
    meters: 1500,
    bearing: 174,
    img: 'pop/tegalluar.png',
    about: 'Stasiun kereta cepat Whoosh — gerbang Jakarta–Bandung dalam hitungan menit.',
  },
  {
    id: 'uin',
    name: 'Kampus UIN Bandung',
    distance: '2 KM',
    meters: 2000,
    bearing: 25,
    img: 'pop/uin.png',
    about: 'UIN Sunan Gunung Djati (Cibiru). Ribuan mahasiswa — potensi kos & usaha kuliner.',
  },
];

export const landmarkXY = (lm: SatLandmark): XY => {
  const d = lm.meters / AREA.mPerPx;
  const r = (lm.bearing * Math.PI) / 180;
  return [PLOT_IN_AREA[0] + Math.sin(r) * d, PLOT_IN_AREA[1] - Math.cos(r) * d];
};

// Illustrative route: up to the main road, along it, then in to the landmark.
export const routeFor = (lm: SatLandmark): XY[] => {
  const [px, py] = PLOT_IN_AREA;
  const [tx, ty] = landmarkXY(lm);
  const road: XY = [px, py - 6];
  const bend: XY = Math.abs(tx - px) > Math.abs(ty - py) ? [tx, py - 6 + (ty - py) * 0.15] : [px + (tx - px) * 0.2, ty];
  return [[px, py], road, bend, [tx, ty]];
};

export const SAT_T = {
  intro: [0, 150],
  approach: [150, 300],
  toursStart: 330,
  tourLen: 150,
  recap: [1080, 1200],
  cta: [1200, 1420],
} as const;

export const SAT_TEXT = {
  h1: 'Aset Potensial Di kota Bandung ini Mau di jual',
  h2: 'Ini kesempatan kamu untuk bangun bisnis di kota bandung',
  area: 'Luas Tanah 3.200 m²',
  recap: 'Satu Lokasi, Banyak Potensi.',
  perM: 'Rp5.500.000',
  total: 'Rp17.600.000.000',
  legal: 'SHM · MILIK PRIBADI · PINGGIR JALAN UTAMA',
  cta: 'Hubungi Penjual',
  disclaimer: 'Visual: ilustrasi AI · Jarak: menurut penjual',
};

export type Sfx = {at: number; file: string; volume?: number};
