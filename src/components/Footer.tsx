export function Footer() {
  return (
    <footer className="mt-auto border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-body-mid sm:flex-row sm:px-6">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-body">DeepForge</span>
          <span>·</span>
          <span>by svx</span>
          <span>·</span>
          <span>© 2026</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/srivtx/deepforge"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ink"
          >
            GitHub
          </a>
          <a
            href="#top"
            className="transition-colors hover:text-ink"
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
