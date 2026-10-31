import {Easing} from 'remotion';
import {CAMERA, HEIGHT, LngLat, WIDTH} from './config';

// Web Mercator in radians-based units; deterministic and dependency-free.
const RAD = Math.PI / 180;
const EARTH_KM = 6371.0088;

export const merc = ([lon, lat]: LngLat): [number, number] => [
  lon * RAD,
  Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2)),
];

export type Camera = {cx: number; cy: number; k: number; widthKm: number};

// Map focus sits slightly above the frame centre, leaving room for captions.
export const FOCUS: [number, number] = [WIDTH / 2, HEIGHT * 0.46];

const camAt = (center: LngLat, widthKm: number): Camera => {
  const [cx, cy] = merc(center);
  // Mercator stretch at the centre latitude: 1 unit = EARTH_KM * cos(lat) km.
  const kmPerUnit = EARTH_KM * Math.cos(center[1] * RAD);
  return {cx, cy, k: WIDTH / (widthKm / kmPerUnit), widthKm};
};

const ease = Easing.bezier(0.65, 0, 0.35, 1);

export const cameraAt = (frame: number): Camera => {
  const keys = CAMERA;
  if (frame <= keys[0].frame) return camAt(keys[0].center, keys[0].widthKm);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame <= b.frame) {
      const t = ease((frame - a.frame) / (b.frame - a.frame));
      const A = camAt(a.center, a.widthKm);
      const B = camAt(b.center, b.widthKm);
      const k = Math.exp(Math.log(A.k) + (Math.log(B.k) - Math.log(A.k)) * t);
      // Keep the zoom target steady: move the centre in proportion to scale change.
      const s = A.k === B.k ? t : (1 / A.k - 1 / k) / (1 / A.k - 1 / B.k);
      return {
        cx: A.cx + (B.cx - A.cx) * s,
        cy: A.cy + (B.cy - A.cy) * s,
        k,
        widthKm: a.widthKm + (b.widthKm - a.widthKm) * t,
      };
    }
  }
  const last = keys[keys.length - 1];
  return camAt(last.center, last.widthKm);
};

export const project = (cam: Camera, p: LngLat): [number, number] => {
  const [x, y] = merc(p);
  return [FOCUS[0] + (x - cam.cx) * cam.k, FOCUS[1] - (y - cam.cy) * cam.k];
};

export const ringToPath = (cam: Camera, ring: LngLat[], close = true): string => {
  let d = '';
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = project(cam, ring[i]);
    d += `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return close ? d + 'Z' : d;
};

type Geometry = {type: string; coordinates: any};
export const geometryToPath = (cam: Camera, g: Geometry): string => {
  if (g.type === 'Polygon') return (g.coordinates as LngLat[][]).map((r) => ringToPath(cam, r)).join('');
  if (g.type === 'MultiPolygon')
    return (g.coordinates as LngLat[][][]).flatMap((p) => p.map((r) => ringToPath(cam, r))).join('');
  return '';
};
