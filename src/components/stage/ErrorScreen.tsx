"use client";

interface ErrorScreenProps {
  errors: readonly string[];
  warnings: readonly string[];
}

export function ErrorScreen({ errors, warnings }: ErrorScreenProps) {
  const midpoint = Math.ceil(errors.length / 2);
  const columns = [errors.slice(0, midpoint), errors.slice(midpoint)];

  return (
    <div
      className="flex h-full w-full flex-col px-[112px] pb-[96px] pt-[92px]"
      data-testid="error-screen"
      role="alert"
    >
      <div className="flex items-center gap-4">
        <span className="h-[7px] w-[7px] rounded-full bg-over" aria-hidden />
        <p className="type-figure text-over">Data check · action required</p>
      </div>

      <h1 className="mt-8 max-w-[1400px] type-slide-title text-text">
        The presentation could not start.
      </h1>
      <p className="mt-5 max-w-[1250px] type-body text-muted">
        Validation caught problems in the slide data. Fix the entries below, then reload. The
        presentation never falls back to a blank screen.
      </p>

      <div className="mt-10 grid min-h-0 flex-1 grid-cols-2 gap-x-16 border-t border-line pt-7">
        {columns.map((column, columnIndex) => (
          <ol key={columnIndex} className="space-y-4">
            {column.map((message, index) => (
              <li key={`${columnIndex}-${message}`} className="flex gap-4 type-hud text-text">
                <span className="tabular w-8 shrink-0 text-over">
                  {String(columnIndex === 0 ? index + 1 : midpoint + index + 1).padStart(2, "0")}
                </span>
                <span className="leading-[1.45]">{message}</span>
              </li>
            ))}
          </ol>
        ))}
      </div>

      <footer className="flex items-end justify-between border-t border-line pt-6">
        <div className="space-y-1">
          <p className="type-hud text-muted">
            Fix the data, then run <span className="font-mono text-text">npm run typecheck</span> and{" "}
            <span className="font-mono text-text">npm run build</span>.
          </p>
          {warnings.length > 0 ? (
            <p className="type-caption text-muted">
              {warnings.length} non-blocking {warnings.length === 1 ? "warning" : "warnings"} also
              reported.
            </p>
          ) : null}
        </div>
        <p className="type-hud text-muted">Validation runs at startup and at build time.</p>
      </footer>
    </div>
  );
}
