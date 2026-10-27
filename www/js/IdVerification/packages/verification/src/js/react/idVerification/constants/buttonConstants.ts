export const buttonVariants = {
  primary: 'primary',
  secondary: 'secondary',
  cta: 'cta'
} as const;

export type ButtonInfo = {
  variant?: (typeof buttonVariants)[keyof typeof buttonVariants];
  text: string;
  callback: () => void;
  explicitDisable?: boolean;
};

export default buttonVariants;
