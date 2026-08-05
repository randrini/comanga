"use client";

interface CoverPlaceholderProps {
  title: string;
  volumeNumber?: number;
  mediaType?: string;
  seed?: string;
  className?: string;
}

function hashToColor(seed: string): string {
  const colors = [
    "#c62828", "#1565c0", "#2e7d32", "#e65100", "#6a1b9a",
    "#00838f", "#4e342e", "#37474f", "#bf360c", "#1a237e",
    "#004d40", "#827717", "#3e2723", "#0d47a1", "#b71c1c",
    "#1b5e20", "#880e4f", "#01579b", "#33691e", "#4a148c",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function hashToPattern(seed: string): "stripes" | "dots" | "diagonal" | "crosshatch" | "waves" {
  const patterns: ("stripes" | "dots" | "diagonal" | "crosshatch" | "waves")[] = [
    "stripes", "dots", "diagonal", "crosshatch", "waves",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 3) - hash);
  }
  return patterns[Math.abs(hash) % patterns.length];
}

function PatternSVG({ pattern, color }: { pattern: string; color: string }) {
  const opacity = 0.08;
  switch (pattern) {
    case "stripes":
      return (
        <pattern id="stripes" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="20" stroke={color} strokeWidth="2" opacity={opacity} />
        </pattern>
      );
    case "dots":
      return (
        <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="2" fill={color} opacity={opacity} />
        </pattern>
      );
    case "diagonal":
      return (
        <pattern id="diagonal" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
          <rect width="12" height="6" fill={color} opacity={opacity} />
        </pattern>
      );
    case "crosshatch":
      return (
        <pattern id="crosshatch" width="16" height="16" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="16" y2="16" stroke={color} strokeWidth="1.5" opacity={opacity} />
          <line x1="16" y1="0" x2="0" y2="16" stroke={color} strokeWidth="1.5" opacity={opacity} />
        </pattern>
      );
    case "waves":
      return (
        <pattern id="waves" width="24" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 6 Q6 0 12 6 Q18 12 24 6" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity} />
        </pattern>
      );
    default:
      return null;
  }
}

export function CoverPlaceholder({
  title,
  volumeNumber,
  mediaType,
  seed,
  className,
}: CoverPlaceholderProps) {
  const id = seed || title;
  const bgColor = hashToColor(id);
  const pattern = hashToPattern(id);
  const patternId = `pattern-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
  const gradientId = `gradient-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
  const initials = title
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const mediaTypeLabel =
    mediaType === "manga"
      ? "MANGA"
      : mediaType === "manhwa"
        ? "MANHWA"
        : mediaType === "comic"
          ? "COMIC"
          : mediaType === "light_novel"
            ? "L.NOVEL"
            : mediaType === "novel"
              ? "NOVEL"
              : "";

  return (
    <div className={`relative w-full h-full overflow-hidden ${className || ""}`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 400"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ backgroundColor: bgColor }}
      >
        <defs>
          <PatternSVG pattern={pattern} color="#ffffff" />
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="60%" stopColor="rgba(0,0,0,0.3)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
          </linearGradient>
        </defs>

        {/* Background pattern */}
        <rect width="300" height="400" fill={`url(#${patternId})`} />

        {/* Spine shadow left */}
        <rect x="0" y="0" width="12" height="400" fill="rgba(0,0,0,0.15)" />

        {/* Top decorative band */}
        <rect x="0" y="0" width="300" height="6" fill="rgba(255,255,255,0.1)" />
        <rect x="0" y="6" width="300" height="2" fill="rgba(0,0,0,0.1)" />

        {/* Bottom decorative band */}
        <rect x="0" y="392" width="300" height="6" fill="rgba(255,255,255,0.1)" />
        <rect x="0" y="390" width="300" height="2" fill="rgba(0,0,0,0.1)" />

        {/* Center decorative line */}
        <line x1="40" y1="160" x2="260" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1="40" y1="162" x2="260" y2="162" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />

        {/* Initials / icon area */}
        <text
          x="150"
          y="120"
          textAnchor="middle"
          fill="rgba(255,255,255,0.15)"
          fontFamily="serif"
          fontSize="64"
          fontWeight="bold"
        >
          {initials}
        </text>

        {/* Title */}
        <text
          x="150"
          y="200"
          textAnchor="middle"
          fill="white"
          fontFamily="sans-serif"
          fontSize="18"
          fontWeight="bold"
        >
          {title.length > 20 ? title.slice(0, 18) + "…" : title}
        </text>

        {/* Volume number */}
        {volumeNumber !== undefined && (
          <text
            x="150"
            y="230"
            textAnchor="middle"
            fill="rgba(255,255,255,0.6)"
            fontFamily="sans-serif"
            fontSize="13"
          >
            Vol. {volumeNumber}
          </text>
        )}

        {/* Media type badge */}
        {mediaTypeLabel && (
          <rect x="110" y="250" width="80" height="20" rx="3" fill="rgba(0,0,0,0.3)" />
        )}
        {mediaTypeLabel && (
          <text
            x="150"
            y="263"
            textAnchor="middle"
            fill="rgba(255,255,255,0.7)"
            fontFamily="sans-serif"
            fontSize="10"
            fontWeight="bold"
          >
            {mediaTypeLabel}
          </text>
        )}

        {/* Bottom gradient overlay */}
        <rect width="300" height="400" fill={`url(#${gradientId})`} />
      </svg>
    </div>
  );
}

export function generateCoverSVG(title: string, seed?: string): string {
  const id = seed || title;
  const bgColor = hashToColor(id);
  const pattern = hashToPattern(id);
  const initials = title
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  let patternSvg = "";
  switch (pattern) {
    case "stripes":
      patternSvg = `<pattern id="p" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="20" stroke="white" stroke-width="2" opacity="0.08"/></pattern>`;
      break;
    case "dots":
      patternSvg = `<pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="2" fill="white" opacity="0.08"/></pattern>`;
      break;
    case "diagonal":
      patternSvg = `<pattern id="p" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(135)"><rect width="12" height="6" fill="white" opacity="0.08"/></pattern>`;
      break;
    case "crosshatch":
      patternSvg = `<pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="16" y2="16" stroke="white" stroke-width="1.5" opacity="0.08"/><line x1="16" y1="0" x2="0" y2="16" stroke="white" stroke-width="1.5" opacity="0.08"/></pattern>`;
      break;
    case "waves":
      patternSvg = `<pattern id="p" width="24" height="12" patternUnits="userSpaceOnUse"><path d="M0 6 Q6 0 12 6 Q18 12 24 6" fill="none" stroke="white" stroke-width="1.5" opacity="0.08"/></pattern>`;
      break;
  }

  return `<svg width="300" height="400" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" style="background-color:${bgColor}">
    <defs>${patternSvg}<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(0,0,0,0)"/><stop offset="60%" stop-color="rgba(0,0,0,0.3)"/><stop offset="100%" stop-color="rgba(0,0,0,0.7)"/></linearGradient></defs>
    <rect width="300" height="400" fill="url(#p)"/>
    <rect x="0" y="0" width="12" height="400" fill="rgba(0,0,0,0.15)"/>
    <rect x="0" y="0" width="300" height="6" fill="rgba(255,255,255,0.1)"/>
    <rect x="0" y="6" width="300" height="2" fill="rgba(0,0,0,0.1)"/>
    <rect x="0" y="392" width="300" height="6" fill="rgba(255,255,255,0.1)"/>
    <rect x="0" y="390" width="300" height="2" fill="rgba(0,0,0,0.1)"/>
    <line x1="40" y1="160" x2="260" y2="160" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <line x1="40" y1="162" x2="260" y2="162" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>
    <text x="150" y="120" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-family="serif" font-size="64" font-weight="bold">${initials}</text>
    <text x="150" y="200" text-anchor="middle" fill="white" font-family="sans-serif" font-size="18" font-weight="bold">${title.length > 20 ? title.slice(0, 18) + "…" : title}</text>
    <rect width="300" height="400" fill="url(#g)"/>
  </svg>`;
}
