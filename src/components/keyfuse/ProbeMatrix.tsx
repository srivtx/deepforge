import {
  slotName,
  type ProbeRow,
  type SlotSpec,
  type SlotUniverse,
} from "@/lib/keyfuse";

function valueTag(spec: SlotSpec, value: string): string {
  if (value === spec.baseline) return "baseline";
  if (value === spec.top) return "top";
  if (spec.sentinels?.includes(value)) return "sentinel";
  return "other";
}

export function ProbeMatrix({
  universe,
  rows,
}: {
  readonly universe: SlotUniverse;
  readonly rows: readonly ProbeRow[];
}) {
  const baselineOutput = rows[0]?.output ?? "";

  return (
    <section
      aria-label="Probe rows"
      className="rounded-lg border border-hairline bg-canvas-card"
    >
      <div className="df-scroll max-w-full overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-left text-xs">
          <caption className="px-4 pb-2 pt-3 text-left text-xs leading-relaxed text-body-mid sm:px-5">
            Probe rows for this run. Each row is one oracle call at one
            assignment; a cell shows the slot value and which member of its
            domain it is. Baseline output:{" "}
            <span className="font-mono text-[11px] text-body">
              {baselineOutput}
            </span>
            .
          </caption>
          <thead>
            <tr className="border-b border-hairline">
              <th
                scope="col"
                className="px-3 py-2 font-medium text-body-mid"
              >
                Row
              </th>
              {universe.slots.map((spec) => (
                <th
                  key={slotName(spec)}
                  scope="col"
                  className="px-3 py-2 font-medium text-body-mid"
                >
                  <span className="block font-mono text-[11px] text-ink">
                    {slotName(spec)}
                  </span>
                  <span className="block text-[10px] font-normal text-mute">
                    baseline {spec.baseline}
                  </span>
                  <span className="block text-[10px] font-normal text-mute">
                    top {spec.top}
                  </span>
                  {(spec.sentinels ?? []).map((sentinel) => (
                    <span
                      key={sentinel}
                      className="block text-[10px] font-normal text-mute"
                    >
                      sentinel {sentinel}
                    </span>
                  ))}
                </th>
              ))}
              <th scope="col" className="px-3 py-2 font-medium text-body-mid">
                Output
              </th>
              <th scope="col" className="px-3 py-2 font-medium text-body-mid">
                Differing slots
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.index}
                className="border-b border-hairline last:border-b-0"
              >
                <th
                  scope="row"
                  className="px-3 py-2 font-mono text-[11px] font-normal text-body-mid"
                >
                  {row.index}
                </th>
                {universe.slots.map((spec) => {
                  const name = slotName(spec);
                  const value = row.assignment[name] ?? spec.baseline;
                  return (
                    <td key={name} className="px-3 py-2">
                      <span className="block font-mono text-[11px] text-ink">
                        {value}
                      </span>
                      <span className="block text-[10px] text-mute">
                        {valueTag(spec, value)}
                      </span>
                    </td>
                  );
                })}
                <td className="px-3 py-2">
                  <span className="block font-mono text-[11px] text-ink">
                    {row.output}
                  </span>
                  <span className="block text-[10px] text-mute">
                    {row.index === 0
                      ? "baseline row"
                      : row.changed
                        ? "differs from baseline"
                        : "matches baseline"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {row.differing.length === 0 ? (
                    <span className="text-[10px] text-mute">none</span>
                  ) : (
                    row.differing.map((slot) => (
                      <span
                        key={slot}
                        className="block font-mono text-[11px] text-body-mid"
                      >
                        {slot}
                      </span>
                    ))
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
