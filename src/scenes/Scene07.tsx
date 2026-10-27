import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {AgentCard, AgentCardProps, RED} from '../components/AgentCard';
import {Background} from '../components/Background';
import {EnergyDefs, EnergyLink, Pt} from '../components/Energy';
import {Fonts} from '../components/Fonts';
import {ownerBob, OwnerFront, phoneOf} from '../components/OwnerFront';
import {SpeechBubble} from '../components/SpeechBubble';
import {HEIGHT, WIDTH} from '../theme';

export const SCENE07_FRAMES = 150;

const staff = (n: string) => staticFile(`clean/staff/${n}.png`);
const logo = (n: string) => staticFile(`clean/logos/${n}.png`);
const OWNER = {x: 540, bottom: 1960, h: 1250};
const PHONE = phoneOf('present', OWNER.x, OWNER.bottom, OWNER.h);

const T = {chat: 24, beam: 40, mila: 60, heads: 78, loop: 120};
const HEAD = {w: 240, h: 200, img: 110, nameSize: 28};
const CHIP = {w: 140, h: 150, img: 76, nameSize: 21};
const CHIP_Y = 700;
const BUS1 = 350;
const BUS2 = 600;

type Card = AgentCardProps & {id: string};
const CARDS: Card[] = [
  {id: 'mila', ...HEAD, x: 540, y: 230, src: staff('Bu Mila'), name: 'Bu Mila', role: 'HRD', at: T.mila},
  {id: 'bambang', ...HEAD, x: 270, y: 470, src: staff('Bambang'), name: 'Bambang', role: 'Divisi Pelanggan', at: T.heads, accent: RED, nameSize: 26},
  {id: 'angga', ...HEAD, x: 810, y: 470, src: staff('Angga'), name: 'Angga', role: 'Marketing', at: T.heads},
  {id: 'fitri', ...CHIP, x: 90, y: CHIP_Y, src: staff('Fitri'), name: 'Fitri', role: 'WhatsApp', at: 96, badge: logo('WA Logo No Background'), update: true},
  {id: 'wawan', ...CHIP, x: 240, y: CHIP_Y, src: staff('Wawan'), name: 'Wawan', role: 'Instagram', at: 100, badge: logo('Logo Insta No Background'), update: true},
  {id: 'lilis', ...CHIP, x: 390, y: CHIP_Y, src: staff('Lilis'), name: 'Lilis', role: 'TikTok', at: 104, badge: logo('Logo TikTok No Background'), update: true},
  {id: 'baron', ...CHIP, x: 540, y: CHIP_Y, src: staff('Baron'), name: 'Baron', role: 'BB App', at: 108, badgeText: 'BB', update: true},
  {id: 'winda', ...CHIP, x: 745, y: CHIP_Y, src: staff('Winda'), name: 'Winda', role: 'Follow-up', at: 98, update: true},
  {id: 'fajar', ...CHIP, x: 905, y: CHIP_Y, src: staff('Fajar'), name: 'Fajar', role: 'Broadcast', at: 104, update: true},
];
const C = Object.fromEntries(CARDS.map((c) => [c.id, c]));
const top = (id: string): Pt => [C[id].x, C[id].y - C[id].h / 2];
const bottom = (id: string): Pt => [C[id].x, C[id].y + C[id].h / 2];

const EDGES: {pts: Pt[]; from: number; to: number}[] = [
  {pts: [[PHONE[0] - 20, PHONE[1] - 40], [12, PHONE[1] - 140], [12, C.mila.y], [C.mila.x - HEAD.w / 2, C.mila.y]], from: T.beam, to: T.mila},
  ...['bambang', 'angga'].map((id) => ({pts: [bottom('mila'), [540, BUS1], [C[id].x, BUS1], top(id)] as Pt[], from: T.mila, to: T.heads})),
  ...['fitri', 'wawan', 'lilis', 'baron'].map((id) => ({pts: [bottom('bambang'), [C.bambang.x, BUS2], [C[id].x, BUS2], top(id)] as Pt[], from: T.heads, to: C[id].at})),
  ...['winda', 'fajar'].map((id) => ({pts: [bottom('angga'), [C.angga.x, BUS2], [C[id].x, BUS2], top(id)] as Pt[], from: T.heads, to: C[id].at})),
];

/** Owner shows the content on her phone and tells Bu Mila to distribute it; it fans out to the channels and marketing. */
export const Scene07: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, SCENE07_FRAMES], [1.06, 1.0], {easing: Easing.inOut(Easing.quad)});
  const drift = Math.sin(frame / 40) * 6;
  const phone: Pt = [PHONE[0], PHONE[1] + ownerBob(frame)];
  return (
    <AbsoluteFill>
      <Fonts />
      <Background camX={drift * 3} camY={0} zoom={zoom} />
      <div style={{position: 'absolute', width: WIDTH, height: HEIGHT, transformOrigin: '50% 30%', transform: `scale(${0.97 + (zoom - 1) * 0.5}) translateX(${drift * 0.5}px)`}}>
        <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <EnergyDefs />
          {EDGES.map((e, i) => (
            <EnergyLink key={i} {...e} packet loopFrom={T.loop} />
          ))}
        </svg>
        {CARDS.map(({id, ...c}) => (
          <AgentCard key={id} {...c} />
        ))}
      </div>
      <div style={{position: 'absolute', width: WIDTH, height: HEIGHT, transformOrigin: '50% 100%', transform: `scale(${zoom}) translateX(${drift}px)`}}>
        <OwnerFront pose="present" {...OWNER} />
        <SpeechBubble
          text="Distributikan konten ini ke divisi kanal, dan hubungi team marketing untuk follow up dan broadcast promo"
          start={T.chat}
          originX={phone[0]}
          originY={phone[1]}
          x={40}
          y={1520}
          width={1000}
          fontSize={36}
        />
      </div>

      <Audio src={staticFile('sfx/hum.wav')} volume={0.2} endAt={SCENE07_FRAMES} />
      <Sequence from={0}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} /></Sequence>
      <Sequence from={T.chat - 2}><Audio src={staticFile('sfx/send.wav')} volume={0.45} /></Sequence>
      <Sequence from={T.chat}><Audio src={staticFile('sfx/pop.wav')} volume={0.4} /></Sequence>
      <Sequence from={T.mila - 2}><Audio src={staticFile('sfx/zap.wav')} volume={0.4} /></Sequence>
      <Sequence from={T.heads - 2}><Audio src={staticFile('sfx/zap.wav')} volume={0.4} /></Sequence>
      {[96, 100, 104, 108].map((at) => (
        <Sequence key={at} from={at + 10}><Audio src={staticFile('sfx/sync.wav')} volume={0.3} /></Sequence>
      ))}
      <Sequence from={124}><Audio src={staticFile('sfx/ting.wav')} volume={0.45} /></Sequence>
    </AbsoluteFill>
  );
};
