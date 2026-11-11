export function SearchBar() {
  return (
    <form
      action="https://search.seznam.cz/"
      method="get"
      className="mt-5 px-4"
    >
      <label className="flex h-[52px] w-full items-center rounded-[28px] border border-solid border-[#aaa] bg-white pr-1.5 pl-6">
        <input
          type="search"
          name="q"
          placeholder="...najdu tam, co neznám"
          className="h-6 min-w-0 flex-1 appearance-none bg-transparent text-[16px] leading-6 text-[#111] outline-none placeholder:text-[#aaa] [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="submit"
          aria-label="Hledat"
          className="flex size-10 shrink-0 items-center justify-center"
        >
          <img
            src="/assets/icon-search-field.svg"
            alt=""
            width={40}
            height={40}
          />
        </button>
      </label>
    </form>
  );
}
