// Home collage photo slots. The order is fixed: index → position in the Figma collage.
//
// main (first collage, below the headline):
//   0  wide photo on the left
//   1  centre photo
//   2  tall photo on the right
// secondary (collage between Research Fields and Award & Activity):
//   0  tall photo on the left
//   1  photo on the right
//
// The two black blocks, the green gradient and the light-blue block are decoration in CSS,
// not slots (Figma draws the black blocks as an opaque fill: no photo would ever show).
export const HOME_VISUAL_SLOTS = {
  main: 3,
  secondary: 2,
} as const;

export type HomeVisualGroup = keyof typeof HOME_VISUAL_SLOTS;
