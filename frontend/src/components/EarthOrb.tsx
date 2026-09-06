import React from "react";

interface EarthOrbProps {
  dark?: boolean;
  size?: number;
  className?: string;
}

const CONTINENTS = [
  "M30 55 C40 35 65 30 75 45 C82 56 70 70 58 76 C42 84 28 76 26 66 C24 60 22 62 30 55 Z",
  "M115 45 C130 40 152 46 156 60 C159 74 140 84 126 80 C112 75 108 58 115 45 Z",
  "M95 97 C102 86 114 88 112 102 C110 116 98 126 88 118 C80 110 88 102 95 97 Z",
  "M60 130 C70 122 80 128 76 140 C70 152 56 146 58 136 C58 132 56 134 60 130 Z",
  "M141 134 C153 129 163 137 159 149 C153 161 139 157 137 145 Z",
  "M164 24 C171 19 179 25 175 33 C170 40 161 35 164 24 Z",
];

export const EarthOrb: React.FC<EarthOrbProps> = ({ dark = false, size = 168, className = "" }) => {
  const ocean = dark
    ? "radial-gradient(circle at 32% 28%, #10b981 0%, #059669 42%, #04563e 72%, #03301f 100%)"
    : "radial-gradient(circle at 32% 28%, #6ee7b7 0%, #34d399 42%, #0f9f73 72%, #0b7a58 100%)";
  const land = dark ? "#0b3d2c" : "#1f7a57";
  const landStroke = dark ? "rgba(52, 211, 153, 0.45)" : "rgba(255, 255, 255, 0.5)";
  const highlight = dark ? "rgba(255, 255, 255, 0.16)" : "rgba(255, 255, 255, 0.45)";
  const terminator = dark ? "rgba(2, 20, 12, 0.5)" : "rgba(2, 44, 34, 0.18)";
  const orbitColor = dark ? "rgba(16, 185, 129, 0.4)" : "rgba(5, 150, 105, 0.45)";
  const satellite = dark ? "#34d399" : "#059669";
  const satelliteGlow = dark ? "rgba(52, 211, 153, 0.8)" : "rgba(5, 150, 105, 0.8)";
  const bloom = dark
    ? "radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(45, 212, 191, 0.18) 45%, transparent 70%)"
    : "radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(45, 212, 191, 0.2) 45%, transparent 70%)";

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <div
        className="seph-aurora absolute -inset-10 rounded-full blur-2xl pointer-events-none"
        style={{ backgroundImage: bloom }}
      />

      <div
        className="seph-spin-rev absolute -inset-4 rounded-full"
        style={{ border: `1.5px dashed ${orbitColor}` }}
      >
        <span
          className="absolute -top-1 left-1/2 block h-2.5 w-2.5 rounded-full"
          style={{ background: satellite, boxShadow: `0 0 12px 2px ${satelliteGlow}` }}
        />
      </div>

      <div
        className="absolute -inset-1 rounded-full pointer-events-none"
        style={{
          boxShadow: `0 0 0 1px ${dark ? "rgba(110,231,183,0.35)" : "rgba(5,150,105,0.35)"}, 0 0 28px 2px ${
            dark ? "rgba(16,185,129,0.35)" : "rgba(5,150,105,0.28)"
          }`,
        }}
      />

      <div className="absolute inset-0 overflow-hidden rounded-full" style={{ backgroundImage: ocean }}>
        <svg viewBox="0 0 200 200" className="seph-spin-slow absolute inset-0 h-full w-full">
          <g fill={land} stroke={landStroke} strokeWidth="0.75">
            {CONTINENTS.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
          <ellipse
            cx="100"
            cy="100"
            rx="98"
            ry="42"
            fill="none"
            stroke={landStroke}
            strokeWidth="0.5"
            opacity="0.5"
          />
          <line x1="100" y1="0" x2="100" y2="200" stroke={landStroke} strokeWidth="0.5" opacity="0.35" />
        </svg>

        <div
          className="absolute inset-0 rounded-full"
          style={{ backgroundImage: `radial-gradient(circle at 30% 22%, ${highlight} 0%, transparent 42%)` }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{ backgroundImage: `radial-gradient(circle at 68% 78%, ${terminator} 0%, transparent 60%)` }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "inset -10px -14px 32px rgba(0,0,0,0.45), inset 8px 10px 24px rgba(255,255,255,0.18)" }}
        />
      </div>
    </div>
  );
};