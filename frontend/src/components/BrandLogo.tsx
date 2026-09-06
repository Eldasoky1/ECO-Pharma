import React from "react";

interface BrandLogoProps {
  variant?: "full" | "horizontal" | "compact" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "light" | "dark";
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "horizontal",
  size = "md",
  theme = "light",
  className = "",
}) => {
  // Dimension definitions
  const sizeMap = {
    sm: { icon: 28, title: "text-sm", subtitle: "text-[9px]" },
    md: { icon: 38, title: "text-base", subtitle: "text-[10px]" },
    lg: { icon: 52, title: "text-xl", subtitle: "text-xs" },
    xl: { icon: 72, title: "text-3xl", subtitle: "text-sm" },
  };

  const { icon: iconSize, title: titleClass, subtitle: subtitleClass } = sizeMap[size];

  // Colors matching the official logo in gg.png
  const primaryColor = theme === "dark" ? "#10b981" : "#008767"; // Emerald Green
  const textColor = theme === "dark" ? "text-white" : "text-[#008767]";
  const subtextColor = theme === "dark" ? "text-slate-400" : "text-slate-500";

  // Crisp Vector SVG reproducing the exact circular emblem from gg.png:
  // Circular ring with medical cross + organic leaf overlay + connected network nodes
  const EmblemSVG = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200"
    >
      {/* Outer circular frame */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke={primaryColor}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeDasharray="250 30"
      />

      {/* Network node dots & connecting circuit branches */}
      <line x1="68" y1="26" x2="80" y2="40" stroke={primaryColor} strokeWidth="3" />
      <line x1="80" y1="40" x2="72" y2="52" stroke={primaryColor} strokeWidth="2.5" />
      <line x1="28" y1="72" x2="22" y2="82" stroke={primaryColor} strokeWidth="3" />

      {/* Circuit Nodes */}
      <circle cx="68" cy="26" r="4.5" fill={primaryColor} />
      <circle cx="80" cy="40" r="4.5" fill={primaryColor} />
      <circle cx="22" cy="82" r="4.5" fill={primaryColor} />

      {/* Medical Cross in the background center */}
      <path
        d="M44 26 H56 V40 H70 V52 H56 V68 H44 V52 H30 V40 H44 Z"
        stroke={primaryColor}
        strokeWidth="5"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Elegant Eco Leaf curved across the cross */}
      <path
        d="M26 84 C 26 84, 38 68, 52 50 C 66 32, 80 44, 80 44 C 80 44, 76 68, 56 78 C 42 85, 26 84, 26 84 Z"
        fill={theme === "dark" ? "#064e3b" : "#e6f4f1"}
        stroke={primaryColor}
        strokeWidth="5.5"
        strokeLinejoin="round"
      />

      {/* Leaf Central Vein */}
      <path
        d="M32 78 Q 50 62 68 48"
        stroke={primaryColor}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );

  if (variant === "icon") {
    return <div className={`inline-flex items-center ${className}`}>{EmblemSVG}</div>;
  }

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {EmblemSVG}
        <span className={`font-extrabold ${textColor} ${titleClass} tracking-tight leading-tight`}>
          Smart Eco-Pharma Hub
        </span>
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className={`flex flex-col items-center text-center gap-3 ${className}`}>
        {EmblemSVG}
        <div>
          <h1 className={`font-extrabold ${textColor} ${titleClass} tracking-tight leading-tight`}>
            Smart Eco-Pharma <br className="sm:hidden" />Hub
          </h1>
          <p
            className={`font-bold ${subtextColor} ${subtitleClass} uppercase tracking-widest mt-1`}
          >
            Advanced Pharmacy Operations
          </p>
          <span
            className={`block font-bold ${subtextColor} ${subtitleClass} uppercase tracking-widest mt-0.5`}
          >
            www.smart-eco-pharma.com
          </span>
        </div>
      </div>
    );
  }

  // Default: "horizontal"
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {EmblemSVG}
      <div className="flex flex-col">
        <span className={`font-extrabold ${textColor} ${titleClass} tracking-tight leading-tight`}>
          Smart Eco-Pharma Hub
        </span>
        <span
          className={`font-bold ${subtextColor} ${subtitleClass} uppercase tracking-widest leading-none mt-0.5`}
        >
          Advanced Pharmacy Operations
        </span>
        <span
          className={`font-bold ${subtextColor} ${subtitleClass} uppercase tracking-widest leading-none mt-0.5`}
        >
          www.smart-eco-pharma.com
        </span>
      </div>
    </div>
  );
};
