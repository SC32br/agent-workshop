# Живой цех ИИ-агентов

Изометрический офис из стопки webp. Пять персонажей работают за столами. Кликни по агенту: слой look кроссфейдится через GSAP, над головой печатается реплика. Справа крутится живой лог.

Демо: https://ns.нейросинк.рф/lab

```mermaid
flowchart TB
  work["scene-work.webp база"]
  work --> auto["авто-оверлеи: look, chat, comm"]
  work --> click["клик по хотспоту"]
  auto --> gsap["GSAP opacity + параллакс"]
  click --> lookN["scene-look-N.webp"]
  lookN --> bubble["пузырь typewriter"]
```

## Запуск

Node 18+.

```bash
npm i && npm run dev
```

Открой http://localhost:3000. Ключ kie для локального просмотра не нужен: кадры уже лежат в public/lab/.

## Как устроены слои

Компонент: src/components/agent-office.tsx. Движок сцены: стопка img + GSAP. Three.js, Pixi и canvas-движок не подключены.

- База: scene-work.webp. Всегда видна.
- Авто-оверлеи: scene-look.webp, scene-chat.webp, scene-chat2.webp, scene-chat3.webp и comm-кадры. GSAP по кругу поднимает opacity на 0.7 с, держит 1-2 с, опускает.
- Клик: невидимые кнопки стоят на spot (стол/тело). По клику включается scene-look-0 ... scene-look-4 - только этот персонаж смотрит в камеру. Пузырь вешается на head.
- Параллакс: слой чуть едет за курсором (pointer: fine, без reduced-motion).

Пять ролей: Директор, Аналитик, Коммуникатор, Архитектор, Куратор.

Кадров 28. scene-comm-8.webp нет: на этой генерации пропали стулья, кадр выкинули. В массиве SCENE_COMMS индексы 0-7, 9-17, 19.

Кадры NeuroSync: изометрия офиса плюс XMP-штамп автора (Sergey Nozdrov / Adobe Photoshop). Штамп намеренный, EXIF/XMP не чистить.

## Перегенерация через kie.ai

Скрипты в scripts/ читают process.env.KIE_API_KEY. Для прогона скопируй .env.example в .env и подставь ключ. Референс scripts/gen-out/scene-work-ref.png в репозиторий не входит.

```bash
node scripts/gen-lab.mjs
node scripts/gen-look-scenes.mjs
node scripts/gen-comm-scenes-v2.mjs
```

Скрипты пишут jpg/png. В репозитории лежат уже сжатые webp, которые крутит компонент.

Перед прогоном выставь переменную окружения KIE_API_KEY (пустое значение в .env.example).

## Для агентов

Краткий индекс: llms.txt.

## Лицензия

MIT. Copyright (c) 2026 Сергей Ноздров.
