// Builds assets/data/region_countries.geo.json from Natural Earth 1:10m (world-atlas, public domain).
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {feature} from 'topojson-client';
const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-10m.json');
const keep = new Set(['360', '458', '626', '096', '598', '036', '608', '702']);
const fc = feature(topo, topo.objects.countries);
fc.features = fc.features.filter((f) => keep.has(f.id));
fs.writeFileSync('assets/data/region_countries.geo.json', JSON.stringify(fc));
console.log('countries:', fc.features.map((f) => f.properties.name).join(', '));
