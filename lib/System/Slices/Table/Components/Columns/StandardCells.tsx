// ── Standard Cell Components ──
// Each returns ReactNode (content only). The row builder wraps in <td>.

// ── Text Cell ──
export const TextCell = ({ value, limit }: { value: any; limit?: number }) => {
  if (value == null || value === "") return null;
  const str = String(value);
  const display = limit && str.length > limit ? str.substring(0, limit) + "…" : str;
  return <span title={str}>{display}</span>;
};

// ── Date Cell ──
export const DateCell = ({ value, format = "date" }: { value: any; format?: string }) => {
  if (value == null) return null;
  try {
    const date = new Date(value);
    const display = format === "date" ? date.toLocaleDateString() : date.toLocaleString();
    return <span className="ez-cell--nowrap">{display}</span>;
  } catch {
    return <span>{String(value)}</span>;
  }
};

// ── Money Cell ──
export const MoneyCell = ({ value, currency }: { value: any; currency?: string }) => {
  if (value == null) return null;
  const formatted = Number(value).toFixed(2);
  return (
    <span className="ez-cell--money">
      {formatted}
      {currency && <span className="ez-cell--currency">{currency}</span>}
    </span>
  );
};

// ── Status Cell ──
export const StatusCell = ({ value }: { value: any }) => {
  if (value == null) return null;
  return (
    <span className="ez-cell--badge" data-status={String(value).toLowerCase()}>
      {value}
    </span>
  );
};

// ── Action Button ──
const ActionButton = (props: { icon: string; label: string; variant?: string; onClick: () => void }) => (
  <button
    className="ez-action-btn"
    data-variant={props.variant || "ghost"}
    onClick={(e) => {
      e.stopPropagation();
      props.onClick();
    }}
    title={props.label}
    type="button">
    <i className={`icon-${props.icon}`} />
  </button>
);

// ── Actions Cell ──
type ActionDef<T> = {
  icon: string;
  label: string;
  onClick: (item: T) => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  hidden?: (item: T) => boolean;
};

export const ActionCell = <T,>({ item, actions }: { item: T; actions: ActionDef<T>[] }) => (
  <div className="ez-cell--actions">
    {actions.map((act, i) => {
      if (act.hidden?.(item)) return null;
      return <ActionButton key={i} icon={act.icon} label={act.label} variant={act.variant} onClick={() => act.onClick(item)} />;
    })}
  </div>
);
