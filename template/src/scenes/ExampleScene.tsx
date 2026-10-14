import { Audio } from "@remotion/media";
import type React from "react";
import {
  Easing,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { brand, clamp, fontFamily, green, slate } from "../theme";
import { fadeIn, money, rise, springIn } from "../ui/anim";
import { Backdrop } from "../ui/Backdrop";
import { Browser } from "../ui/Browser";
import { Cursor } from "../ui/Cursor";
import { TopHeadline } from "../ui/TopHeadline";
import { Wordmark } from "../ui/Wordmark";

// Reference scene: the shape every product-screen scene follows. Copy it,
// rename it, and replace the window contents with a recreation of the real
// screen. What it shows:
//   - Backdrop + a TopHeadline per beat (headlines hand over to each other)
//   - the product screen inside <Browser>, entering with a spring
//   - rows appearing on their own beat, a value counting up, a result badge
//   - a <Cursor> clicking a button (coordinates are window coordinates; read
//     them off a rendered still, never guess)
//   - sound effects as <Audio> at the beat they belong to
//   - a vertical layout from the same code (height > width)

type ExampleProps = {
  readonly beat1: string;
  readonly beat2: string;
};

const Row: React.FC<{ readonly at: number; readonly label: string; readonly value: string }> = ({ at, label, value }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "16px 28px",
        borderTop: `1.5px solid ${slate[200]}`,
        fontSize: 22,
        color: slate[900],
        opacity: fadeIn(frame, fps, at, 0.25),
        translate: rise(frame, fps, at, 16, 0.4),
      }}
    >
      <span>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
};

const ExampleInner: React.FC<ExampleProps> = ({ beat1, beat2 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;

  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, overflow: "hidden" }}>
      <Backdrop glow="50% 70%" />

      {/* Sound effects, timed to the animation beats */}
      <Audio name="SFX whoosh 0s" src={staticFile("audio/whoosh.wav")} from={0} volume={0.16} premountFor={fps} />
      <Audio name="SFX tick 1.0s" src={staticFile("audio/tick.wav")} from={1.0 * fps} volume={0.3} premountFor={fps} />
      <Audio name="SFX click 3.0s" src={staticFile("audio/click.wav")} from={3.0 * fps} volume={0.5} premountFor={fps} />
      <Audio name="SFX success 3.3s" src={staticFile("audio/success.wav")} from={3.3 * fps} volume={0.5} premountFor={fps} />

      <TopHeadline from={0.2} to={2.9}>
        {beat1}
      </TopHeadline>
      <TopHeadline from={3.2}>{beat2}</TopHeadline>

      <Interactive.Div
        name="App window"
        style={{
          position: "absolute",
          left: vertical ? 40 : 260,
          top: vertical ? 590 : 230,
          width: vertical ? 1000 : 1400,
          height: vertical ? 1120 : 920,
          translate: interpolate(frame, [0, 0.8 * fps], ["0px 500px", "0px 0px"], {
            ...clamp,
            easing: Easing.spring({ damping: 18 }),
          }),
        }}
      >
        <Browser url="app.example.com/dashboard" logo={<Wordmark name="Product" height={34} />} nav={["Home", "Reports"]} active="Home">
          <div style={{ padding: "28px 40px" }}>
            <div style={{ borderRadius: 20, border: `1.5px solid ${slate[300]}`, background: "#fff", overflow: "hidden" }}>
              <Row at={1.0} label="First thing" value="120" />
              <Row at={1.2} label="Second thing" value="80" />
              <Row at={1.4} label="Third thing" value="24" />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22 }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: slate[900], fontVariantNumeric: "tabular-nums" }}>
                {money(interpolate(frame, [1.8 * fps, 2.6 * fps], [0, 1234.5], clamp))}
              </span>
              <span
                style={{
                  padding: "16px 30px",
                  borderRadius: 14,
                  background: brand.primary,
                  color: "#fff",
                  fontSize: 21,
                  fontWeight: 700,
                  scale: interpolate(frame, [3.0 * fps, 3.08 * fps, 3.2 * fps], [1, 0.95, 1], clamp),
                }}
              >
                Do the thing
              </span>
            </div>
            <div
              style={{
                marginTop: 22,
                display: "inline-flex",
                padding: "12px 20px",
                borderRadius: 14,
                background: green[100],
                color: green[600],
                fontSize: 22,
                fontWeight: 800,
                opacity: fadeIn(frame, fps, 3.3, 0.2),
                scale: springIn(frame, fps, 3.3, 0.85),
              }}
            >
              Done
            </div>
          </div>
        </Browser>

        <Cursor
          from={2.2}
          to={3.6}
          clicks={[3.0]}
          path={vertical ? [[2.2, 500, 700], [2.9, 824, 398]] : [[2.2, 900, 700], [2.9, 1268, 400]]}
        />
      </Interactive.Div>
    </div>
  );
};

const exampleSchema = {
  beat1: { type: "string", default: "Say the first thing it does.", description: "Headline 1" },
  beat2: { type: "string", default: "Then the payoff.", description: "Headline 2" },
} as const satisfies InteractivitySchema;

export const ExampleScene = Interactive.withSchema({
  Component: ExampleInner,
  componentName: "ExampleScene",
  schema: exampleSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
