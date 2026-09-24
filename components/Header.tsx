export function Header() {
  return (
    <header className="relative mt-[max(2.5rem,env(safe-area-inset-top))] flex h-10 items-center justify-center px-4">
      <img src="/assets/logo.svg" alt="Seznam.cz" />
      <div className="absolute top-0 right-4 size-10">
        <img src="/assets/avatar.svg" alt="" />
        <span className="absolute inset-0 flex items-center justify-center text-center text-[16px] leading-4 text-[#111]">
          PB
        </span>
      </div>
    </header>
  );
}
