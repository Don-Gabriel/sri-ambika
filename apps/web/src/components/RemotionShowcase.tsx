"use client";

import { Player } from "@remotion/player";
import SignatureReel from "@/remotion/SignatureReel";

/** Embeds the Remotion composition with the in-browser Player. */
export default function RemotionShowcase() {
  return (
    <div className="relative overflow-hidden rounded-3xl glass p-2 shadow-glow">
      <div className="overflow-hidden rounded-[20px]">
        <Player
          component={SignatureReel}
          durationInFrames={320}
          fps={30}
          compositionWidth={1280}
          compositionHeight={720}
          style={{ width: "100%", aspectRatio: "16 / 9" }}
          controls
          autoPlay
          loop
        />
      </div>
      <span className="pointer-events-none absolute right-5 top-5 rounded-full glass-light px-3 py-1 font-body text-[10px] uppercase tracking-[0.2em] text-amber-glow">
        Rendered with Remotion
      </span>
    </div>
  );
}
