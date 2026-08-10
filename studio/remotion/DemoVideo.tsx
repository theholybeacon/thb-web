import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Scene, CaptureManifest } from "../schema";

export interface DemoProps {
  scene: Scene | null;
  capture: CaptureManifest | null;
  // Remotion's Composition requires props to extend Record<string, unknown>.
  [key: string]: unknown;
}

const BRAND = "#7c3aed";
const FONT =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

function framePath(n: number): string {
  return staticFile(`frames/frame-${String(n).padStart(5, "0")}.jpg`);
}

/** The captured screen (frozen on the last frame during the tail hold). */
const Screen: React.FC<{ frameCount: number }> = ({ frameCount }) => {
  const frame = useCurrentFrame();
  const src = Math.min(frame, Math.max(0, frameCount - 1));
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b0f" }}>
      <Img
        src={framePath(src)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

const HookCaption: React.FC<{ text: string; fps: number }> = ({ text, fps }) => {
  const frame = useCurrentFrame();
  const inEnd = 0.4 * fps;
  const outStart = 1.5 * fps;
  const outEnd = 2.0 * fps;
  const opacity = interpolate(
    frame,
    [0, inEnd, outStart, outEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 90px",
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 92,
          lineHeight: 1.08,
          color: "#fff",
          textAlign: "center",
          textShadow: "0 4px 40px rgba(0,0,0,0.85)",
          whiteSpace: "pre-line",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const Captions: React.FC<{ scene: Scene; capture: CaptureManifest }> = ({ scene, capture }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {scene.compose.captions.map((c, i) => {
        const anchorMs = capture.markers[c.atMarker];
        if (anchorMs == null) return null;
        const startF = Math.round(((anchorMs + c.offsetMs) / 1000) * fps);
        const endF = startF + Math.round((c.durationMs / 1000) * fps);
        if (frame < startF || frame > endF) return null;
        const opacity = interpolate(
          frame,
          [startF, startF + 5, endF - 6, endF],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const bottom = c.position === "bottom" ? 260 : c.position === "center" ? 900 : 1560;
        return (
          <AbsoluteFill key={i} style={{ justifyContent: "flex-end", alignItems: "center", opacity }}>
            <div
              style={{
                position: "absolute",
                bottom,
                maxWidth: 900,
                padding: "18px 34px",
                borderRadius: 18,
                background: "rgba(11,11,15,0.82)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 46,
                color: "#fff",
                textAlign: "center",
              }}
            >
              {c.text}
            </div>
          </AbsoluteFill>
        );
      })}
    </>
  );
};

const VerseRef: React.FC<{ text: string }> = ({ text }) => (
  <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
    <div
      style={{
        position: "absolute",
        top: 70,
        padding: "10px 26px",
        borderRadius: 999,
        background: "rgba(124,58,237,0.16)",
        border: "1px solid rgba(124,58,237,0.5)",
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: 34,
        letterSpacing: "0.04em",
        color: "#e9d5ff",
      }}
    >
      {text}
    </div>
  </AbsoluteFill>
);

const EndCard: React.FC<{
  headline: string;
  sub: string;
  cta: string;
  startFrame: number;
}> = ({ headline, sub, cta, startFrame }) => {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;
  const opacity = interpolate(frame, [startFrame, startFrame + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundColor: "rgba(11,11,15,0.94)",
        backgroundImage: "radial-gradient(circle at 50% 38%, rgba(124,58,237,0.35), transparent 60%)",
        justifyContent: "center",
        alignItems: "center",
        gap: 26,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 999,
          background: BRAND,
          boxShadow: "0 0 40px 10px rgba(124,58,237,0.7)",
          marginBottom: 10,
        }}
      />
      <div style={{ fontWeight: 800, fontSize: 84, color: "#fff" }}>{headline}</div>
      <div style={{ fontWeight: 600, fontSize: 44, color: BRAND }}>{sub}</div>
      <div style={{ fontWeight: 500, fontSize: 36, color: "#a1a1aa", marginTop: 12 }}>{cta}</div>
    </AbsoluteFill>
  );
};

export const DemoVideo: React.FC<DemoProps> = ({ scene, capture }) => {
  const { durationInFrames, fps } = useVideoConfig();

  if (!scene || !capture) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#0b0b0f",
          color: "#71717a",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: FONT,
          fontSize: 40,
          textAlign: "center",
          padding: 80,
        }}
      >
        No run loaded. Render with{"\n"}--props=&lt;runDir&gt;/props.json
      </AbsoluteFill>
    );
  }

  const endStart = durationInFrames - Math.round(2.2 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b0f" }}>
      <Screen frameCount={capture.frameCount} />
      {scene.compose.verseRef ? <VerseRef text={scene.compose.verseRef} /> : null}
      <Captions scene={scene} capture={capture} />
      <HookCaption text={scene.compose.hook} fps={fps} />
      <EndCard
        headline={scene.compose.endCard.headline}
        sub={scene.compose.endCard.sub}
        cta={scene.compose.endCard.cta}
        startFrame={endStart}
      />
    </AbsoluteFill>
  );
};
