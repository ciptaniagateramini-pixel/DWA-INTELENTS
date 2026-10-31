import React, {useMemo} from 'react';
import {COLORS, HEIGHT, LngLat, WIDTH} from '../config';
import {Camera, geometryToPath, ringToPath} from '../geo';
import countries from '../../assets/data/region_countries.geo.json';
import bandung from '../../assets/data/bandung_city_boundary.geo.json';
import osmLocal from '../../assets/data/osm_gedebage_local.json';

type Way = {id: number; kind: string; hw?: string; coords: LngLat[]};

// 0 at width `from` → 1 at width `to` (log scale; either direction).
const fadeBy = (w: number, from: number, to: number) => {
  const [a, b] = [Math.log(from), Math.log(to)];
  const t = (Math.log(w) - a) / (b - a);
  return Math.max(0, Math.min(1, t));
};

const roadWidth = (hw?: string) =>
  hw === 'tertiary' || hw === 'tertiary_link' ? 7 : hw === 'residential' ? 4 : 2.5;

// Georeferenced vector basemap: Natural Earth countries → OSM Bandung boundary → OSM local detail.
export const MapSequence: React.FC<{cam: Camera}> = ({cam}) => {
  const w = cam.widthKm;
  const countryOpacity = fadeBy(w, 25, 80);
  const bandungOpacity = Math.min(fadeBy(w, 900, 250), fadeBy(w, 1.2, 4));
  const localOpacity = fadeBy(w, 9, 2.5);
  const pxPerM = cam.k / (6371008.8 * Math.cos((6.95 * Math.PI) / 180));

  const countryPaths = useMemo(
    () =>
      countryOpacity > 0
        ? (countries as any).features.map((f: any) => ({
            id: f.id,
            d: geometryToPath(cam, f.geometry),
            indo: f.id === '360',
          }))
        : [],
    [cam, countryOpacity]
  );
  const bandungPath = bandungOpacity > 0 ? geometryToPath(cam, (bandung as any).geometry) : '';
  const ways = (osmLocal as any).ways as Way[];

  return (
    <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
      <rect width={WIDTH} height={HEIGHT} fill={COLORS.sea} />
      <rect width={WIDTH} height={HEIGHT} fill={COLORS.land} opacity={1 - countryOpacity} />
      <g opacity={countryOpacity}>
        {countryPaths.map((c: any) => (
          <path
            key={c.id}
            d={c.d}
            fill={c.indo ? '#223143' : COLORS.land}
            stroke={c.indo ? 'rgba(230,182,76,0.55)' : COLORS.landStroke}
            strokeWidth={c.indo ? 1.6 : 1}
          />
        ))}
      </g>
      {bandungOpacity > 0 && (
        <path
          d={bandungPath}
          fill="rgba(230,182,76,0.10)"
          stroke={COLORS.mustard}
          strokeWidth={2.5}
          strokeDasharray="10 6"
          opacity={bandungOpacity}
        />
      )}
      {localOpacity > 0 && (
        <g opacity={localOpacity}>
          {ways
            .filter((wy) => ['farmland', 'scrub', 'commercial'].includes(wy.kind))
            .map((wy) => (
              <path
                key={wy.id}
                d={ringToPath(cam, wy.coords)}
                fill={wy.kind === 'farmland' ? '#1F3326' : wy.kind === 'scrub' ? '#24382A' : '#263040'}
                stroke="none"
              />
            ))}
          {ways
            .filter((wy) => wy.kind === 'building')
            .map((wy) => (
              <path key={wy.id} d={ringToPath(cam, wy.coords)} fill="#3A4757" stroke="#4A5869" strokeWidth={0.6} />
            ))}
          {ways
            .filter((wy) => wy.kind === 'water')
            .map((wy) => (
              <path key={wy.id} d={ringToPath(cam, wy.coords, false)} fill="none" stroke="#2D5A7A" strokeWidth={1.5} />
            ))}
          {ways
            .filter((wy) => wy.kind === 'road')
            .map((wy) => (
              <path
                key={wy.id}
                d={ringToPath(cam, wy.coords, false)}
                fill="none"
                stroke="#5B6878"
                strokeWidth={Math.max(1, roadWidth(wy.hw) * Math.min(1, pxPerM / 2))}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          {ways
            .filter((wy) => wy.kind === 'rail')
            .map((wy) => (
              <g key={wy.id}>
                <path d={ringToPath(cam, wy.coords, false)} fill="none" stroke="#C9CED6" strokeWidth={4} />
                <path
                  d={ringToPath(cam, wy.coords, false)}
                  fill="none"
                  stroke="#0F1720"
                  strokeWidth={2.4}
                  strokeDasharray="10 10"
                />
              </g>
            ))}
        </g>
      )}
      {/* Soft vignette keeps edges of the local OSM extract from reading as hard cuts. */}
      <defs>
        <radialGradient id="vig" cx="50%" cy="46%" r="70%">
          <stop offset="55%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.75} />
        </radialGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#vig)" />
    </svg>
  );
};
