"use client";

export function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M8.5625 5L6.29868 7.28361C5.90746 7.67825 5.26954 7.67825 4.87832 7.28361L2.6145 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CityButton({
  name,
  onOpen,
  className,
  chevron = "red",
}: {
  name: string;
  onOpen: () => void;
  className?: string;
  chevron?: "red" | "white" | "none";
}) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={`Změnit lokalitu, teď ${name}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onOpen();
      }}
      className={`inline-flex max-w-full items-center gap-0.5 bg-transparent p-0 ${
        className ?? ""
      }`}
    >
      <span className="truncate">{name}</span>
      {chevron === "none" ? null : (
        <ChevronDown
          className={`size-3 shrink-0 ${
            chevron === "white" ? "text-white" : "text-[#cc0000]"
          }`}
        />
      )}
    </button>
  );
}
