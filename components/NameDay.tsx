export function NameDay({
  weekday,
  dateLabel,
  name,
  className = "mt-4",
}: {
  weekday: string;
  dateLabel: string;
  name: string;
  className?: string;
}) {
  return (
    <p className={`${className} text-center text-[12px] leading-5 text-[#888]`}>
      {weekday} {dateLabel}, svátek má{" "}
      {name ? (
        <>
          <span className="text-[#c00]">{name}</span>.
        </>
      ) : null}
    </p>
  );
}
