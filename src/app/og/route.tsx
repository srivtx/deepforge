import { ImageResponse } from "next/og";

const WIDTH = 1200;
const HEIGHT = 630;

const CANVAS = "#0a0a0a";
const INK = "#ffffff";
const BODY_MID = "#8b8b8b";
const HAIRLINE = "#1f1f1f";
const ACCENT = "#7FFF9F";

const KIND_LABELS: Record<string, string> = {
  problem: "Problem",
  category: "Category",
  home: "Home",
  research: "Research",
  lab: "Lab",
  paper: "Paper",
};

const DIFFICULTY_STYLES: Record<
  string,
  { text: string; border: string; background: string }
> = {
  Easy: {
    text: "#7FFF9F",
    border: "rgba(127, 255, 159, 0.4)",
    background: "rgba(127, 255, 159, 0.12)",
  },
  Medium: {
    text: "#FFB347",
    border: "rgba(255, 179, 71, 0.4)",
    background: "rgba(255, 179, 71, 0.12)",
  },
  Hard: {
    text: "#FF6B6B",
    border: "rgba(255, 107, 107, 0.4)",
    background: "rgba(255, 107, 107, 0.12)",
  },
};

function truncate(value: string | null, max: number): string {
  if (!value) return "";
  const text = value.trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function normalizeDifficulty(value: string): string {
  if (!value) return "";
  const normalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  return DIFFICULTY_STYLES[normalized] ? normalized : "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = truncate(searchParams.get("title"), 70);

  if (!title) {
    return new Response("Missing required `title` query parameter", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const subtitle = truncate(searchParams.get("subtitle"), 90);
  const kindParam = searchParams.get("kind") ?? "";
  const kind = KIND_LABELS[kindParam];
  const difficulty = normalizeDifficulty(searchParams.get("difficulty") ?? "");
  const difficultyStyle = difficulty ? DIFFICULTY_STYLES[difficulty] : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          backgroundColor: CANVAS,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage:
              "radial-gradient(circle at 12% 0%, rgba(127, 255, 159, 0.16), transparent 55%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            display: "flex",
            backgroundImage: `linear-gradient(to right, ${ACCENT}, rgba(127, 255, 159, 0))`,
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            padding: "64px 72px 48px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            {(kind || difficultyStyle) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                {kind && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        backgroundColor: ACCENT,
                        display: "flex",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        color: ACCENT,
                        fontSize: 20,
                        fontWeight: 600,
                        letterSpacing: 3,
                        textTransform: "uppercase",
                      }}
                    >
                      {kind}
                    </div>
                  </div>
                )}
                {difficultyStyle && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      borderRadius: 999,
                      border: `1px solid ${difficultyStyle.border}`,
                      backgroundColor: difficultyStyle.background,
                      color: difficultyStyle.text,
                      fontSize: 20,
                      fontWeight: 600,
                      padding: "6px 18px",
                    }}
                  >
                    {difficulty}
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                display: "flex",
                color: INK,
                fontSize: title.length > 40 ? 64 : 76,
                fontWeight: 600,
                lineHeight: 1.12,
                letterSpacing: -1.5,
                maxWidth: 1000,
              }}
            >
              {title}
            </div>

            {subtitle && (
              <div
                style={{
                  display: "flex",
                  color: BODY_MID,
                  fontSize: 32,
                  lineHeight: 1.35,
                  maxWidth: 920,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `1px solid ${HAIRLINE}`,
              paddingTop: 26,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: ACCENT,
                  color: CANVAS,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                D
              </div>
              <div
                style={{
                  display: "flex",
                  color: INK,
                  fontSize: 26,
                  fontWeight: 600,
                }}
              >
                DeepForge
              </div>
            </div>
            <div
              style={{
                display: "flex",
                color: BODY_MID,
                fontSize: 22,
              }}
            >
              deepforge.app
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}
