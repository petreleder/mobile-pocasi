export function SearchBar() {
  return (
    <form
      action="https://search.seznam.cz/"
      method="get"
      className="relative z-10"
      style={{
        paddingLeft: "calc(20px - 4px * var(--shrink, 0))",
        paddingRight: "calc(20px + 52px * var(--shrink, 0))",
      }}
    >
      <label
        className="flex w-full items-center overflow-hidden border border-solid bg-white"
        style={{
          height: "calc(52px - 12px * var(--shrink, 0))",
          borderRadius: "calc(28px - 8px * var(--shrink, 0))",
          borderColor:
            "rgb(calc(170 + 34 * var(--shrink, 0)) calc(170 + 34 * var(--shrink, 0)) calc(170 + 34 * var(--shrink, 0)))",
          paddingLeft: "calc(24px - 4px * var(--shrink, 0))",
          paddingRight: "calc(6px - 4px * var(--shrink, 0))",
        }}
      >
        <input
          type="search"
          name="q"
          placeholder="...najdu tam, co neznám"
          className="h-6 min-w-0 flex-1 appearance-none bg-transparent leading-6 text-[#111] outline-none placeholder:text-[#aaa] [&::-webkit-search-cancel-button]:hidden"
          style={{ fontSize: "calc(16px - 2px * var(--shrink, 0))" }}
        />
        <button
          type="submit"
          aria-label="Hledat"
          className="flex shrink-0 items-center justify-center"
          style={{
            width: "calc(40px - 4px * var(--shrink, 0))",
            height: "calc(40px - 4px * var(--shrink, 0))",
          }}
        >
          <img
            src="/assets/icon-search-field.svg"
            alt=""
            width={40}
            height={40}
            className="h-full w-full"
          />
        </button>
      </label>
    </form>
  );
}
