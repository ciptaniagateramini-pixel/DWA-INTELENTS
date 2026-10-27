import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Fonts} from '../components/Fonts';
import {SpeechBubble} from '../components/SpeechBubble';
import {COLORS, FONT, HEIGHT, WIDTH} from '../theme';

export const SCENE04_FRAMES = 210;

type Pt = [number, number];
const staff = (n: string) => staticFile(`clean/staff/${n}.png`);
const logo = (n: string) => staticFile(`clean/logos/${n}.png`);
const RED = '#E8303A';
const GREEN = '#22C55E';

// Owner stands in front; the agent chain works behind her.
const OWNER = {src: staticFile('clean/scene01/Ownerbb mengetik pesan.png'), h: 1300, bottom: 1960};
const OWNER_W = OWNER.h * (1024 / 1536);
const PHONE: Pt = [540 - OWNER_W / 2 + 0.82 * OWNER_W, OWNER.bottom - OWNER.h + 0.45 * OWNER.h];

const T = {
  ownerIn: 0,
  typing: 12,
  chat: 34,
  beam: 50,
  mila: 66,
  acep: 82,
  bambang: 98,
  channels: [116, 121, 126, 131],
};

type CardDef = {id: string; name: string; role: string; src: string; x: number; y: number; w: number; h: number; img: number; at: number; accent?: string; badge?: string; badgeText?: string};
const HEAD = {w: 230, h: 200, img: 108};
const CH = {w: 220, h: 196, img: 100};
const ROW1 = 300;
const ROW2 = 600;
const CARDS: CardDef[] = [
  {id: 'mila', name: 'Bu Mila', role: 'HRD', src: staff('Bu Mila'), x: 870, y: ROW1, ...HEAD, at: T.mila},
  {id: 'acep', name: 'Acep', role: 'Harga', src: staff('Acep'), x: 540, y: ROW1, ...HEAD, at: T.acep},
  {id: 'bambang', name: 'Bambang', role: 'Divisi Pelanggan', src: staff('Bambang'), x: 210, y: ROW1, ...HEAD, at: T.bambang, accent: RED},
  {id: 'fitri', name: 'Fitri', role: 'WhatsApp', src: staff('Fitri'), x: 150, y: ROW2, ...CH, at: T.channels[0], badge: logo('WA Logo No Background')},
  {id: 'wawan', name: 'Wawan', role: 'Instagram', src: staff('Wawan'), x: 400, y: ROW2, ...CH, at: T.channels[1], badge: logo('Logo Insta No Background')},
  {id: 'lilis', name: 'Lilis', role: 'TikTok', src: staff('Lilis'), x: 680, y: ROW2, ...CH, at: T.channels[2], badge: logo('Logo TikTok No Background')},
  {id: 'baron', name: 'Baron', role: 'BB App', src: staff('Baron'), x: 930, y: ROW2, ...CH, at: T.channels[3], badgeText: 'BB'},
];
const C = Object.fromEntries(CARDS.map((c) => [c.id, c]));
const BUS = 485;

type Edge = {from: number; to: number; pts: Pt[]};
const EDGES: Edge[] = [
  // phone -> Bu Mila: the command leaves the phone and climbs behind the Owner
  {from: T.beam, to: T.mila, pts: [[PHONE[0] + 20, PHONE[1] - 30], [1030, PHONE[1] - 160], [1030, ROW1], [C.mila.x + HEAD.w / 2, ROW1]]},
  {from: T.mila, to: T.acep, pts: [[C.mila.x - HEAD.w / 2, ROW1], [C.acep.x + HEAD.w / 2, ROW1]]},
  {from: T.acep, to: T.bambang, pts: [[C.acep.x - HEAD.w / 2, ROW1], [C.bambang.x + HEAD.w / 2, ROW1]]},
  ...(['fitri', 'wawan', 'lilis', 'baron'] as const).map((id) => ({
    from: T.bambang,
    to: C[id].at,
    pts: [[C.bambang.x, ROW1 + HEAD.h / 2], [C.bambang.x, BUS], [C[id].x, BUS], [C[id].x, ROW2 - CH.h / 2]] as Pt[],
  })),
];

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

const Link: React.FC<{e: Edge}> = ({e}) => {
  const frame = useCurrentFrame();
  const len = lengthOf(e.pts);
  const p = interpolate(frame, [e.from, e.to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const head = pointAt(e.pts, p * len);
  const loop = frame > 140 ? ((frame - 140 + (e.to % 17)) % 40) / 40 : -1;
  const loopHead = loop >= 0 ? pointAt(e.pts, loop * len) : null;
  return (
    <g>
      <path d={pathD(e.pts)} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={6} strokeLinejoin="round" />
      <path
        d={pathD(e.pts)}
        fill="none"
        stroke={COLORS.yellow}
        strokeWidth={6}
        strokeLinejoin="round"
        strokeDasharray={`${len * p} ${len}`}
        style={{filter: `drop-shadow(0 0 8px ${COLORS.yellow}) drop-shadow(0 0 18px rgba(255,201,40,0.6))`}}
      />
      {p > 0 && p < 1 && (
        <>
          <circle cx={head[0]} cy={head[1]} r={20} fill="rgba(255,240,180,0.35)" style={{filter: 'blur(6px)'}} />
          <circle cx={head[0]} cy={head[1]} r={10} fill="#FFFFFF" style={{filter: `drop-shadow(0 0 10px ${COLORS.yellow})`}} />
        </>
      )}
      {loopHead && <circle cx={loopHead[0]} cy={loopHead[1]} r={7} fill="#FFF6D0" opacity={0.9} style={{filter: `drop-shadow(0 0 8px ${COLORS.yellow})`}} />}
    </g>
  );
};

/** Sync bar fills, then a check pops: the channel's price has been updated. */
const UpdateBadge: React.FC<{at: number; w: number}> = ({at, w}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const fill = interpolate(frame - at, [0, 12], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const check = spring({frame: frame - at - 12, fps, config: {damping: 9, stiffness: 220}});
  return (
    <>
      <div style={{position: 'absolute', left: 18, right: 18, bottom: 10, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.15)'}}>
        <div style={{width: `${fill * 100}%`, height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${COLORS.yellow}, ${GREEN})`, boxShadow: `0 0 10px ${GREEN}`}} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: w / 2 + 34,
          top: 14,
          width: 46,
          height: 46,
          borderRadius: 23,
          background: GREEN,
          boxShadow: `0 0 18px ${GREEN}, 0 6px 14px rgba(0,0,0,0.4)`,
          transform: `scale(${check})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={28} height={28} viewBox="0 0 24 24">
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
};

const Card: React.FC<{c: CardDef}> = ({c}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lit = spring({frame: frame - c.at, fps, config: {damping: 8, stiffness: 200}});
  const flash = interpolate(frame - c.at, [0, 4, 18], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const accent = c.accent ?? COLORS.yellow;
  const isChannel = !!(c.badge || c.badgeText);
  return (
    <div
      style={{
        position: 'absolute',
        left: c.x - c.w / 2,
        top: c.y - c.h / 2,
        width: c.w,
        height: c.h,
        borderRadius: 30,
        background: `linear-gradient(160deg, rgba(30,44,100,${0.7 + lit * 0.25}), rgba(8,14,40,0.92))`,
        border: `${c.accent ? 4 : 3}px solid ${lit > 0.05 ? accent : 'rgba(255,255,255,0.16)'}`,
        boxShadow: `0 16px 34px rgba(0,0,0,0.5), 0 0 ${38 * lit}px ${accent}AA, inset 0 0 ${28 * flash}px rgba(255,255,255,0.8)`,
        transform: `scale(${1 + flash * 0.07})`,
        filter: `brightness(${0.45 + lit * 0.55}) saturate(${0.5 + lit * 0.5})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: c.w / 2 - c.img / 2,
          top: 10,
          width: c.img,
          height: c.img,
          borderRadius: c.img * 0.26,
          background: `linear-gradient(150deg, #FFE48A, ${c.accent ? '#FF6B6B' : COLORS.yellow} 50%, ${c.accent ? '#B3121C' : COLORS.yellowDeep})`,
          boxShadow: 'inset -8px -10px 18px rgba(120,60,0,0.4), inset 8px 8px 16px rgba(255,255,255,0.5)',
          overflow: 'hidden',
        }}
      >
        <Img src={c.src} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 8%'}} />
      </div>
      {c.badge && <Img src={c.badge} style={{position: 'absolute', left: 8, top: 6, width: 62, height: 62, objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'}} />}
      {c.badgeText && (
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: 10,
            width: 54,
            height: 54,
            borderRadius: 16,
            background: `linear-gradient(150deg, #FFE48A, ${COLORS.yellow}, ${COLORS.yellowDeep})`,
            boxShadow: 'inset -4px -5px 10px rgba(120,60,0,0.4), 0 4px 8px rgba(0,0,0,0.5)',
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 24,
            color: COLORS.navy,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {c.badgeText}
        </div>
      )}
      <div style={{position: 'absolute', left: 4, right: 4, top: c.img + 14, textAlign: 'center', fontFamily: FONT, lineHeight: 1.1}}>
        <div style={{fontWeight: 700, fontSize: 28, color: COLORS.white}}>{c.name}</div>
        <div style={{fontWeight: 600, fontSize: 21, color: c.accent ? '#FF8A8F' : COLORS.yellow}}>{c.role}</div>
      </div>
      {isChannel && <UpdateBadge at={c.at} w={c.w} />}
    </div>
  );
};

export const Scene04: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ownerIn = spring({frame: frame - T.ownerIn, fps, config: {damping: 16, stiffness: 80}});
  const zoom = interpolate(frame, [0, SCENE04_FRAMES], [1.07, 1.0], {easing: Easing.inOut(Easing.quad)});
  const drift = Math.sin(frame / 40) * 6;
  const bob = Math.sin(frame / 22) * 8;
  const breathe = 1 + Math.sin(frame / 18) * 0.006;

  return (
    <AbsoluteFill>
      <Fonts />
      <Background camX={drift * 3} camY={0} zoom={zoom} />
      {/* back layer: the agent chain, moves less than the Owner (parallax) */}
      <div
        style={{
          position: 'absolute',
          width: WIDTH,
          height: HEIGHT,
          transformOrigin: '50% 30%',
          transform: `scale(${0.96 + (zoom - 1) * 0.5}) translateX(${drift * 0.5}px)`,
          opacity: interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'}),
        }}
      >
        <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {EDGES.map((e, i) => (
            <Link key={i} e={e} />
          ))}
        </svg>
        {CARDS.map((c) => (
          <Card key={c.id} c={c} />
        ))}
      </div>
      {/* front layer: the Owner, relaxed and free, with the phone */}
      <div style={{position: 'absolute', width: WIDTH, height: HEIGHT, transformOrigin: '50% 100%', transform: `scale(${zoom}) translateX(${drift}px)`}}>
        <div
          style={{
            position: 'absolute',
            left: 540 - OWNER_W * 0.42,
            top: OWNER.bottom - OWNER.h * 0.8,
            width: OWNER_W * 0.84,
            height: OWNER.h * 0.7,
            borderRadius: '45%',
            background: 'radial-gradient(closest-side, rgba(255,214,90,0.35), transparent)',
            filter: 'blur(40px)',
          }}
        />
        <Img
          src={OWNER.src}
          style={{
            position: 'absolute',
            left: 540 - OWNER_W / 2,
            top: OWNER.bottom - OWNER.h,
            width: OWNER_W,
            height: OWNER.h,
            transform: `translateY(${(1 - ownerIn) * 260 + bob}px) scale(${breathe})`,
            transformOrigin: '50% 100%',
            filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.6)) drop-shadow(0 -6px 30px rgba(0,0,0,0.45))',
            maskImage: 'linear-gradient(to bottom, black 80%, transparent 99%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 99%)',
          }}
        />
        <SpeechBubble
          text="Atur harga buyback hari ini"
          start={T.chat}
          originX={PHONE[0]}
          originY={PHONE[1] + bob}
          x={600}
          y={1000}
          width={440}
          fontSize={40}
        />
      </div>

      <Audio src={staticFile('sfx/hum.wav')} volume={0.22} endAt={SCENE04_FRAMES} />
      <Sequence from={0}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} /></Sequence>
      <Sequence from={T.typing}><Audio src={staticFile('sfx/typing.wav')} volume={0.45} /></Sequence>
      <Sequence from={T.chat - 2}><Audio src={staticFile('sfx/send.wav')} volume={0.45} /></Sequence>
      <Sequence from={T.chat}><Audio src={staticFile('sfx/pop.wav')} volume={0.4} /></Sequence>
      {[T.mila, T.acep, T.bambang].map((at) => (
        <Sequence key={at} from={at - 2}><Audio src={staticFile('sfx/zap.wav')} volume={0.4} /></Sequence>
      ))}
      {T.channels.map((at) => (
        <Sequence key={at} from={at + 10}><Audio src={staticFile('sfx/sync.wav')} volume={0.35} /></Sequence>
      ))}
      <Sequence from={T.channels[3] + 16}><Audio src={staticFile('sfx/ting.wav')} volume={0.45} /></Sequence>
    </AbsoluteFill>
  );
};
