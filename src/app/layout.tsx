import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Живой цех ИИ-агентов",
  description: "Изометрический офис из webp-слоёв. Кликни по агенту: он поднимет взгляд и скажет реплику.",
  alternates: { canonical: "https://sc32br.github.io/agent-workshop/" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
