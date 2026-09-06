import React from "react";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "rounded";
  className?: string;
}

const sizeClasses: Record<NonNullable<UserAvatarProps["size"]>, { box: string; text: string }> = {
  sm: { box: "w-8 h-8", text: "text-[11px]" },
  md: { box: "w-10 h-10", text: "text-sm" },
  lg: { box: "w-16 h-16", text: "text-lg" },
  xl: { box: "w-24 h-24", text: "text-2xl" },
};

function getInitials(name: string): string {
  const clean = name.replace(/^Dr\.?\s+/i, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + (last || "")).toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = "md",
  shape = "rounded",
  className = "",
}) => {
  const { box, text } = sizeClasses[size];
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-xl";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${box} ${shapeClass} object-cover ring-1 ring-slate-200/80 dark:ring-white/10 shadow-sm ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={`${box} ${shapeClass} ${text} flex items-center justify-center font-bold text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};