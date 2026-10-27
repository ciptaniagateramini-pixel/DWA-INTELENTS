import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

const WEIGHTS: [string, string][] = [
  ['500', 'Poppins-Medium.ttf'],
  ['600', 'Poppins-SemiBold.ttf'],
  ['700', 'Poppins-Bold.ttf'],
  ['800', 'Poppins-ExtraBold.ttf'],
];

/** Blocks rendering until the local Poppins files are loaded, so no frame uses a fallback font. */
export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender('Loading Poppins'));
  useEffect(() => {
    Promise.all(
      WEIGHTS.map(([weight, file]) => {
        const f = new FontFace('Poppins', `url(${staticFile(`fonts/${file}`)})`, {weight});
        document.fonts.add(f);
        return f.load();
      }),
    ).then(() => continueRender(handle));
  }, [handle]);
  return null;
};
