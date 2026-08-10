import React from "react";
import { Composition, staticFile } from "remotion";
import { DemoVideo, type DemoProps } from "./DemoVideo";

const PLACEHOLDER: DemoProps = { scene: null, capture: null };

/**
 * The composition loads its own run data from the public dir (which IS the run
 * dir — see cli.ts `--public-dir`). Duration therefore comes from capture.json,
 * not from props.
 *
 * This matters: threading run data through `--props` meant any invocation that
 * didn't forward the flag (notably the Remotion Studio UI's Render button) fell
 * back to a placeholder duration and crashed with
 * "durationInFrames was evaluated to be 132, but frame range 0-1264 ...".
 * There is no props channel left to lose now — CLI render, `preview`, and the
 * Studio UI all agree.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Demo"
      component={DemoVideo}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={300}
      defaultProps={PLACEHOLDER}
      calculateMetadata={async () => {
        try {
          const [scene, capture] = await Promise.all([
            fetch(staticFile("scene.json")).then((r) => r.json()),
            fetch(staticFile("capture.json")).then((r) => r.json()),
          ]);
          const fps: number = capture.fps;
          const tail = Math.round(((scene.compose.tailHoldMs ?? 1400) / 1000) * fps);
          return {
            props: { scene, capture } as DemoProps,
            durationInFrames: Math.max(1, capture.frameCount + tail),
            fps,
            width: capture.viewport.width,
            height: capture.viewport.height,
          };
        } catch {
          // No run loaded (e.g. bare `remotion studio` with no --public-dir).
          // DemoVideo renders its "No run loaded" placeholder — safe, since
          // there are no frames to render anyway.
          return { props: PLACEHOLDER, durationInFrames: 60 };
        }
      }}
    />
  );
};
