"use client";

import AgentOffice from "@/components/agent-office";

export default function Page() {
  return (
    <main>
      <header>
        <h1>Живой цех ИИ-агентов</h1>
        <p>
          Изометрический офис из webp-слоёв. Кликни по персонажу: он поднимет
          голову и скажет реплику. Сцены сами переключаются через GSAP.
        </p>
        <p>
          Этот OSS-билд и есть цех. Оригинал: <a href="https://ns.нейросинк.рф/lab">ns.нейросинк.рф/lab</a>
        </p>
      </header>
      <AgentOffice locale="ru" />
    </main>
  );
}
