// 2D affine helpers. Matrices are SVG order [a,b,c,d,e,f]: x' = a x + c y + e, y' = b x + d y + f (SVG_Y_DOWN_PX, degrees clockwise on screen).
export const I = Object.freeze([1, 0, 0, 1, 0, 0]);
export const mul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
export const chain = (...Ms) => Ms.reduce((acc, M) => mul(acc, M), I);
export const T = (x, y) => [1, 0, 0, 1, x, y];
export const S = (sx, sy = sx) => [sx, 0, 0, sy, 0, 0];
export const R = (deg) => { const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); return [c, s, -s, c, 0, 0]; };
export const Rabout = (deg, p) => chain(T(p[0], p[1]), R(deg), T(-p[0], -p[1]));
export const apply = (M, p) => [M[0] * p[0] + M[2] * p[1] + M[4], M[1] * p[0] + M[3] * p[1] + M[5]];
export const applyVec = (M, v) => [M[0] * v[0] + M[2] * v[1], M[1] * v[0] + M[3] * v[1]];
export const det = (M) => M[0] * M[3] - M[1] * M[2];
export function inv(M) { const d = det(M); if (Math.abs(d) < 1e-12) throw new Error("NON_INVERTIBLE_MATRIX"); return [M[3] / d, -M[1] / d, -M[2] / d, M[0] / d, (M[2] * M[5] - M[3] * M[4]) / d, (M[1] * M[4] - M[0] * M[5]) / d]; }
export const angleOf = (M) => (Math.atan2(M[1], M[0]) * 180) / Math.PI;
export const scaleOf = (M) => Math.sqrt(Math.abs(det(M)));
export const finite = (M) => M.every(Number.isFinite);
export const fmt = (M) => `matrix(${M.map((v) => +v.toFixed(6)).join(" ")})`;
export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export const deg = (rad) => (rad * 180) / Math.PI;
export const wrap180 = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
