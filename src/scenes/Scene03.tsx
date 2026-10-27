import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Fonts} from '../components/Fonts';
import {Title} from '../components/Title';
import {COLORS, FONT, HEIGHT, WIDTH} from '../theme';

export const SCENE03_FRAMES = 360;

type Pt = [number, number];
type NodeDef = {id: string; name: string; role: string; src: string; x: number; y: number; size: 'top' | 'head' | 'leaf'; at: number; accent?: string};

const staff = (n: string) => staticFile(`clean/staff/${n}.png`);
const SIZE = {top: {w: 300, h: 250, img: 150}, head: {w: 280, h: 230, img: 130}, leaf: {w: 250, h: 210, img: 112}};
const RED = '#E8303A';

// Layout fits 1080x1920 at zoom 1 (final reveal). `at` = frame the energy reaches the card.
const LEAF_ROWS = [1130, 1370, 1610];
const NODES: NodeDef[] = [
  {id: 'owner', name: 'Owner', role: 'TOKO BB GOLD', src: staticFile('clean/scene01/Ownerbb-Melihatkan hp.png'), x: 400, y: 360, size: 'top', at: 16},
  {id: 'marzuki', name: 'Marzuki', role: 'Jalur Langsung', src: staff('Marzuki'), x: 860, y: 360, size: 'head', at: 46},
  {id: 'mila', name: 'Bu Mila', role: 'HRD', src: staff('Bu Mila'), x: 440, y: 640, size: 'head', at: 72},
  {id: 'acep', name: 'Acep', role: 'Harga', src: staff('Acep'), x: 150, y: 900, size: 'head', at: 100},
  {id: 'bambang', name: 'Bambang', role: 'Divisi Pelanggan', src: staff('Bambang'), x: 440, y: 900, size: 'head', at: 100, accent: RED},
  {id: 'angga', name: 'Angga', role: 'Marketing', src: staff('Angga'), x: 860, y: 900, size: 'head', at: 100},
  {id: 'fitri', name: 'Fitri', role: 'WhatsApp', src: staff('Fitri'), x: 290, y: LEAF_ROWS[0], size: 'leaf', at: 124},
  {id: 'wawan', name: 'Wawan', role: 'Instagram', src: staff('Wawan'), x: 590, y: LEAF_ROWS[0], size: 'leaf', at: 128},
  {id: 'lilis', name: 'Lilis', role: 'TikTok', src: staff('Lilis'), x: 290, y: LEAF_ROWS[1], size: 'leaf', at: 134},
  {id: 'baron', name: 'Baron', role: 'BB App', src: staff('Baron'), x: 590, y: LEAF_ROWS[1], size: 'leaf', at: 138},
  {id: 'penjaga', name: 'Penjaga Toko', role: 'Janji Temu', src: staff('Penjaga Toko'), x: 290, y: LEAF_ROWS[2], size: 'leaf', at: 144},
  {id: 'kurir', name: 'Kurir Toko', role: 'Pickup / COD', src: staff('Kurir Toko'), x: 590, y: LEAF_ROWS[2], size: 'leaf', at: 148},
  {id: 'winda', name: 'Winda', role: 'Follow-up', src: staff('Winda'), x: 880, y: LEAF_ROWS[0], size: 'leaf', at: 166},
  {id: 'fajar', name: 'Fajar', role: 'Email / Broadcast', src: staff('Fajar'), x: 880, y: LEAF_ROWS[1], size: 'leaf', at: 172},
  {id: 'amanda', name: 'Amanda', role: 'Konten', src: staff('Amanda'), x: 880, y: LEAF_ROWS[2], size: 'leaf', at: 178},
];
const N = Object.fromEntries(NODES.map((n) => [n.id, n]));
const bottom = (id: string): Pt => [N[id].x, N[id].y + SIZE[N[id].size].h / 2];
const top = (id: string): Pt => [N[id].x, N[id].y - SIZE[N[id].size].h / 2];
const left = (id: string): Pt => [N[id].x - SIZE[N[id].size].w / 2, N[id].y];
const right = (id: string): Pt => [N[id].x + SIZE[N[id].size].w / 2, N[id].y];

type Edge = {to: string; pts: Pt[]; special?: boolean};
const BUS_Y = 770;
const SPINE_B = 440; // Bambang's spine runs between his two leaf columns
const SPINE_A = 1034; // Angga's spine runs on the right edge
const EDGES: Edge[] = [
  {to: 'marzuki', pts: [right('owner'), left('marzuki')], special: true},
  {to: 'mila', pts: [[440, bottom('owner')[1]], top('mila')]},
  ...['acep', 'bambang', 'angga'].map((id) => ({to: id, pts: [bottom('mila'), [440, BUS_Y], [N[id].x, BUS_Y], top(id)] as Pt[]})),
  ...['fitri', 'lilis', 'penjaga'].map((id) => ({to: id, pts: [bottom('bambang'), [SPINE_B, N[id].y], right(id)] as Pt[]})),
  ...['wawan', 'baron', 'kurir'].map((id) => ({to: id, pts: [bottom('bambang'), [SPINE_B, N[id].y], left(id)] as Pt[]})),
  ...['winda', 'fajar', 'amanda'].map((id) => ({to: id, pts: [right('angga'), [SPINE_A, N['angga'].y], [SPINE_A, N[id].y], right(id)] as Pt[]})),
];
const parentAt = (e: Edge) => (e.special || e.to === 'mila' ? N.owner.at : e.to === 'acep' || e.to === 'bambang' || e.to === 'angga' ? N.mila.at : ['winda', 'fajar', 'amanda'].includes(e.to) ? N.angga.at : N.bambang.at);

const lengthOf = (pts: Pt[]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const pointAt = (pts: Pt[], d: number): Pt => {
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d <= seg) {
      const t = seg === 0 ? 0 : d / seg;
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
    }
    d -= seg;
  }
  return pts[pts.length - 1];
};
const pathD = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');

const Link: React.FC<{edge: Edge}> = ({edge}) => {
  const frame = useCurrentFrame();
  const start = parentAt(edge);
  const end = N[edge.to].at;
  const len = lengthOf(edge.pts);
  const p = interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const color = edge.special ? '#FFE27A' : edge.to === 'bambang' || N[edge.to].x === SPINE_B ? COLORS.yellow : COLORS.yellow;
  // after the reveal, a repeating pulse keeps the energy flowing downward
  const loop = frame > 200 ? ((frame - 200 + (end % 20)) % 50) / 50 : -1;
  const head = pointAt(edge.pts, p * len);
  const loopHead = loop >= 0 ? pointAt(edge.pts, loop * len) : null;
  return (
    <g>
      <path d={pathD(edge.pts)} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={edge.special ? 8 : 6} strokeLinejoin="round" strokeDasharray={edge.special ? '18 12' : undefined} />
      <path
        d={pathD(edge.pts)}
        fill="none"
        stroke={color}
        strokeWidth={edge.special ? 8 : 6}
        strokeLinejoin="round"
        strokeDasharray={`${len * p} ${len}`}
        style={{filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 18px rgba(255,201,40,0.6))`}}
      />
      {p > 0 && p < 1 && (
        <>
          <circle cx={head[0]} cy={head[1]} r={18} fill="rgba(255,240,180,0.35)" style={{filter: 'blur(6px)'}} />
          <circle cx={head[0]} cy={head[1]} r={9} fill="#FFFFFF" style={{filter: `drop-shadow(0 0 10px ${COLORS.yellow})`}} />
        </>
      )}
      {loopHead && <circle cx={loopHead[0]} cy={loopHead[1]} r={7} fill="#FFF6D0" opacity={0.9} style={{filter: `drop-shadow(0 0 8px ${COLORS.yellow})`}} />}
    </g>
  );
};

const Card: React.FC<{n: NodeDef}> = ({n}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sz = SIZE[n.size];
  const appear = spring({frame: frame - (n.at - 22), fps, config: {damping: 14, stiffness: 120}});
  const lit = spring({frame: frame - n.at, fps, config: {damping: 8, stiffness: 200}});
  const flash = interpolate(frame - n.at, [0, 4, 18], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const accent = n.accent ?? COLORS.yellow;
  const isBambang = n.id === 'bambang';
  const glow = lit * (isBambang ? 1.4 : 1);
  return (
    <div
      style={{
        position: 'absolute',
        left: n.x - sz.w / 2,
        top: n.y - sz.h / 2,
        width: sz.w,
        height: sz.h,
        borderRadius: 34,
        background: `linear-gradient(160deg, rgba(30,44,100,${0.75 + lit * 0.2}), rgba(8,14,40,0.92))`,
        border: `${isBambang ? 5 : 3}px solid ${lit > 0.05 ? accent : 'rgba(255,255,255,0.18)'}`,
        boxShadow: `0 18px 40px rgba(0,0,0,0.5), 0 0 ${40 * glow}px ${accent}${isBambang ? 'CC' : '88'}, inset 0 0 ${30 * flash}px rgba(255,255,255,0.8)`,
        transform: `scale(${(0.85 + appear * 0.15) * (1 + flash * 0.06) * (isBambang ? 1.06 : 1)})`,
        opacity: Math.min(1, appear * 0.55 + lit * 0.45),
        filter: `brightness(${0.55 + lit * 0.45})`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: sz.w / 2 - sz.img / 2,
          top: 12,
          width: sz.img,
          height: sz.img,
          borderRadius: sz.img * 0.26,
          background: `linear-gradient(150deg, #FFE48A, ${n.accent ? '#FF6B6B' : COLORS.yellow} 50%, ${n.accent ? '#B3121C' : COLORS.yellowDeep})`,
          boxShadow: 'inset -8px -10px 18px rgba(120,60,0,0.4), inset 8px 8px 16px rgba(255,255,255,0.5)',
          overflow: 'hidden',
        }}
      >
        <Img src={n.src} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 8%'}} />
      </div>
      <div style={{position: 'absolute', left: 6, right: 6, top: sz.img + 18, textAlign: 'center', fontFamily: FONT, lineHeight: 1.12}}>
        <div style={{fontWeight: 700, fontSize: n.size === 'leaf' ? 30 : 34, color: COLORS.white}}>{n.name}</div>
        <div style={{fontWeight: 600, fontSize: n.size === 'leaf' ? 23 : 25, color: accent === RED ? '#FF8A8F' : COLORS.yellow}}>{n.role}</div>
      </div>
    </div>
  );
};

// Camera keys: [frame, x, y, zoom] — follows the energy, then reveals the whole diagram.
const CAM: [number, number, number, number][] = [
  [0, 560, 420, 1.55],
  [40, 640, 420, 1.45],
  [70, 460, 600, 1.45],
  [100, 540, 840, 1.25],
  [128, 440, 1250, 1.3],
  [150, 440, 1400, 1.3],
  [176, 760, 1370, 1.3],
  [215, 540, 990, 0.97],
  [360, 540, 975, 1.0],
];
const camAt = (frame: number) => {
  const f = CAM.map((c) => c[0]);
  const opts = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const, easing: Easing.inOut(Easing.cubic)};
  return [1, 2, 3].map((k) => interpolate(frame, f, CAM.map((c) => c[k]), opts));
};

export const Scene03: React.FC = () => {
  const frame = useCurrentFrame();
  const [cx, cy, zoom] = camAt(frame);
  return (
    <AbsoluteFill>
      <Fonts />
      <Background camX={(cx - 540) * 0.6} camY={(cy - 990) * 0.4} zoom={zoom} />
      <div
        style={{
          position: 'absolute',
          width: WIDTH,
          height: HEIGHT,
          transformOrigin: '0 0',
          transform: `translate(${WIDTH / 2}px, ${HEIGHT / 2 + 50}px) scale(${zoom}) translate(${-cx}px, ${-cy}px)`,
        }}
      >
        <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {EDGES.map((e) => (
            <Link key={e.to} edge={e} />
          ))}
        </svg>
        {NODES.map((n) => (
          <Card key={n.id} n={n} />
        ))}
      </div>
      <Title text="struktur kerja Agent" start={2} y={70} size={66} />

      <Audio src={staticFile('sfx/hum.wav')} volume={0.35} />
      <Sequence from={0}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.35} /></Sequence>
      {[...new Set(NODES.map((n) => n.at))].map((at) => (
        <Sequence key={at} from={at - 2}>
          <Audio src={staticFile('sfx/zap.wav')} volume={0.32} />
        </Sequence>
      ))}
      <Sequence from={200}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.3} /></Sequence>
    </AbsoluteFill>
  );
};
