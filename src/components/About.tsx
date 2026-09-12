export function About() {
  return (
    <section
      id="about"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            What is DeepForge?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-body">
            DeepForge is a practice ground for the math behind machine
            learning. Every problem asks you to implement a fundamental
            primitive from scratch — no sklearn, no torch, no imports beyond
            the standard library. Your code runs in a real Python interpreter
            (Pyodide) inside your browser, executed against real test cases.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-body">
            The goal is fluency. If you can write a softmax by hand, you
            understand softmax. If you can derive the gradient of an MLP, you
            understand backprop. DeepForge is the place to do that work.
          </p>
        </div>
        <div className="rounded-lg border border-hairline bg-canvas-card p-5">
          <h3 className="text-sm font-semibold text-ink">How it works</h3>
          <ul className="mt-3 space-y-2 text-sm text-body-mid">
            <li className="flex gap-2">
              <span className="font-mono text-accent">01</span>
              <span>Pick a problem from any category.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-accent">02</span>
              <span>
                Read the spec, then fill in the function body in the editor.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-accent">03</span>
              <span>
                Press Run. Pyodide loads once (~5s), then runs your code
                against every test case.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-accent">04</span>
              <span>
                Pass all tests to mark the problem solved. Your code and
                progress save to localStorage — no account needed.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
