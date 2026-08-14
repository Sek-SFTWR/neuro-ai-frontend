/** Placeholder gradients standing in for missing scene frames. */
const GRADS = [
  'linear-gradient(135deg,#3F6B57,#26433A)',
  'linear-gradient(135deg,#8A5A3C,#5A3A26)',
  'linear-gradient(135deg,#3C5578,#25344B)',
  'linear-gradient(135deg,#9A7A34,#5F4B20)',
  'linear-gradient(135deg,#6B5A8A,#413655)',
];

export function grad(sec: number): string {
  return GRADS[sec % GRADS.length];
}
