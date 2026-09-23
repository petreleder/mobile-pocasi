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
    <p className={`${className} px-4 text-[14px] leading-5`}>
      <span className="text-[#767676]">
        {weekday}, {dateLabel}, svátek má{" "}
      </span>
      {name ? <span className="text-[#c00]">{name}.</span> : null}
    </p>
  );
}
