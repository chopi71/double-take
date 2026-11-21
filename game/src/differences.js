// The difference definitions for DOUBLE TAKE: for each of the three scenes, the eight spots
// where the right-hand picture departs from the left. Anchors are panel coordinates (each
// picture is 600x600), radius is how close a click must land to count, and label says what
// changed, for the status line. The painters in scenes.js position the differing elements on
// these same anchors, so a found-ring always lands exactly on the element that changed.

function diff(id, x, y, radius, label) {
  return { id, x, y, radius, label };
}

export const SCENES = [
  {
    id: 'coral-cove',
    name: 'Coral Cove',
    differences: [
      diff('sun-ray', 480, 90, 55, 'the sun is missing a ray'),
      diff('cloud-gone', 300, 58, 55, 'one cloud has drifted away'),
      diff('fish-color', 460, 362, 32, 'one fish changed colour'),
      diff('crab-claw', 272, 486, 38, 'the crab lost a claw'),
      diff('extra-shell', 500, 520, 30, 'an extra shell washed up'),
      diff('ball-stripes', 520, 470, 34, "the beach ball's stripes changed"),
      diff('boat-flag', 150, 222, 30, "the sailboat's flag is gone"),
      diff('starfish-arm', 120, 480, 36, 'the starfish has four arms, not five'),
    ],
  },
  {
    id: 'lantern-lane',
    name: 'Lantern Lane',
    differences: [
      diff('lantern-color', 273, 166, 28, 'one lantern glows a different colour'),
      diff('moon-flip', 510, 80, 40, 'the crescent moon faces the other way'),
      diff('cat-tail', 130, 378, 32, "the cat's tail curls the other way"),
      diff('sign-symbol', 480, 282, 28, "one sign's symbol changed"),
      diff('stars-gone', 137, 64, 45, 'a cluster of stars went out'),
      diff('pot-color', 300, 552, 28, 'one plant pot changed colour'),
      diff('window-dark', 407, 211, 24, 'one lit window went dark'),
      diff('awning-stripes', 435, 427, 42, "one awning's stripes run the other way"),
    ],
  },
  {
    id: 'wizards-attic',
    name: "The Wizard's Attic",
    differences: [
      diff('potion-color', 340, 404, 28, 'one potion changed colour'),
      diff('book-missing', 120, 347, 28, 'one book is missing from the shelf'),
      diff('owl-eyes', 517, 258, 32, 'the owl has closed its eyes'),
      diff('candle-out', 462, 388, 24, 'the candle has gone out'),
      diff('globe-color', 232, 414, 34, "the globe's lands changed colour"),
      diff('hat-color', 92, 150, 36, 'the pointed hat changed colour'),
      diff('window-star', 345, 95, 24, 'one star outside the window is missing'),
      diff('rug-pattern', 300, 532, 50, "the rug's pattern changed"),
    ],
  },
];

/** Every difference id of a scene, in list order: the set the right-hand panel is painted with. */
export function allDiffIds(scene) {
  return scene.differences.map((d) => d.id);
}
