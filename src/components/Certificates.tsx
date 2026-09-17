"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import {
  CERTIFICATES_CHANGE_EVENT,
  buildCertificateText,
  certificateCredentialCode,
  formatCertificateDate,
  formatMeasure,
  getIssued,
  getTrackProgress,
  issueCertificate,
  listCertificateCandidates,
  revokeCertificate,
  verificationCode,
  type CertTrackProgress,
  type Certificate,
  type CertificateCandidate,
  type CertificateEntry,
  type CertificateKind,
} from "@/lib/certificates";
import { CERT_TRACKS, type CertTrack } from "@/data/certTracks";
import { LEARNING_PATHS } from "@/data/problems/paths";
import {
  fingerprintFromCode,
  formatFingerprint,
  verifyUrl,
} from "@/lib/credentials";
import { INTERVIEW_CHANGE_EVENT } from "@/lib/interview";
import { LAB_CHANGE_EVENT } from "@/lib/labs";
import { RESEARCH_CHANGE_EVENT } from "@/lib/research";

/* ──────────────────────────────── chrome ────────────────────────────────── */

const PRIMARY_BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

const SECONDARY_BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

const DANGER_BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-error/30 px-3 py-1.5 text-xs text-error transition-colors hover:bg-error/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-error/40 sm:min-h-0";

const DANGER_CONFIRM_BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-error/60 bg-error/10 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error/20 focus:outline-none focus-visible:ring-1 focus-visible:ring-error/40 sm:min-h-0";

const KIND_LABELS: Record<CertificateKind, string> = {
  path: "Path",
  collection: "Collection",
  category: "Category",
  lab: "Lab",
  project: "Project",
  interview: "Interview",
  research: "Research",
  track: "Track",
};

const LEVEL_LABELS: Record<CertTrack["level"], string> = {
  foundation: "Foundation",
  practitioner: "Practitioner",
  specialist: "Specialist",
};

/** Catalog groups, small ones open by default so the page never reads empty. */
const CATALOG_GROUPS: {
  kind: CertificateKind;
  title: string;
  blurb: string;
  open: boolean;
}[] = [
  {
    kind: "path",
    title: "Learning paths",
    blurb: "Solve every problem in the path.",
    open: false,
  },
  {
    kind: "collection",
    title: "Curated collections",
    blurb: "One focused set, start to finish.",
    open: false,
  },
  {
    kind: "category",
    title: "Category milestones",
    blurb: "Reach 80% of a category's problems.",
    open: false,
  },
  {
    kind: "lab",
    title: "Scored labs",
    blurb: "Hit the held-out target.",
    open: true,
  },
  {
    kind: "project",
    title: "Project builds",
    blurb: "Complete every build step.",
    open: true,
  },
  {
    kind: "interview",
    title: "Interview mocks",
    blurb: "Score 80% on a timed mock.",
    open: false,
  },
  {
    kind: "research",
    title: "Research challenges",
    blurb: "Beat every baseline.",
    open: true,
  },
];

/** Where an entry's work lives, so every catalog row can link out. */
function candidateHref(entry: CertificateEntry): string {
  switch (entry.kind) {
    case "path": {
      const path = LEARNING_PATHS.find((item) => item.id === entry.refId);
      return path ? `/paths/${path.slug}` : "/paths";
    }
    case "collection":
      return `/collections/${entry.refId}`;
    case "category":
      return `/categories/${entry.refId}`;
    case "lab":
      return `/labs/${entry.refId}`;
    case "project":
      return `/projects/${entry.refId}`;
    case "interview":
      return `/interview/${entry.refId}`;
    case "research":
      return "/research";
    case "track":
      return "/certificates";
  }
}

/** Compact mono readout for a candidate: counts or a measure pair. */
function candidateValue(entry: CertificateEntry): string {
  if (entry.score !== undefined && entry.target !== undefined) {
    const metric = entry.metric ?? "accuracy";
    return `${formatMeasure(metric, entry.score)} / ${formatMeasure(metric, entry.target)}`;
  }
  if (entry.solved !== undefined && entry.total !== undefined) {
    if (entry.kind === "project") return `${entry.solved}/${entry.total} steps`;
    if (entry.kind === "interview") return `${entry.solved}/${entry.total} mock`;
    if (entry.kind === "research") {
      return `${entry.solved}/${entry.total} baselines`;
    }
    if (entry.kind === "track") return `${entry.solved}/${entry.total} steps`;
    return `${entry.solved}/${entry.total}`;
  }
  return "";
}

const CHANGE_EVENTS = [
  "deepforge:progress-change",
  "deepforge:collections-change",
  "deepforge:username-change",
  LAB_CHANGE_EVENT,
  INTERVIEW_CHANGE_EVENT,
  RESEARCH_CHANGE_EVENT,
  CERTIFICATES_CHANGE_EVENT,
];

/* ────────────────────────────── certificate art ─────────────────────────── */

const PAPER = "#fbfaf7";
const INK = "#1c1c1c";
const MUTED = "#6b6355";
const ACCENT = "#2f7d4f";
const BORDER = "#b9b29c";
const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';

const PNG_WIDTH = 1200;
const PNG_HEIGHT = 750;

/* ────────────────────────────── data loading ────────────────────────────── */

interface CertificateState {
  eligible: CertificateEntry[];
  candidates: CertificateCandidate[];
  tracks: CertTrackProgress[];
  issued: Certificate[];
}

const EMPTY_STATE: CertificateState = {
  eligible: [],
  candidates: [],
  tracks: [],
  issued: [],
};

function safeLoad(): CertificateState {
  try {
    const candidates = listCertificateCandidates();
    return {
      eligible: candidates.filter((candidate) => candidate.eligible),
      candidates,
      tracks: CERT_TRACKS.map((track) => getTrackProgress(track)),
      issued: getIssued(),
    };
  } catch {
    return EMPTY_STATE;
  }
}

let cachedState: CertificateState | null = null;

function getSnapshot(): CertificateState {
  if (!cachedState) cachedState = safeLoad();
  return cachedState;
}

function getServerSnapshot(): CertificateState {
  return EMPTY_STATE;
}

function invalidate(): void {
  cachedState = null;
}

function subscribe(onStoreChange: () => void): () => void {
  const onChange = () => {
    cachedState = null;
    onStoreChange();
  };
  for (const event of CHANGE_EVENTS) window.addEventListener(event, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    for (const event of CHANGE_EVENTS) {
      window.removeEventListener(event, onChange);
    }
    window.removeEventListener("storage", onChange);
  };
}

/* ─────────────────────────────── actions ────────────────────────────────── */

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the textarea fallback */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function printCertificate(cert: Certificate, credentialCode?: string): boolean {
  try {
    const win = window.open("", "_blank", "width=1100,height=760");
    if (!win) return false;
    const title = escapeHtml(cert.title);
    const recipient = escapeHtml(cert.recipient);
    const detail = escapeHtml(cert.detail);
    const date = escapeHtml(formatCertificateDate(cert.issuedAt));
    const fingerprint = credentialCode
      ? fingerprintFromCode(credentialCode)
      : null;
    const code = escapeHtml(
      fingerprint
        ? formatFingerprint(fingerprint)
        : verificationCode(cert),
    );
    const verifyLink = credentialCode
      ? escapeHtml(`${window.location.origin}${verifyUrl(credentialCode)}`)
      : "";
    win.document.write(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${title} — DeepForge certificate</title>
<style>
  html, body { margin: 0; padding: 0; background: #ffffff; }
  @page { size: A4 landscape; margin: 10mm; }
  body {
    padding: 10mm;
    font-family: Georgia, "Times New Roman", serif;
    color: ${INK};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cert {
    box-sizing: border-box;
    width: 100%;
    height: 180mm;
    border: 4px double ${BORDER};
    background: ${PAPER};
    padding: 10mm 16mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .wordmark {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: Inter, system-ui, sans-serif;
    font-size: 11px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }
  .mark { width: 8px; height: 8px; background: ${ACCENT}; transform: rotate(45deg); }
  .center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 0;
  }
  .eyebrow {
    margin: 0;
    font-family: Inter, system-ui, sans-serif;
    font-size: 10pt;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: ${MUTED};
  }
  h1 { margin: 4mm 0 2mm; font-size: 30pt; line-height: 1.15; font-weight: 600; }
  .awarded { margin: 0; font-size: 14pt; font-style: italic; color: #4a4438; }
  .detail {
    margin: 3mm 0 0;
    font-family: Inter, system-ui, sans-serif;
    font-size: 10pt;
    color: ${MUTED};
  }
  .rule { width: 70%; display: flex; align-items: center; gap: 3mm; margin: 5mm 0; }
  .rule span { flex: 1; height: 1px; background: ${ACCENT}59; }
  .rule i { width: 5px; height: 5px; background: ${ACCENT}99; transform: rotate(45deg); }
  .verify {
    margin: 0 0 3mm;
    max-width: 100%;
    font-family: "JetBrains Mono", ui-monospace, Menlo, monospace;
    font-size: 7.5pt;
    color: ${MUTED};
    word-break: break-all;
  }
  .footer {
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    font-family: Inter, system-ui, sans-serif;
    font-size: 9pt;
    color: ${MUTED};
  }
  .footer code { font-family: "JetBrains Mono", ui-monospace, Menlo, monospace; letter-spacing: 0.15em; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <div class="cert">
    <div class="wordmark"><span>DeepForge</span><span class="mark"></span></div>
    <div class="center">
      <p class="eyebrow">Certificate of Completion</p>
      <h1>${title}</h1>
      <p class="awarded">awarded to ${recipient}</p>
      <p class="detail">${detail}</p>
    </div>
    <div class="rule"><span></span><i></i><span></span></div>
    ${verifyLink ? `<p class="verify">Verify at ${verifyLink}</p>` : ""}
    <div class="footer"><span>Issued ${date}</span><code>${code}</code></div>
  </div>
  <script>window.addEventListener("load", function () { window.print(); });</script>
</body>
</html>`);
    win.document.close();
    win.focus();
    return true;
  } catch {
    return false;
  }
}

/* ─────────────────────────────── PNG export ─────────────────────────────── */

function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  spacing: number,
): void {
  const chars = [...text];
  const widths = chars.map((char) => ctx.measureText(char).width);
  const total =
    widths.reduce((sum, width) => sum + width, 0) +
    spacing * Math.max(0, chars.length - 1);
  let cursor = centerX - total / 2;
  const previousAlign = ctx.textAlign;
  ctx.textAlign = "left";
  chars.forEach((char, index) => {
    ctx.fillText(char, cursor, y);
    cursor += widths[index] + spacing;
  });
  ctx.textAlign = previousAlign;
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length > 0 ? lines : [""];
}

function wrapContinuous(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const lines: string[] = [];
  let line = "";
  for (const char of text) {
    const candidate = line + char;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = char;
      if (lines.length >= maxLines) return lines;
    } else {
      line = candidate;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function drawCertificate(
  ctx: CanvasRenderingContext2D,
  cert: Certificate,
  credentialCode?: string,
): void {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, PNG_WIDTH, PNG_HEIGHT);

  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 2;
  ctx.strokeRect(26.5, 26.5, PNG_WIDTH - 53, PNG_HEIGHT - 53);
  ctx.lineWidth = 1;
  ctx.strokeRect(36.5, 36.5, PNG_WIDTH - 73, PNG_HEIGHT - 73);

  ctx.fillStyle = INK;
  ctx.font = `600 20px ${SANS}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("DEEPFORGE", 64, 82);

  ctx.save();
  ctx.translate(PNG_WIDTH - 70, 76);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = ACCENT;
  ctx.fillRect(-5, -5, 10, 10);
  ctx.restore();

  ctx.font = `500 15px ${SANS}`;
  ctx.fillStyle = MUTED;
  drawSpacedText(ctx, "CERTIFICATE OF COMPLETION", PNG_WIDTH / 2, 226, 6);

  ctx.fillStyle = INK;
  ctx.font = `600 46px ${SERIF}`;
  const titleLines = wrapLines(ctx, cert.title, PNG_WIDTH - 340).slice(0, 2);
  const titleTop = 286;
  titleLines.forEach((line, index) => {
    ctx.textAlign = "center";
    ctx.fillText(line, PNG_WIDTH / 2, titleTop + index * 56);
  });
  const afterTitle = titleTop + (titleLines.length - 1) * 56;

  ctx.font = `italic 24px ${SERIF}`;
  ctx.fillStyle = "#4a4438";
  ctx.textAlign = "center";
  ctx.fillText(`awarded to ${cert.recipient}`, PNG_WIDTH / 2, afterTitle + 64);

  ctx.font = `400 17px ${SANS}`;
  ctx.fillStyle = MUTED;
  const detailLines = wrapLines(ctx, cert.detail, PNG_WIDTH - 380).slice(0, 2);
  detailLines.forEach((line, index) => {
    ctx.fillText(line, PNG_WIDTH / 2, afterTitle + 108 + index * 26);
  });

  if (credentialCode) {
    const link = `${window.location.origin}${verifyUrl(credentialCode)}`;
    ctx.font = `400 10px ${MONO}`;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "center";
    const linkLines = wrapContinuous(ctx, link, PNG_WIDTH - 240, 3);
    linkLines.forEach((line, index) => {
      ctx.fillText(
        line,
        PNG_WIDTH / 2,
        PNG_HEIGHT - 185 - (linkLines.length - 1 - index) * 15,
      );
    });
  }

  const ruleY = PNG_HEIGHT - 150;
  ctx.strokeStyle = `${ACCENT}59`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(360, ruleY);
  ctx.lineTo(PNG_WIDTH / 2 - 26, ruleY);
  ctx.moveTo(PNG_WIDTH / 2 + 26, ruleY);
  ctx.lineTo(PNG_WIDTH - 360, ruleY);
  ctx.stroke();
  ctx.save();
  ctx.translate(PNG_WIDTH / 2, ruleY);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = `${ACCENT}99`;
  ctx.fillRect(-4, -4, 8, 8);
  ctx.restore();

  ctx.font = `400 14px ${SANS}`;
  ctx.fillStyle = MUTED;
  ctx.textAlign = "left";
  ctx.fillText(
    `Issued ${formatCertificateDate(cert.issuedAt)}`,
    64,
    PNG_HEIGHT - 78,
  );
  ctx.font = `500 15px ${MONO}`;
  ctx.textAlign = "right";
  const fingerprint = credentialCode
    ? fingerprintFromCode(credentialCode)
    : null;
  ctx.fillText(
    fingerprint ? formatFingerprint(fingerprint) : verificationCode(cert),
    PNG_WIDTH - 64,
    PNG_HEIGHT - 78,
  );
}

function downloadCertificatePng(
  cert: Certificate,
  credentialCode?: string,
): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = PNG_WIDTH;
    canvas.height = PNG_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    drawCertificate(ctx, cert, credentialCode);
    const url = canvas.toDataURL("image/png");
    const safeRef = cert.refId.replace(/[^a-zA-Z0-9_-]+/g, "-");
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `deepforge-certificate-${cert.kind}-${safeRef}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return true;
  } catch {
    return false;
  }
}

/* ──────────────────────────────── card ──────────────────────────────────── */

const CODE_TEXT =
  "font-mono text-[8px] tracking-[0.2em] sm:text-[10px]";

function CertificateCode({
  cert,
  code,
}: {
  cert: Certificate;
  code?: string;
}) {
  const fingerprint = code ? fingerprintFromCode(code) : null;
  if (!code || !fingerprint) {
    return (
      <span aria-hidden className={cn(CODE_TEXT, "text-[#6b6355]")}>
        ····-····-····-····
      </span>
    );
  }
  return (
    <Link
      href={verifyUrl(code)}
      title="Verify this certificate"
      aria-label={`Verify the certificate for ${cert.title}`}
      className={cn(
        CODE_TEXT,
        "rounded-sm text-[#3f7354] underline-offset-2 transition-colors hover:text-[#2f7d4f] hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-[#2f7d4f]/50",
      )}
    >
      {formatFingerprint(fingerprint)}
    </Link>
  );
}

interface CertificateCardProps {
  cert: Certificate;
  code?: string;
  confirming: boolean;
  onPrint: (cert: Certificate) => void;
  onCopy: (cert: Certificate) => void;
  onCopyLink: (cert: Certificate) => void;
  onDownload: (cert: Certificate) => void;
  onRevoke: (cert: Certificate) => void;
}

function CertificateCard({
  cert,
  code,
  confirming,
  onPrint,
  onCopy,
  onCopyLink,
  onDownload,
  onRevoke,
}: CertificateCardProps) {
  return (
    <li className="flex flex-col">
      <article
        aria-label={`Certificate of completion: ${cert.title}, awarded to ${cert.recipient}`}
        className="shadow-sm"
      >
        <div
          className="flex aspect-[8/5] flex-col bg-[#fbfaf7] px-5 py-4 text-[#1c1c1c] sm:px-9 sm:py-7"
          style={{ border: "3px double #b9b29c" }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.3em] sm:text-[11px]">
              DeepForge
            </span>
            <span
              aria-hidden
              className="h-1.5 w-1.5 rotate-45 bg-[#2f7d4f]/70 sm:h-2 sm:w-2"
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
            <p className="text-[8px] uppercase tracking-[0.35em] text-[#6b6355] sm:text-[10px]">
              Certificate of Completion
            </p>
            <h4 className="mt-1 line-clamp-2 max-w-[42ch] font-serif text-base font-semibold leading-snug sm:mt-2 sm:text-2xl">
              {cert.title}
            </h4>
            <p className="mt-1 line-clamp-1 max-w-[42ch] font-serif text-[11px] italic text-[#4a4438] sm:mt-1.5 sm:text-sm">
              awarded to {cert.recipient}
            </p>
            <p className="mt-1 line-clamp-2 max-w-[54ch] text-[9px] leading-relaxed text-[#6b6355] sm:mt-2 sm:text-xs">
              {cert.detail}
            </p>
          </div>

          <div aria-hidden className="my-1.5 flex items-center gap-3 sm:my-2">
            <span className="h-px flex-1 bg-[#2f7d4f]/35" />
            <span className="h-1 w-1 rotate-45 bg-[#2f7d4f]/60 sm:h-1.5 sm:w-1.5" />
            <span className="h-px flex-1 bg-[#2f7d4f]/35" />
          </div>

          <div className="flex items-end justify-between gap-3">
            <span className="text-[8px] text-[#6b6355] sm:text-[10px]">
              Issued {formatCertificateDate(cert.issuedAt)}
            </span>
            <CertificateCode cert={cert} code={code} />
          </div>
        </div>
      </article>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onPrint(cert)}
          aria-label={`Print certificate for ${cert.title}`}
          className={SECONDARY_BUTTON}
        >
          Print
        </button>
        <button
          type="button"
          onClick={() => onCopy(cert)}
          aria-label={`Copy certificate text for ${cert.title}`}
          className={SECONDARY_BUTTON}
        >
          Copy text
        </button>
        {code && (
          <Link
            href={verifyUrl(code)}
            aria-label={`Open the verification page for ${cert.title}`}
            className={SECONDARY_BUTTON}
          >
            Verify
          </Link>
        )}
        <button
          type="button"
          onClick={() => onCopyLink(cert)}
          aria-label={`Copy the verification link for ${cert.title}`}
          className={SECONDARY_BUTTON}
        >
          Copy link
        </button>
        <button
          type="button"
          onClick={() => onDownload(cert)}
          aria-label={`Download certificate for ${cert.title} as a PNG`}
          className={SECONDARY_BUTTON}
        >
          Download PNG
        </button>
        <button
          type="button"
          onClick={() => onRevoke(cert)}
          aria-label={
            confirming
              ? `Confirm revoking the certificate for ${cert.title}`
              : `Revoke the certificate for ${cert.title}`
          }
          className={confirming ? DANGER_CONFIRM_BUTTON : DANGER_BUTTON}
        >
          {confirming ? "Confirm revoke" : "Revoke"}
        </button>
      </div>
    </li>
  );
}

/* ─────────────────────────── track + catalog ────────────────────────────── */

function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      className="h-1.5 w-full overflow-hidden rounded-full bg-canvas-soft"
    >
      <div
        aria-hidden
        className="h-full rounded-full bg-accent"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function LevelBadge({ level }: { level: CertTrack["level"] }) {
  return (
    <span className="rounded-full border border-hairline bg-canvas-soft px-2 py-0.5 text-[11px] text-body-mid">
      {LEVEL_LABELS[level]}
    </span>
  );
}

const STEP_LINK =
  "min-w-0 truncate rounded-sm text-xs text-ink underline-offset-2 transition-colors hover:text-accent hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40";

function TrackCard({
  progress,
  entry,
  issued,
  onClaim,
}: {
  progress: CertTrackProgress;
  entry?: CertificateEntry;
  issued: boolean;
  onClaim: (entry: CertificateEntry) => void;
}) {
  const { track } = progress;
  const firstUndone = progress.steps.findIndex((step) => !step.done);
  const next = firstUndone === -1 ? null : progress.steps[firstUndone];
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <LevelBadge level={track.level} />
        {issued && (
          <span className="rounded-full border border-accent/40 bg-accent/5 px-2 py-0.5 text-[11px] font-medium text-accent">
            Claimed
          </span>
        )}
      </div>

      <div>
        <h4 className="text-sm font-medium text-ink">{track.title}</h4>
        <p className="mt-1 text-xs leading-relaxed text-body-mid">
          {track.blurb}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-body-mid">
          <span className="text-mute">Outcome: </span>
          {track.outcome}
        </p>
      </div>

      <ol className="space-y-1.5">
        {progress.steps.map((step, index) => (
          <li
            key={`${step.step.kind}:${step.step.id}`}
            className={cn(
              "flex flex-col gap-1 rounded-md border px-2.5 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
              step.done
                ? "border-hairline bg-canvas-soft/60"
                : index === firstUndone
                  ? "border-accent/40 bg-accent/5"
                  : "border-hairline",
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rotate-45",
                  step.done ? "bg-accent" : "bg-hairline",
                )}
              />
              <Link href={step.href} className={STEP_LINK}>
                {step.label}
              </Link>
            </span>
            <span className="shrink-0 font-mono text-[11px] text-body-mid">
              {step.progress}
            </span>
          </li>
        ))}
      </ol>

      {next && (
        <p className="text-xs leading-relaxed text-body-mid">
          Next: <span className="text-ink">{next.label}</span>
          {" — "}
          {next.progress}.
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-3">
        <div className="min-w-[8rem] flex-1">
          <ProgressBar
            value={progress.total === 0 ? 0 : progress.done / progress.total}
            label={`${track.title} progress`}
          />
        </div>
        <span className="font-mono text-xs text-body-mid">
          {progress.done}/{progress.total}
        </span>
        {progress.complete && entry && !issued && (
          <button
            type="button"
            onClick={() => onClaim(entry)}
            aria-label={`Claim the ${track.title} certificate`}
            className={PRIMARY_BUTTON}
          >
            Claim
          </button>
        )}
      </div>
    </article>
  );
}

function CandidateRow({
  candidate,
  issued,
  onClaim,
}: {
  candidate: CertificateCandidate;
  issued: boolean;
  onClaim: (entry: CertificateEntry) => void;
}) {
  const href = candidateHref(candidate);
  const value = candidateValue(candidate);
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-hairline bg-canvas-card px-3 py-2.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link href={href} className={STEP_LINK}>
            {candidate.title}
          </Link>
          <p className="mt-0.5 text-xs leading-relaxed text-body-mid">
            {candidate.requirement}
          </p>
        </div>
        {issued ? (
          <span className="shrink-0 rounded-full border border-accent/40 bg-accent/5 px-2 py-0.5 text-[11px] font-medium text-accent">
            Issued
          </span>
        ) : candidate.eligible ? (
          <button
            type="button"
            onClick={() => onClaim(candidate)}
            aria-label={`Claim certificate for ${candidate.title}`}
            className={PRIMARY_BUTTON}
          >
            Claim
          </button>
        ) : (
          <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-[11px] text-mute">
            {KIND_LABELS[candidate.kind]}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <ProgressBar
            value={candidate.progress}
            label={`${candidate.title} progress`}
          />
        </div>
        {value && (
          <span className="shrink-0 font-mono text-[11px] text-body-mid">
            {value}
          </span>
        )}
      </div>
    </li>
  );
}

/* ─────────────────────────────── section ────────────────────────────────── */

export function Certificates() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [status, setStatus] = useState("");
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const loaded = state !== EMPTY_STATE;

  useEffect(() => {
    if (!confirmRevokeId) return;
    const timer = window.setTimeout(() => setConfirmRevokeId(null), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmRevokeId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const pairs = await Promise.all(
        state.issued.map(async (cert) => {
          try {
            const code = await certificateCredentialCode(cert);
            return [cert.id, code] as const;
          } catch {
            return [cert.id, null] as const;
          }
        }),
      );
      if (cancelled) return;
      const next: Record<string, string> = {};
      for (const [id, code] of pairs) {
        if (code) next[id] = code;
      }
      setCodes(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [state.issued]);

  const issuedKeys = new Set(
    state.issued.map((cert) => `${cert.kind}:${cert.refId}`),
  );
  const claimable = state.eligible.filter(
    (entry) => !issuedKeys.has(`${entry.kind}:${entry.refId}`),
  );
  const trackCandidates = new Map(
    state.candidates
      .filter((candidate) => candidate.kind === "track")
      .map((candidate) => [candidate.refId, candidate]),
  );
  const closest = state.candidates
    .filter(
      (candidate) =>
        !candidate.eligible &&
        !issuedKeys.has(`${candidate.kind}:${candidate.refId}`) &&
        candidate.progress > 0,
    )
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  const handleGroupToggle = (kind: CertificateKind, open: boolean) => {
    setOpenGroups((previous) => ({ ...previous, [kind]: open }));
  };

  const handleClaim = (entry: CertificateEntry) => {
    try {
      const cert = issueCertificate(entry);
      invalidate();
      setStatus(`Issued "${cert.title}" to ${cert.recipient}.`);
    } catch {
      setStatus("Could not issue that certificate.");
    }
  };

  const handleCopy = async (cert: Certificate) => {
    const code = codes[cert.id];
    const text = code
      ? `${buildCertificateText(cert, code)}\nVerify: ${window.location.origin}${verifyUrl(code)}`
      : buildCertificateText(cert);
    const ok = await copyText(text);
    setStatus(
      ok
        ? `Copied "${cert.title}" as text.`
        : "Copy failed — the clipboard is unavailable.",
    );
  };

  const handleCopyLink = async (cert: Certificate) => {
    const code = codes[cert.id];
    if (!code) {
      setStatus("The verification link is still being computed.");
      return;
    }
    const ok = await copyText(`${window.location.origin}${verifyUrl(code)}`);
    setStatus(
      ok
        ? `Copied the verification link for "${cert.title}".`
        : "Copy failed — the clipboard is unavailable.",
    );
  };

  const handleDownload = (cert: Certificate) => {
    const ok = downloadCertificatePng(cert, codes[cert.id]);
    setStatus(
      ok
        ? `Downloaded "${cert.title}" as a PNG.`
        : "Could not create the PNG in this browser.",
    );
  };

  const handlePrint = (cert: Certificate) => {
    const ok = printCertificate(cert, codes[cert.id]);
    setStatus(
      ok
        ? "Opening the print dialog…"
        : "Pop-up blocked — allow pop-ups to print.",
    );
  };

  const handleRevoke = (cert: Certificate) => {
    if (confirmRevokeId !== cert.id) {
      setConfirmRevokeId(cert.id);
      setStatus(`Press revoke again to remove "${cert.title}".`);
      return;
    }
    const ok = revokeCertificate(cert.id);
    invalidate();
    setConfirmRevokeId(null);
    setStatus(ok ? "Certificate revoked." : "Certificate was already removed.");
  };

  return (
    <section
      id="certificates"
      className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 py-8 sm:px-6 sm:py-12"
    >
      <div className="mb-6">
        <h2 className="text-sm font-medium text-body-mid">
          {claimable.length} ready to claim · {state.candidates.length} to work
          toward · {state.issued.length} issued
        </h2>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mb-4 min-h-4 text-xs text-body-mid"
      >
        {status}
      </p>

      {loaded && state.eligible.length === 0 && (
        <div className="mb-8 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <h3 className="text-sm font-medium text-ink">
            Nothing ready to claim yet
          </h3>
          {closest.length > 0 ? (
            <>
              <p className="mt-1 text-xs leading-relaxed text-body-mid">
                Certificates are earned by completing curated work. These are
                closest to done:
              </p>
              <ul className="mt-3 space-y-2">
                {closest.map((candidate) => (
                  <li
                    key={`${candidate.kind}:${candidate.refId}`}
                    className="flex flex-wrap items-center justify-between gap-2"
                  >
                    <Link
                      href={candidateHref(candidate)}
                      className={STEP_LINK}
                    >
                      {candidate.title}
                    </Link>
                    <span className="font-mono text-[11px] text-body-mid">
                      {candidate.requirement} ·{" "}
                      {Math.round(candidate.progress * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-body-mid">
              Certificates are earned by completing curated work — every
              problem in a path or collection, 80% of a category, a lab at its
              target, every project step, 80% on an interview mock, or every
              research baseline. Start with a certification track below, then
              open a path or collection and solve your first problem.
            </p>
          )}
        </div>
      )}

      {/* Certification tracks */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-ink">
            Certification tracks
          </h3>
          <p className="mt-0.5 text-xs leading-relaxed text-body-mid">
            Curated routes from first principles to applied work. Complete every
            step to claim the track certificate.
          </p>
        </div>
        {state.tracks.length === 0 ? (
          loaded && (
            <div className="rounded-lg border border-hairline bg-canvas-card p-4 text-center text-sm text-body-mid sm:p-5">
              Track progress is unavailable in this browser.
            </div>
          )
        ) : (
          <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {state.tracks.map((progress) => {
              const entry = trackCandidates.get(progress.track.id);
              return (
                <li key={progress.track.id} className="flex">
                  <div className="flex w-full flex-col">
                    <TrackCard
                      progress={progress}
                      entry={entry}
                      issued={issuedKeys.has(
                        `track:${progress.track.id}`,
                      )}
                      onClaim={handleClaim}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Catalog */}
      <div className="mt-10">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-ink">
            Certificate catalog
          </h3>
          <p className="mt-0.5 text-xs leading-relaxed text-body-mid">
            Everything you can earn, with live progress and what each one needs.
          </p>
        </div>
        <div className="space-y-3">
          {CATALOG_GROUPS.map((group) => {
            const entries = state.candidates.filter(
              (candidate) => candidate.kind === group.kind,
            );
            if (entries.length === 0) return null;
            const earned = entries.filter(
              (candidate) =>
                candidate.eligible ||
                issuedKeys.has(`${candidate.kind}:${candidate.refId}`),
            ).length;
            const readyToClaim = entries.some(
              (candidate) =>
                candidate.eligible &&
                !issuedKeys.has(`${candidate.kind}:${candidate.refId}`),
            );
            const open = openGroups[group.kind] ?? (group.open || readyToClaim);
            return (
              <details
                key={group.kind}
                open={open}
                onToggle={(event) =>
                  handleGroupToggle(group.kind, event.currentTarget.open)
                }
                className="rounded-lg border border-hairline bg-canvas-card"
              >
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40">
                  <span className="min-w-0">
                    {group.title}
                    <span className="ml-2 text-xs font-normal text-body-mid">
                      {group.blurb}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] text-body-mid">
                    {earned}/{entries.length}
                  </span>
                </summary>
                <ul className="grid grid-cols-1 gap-2 border-t border-hairline p-3 sm:grid-cols-2 xl:grid-cols-3">
                  {entries.map((candidate) => (
                    <CandidateRow
                      key={`${candidate.kind}:${candidate.refId}`}
                      candidate={candidate}
                      issued={issuedKeys.has(
                        `${candidate.kind}:${candidate.refId}`,
                      )}
                      onClaim={handleClaim}
                    />
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      </div>

      {/* Issued certificates */}
      <div className="mt-10">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-ink">
            Your certificates
          </h3>
          <p className="mt-0.5 text-xs text-body-mid">
            {state.issued.length} earned
          </p>
        </div>
        {state.issued.length === 0 ? (
          loaded && (
            <div className="rounded-lg border border-hairline bg-canvas-card p-4 text-center text-sm text-body-mid sm:p-5">
              No certificates yet. Claim one above when a milestone is ready.
            </div>
          )
        ) : (
          <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {state.issued.map((cert) => (
              <CertificateCard
                key={cert.id}
                cert={cert}
                code={codes[cert.id]}
                confirming={confirmRevokeId === cert.id}
                onPrint={handlePrint}
                onCopy={handleCopy}
                onCopyLink={handleCopyLink}
                onDownload={handleDownload}
                onRevoke={handleRevoke}
              />
            ))}
          </ul>
        )}
      </div>

      <p className={cn("mt-6 text-[11px] text-mute")}>
        Certificate codes are SHA-256 fingerprints of the printed fields,
        computed in your browser. Anyone can re-check one on its verification
        page — no account and no server secret. Codes are self-attested: they
        prove the fields were not altered after issue.
      </p>
    </section>
  );
}
