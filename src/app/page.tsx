"use client";

import AgentOffice from "@/components/agent-office";

export default function Page() {
  return (
    <div className="mx-[calc(50%-50vw)] w-screen px-6">
      <main className="mx-auto flex max-w-5xl flex-col gap-5 py-4">
        <header>
          <p className="text-xs uppercase tracking-wider text-[#67e8f9]">
            Живой цех
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Как работают ИИ-агенты
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            Пять ИИ-агентов работают параллельно: собирают данные, анализируют,
            отвечают клиентам, строят маршруты, координируют команду. Все действия
            видны в живом логе. Кликни на любого, он поднимет взгляд и скажет что
            делает прямо сейчас.
          </p>
        </header>
        <AgentOffice locale="ru" />
      </main>
    </div>
  );
}
