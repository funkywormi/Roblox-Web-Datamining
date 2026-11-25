export const PoolItemAlignment = {
  LeftPin: "LeftPin",
  RightPin: "RightPin",
} as const;

export type PoolItemAlignment = (typeof PoolItemAlignment)[keyof typeof PoolItemAlignment];
