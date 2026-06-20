export const rangesOverlap = (startA, endA, startB, endB) =>
  Number(startA) <= Number(endB) && Number(endA) >= Number(startB);
