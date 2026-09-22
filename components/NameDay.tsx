export function NameDay({
  weekday,
  dateLabel,
  name,
}: {
  weekday: string;
  dateLabel: string;
  name: string;
}) {
  return (
    <p className="mt-4 px-4 text-[14px] leading-5">
      <span className="text-[#767676]">
        {weekday}, {dateLabel}, svátek má{" "}
      </span>
      {name ? <span className="text-[#c00]">{name}.</span> : null}
    </p>
  );
}
