"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import {
  ASSISTANT_CHANGE_EVENT,
  appendMessage,
  createMessage,
  getMessages,
  respond,
  resetConversation,
  suggestedPrompts,
  type Ctx,
  type Msg,
} from "@/lib/assistant";
import { getProblemById } from "@/data/problems";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Module-level context store.
//
// ProblemView (or the orchestrator) can attach the current problem + user code
// either by dispatching:
//   window.dispatchEvent(new CustomEvent("deepforge:problem-context",
//     { detail: { problem, code } }))
// or by importing the setter below:
//   setAssistantContext({ problem, code })
// ─────────────────────────────────────────────────────────────────────────────

let assistantContext: Ctx = {};
const contextListeners = new Set<() => void>();

export function setAssistantContext(ctx: Ctx): void {
  assistantContext = { ...ctx };
  for (const listener of Array.from(contextListeners)) listener();
}

function subscribeContext(listener: () => void): () => void {
  contextListeners.add(listener);
  return () => {
    contextListeners.delete(listener);
  };
}

function getContextSnapshot(): Ctx {
  return assistantContext;
}

const PROBLEM_CONTEXT_EVENT = "deepforge:problem-context";

function CitationChip({ id }: { id: string }) {
  const router = useRouter();
  const problem = getProblemById(id);
  return (
    <button
      type="button"
      onClick={() => router.push(`/problems/${id}`)}
      aria-label={`Open problem ${id}`}
      title={problem ? `${problem.id} — ${problem.title}` : id}
      className="max-w-full truncate rounded-md border border-hairline bg-canvas px-1.5 py-0.5 text-left font-mono text-[10px] text-body-mid transition-colors hover:border-accent/40 hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
    >
      {problem ? `${problem.id} — ${problem.title}` : id}
    </button>
  );
}

function MessageBubble({ message }: { message: Msg }) {
  const mine = message.role === "user";
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-lg border px-2.5 py-2 text-xs leading-relaxed",
          mine
            ? "border-accent/30 bg-accent/10 text-ink"
            : "border-hairline bg-canvas-soft text-body",
        )}
      >
        {!mine && message.intent && (
          <div className="mb-1 font-mono text-[10px] text-mute">
            {message.intent}
          </div>
        )}
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        {!mine && message.citations && message.citations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.citations.map((id) => (
              <CitationChip key={id} id={id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingShimmer() {
  return (
    <div className="flex justify-start" aria-hidden>
      <div className="flex items-center gap-1 rounded-lg border border-hairline bg-canvas-soft px-2.5 py-2.5">
        <span className="df-pulse h-1.5 w-1.5 rounded-full bg-mute" />
        <span
          className="df-pulse h-1.5 w-1.5 rounded-full bg-mute"
          style={{ animationDelay: "0.2s" }}
        />
        <span
          className="df-pulse h-1.5 w-1.5 rounded-full bg-mute"
          style={{ animationDelay: "0.4s" }}
        />
      </div>
    </div>
  );
}

export function ZeroAssistant() {
  const ctx = useSyncExternalStore(
    subscribeContext,
    getContextSnapshot,
    getContextSnapshot,
  );

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const fabRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<Ctx>(ctx);
  const exchangeRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const chips = useMemo(() => suggestedPrompts(ctx), [ctx]);

  const close = useCallback(() => {
    setOpen(false);
    fabRef.current?.focus();
  }, []);

  // Keep the latest context in a ref so a pending reply always sees it.
  useEffect(() => {
    ctxRef.current = ctx;
  }, [ctx]);

  // Load the persisted thread and stay in sync with every writer.
  useEffect(() => {
    const load = () => setMessages(getMessages());
    load();
    window.addEventListener(ASSISTANT_CHANGE_EVENT, load);
    return () => window.removeEventListener(ASSISTANT_CHANGE_EVENT, load);
  }, []);

  // Attach problem context dispatched as an event (safe if never fired).
  useEffect(() => {
    const onContext = (event: Event) => {
      const detail = (event as CustomEvent).detail as
        | { problem?: Ctx["problem"]; code?: string }
        | undefined;
      if (!detail || typeof detail !== "object") return;
      setAssistantContext({ problem: detail.problem, code: detail.code });
    };
    window.addEventListener(PROBLEM_CONTEXT_EVENT, onContext);
    return () => window.removeEventListener(PROBLEM_CONTEXT_EVENT, onContext);
  }, []);

  // Escape closes the panel and returns focus to the launcher.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus the input when opened; clean up a pending reply timer on unmount.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  // Keep the newest message in view.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, open]);

  const clear = useCallback(() => {
    exchangeRef.current += 1;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setBusy(false);
    resetConversation();
    setMessages([]);
  }, []);

  const send = useCallback(
    (raw?: string) => {
      const text = (raw ?? input).trim();
      if (!text || busy) return;

      exchangeRef.current += 1;
      const token = exchangeRef.current;

      appendMessage(createMessage("user", text));
      setMessages(getMessages());
      setInput("");
      setBusy(true);

      // Zero is synchronous; this tiny delay just makes the reply feel typed.
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        if (exchangeRef.current !== token) return;
        appendMessage(respond(text, ctxRef.current));
        setMessages(getMessages());
        setBusy(false);
      }, 160);
    },
    [input, busy],
  );

  const onInputKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Zero study assistant"
          className="df-slide-up fixed bottom-16 right-4 z-40 flex h-[min(70vh,540px)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-hairline bg-canvas shadow-xl"
        >
          <div className="flex items-center gap-2 border-b border-hairline px-3 py-2.5">
            <span
              className="df-pulse h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink">Zero</div>
              <div className="truncate text-[10px] text-mute">
                offline · answers only from the catalogue
              </div>
            </div>
            {ctx.problem && (
              <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 font-mono text-[10px] text-body-mid">
                {ctx.problem.id}
              </span>
            )}
            <button
              type="button"
              onClick={clear}
              className="shrink-0 rounded-lg border border-hairline px-2 py-1 text-[10px] text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="Close Zero"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-hairline text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
              >
                <path
                  d="M2 2l10 10M12 2L2 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div
            ref={listRef}
            role="log"
            aria-live="polite"
            aria-label="Conversation with Zero"
            className="df-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3"
          >
            {messages.length === 0 && !busy ? (
              <div className="space-y-3">
                <p className="text-xs leading-relaxed text-body-mid">
                  Ask about anything in the catalogue. Every claim cites a real
                  problem id — I never invent one.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => send(chip)}
                      className="rounded-full border border-hairline bg-canvas-soft px-2.5 py-1 text-[11px] text-body transition-colors hover:border-accent/40 hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            {busy && <TypingShimmer />}
          </div>

          <div className="border-t border-hairline p-2.5">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                rows={1}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Ask Zero…"
                aria-label="Message Zero"
                autoComplete="off"
                spellCheck={false}
                className="df-scroll min-h-[36px] max-h-28 flex-1 resize-none rounded-lg border border-hairline bg-canvas-soft px-2.5 py-2 text-sm text-ink placeholder:text-mute focus:border-accent/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={!input.trim() || busy}
                className="rounded-lg bg-accent px-3 py-2 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <div className="mt-1.5 text-[10px] text-mute">
              Enter to send · Shift+Enter for a new line
            </div>
          </div>
        </div>
      )}

      <button
        ref={fabRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Zero study assistant"
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-accent/40 bg-canvas px-3.5 py-2 text-xs font-medium text-accent shadow-lg transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
      >
        <span
          className="df-pulse h-1.5 w-1.5 rounded-full bg-accent"
          aria-hidden
        />
        Zero
      </button>
    </>
  );
}
