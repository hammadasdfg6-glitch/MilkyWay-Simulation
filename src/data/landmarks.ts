import type { Landmark } from '../types';
import { rotateY } from '../math/mat4';

/**
 * Galactocentric position of the Solar System (Sol) in kiloparsecs (kpc):
 * ~8.178 kpc from Sgr A* along -X, ~21 pc above the galactic midplane.
 */
export const SOL_POSITION_KPC: [number, number, number] = [-8.178, 0.021, 0];

/**
 * Solar orbital angular speed around the Galactic Center (~228 km/s at 8.178 kpc):
 * 1 km/s ≈ 1.02271e-3 kpc/Myr -> 228 * 1.02271e-3 / 8.178 ≈ 0.0285 rad/Myr.
 */
export const SOL_OMEGA_RAD_PER_MYR = 0.0285;

/** Spiral density-wave pattern angular speed in rad/Myr (must match astro/shaders). */
const PATTERN_OMEGA = 0.025;

/** Galactic bar pattern angular speed in rad/Myr (must match astro/shaders). */
const BAR_OMEGA = 0.041;

/**
 * Catalog of scientifically grounded Milky Way landmarks.
 * Coordinates use a Galactic Cartesian frame in kpc:
 *   +X = Sol -> Sagittarius A* (l = 0°)
 *   +Y = North Galactic Pole (b = +90°)
 *   -Z = Direction of Galactic rotation / Cygnus (l = 90°)
 */
export const MILKY_WAY_LANDMARKS: Landmark[] = [
  {
    id: 'sgr-a-star',
    name: 'Sagittarius A*',
    category: 'core',
    positionKpc: [0, 0, 0],
    cameraOffsetKpc: [-0.045, 0.018, 0.045],
    distanceFromSolLy: '26,670 ly',
    classification: 'Supermassive Black Hole (4.15 × 10⁶ M☉)',
    description:
      'Dynamical center of the Milky Way, surrounded by the dense Nuclear Star Cluster, S-stars orbiting at relativistic speeds, and a warm dusty accretion flow.',
    omegaRadPerMyr: 0,
  },
  {
    id: 'sol-system',
    name: 'Solar System (Sol)',
    category: 'solar',
    positionKpc: [...SOL_POSITION_KPC],
    cameraOffsetKpc: [-0.45, 0.22, 0.55],
    distanceFromSolLy: '0 ly',
    classification: 'G2V Main-Sequence Star · Orion–Cygnus Spur',
    description:
      'Our home planetary system, located 8.178 kpc from the Galactic Center inside the Local Bubble on the inner edge of the Orion–Cygnus Spur.',
    omegaRadPerMyr: SOL_OMEGA_RAD_PER_MYR,
  },
  {
    id: 'orion-nebula',
    name: 'Orion Nebula (M42)',
    category: 'nebula',
    positionKpc: [-8.518, -0.116, 0.188],
    cameraOffsetKpc: [-0.32, 0.18, 0.42],
    distanceFromSolLy: '1,344 ly',
    classification: 'Diffuse H-II Emission Nebula · Orion Spur',
    description:
      'The closest massive star-forming region to Earth, ionized by the young OB stars of the Trapezium Cluster inside the Orion Molecular Cloud Complex.',
    omegaRadPerMyr: PATTERN_OMEGA,
  },
  {
    id: 'carina-nebula',
    name: 'Carina Nebula (NGC 3372)',
    category: 'nebula',
    positionKpc: [-7.39, -0.027, 2.48],
    cameraOffsetKpc: [-0.65, 0.35, 0.75],
    distanceFromSolLy: '8,500 ly',
    classification: 'Giant H-II Complex · Carina–Sagittarius Arm',
    description:
      'One of the largest and brightest diffuse nebulae in our galaxy, hosting hypergiant Eta Carinae and intense O-star feedback carving colossal dust pillars.',
    omegaRadPerMyr: PATTERN_OMEGA,
  },
  {
    id: 'cygnus-x1',
    name: 'Cygnus X-1',
    category: 'arm',
    positionKpc: [-7.47, 0.14, -2.08],
    cameraOffsetKpc: [-0.55, 0.28, -0.65],
    distanceFromSolLy: '7,200 ly',
    classification: 'High-Mass X-Ray Binary (21.2 M☉ Black Hole)',
    description:
      'A landmark stellar-mass black hole accreting wind from blue supergiant HDE 226868 ahead of the Sun along the Cygnus X star-forming complex.',
    omegaRadPerMyr: 0.0298,
  },
  {
    id: 'westerlund-1',
    name: 'Westerlund 1',
    category: 'cluster',
    positionKpc: [-4.24, -0.029, 1.47],
    cameraOffsetKpc: [-0.7, 0.4, 0.75],
    distanceFromSolLy: '13,700 ly',
    classification: 'Super Star Cluster · Scutum–Centaurus Arm',
    description:
      'The most massive compact young star cluster known in the Milky Way, packed with hypergiants, Wolf–Rayet stars, and magnetars at R ≈ 4.5 kpc.',
    omegaRadPerMyr: PATTERN_OMEGA,
  },
  {
    id: 'eagle-nebula',
    name: 'Eagle Nebula (M16)',
    category: 'nebula',
    positionKpc: [-6.5, 0.045, -0.51],
    cameraOffsetKpc: [-0.5, 0.26, -0.55],
    distanceFromSolLy: '5,700 ly',
    classification: 'Young Open Cluster & H-II Region · Sagittarius Arm',
    description:
      'Home to the Pillars of Creation, where ultraviolet radiation from young cluster NGC 6611 photo-evaporates dense molecular hydrogen columns.',
    omegaRadPerMyr: PATTERN_OMEGA,
  },
  {
    id: 'perseus-double-cluster',
    name: 'Perseus Double Cluster',
    category: 'cluster',
    positionKpc: [-9.8, -0.148, -1.63],
    cameraOffsetKpc: [-0.75, 0.45, -0.85],
    distanceFromSolLy: '7,500 ly',
    classification: 'Twin Open Clusters (NGC 869 / NGC 884) · Perseus Arm',
    description:
      'A pair of rich, 14-million-year-old supergiant open clusters anchoring the outer Perseus Spiral Arm in the galactic anticenter quadrant.',
    omegaRadPerMyr: PATTERN_OMEGA,
  },
  {
    id: 'omega-centauri',
    name: 'Omega Centauri (NGC 5139)',
    category: 'cluster',
    positionKpc: [-4.98, 1.38, 3.93],
    cameraOffsetKpc: [-0.95, 0.65, 1.05],
    distanceFromSolLy: '17,090 ly',
    classification: 'Massive Globular Cluster (~10⁷ Stars) · Inner Halo',
    description:
      'The largest and brightest globular cluster orbiting the Milky Way, widely interpreted as the stripped core of an ancient accreted dwarf galaxy.',
    omegaRadPerMyr: 0.011,
  },
  {
    id: '47-tucanae',
    name: '47 Tucanae (NGC 104)',
    category: 'cluster',
    positionKpc: [-6.31, -3.16, 2.58],
    cameraOffsetKpc: [-0.85, -0.55, 0.95],
    distanceFromSolLy: '14,700 ly',
    classification: 'Core-Collapsed Globular Cluster · Southern Halo',
    description:
      'Second brightest globular cluster in Earth’s sky, containing millions of ancient metal-poor stars and millisecond pulsars 3.16 kpc south of the disk.',
    omegaRadPerMyr: 0.012,
  },
  {
    id: 'galactic-bar-tip',
    name: 'Galactic Bar Near Tip',
    category: 'arm',
    positionKpc: [-3.21, 0, -1.63],
    cameraOffsetKpc: [-1.4, 1.1, -1.3],
    distanceFromSolLy: '17,050 ly',
    classification: 'Triaxial Long Bar End (~27° Sun–GC Offset)',
    description:
      'The near end of the Milky Way’s 3.6 kpc stellar bar where gas piles up and feeds the Scutum–Centaurus spiral arm and W43 mini-starburst.',
    omegaRadPerMyr: BAR_OMEGA,
  },
  {
    id: 'great-rift-vantage',
    name: 'Great Rift Edge-On Vantage',
    category: 'vantage',
    positionKpc: [-11.8, 0.16, 1.5],
    cameraOffsetKpc: [-2.4, 0.35, 0.4],
    distanceFromSolLy: '12,800 ly',
    classification: 'Edge-On Interstellar Dust Extinction Sightline',
    description:
      'A shallow oblique viewpoint across the outer disk looking inward through the dark molecular dust lanes of the Great Rift toward the glowing bulge.',
    omegaRadPerMyr: 0,
  },
  {
    id: 'galactic-north-pole',
    name: 'Galactic North Pole Overlook',
    category: 'vantage',
    positionKpc: [0, 18, 0],
    cameraOffsetKpc: [-0.5, 10.0, 4.5],
    distanceFromSolLy: '64,400 ly (North Halo)',
    classification: 'Grand-Design Face-On Observatory Vantage',
    description:
      'High above the Galactic North Pole (+28 kpc vantage), revealing the four-armed logarithmic spiral structure, Orion Spur, and central barred bulge.',
    omegaRadPerMyr: 0,
  },
  {
    id: 'm13-hercules',
    name: 'Hercules Cluster (M13)',
    category: 'cluster',
    positionKpc: [-5.53, 4.47, -4.41],
    cameraOffsetKpc: [-1.0, 0.8, -1.0],
    distanceFromSolLy: '22,200 ly',
    classification: 'Halo Globular Cluster (NGC 6205)',
    description:
      'A dense sphere of ~300,000 ancient Population II stars orbiting 4.47 kpc above the northern galactic plane in the outer halo.',
    omegaRadPerMyr: 0.009,
  },
];

/**
 * Compute the 3D Galactocentric position (kpc) of a landmark at `simTimeMyr`
 * by rotating around the Galactic +Y axis at `landmark.omegaRadPerMyr`.
 */
export function getLandmarkPositionAtTime(
  landmark: Landmark,
  simTimeMyr: number
): [number, number, number] {
  if (landmark.omegaRadPerMyr === 0 || simTimeMyr === 0) {
    return [
      landmark.positionKpc[0],
      landmark.positionKpc[1],
      landmark.positionKpc[2],
    ];
  }
  return rotateY(landmark.positionKpc, landmark.omegaRadPerMyr * simTimeMyr);
}
