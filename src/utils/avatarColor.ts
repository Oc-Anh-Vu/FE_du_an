export const AVATAR_COLORS = [
  "purple",
  "blue",
  "pink",
  "emerald",
  "amber",
  "indigo",
  "orange",
  "teal",
] as const;

export type AvatarColor = (typeof AVATAR_COLORS)[number];

export const AVATAR_BG_CLASS: Record<AvatarColor, string> = {
  purple: "bg-avatar-purple",
  blue: "bg-avatar-blue",
  pink: "bg-avatar-pink",
  emerald: "bg-avatar-emerald",
  amber: "bg-avatar-amber",
  indigo: "bg-avatar-indigo",
  orange: "bg-avatar-orange",
  teal: "bg-avatar-teal",
};

export function getAvatarColor(seed: string): AvatarColor {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
