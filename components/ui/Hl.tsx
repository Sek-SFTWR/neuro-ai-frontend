/* Renders `**bold**` runs as the AI-produced highlight span (assets/css/base.css .hl). */
export function Hl({ text }: { text: string | null | undefined }) {
  if (!text) return <>—</>;
  const parts = String(text).split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            className="bg-[linear-gradient(transparent_62%,rgba(244,88,31,0.22)_62%)] font-semibold text-text"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
