/** Small glossy round icons drawn as SVG (no external assets). */
export type IconKind = 'hashtag' | 'kol' | 'idea' | 'search' | 'video' | 'photo' | 'mail' | 'chat' | 'megaphone';

const GLYPH: Record<IconKind, React.ReactNode> = {
  hashtag: <path d="M9 4L7 20M17 4l-2 16M4 9h16M3 15h16" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" fill="none" />,
  kol: <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" fill="#fff" />,
  idea: (
    <g fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
    </g>
  ),
  search: (
    <g fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round">
      <circle cx={10.5} cy={10.5} r={6} />
      <path d="M15 15l5.5 5.5" />
    </g>
  ),
  video: (
    <g fill="#fff">
      <rect x={3} y={6} width={13} height={12} rx={3} />
      <path d="M17 10l4-2.5v9L17 14z" />
    </g>
  ),
  photo: (
    <g fill="none" stroke="#fff" strokeWidth={2.2} strokeLinejoin="round">
      <rect x={3} y={5} width={18} height={14} rx={3} />
      <path d="M3 16l5-5 4 4 3-3 6 6" />
      <circle cx={16} cy={9} r={1.6} fill="#fff" />
    </g>
  ),
  mail: (
    <g fill="none" stroke="#fff" strokeWidth={2.2} strokeLinejoin="round">
      <rect x={3} y={6} width={18} height={13} rx={2.5} />
      <path d="M3.5 7l8.5 6.5L20.5 7" />
    </g>
  ),
  chat: <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H10l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" fill="#fff" />,
  megaphone: (
    <g fill="#fff">
      <path d="M3 10v4a1 1 0 0 0 1 1h3l8 5V4L7 9H4a1 1 0 0 0-1 1z" />
      <path d="M18 9a4 4 0 0 1 0 6" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>
  ),
};

export const ICON_COLORS: Record<IconKind, [string, string]> = {
  hashtag: ['#7C8CFF', '#3B47C9'],
  kol: ['#FFD86B', '#E09A00'],
  idea: ['#FFE27A', '#F5A800'],
  search: ['#6EE7F9', '#0E8FB0'],
  video: ['#FF8AD0', '#C2187A'],
  photo: ['#FFA36E', '#E0541A'],
  mail: ['#7CC4FF', '#1E6FD9'],
  chat: ['#6EE7A0', '#16A34A'],
  megaphone: ['#FF8A8F', '#D21F2B'],
};

export const GlossIcon: React.FC<{kind: IconKind; size: number; style?: React.CSSProperties}> = ({kind, size, style}) => {
  const [a, b] = ICON_COLORS[kind];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        background: `linear-gradient(150deg, ${a}, ${b})`,
        boxShadow: `inset -${size * 0.06}px -${size * 0.08}px ${size * 0.16}px rgba(0,0,0,0.25), inset ${size * 0.06}px ${size * 0.06}px ${size * 0.14}px rgba(255,255,255,0.5), 0 ${size * 0.12}px ${size * 0.25}px rgba(0,0,0,0.45)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24">
        {GLYPH[kind]}
      </svg>
    </div>
  );
};
