"use client";

import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

const DISHES = ["Masala Dosa", "Onion Uttapam", "Poori Channa", "Filter Coffee"];

function Word({ text }: { text: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const y = interpolate(enter, [0, 1], [40, 0]);
  const opacity = interpolate(frame, [0, 10, 50, 60], [0, 1, 1, 0]);
  return (
    <h1
      style={{
        fontFamily: "Playfair Display, serif",
        fontSize: 88,
        fontWeight: 800,
        color: "#FBF6EC",
        transform: `translateY(${y}px)`,
        opacity,
        textAlign: "center",
        margin: 0,
        letterSpacing: -1,
      }}
    >
      {text}
    </h1>
  );
}

export default function SignatureReel() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Aurora drift
  const drift = interpolate(frame, [0, durationInFrames], [0, 360]);
  const logoSpring = spring({ frame: frame - 6, fps, config: { damping: 12 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.6, 1]);
  const outro = interpolate(
    frame,
    [durationInFrames - 50, durationInFrames - 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: "#0E0908", overflow: "hidden" }}>
      {/* aurora / gradient-mesh */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(50% 50% at 30% 30%, rgba(232,163,61,0.45), transparent 60%), radial-gradient(50% 50% at 75% 65%, rgba(192,57,43,0.4), transparent 60%), radial-gradient(45% 45% at 60% 20%, rgba(58,125,68,0.3), transparent 60%)",
          transform: `rotate(${drift * 0.05}deg) scale(1.3)`,
          filter: "blur(10px)",
        }}
      />

      {/* Intro logo */}
      <Sequence durationInFrames={70}>
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <div
            style={{
              transform: `scale(${logoScale})`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "Karla, sans-serif",
                letterSpacing: 14,
                fontSize: 18,
                color: "#F6C667",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Pulianthope · Chennai
            </div>
            <div
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: 120,
                fontWeight: 900,
                background:
                  "linear-gradient(120deg,#F6C667,#E8A33D 45%,#C0392B)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                lineHeight: 1,
              }}
            >
              Sri Ambika
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Dish word cycle */}
      {DISHES.map((d, i) => (
        <Sequence key={d} from={75 + i * 55} durationInFrames={60}>
          <AbsoluteFill
            style={{ justifyContent: "center", alignItems: "center" }}
          >
            <Word text={d} />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* Outro tagline */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: outro,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: 64,
              fontWeight: 800,
              color: "#FBF6EC",
            }}
          >
            Tiffin, perfected.
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: "Karla, sans-serif",
              letterSpacing: 6,
              color: "#F6C667",
              textTransform: "uppercase",
              fontSize: 16,
            }}
          >
            Open daily · Closes 10 PM
          </div>
        </div>
      </AbsoluteFill>

      {/* film grain */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
          opacity: 0.06,
          mixBlendMode: "overlay",
        }}
      />
    </AbsoluteFill>
  );
}
