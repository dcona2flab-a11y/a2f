// Home scroll motion (ani3), values from the designer's reference implementation
// references/feedback/A2F_scroll_animation & 6box.html (revision 7, received 2026-11-04).
// Distances are in the designer's artboard units: × u (= artboard width / 1920) where the
// reference multiplies by u, then × the ratio of the real collage width to the Figma collage
// width, so in-between widths scale. Our breakpoints are kept (768 / 1440 / 1920); 365 has no
// reference artboard and uses the 768 rules (phaseA scaled from 768: 432.5 / 768 × 365).

export type MotionSlot =
  | "black0"
  | "gradient"
  | "blue"
  | "black1"
  | "photo0"
  | "photo1"
  | "photo2"
  | "intro0"
  | "intro1";

export type MotionLayerConfig = {
  slot: MotionSlot;
  rate: number;                               // rise speed × the scroll (> 1 = faster than the page)
  copy?: boolean;                             // text: keeps a gap to the photos above / below it
  wipe?: { start: number; span: number };     // erased from the bottom edge up over `span`
  sectionClearance?: number;                  // gap kept to the next section (default 240)
};

export type MotionBreakpoint = {
  artboardWidth: number;
  collageWidth: number;                       // Figma collage width at this breakpoint
  phaseA: number;
  layers: MotionLayerConfig[];
};

// Reference names: black_top, gradient, blue_chip, black_lower, forest, poster, laptop,
// copy_lower, copy_top / copy.
const BLACK0: MotionLayerConfig = { slot: "black0", rate: 1.12 };
const GRADIENT: MotionLayerConfig = { slot: "gradient", rate: 1.35 };
const BLUE: MotionLayerConfig = { slot: "blue", rate: 0.78 };
const BLACK1: MotionLayerConfig = { slot: "black1", rate: 0.7, wipe: { start: 400, span: 440 } };
const PHOTO0: MotionLayerConfig = { slot: "photo0", rate: 1.32 };
const PHOTO1: MotionLayerConfig = { slot: "photo1", rate: 0.82 };
const PHOTO2: MotionLayerConfig = { slot: "photo2", rate: 0.48, wipe: { start: 660, span: 720 }, sectionClearance: 320 };
const INTRO0: MotionLayerConfig = { slot: "intro0", rate: 0.72, copy: true };
const INTRO1: MotionLayerConfig = { slot: "intro1", rate: 1.02, copy: true, wipe: { start: 740, span: 360 } };

const DESKTOP_LAYERS = [BLACK0, GRADIENT, BLUE, BLACK1, PHOTO0, PHOTO1, PHOTO2, INTRO1, INTRO0];
const MOBILE_LAYERS = [BLUE, PHOTO2, BLACK1, PHOTO1, INTRO0, GRADIENT, PHOTO0];

export const HOME_MOTION = {
  mobile: { artboardWidth: 365, collageWidth: 325, phaseA: 205.5, layers: MOBILE_LAYERS },
  tablet: { artboardWidth: 768, collageWidth: 708, phaseA: 432.5, layers: MOBILE_LAYERS },
  desktop: { artboardWidth: 1440, collageWidth: 1280, phaseA: 571, layers: DESKTOP_LAYERS },
  large: { artboardWidth: 1920, collageWidth: 1720, phaseA: 833.25, layers: DESKTOP_LAYERS },
} satisfies Record<string, MotionBreakpoint>;

// Shared constants of the reference (artboard units × u unless noted).
export const MOTION = {
  phaseBRate: 0.8,        // after phaseA: × 0.8 for phaseBSpan, then × 0.7
  lateRate: 0.7,
  phaseBSpan: 600,
  followMs: 160,          // follow-through after the scroll stops (ms)
  titleStart: 70,         // headline: erased from the bottom from 70 over 340
  titleSpan: 340,
  titleFeather: 4,
  wipeFeather: 8,
  wipeOffset: 30,         // wipe start = phaseA + start + 30 …
  wipeBeforeHeader: 64,   // … or earlier, before the slot reaches the header
  headerGap: 24,          // wiped slots slow down this far below the header
  headerZone: 100,
  nextSectionGap: 140,    // wipes finish this far before the next section reaches the header
  nextSectionLead: 220,
  sectionClearance: 240,
  copyClearance: 96,
  copyZone: 64,
};
