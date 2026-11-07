<p align="center"><img src="icons/icon-512.png" width="128" height="128" alt="Dice Roller icon"></p>

<h1 align="center">Dice Roller</h1>

<p align="center">A physically simulated 3D dice roller in a single page.<br>Any dice, loaded weights, forced results and six tables, all driven by the URL.</p>

---

## Features

- **Real physics.** Every roll is simulated with [Rapier](https://rapier.rs) at 120 Hz: rounded-edge colliders, friction, restitution and continuous collision detection. Dice leave the hand as a tight cluster, bounce off the tray and settle flat.
- **Any number of sides (2–100).** Fair, face-transitive shapes for every die: coin, tetrahedron, cube, octahedron, dodecahedron, icosahedron, trapezohedra (the d10 family, so `38` is a 38-face spindle) and bipyramids. Odd dice use the doubled fair shape with each number twice.
- **Forced results that still look real.** `reverse` makes dice land on chosen faces without faking the motion (see [How forced results work](#how-forced-results-work)).
- **Loaded dice** with exact per-face probabilities.
- **Six tables:** Casino Felt, Tavern Oak, Carrara Marble, Nebula Glass, Synthwave and Royal Velvet, each with its own lighting, dice materials, physics (felt is dead, marble is bouncy) and synthesized impact sounds.
- **Physically based rendering** with three.js: clearcoat resin, glass with dispersion, metal and pearlescent dice, engraved numbers, soft shadows and mirror floors.
- **Setup dialog.** Build any configuration visually. It only writes the query string, so every setup is a shareable link.
- **Roll history.** Every roll is recorded frame by frame and can be replayed at real speed or in slow motion.
- **Installable PWA.** Works offline after the first visit.
- Responsive framing for phones and desktops, orbit and zoom, keyboard shortcuts.

## URL parameters

The page is configured entirely through its query string. With no parameters it rolls one d6 on felt.

| Parameter | Example | Meaning |
| --- | --- | --- |
| `dice` | `dice=[4,6,8,10,12,20,38]` | One entry per die: its number of sides (2–100, up to 30 dice). |
| `weights` | `weights=[6,1,1,10,1,1,1]` | Loaded dice. The first number picks the die size, then one relative weight per face. Here face 3 of every d6 is 10× as likely. Several: `weights=[[6,1,1,10,1,1,1],[20,…]]`. |
| `reverse` | `reverse=[2,4,6]` | Results to land on, in dice order. Use `0` for a die that should roll freely, e.g. `reverse=[0,20]`. |
| `background` | `background=velvet` | `felt`, `wood`, `marble`, `cosmos`, `neon`, `velvet` (or `1`–`6`). |

Examples:

```
?dice=[4,6,8,10,12,20]
?dice=[6,6]&weights=[6,1,1,10,1,1,1]&background=wood
?dice=[6,6,6]&reverse=[2,4,6]&background=velvet
?dice=[20,20,10,7]&background=neon
```

## Keyboard

| Key | Action |
| --- | --- |
| Space / Enter | Roll again |
| R | Replay the last roll in slow motion |
| H | Roll history |
| C | Setup dialog |
| M | Mute |

Drag to orbit, scroll or pinch to zoom.

## How forced results work

Integrating a roll backwards in time (with collisions adding energy) is numerically unstable, so the simulator does something exact instead:

1. The roll is simulated forward with real physics, offline, before anything is shown. Rolls where a die ends cocked or stacked are discarded and re-simulated.
2. Every die shape here is face-transitive: its rotational symmetry group can carry any face onto any other face while mapping the solid onto itself.
3. The die's visual mesh is rotated by the symmetry that carries the requested face onto the face that actually landed up. The collision shape is unchanged, so the recorded trajectory is the genuine simulation, and it ends showing the number you asked for.

Loaded dice use the same mechanism: the result is drawn from your weights, then baked in by a symmetry, so the probabilities are exactly the ones you set.

## Running locally

It is a static site with no build step. Serve the folder over HTTP (service workers and ES modules need it):

```sh
python3 -m http.server 8000
# open http://localhost:8000/?dice=[6,6]
```

Dependencies are loaded from jsDelivr at pinned versions: `three@0.169.0` and `@dimforge/rapier3d-compat@0.14.0`.

## Project layout

```
index.html            the whole app: rendering, physics, UI
sw.js                 service worker (offline support)
manifest.webmanifest  PWA manifest
icons/                app icons (SVG sources and PNG sizes)
```

## License

[MIT](LICENSE)
