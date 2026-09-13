import { cn } from "@/lib/utils";

export interface DecisionRow {
  option: string;
  chosen: boolean;
  why: string;
}

export function DecisionTable({
  rows,
  caption,
  className,
}: {
  rows: DecisionRow[];
  caption?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "df-scroll overflow-x-auto rounded-lg border border-hairline bg-canvas-card",
        className,
      )}
    >
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        {caption && (
          <caption className="border-b border-hairline px-4 py-2 text-left text-xs text-body-mid">
            {caption}
          </caption>
        )}
        <thead>
          <tr className="text-xs text-body-mid">
            <th scope="col" className="px-4 py-2 font-medium">
              Option
            </th>
            <th scope="col" className="w-24 px-4 py-2 font-medium">
              Chosen
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Why
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.option}
              className="border-t border-hairline align-top"
            >
              <th
                scope="row"
                className="px-4 py-2.5 font-medium text-ink"
              >
                {row.option}
              </th>
              <td className="px-4 py-2.5">
                {row.chosen ? (
                  <span className="inline-flex rounded-full border border-accent/40 bg-accent/5 px-2 py-0.5 text-[10px] font-medium text-accent">
                    chosen
                  </span>
                ) : (
                  <span className="text-xs text-mute">&mdash;</span>
                )}
              </td>
              <td className="px-4 py-2.5 leading-relaxed text-body">
                {row.why}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
