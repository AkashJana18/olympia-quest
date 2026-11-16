export function FloorFade({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="floor-fade" aria-hidden="true">
      <div className="floor-fade-inner">
        <span className="eyebrow">NOW ENTERING</span>
        <h2>{label}</h2>
        <p>{sub}</p>
      </div>
    </div>
  );
}
