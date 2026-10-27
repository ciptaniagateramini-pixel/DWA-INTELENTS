import {staticFile} from 'remotion';

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;
export const SCENE01_FRAMES = 240;

export const COLORS = {
  yellow: '#FFC928',
  yellowDeep: '#F5A800',
  navy: '#0A1230',
  navyDeep: '#050916',
  white: '#FFFFFF',
};

export const FONT = 'Poppins, sans-serif';

const face = (weight: number, file: string) => `
@font-face {
  font-family: 'Poppins';
  font-weight: ${weight};
  font-style: normal;
  src: url('${staticFile(`fonts/${file}`)}') format('truetype');
}`;

export const FONT_CSS = [
  face(500, 'Poppins-Medium.ttf'),
  face(600, 'Poppins-SemiBold.ttf'),
  face(700, 'Poppins-Bold.ttf'),
  face(800, 'Poppins-ExtraBold.ttf'),
].join('\n');
