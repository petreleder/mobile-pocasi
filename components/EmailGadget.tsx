"use client";

import { useState } from "react";

type TabId = "inbox" | "orders" | "calendar";

type Mail = {
  sender: string;
  subject: string;
  date: string;
  unread: boolean;
};

const inbox: Mail[] = [
  {
    sender: "Pavel Boušek",
    subject: "Pozvánka na společný oběd do",
    date: "9:45",
    unread: true,
  },
  {
    sender: "Alza.cz",
    subject: "Objednávka 4142 byla přijata",
    date: "včera",
    unread: true,
  },
  {
    sender: "IKEA Family",
    subject: "Objednávka 4142 byla přijata",
    date: "5. 11.",
    unread: false,
  },
  {
    sender: "podpora@nic.cz",
    subject: "Ověření správnosti údajů",
    date: "6. 11.",
    unread: false,
  },
];

const orders: Mail[] = [
  {
    sender: "Alza.cz",
    subject: "Objednávka 4142 byla přijata",
    date: "včera",
    unread: true,
  },
  {
    sender: "IKEA Family",
    subject: "Objednávka 4142 byla přijata",
    date: "5. 11.",
    unread: false,
  },
];

const calendar: Mail[] = [
  {
    sender: "Pavel Boušek",
    subject: "Pozvánka na společný oběd do",
    date: "9:45",
    unread: true,
  },
];

const tabs: { id: TabId; label: string }[] = [
  { id: "inbox", label: "Doručené 2" },
  { id: "orders", label: "Objednávky" },
  { id: "calendar", label: "Kalendář" },
];

const mailByTab: Record<TabId, Mail[]> = {
  inbox,
  orders,
  calendar,
};

export function EmailGadget() {
  const [tab, setTab] = useState<TabId>("inbox");
  const [hidden, setHidden] = useState(false);
  const mails = mailByTab[tab];

  return (
    <section className="mt-3.5">
      <div className="h-px w-full bg-[#ffae00]" />
      <div className="flex items-center justify-between px-4 pt-[5px]">
        <div className="flex items-center gap-4">
          {tabs.map((item) => {
            const active = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setHidden(false);
                }}
                className={`text-[14px] whitespace-nowrap ${
                  active
                    ? "font-bold leading-[22px] text-[#111]"
                    : "leading-5 text-[#666]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <button type="button" className="flex size-8 items-center justify-center" aria-label="Další">
          <img src="/assets/icon-overflow.svg" alt="" className="rotate-90" />
        </button>
      </div>
      {!hidden && (
        <ul className="mt-1 flex flex-col gap-1.5 px-4">
          <li className="h-px w-full bg-[rgba(0,0,0,0.12)]" />
          {mails.map((mail) => (
            <li
              key={`${mail.sender}-${mail.date}`}
              className={`grid grid-cols-[111px_minmax(0,1fr)_auto] items-center gap-[18px] text-[14px] ${
                mail.unread
                  ? "font-bold text-[#111]"
                  : "font-normal text-[#767676]"
              }`}
            >
              <span className="truncate leading-6">{mail.sender}</span>
              <span className="truncate leading-6">{mail.subject}</span>
              <span className="text-right leading-6 whitespace-nowrap">
                {mail.date}
              </span>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => setHidden((value) => !value)}
        className="mt-3 flex w-full items-center gap-2 px-4"
      >
        <span className="h-px min-w-px flex-1 bg-[rgba(0,0,0,0.12)]" />
        <span className="flex items-center gap-0.5 text-[12px] leading-[1.3] text-[#c00]">
          {hidden ? "Zobrazit e-maily" : "Skrýt e-maily"}
          <img
            src="/assets/icon-arrow-up.svg"
            alt=""
            className={hidden ? "" : "rotate-180"}
          />
        </span>
      </button>
    </section>
  );
}
