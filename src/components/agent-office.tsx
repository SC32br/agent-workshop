"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import gsap from "gsap";

/* ------------------------------------------------------------------ */
/*  Живой цех ИИ-агентов. GSAP crossfade сцен + параллакс.            */
/*  Клик на агента → look-сцена (агент поднимает голову) + пузырь с   */
/*  typewriter-анимацией (первое лицо, рандомная фраза).              */
/* ------------------------------------------------------------------ */

type L = { ru: string; en: string };

type Role = {
  name: L;
  label: L;
  level: number;
  quote: L;
  color: string;
  /** Позиция хотспот-кольца (уровень стола/тела) — % сцены 16:9 */
  spot: { x: number; y: number };
  /** Куда вешать пузырь: bottom=head.y%, center=head.x% (ВЫШЕ головы) */
  head: { x: number; y: number };
  /** Фразы от первого лица для пузыря (typewriter) */
  say: { ru: string[]; en: string[] };
  doing: L;
  stats: { k: L; v: number }[];
  tasks: L[];
};

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const lab = (file: string) => `${BASE}/lab/${file}`;

const SCENE_WORK  = lab("scene-work.webp");
const SCENE_LOOK  = lab("scene-look.webp");
const SCENE_CHAT  = lab("scene-chat.webp");
const SCENE_CHAT2 = lab("scene-chat2.webp");
const SCENE_CHAT3 = lab("scene-chat3.webp");
// Индивидуальные сцены: только один персонаж смотрит на зрителя
const SCENE_LOOKS = [
  lab("scene-look-0.webp"),
  lab("scene-look-1.webp"),
  lab("scene-look-2.webp"),
  lab("scene-look-3.webp"),
  lab("scene-look-4.webp"),
] as const;
// 18 сцен коммуникаций (исключена только comm-8 — пропали стулья)
const SCENE_COMMS = [
  lab("scene-comm-0.webp"),
  lab("scene-comm-1.webp"),
  lab("scene-comm-2.webp"),
  lab("scene-comm-3.webp"),
  lab("scene-comm-4.webp"),
  lab("scene-comm-5.webp"),
  lab("scene-comm-6.webp"),
  lab("scene-comm-7.webp"),
  lab("scene-comm-9.webp"),
  lab("scene-comm-10.webp"),
  lab("scene-comm-11.webp"),
  lab("scene-comm-12.webp"),
  lab("scene-comm-13.webp"),
  lab("scene-comm-14.webp"),
  lab("scene-comm-15.webp"),
  lab("scene-comm-16.webp"),
  lab("scene-comm-17.webp"),
  lab("scene-comm-19.webp"),
] as const;

const ROLES: Role[] = [
  {
    name: { ru: "Директор", en: "Director" },
    label: { ru: "Сбор данных", en: "Data harvester" },
    level: 37,
    quote: { ru: "Дай источник, достану полезное. HTML для меня как открытая книга.", en: "Give me a source, I'll pull the signal. HTML is an open book." },
    color: "#67e8f9",
    spot: { x: 20, y: 60 },
    head: { x: 20, y: 45 },
    say: {
      ru: [
        "собираю данные с источника",
        "нашёл {n} лидов, передаю Аналитику",
        "парсю следующую страницу",
        "обхожу базу контактов",
        "загружаю {n} строк в пайплайн",
      ],
      en: [
        "scraping the source right now",
        "found {n} leads, passing to Analyst",
        "parsing the next page",
        "walking through the contact database",
        "loading {n} rows into the pipeline",
      ],
    },
    doing: { ru: "собирает данные с источника", en: "scraping the source" },
    stats: [
      { k: { ru: "Скорость", en: "Speed" }, v: 92 },
      { k: { ru: "Точность", en: "Accuracy" }, v: 78 },
      { k: { ru: "Контекст", en: "Context" }, v: 60 },
      { k: { ru: "Автономность", en: "Autonomy" }, v: 80 },
    ],
    tasks: [
      { ru: "собрал {n} строк с источника", en: "scraped {n} rows" },
      { ru: "нашёл {n} потенциальных лидов", en: "found {n} potential leads" },
      { ru: "передал пакет Аналитику", en: "handed a batch to the Analyst" },
    ],
  },
  {
    name: { ru: "Аналитик", en: "Analyst" },
    label: { ru: "Скоринг и выводы", en: "Scoring & insight" },
    level: 35,
    quote: { ru: "Шум убрал, смысл оставил. Нахожу закономерность там, где другие видят хаос.", en: "Cut the noise, kept the meaning. I find patterns where others see chaos." },
    color: "#fcd34d",
    spot: { x: 40, y: 44 },
    head: { x: 40, y: 31 },
    say: {
      ru: [
        "считаю скоринг по сегменту",
        "нашёл интересный паттерн в данных",
        "обрабатываю выгрузку от Директора",
        "строю модель кластеризации",
        "фильтрую шум, оставляю смысл",
      ],
      en: [
        "computing the segment scoring",
        "found an interesting pattern",
        "processing the Director's data batch",
        "building the clustering model",
        "filtering out noise, keeping the signal",
      ],
    },
    doing: { ru: "считает скоринг", en: "computing the scoring" },
    stats: [
      { k: { ru: "Скорость", en: "Speed" }, v: 55 },
      { k: { ru: "Точность", en: "Accuracy" }, v: 94 },
      { k: { ru: "Контекст", en: "Context" }, v: 82 },
      { k: { ru: "Автономность", en: "Autonomy" }, v: 70 },
    ],
    tasks: [
      { ru: "построил скоринг", en: "built the scoring" },
      { ru: "выделил {n} сильных сегмента", en: "flagged {n} strong segments" },
      { ru: "передал приоритетные контакты Коммуникатору", en: "passed priority contacts on" },
    ],
  },
  {
    name: { ru: "Коммуникатор", en: "Communicator" },
    label: { ru: "Ответы клиентам", en: "Client replies" },
    level: 39,
    quote: { ru: "Отвечаю так, будто клиент уже важен. Диалог закрыт мягко, лид прогрет.", en: "I answer as if the client already matters. Closed softly, lead warmed up." },
    color: "#c4b5fd",
    spot: { x: 82, y: 47 },
    head: { x: 82, y: 34 },
    say: {
      ru: [
        "отвечаю клиенту в чате",
        "закрываю диалог с лидом",
        "формирую персональный ответ",
        "передаю тёплый контакт в CRM",
        "обрабатываю входящий запрос",
      ],
      en: [
        "replying to a client in chat",
        "closing a lead conversation",
        "crafting a personalized reply",
        "sending a warm contact to CRM",
        "processing an incoming request",
      ],
    },
    doing: { ru: "отвечает клиенту", en: "answering a client" },
    stats: [
      { k: { ru: "Скорость", en: "Speed" }, v: 88 },
      { k: { ru: "Точность", en: "Accuracy" }, v: 80 },
      { k: { ru: "Контекст", en: "Context" }, v: 70 },
      { k: { ru: "Автономность", en: "Autonomy" }, v: 75 },
    ],
    tasks: [
      { ru: "ответил клиенту без задержки", en: "answered a client instantly" },
      { ru: "закрыл диалог с лидом", en: "closed a lead chat" },
      { ru: "передал тёплый контакт в CRM", en: "pushed a warm contact to CRM" },
    ],
  },
  {
    name: { ru: "Архитектор", en: "Architect" },
    label: { ru: "Сценарии и маршруты", en: "Workflows & routing" },
    level: 42,
    quote: { ru: "Связал агентов в один процесс. Маршрут пересобран, сценарий стал короче.", en: "Wired the agents into one process. Route rebuilt, the flow got shorter." },
    color: "#a5b4fc",
    spot: { x: 84, y: 70 },
    head: { x: 84, y: 57 },
    say: {
      ru: [
        "пересобираю маршрут задачи",
        "обновляю цепочку агентов",
        "синхронизирую роли в системе",
        "оптимизирую флоу выполнения",
        "проверяю зависимости сценария",
      ],
      en: [
        "rebuilding the task route",
        "updating the agent pipeline",
        "syncing roles across the system",
        "optimizing the execution flow",
        "checking scenario dependencies",
      ],
    },
    doing: { ru: "пересобирает маршрут", en: "rebuilding the route" },
    stats: [
      { k: { ru: "Скорость", en: "Speed" }, v: 70 },
      { k: { ru: "Точность", en: "Accuracy" }, v: 85 },
      { k: { ru: "Контекст", en: "Context" }, v: 95 },
      { k: { ru: "Автономность", en: "Autonomy" }, v: 90 },
    ],
    tasks: [
      { ru: "проверил маршрут задачи", en: "checked a task route" },
      { ru: "синхронизировал роли", en: "synced the roles" },
      { ru: "обновил цепочку выполнения", en: "updated the pipeline" },
    ],
  },
  {
    name: { ru: "Куратор", en: "Curator" },
    label: { ru: "Синхронизация команды", en: "Team lead" },
    level: 45,
    quote: { ru: "Синхронизирую команду. Нагрузка распределена, контекст обновлён для всех.", en: "I keep the team in sync. Load balanced, context refreshed for everyone." },
    color: "#6ee7b7",
    spot: { x: 58, y: 64 },
    head: { x: 58, y: 52 },
    say: {
      ru: [
        "распределяю задачи по команде",
        "балансирую нагрузку агентов",
        "выбрал лучшего исполнителя",
        "обновляю приоритеты очереди",
        "синхронизирую контекст команды",
      ],
      en: [
        "routing tasks across the team",
        "balancing the agent workload",
        "picked the best executor",
        "updating the queue priorities",
        "syncing the team context",
      ],
    },
    doing: { ru: "распределяет задачи", en: "routing tasks" },
    stats: [
      { k: { ru: "Скорость", en: "Speed" }, v: 70 },
      { k: { ru: "Точность", en: "Accuracy" }, v: 88 },
      { k: { ru: "Контекст", en: "Context" }, v: 96 },
      { k: { ru: "Автономность", en: "Autonomy" }, v: 92 },
    ],
    tasks: [
      { ru: "распределил {n} задач между агентами", en: "routed {n} tasks across agents" },
      { ru: "выбрал лучшего исполнителя", en: "picked the best agent" },
      { ru: "синхронизировал команду", en: "synced the whole team" },
    ],
  },
];

const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const frnd = (a: number, b: number) => a + Math.random() * (b - a);

const LOOK_EVENTS: L[] = [
  { ru: "команда прервалась, заметили посетителя", en: "team paused, noticed a visitor" },
  { ru: "агенты отвлеклись от экранов", en: "agents looked up from their screens" },
  { ru: "контакт: команда смотрит на вас", en: "eye contact: the team is watching you" },
];
const CHAT_EVENTS: L[][] = [
  [
    { ru: "директор обсуждает приоритеты с аналитиком", en: "director discussing priorities with analyst" },
    { ru: "директор уточняет детали по проекту", en: "director clarifying project details" },
    { ru: "быстрое совещание: распределение задач", en: "quick sync: task assignment" },
  ],
  [
    { ru: "коллеги согласовывают результаты", en: "colleagues syncing on results" },
    { ru: "обсуждение: следующий шаг в задаче", en: "discussing the next step" },
    { ru: "быстрый обмен данными между агентами", en: "quick data exchange between agents" },
  ],
  [
    { ru: "аналитик обнаружил паттерн, сигнализирует директору", en: "analyst found a pattern, alerting director" },
    { ru: "аналитик: найдены аномалии в данных", en: "analyst: anomalies found in data" },
    { ru: "срочный апдейт: аналитик → директор", en: "urgent update: analyst → director" },
  ],
];
// 18 comm-сцен: 0-7, 9-17, 19
const COMM_EVENTS: L[][] = [
  // comm-0: Директор и Аналитик смотрят на экран
  [
    { ru: "директор и аналитик разбирают данные вместе", en: "director and analyst reviewing data together" },
    { ru: "директор подключился к экрану аналитика", en: "director joined the analyst's screen" },
  ],
  // comm-1: Аналитик сигнализирует Директору
  [
    { ru: "аналитик нашёл кое-что важное, сигнал директору", en: "analyst found something, flagging the director" },
    { ru: "аналитик привлекает внимание директора", en: "analyst catching the director's attention" },
  ],
  // comm-2: Коммуникатор и Архитектор переглянулись
  [
    { ru: "коммуникатор и архитектор синхронизировались", en: "communicator and architect synced up" },
    { ru: "тихое согласие: план принят", en: "silent agreement: plan accepted" },
  ],
  // comm-3: Архитектор объясняет Куратору
  [
    { ru: "архитектор объясняет маршрут куратору", en: "architect briefing the curator on the route" },
    { ru: "архитектор передаёт контекст куратору", en: "architect handing context to curator" },
  ],
  // comm-4: Директор обращается ко всем
  [
    { ru: "директор: важное обновление для команды", en: "director: key update for the team" },
    { ru: "директор обращается к команде", en: "director addressing the team" },
  ],
  // comm-5: Аналитик и Коммуникатор кивают
  [
    { ru: "аналитик и коммуникатор в согласии", en: "analyst and communicator in agreement" },
    { ru: "тихая координация: аналитик ↔ коммуникатор", en: "quiet sync: analyst ↔ communicator" },
  ],
  // comm-6: Куратор даёт сигнал
  [
    { ru: "куратор подтверждает выполнение задачи", en: "curator confirms task completion" },
    { ru: "куратор: сигнал готовности команде", en: "curator: go-signal to the team" },
  ],
  // comm-7: Аналитик что-то обнаружил
  [
    { ru: "аналитик: обнаружена аномалия в данных", en: "analyst: anomaly detected in data" },
    { ru: "аналитик нашёл паттерн, фиксирует открытие", en: "analyst spotted a pattern, marking the find" },
  ],
  // comm-9: Синхронизация — все переглянулись
  [
    { ru: "команда синхронизировалась, все в курсе", en: "team synced, everyone aligned" },
    { ru: "быстрый переглянулись: всё под контролем", en: "quick team check-in: all clear" },
  ],
  // comm-10: Коммуникатор показывает экран Директору
  [
    { ru: "коммуникатор показала экран директору", en: "communicator sharing her screen with the director" },
    { ru: "коммуникатор: смотри сюда, директор включился", en: "communicator: look at this, director tuned in" },
  ],
  // comm-11: Куратор и Директор переглянулись
  [
    { ru: "куратор и директор быстро переглянулись", en: "curator and director exchanged a quick glance" },
    { ru: "тихий сигнал: куратор ↔ директор", en: "quiet signal: curator ↔ director" },
  ],
  // comm-12: Аналитик и Архитектор — взаимная проверка
  [
    { ru: "аналитик и архитектор сверяют данные", en: "analyst and architect cross-checking data" },
    { ru: "тихая проверка: аналитик ↔ архитектор", en: "quiet cross-check: analyst ↔ architect" },
  ],
  // comm-13: Директор кивает Куратору
  [
    { ru: "директор передаёт задачу куратору", en: "director handing off a task to curator" },
    { ru: "директор: задача принята, куратор кивает", en: "director: task accepted, curator nods" },
  ],
  // comm-14: Коммуникатор и Куратор синхронизируются
  [
    { ru: "коммуникатор и куратор синхронизировались", en: "communicator and curator synced up" },
    { ru: "быстрый переглядулись: коммуникатор ↔ куратор", en: "quick check-in: communicator ↔ curator" },
  ],
  // comm-15: Архитектор указывает на свой экран
  [
    { ru: "архитектор: маршрут готов, показывает результат", en: "architect: route ready, showing the result" },
    { ru: "архитектор завершил сценарий", en: "architect finished the scenario" },
  ],
  // comm-16: Аналитик и Коммуникатор — передача данных
  [
    { ru: "аналитик передаёт данные коммуникатору", en: "analyst passing data to communicator" },
    { ru: "аналитик ↔ коммуникатор: приоритеты обновлены", en: "analyst ↔ communicator: priorities updated" },
  ],
  // comm-17: Директор сверяется с дедлайном
  [
    { ru: "директор сверяется с дедлайном", en: "director checking the deadline" },
    { ru: "директор: контроль времени, команда в курсе", en: "director: time check, team notified" },
  ],
  // comm-19: Куратор и Архитектор — взаимное одобрение
  [
    { ru: "куратор и архитектор: задача закрыта", en: "curator and architect: task closed" },
    { ru: "тихое одобрение: куратор ↔ архитектор", en: "quiet approval: curator ↔ architect" },
  ],
];

export default function AgentOffice({ locale = "ru" }: { locale?: "ru" | "en" }) {
  const [events, setEvents] = useState<{ id: number; color: string; who: string; text: string }[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // Пузырь
  const [layersOn, setLayersOn] = useState(false);
  const [bubble, setBubble] = useState<number | null>(null);
  const [bubbleFullText, setBubbleFullText] = useState("");
  const [typedLen, setTypedLen] = useState(0);
  const bubbleTimer  = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const typingTimer  = useRef<ReturnType<typeof setInterval> | null>(null);

  const evId = useRef(0);
  const localeRef = useRef(locale);
  localeRef.current = locale;

  const sceneRef       = useRef<HTMLDivElement>(null);
  const layerRef       = useRef<HTMLDivElement>(null);
  const logRef         = useRef<HTMLDivElement>(null);
  const lookImgRef     = useRef<HTMLImageElement>(null);
  const chatImgRef     = useRef<HTMLImageElement>(null);
  const chat2ImgRef    = useRef<HTMLImageElement>(null);
  const chat3ImgRef    = useRef<HTMLImageElement>(null);
  // 5 индивидуальных look-overlay: каждый для своего персонажа
  const clickLookRef0  = useRef<HTMLImageElement>(null);
  const clickLookRef1  = useRef<HTMLImageElement>(null);
  const clickLookRef2  = useRef<HTMLImageElement>(null);
  const clickLookRef3  = useRef<HTMLImageElement>(null);
  const clickLookRef4  = useRef<HTMLImageElement>(null);
  const clickLookRefs  = [clickLookRef0, clickLookRef1, clickLookRef2, clickLookRef3, clickLookRef4];
  // 18 авто-overlay: сцены коммуникаций 0-7, 9-17, 19
  const commRef0  = useRef<HTMLImageElement>(null);
  const commRef1  = useRef<HTMLImageElement>(null);
  const commRef2  = useRef<HTMLImageElement>(null);
  const commRef3  = useRef<HTMLImageElement>(null);
  const commRef4  = useRef<HTMLImageElement>(null);
  const commRef5  = useRef<HTMLImageElement>(null);
  const commRef6  = useRef<HTMLImageElement>(null);
  const commRef7  = useRef<HTMLImageElement>(null);
  const commRef8  = useRef<HTMLImageElement>(null);
  const commRef9  = useRef<HTMLImageElement>(null);
  const commRef10 = useRef<HTMLImageElement>(null);
  const commRef11 = useRef<HTMLImageElement>(null);
  const commRef12 = useRef<HTMLImageElement>(null);
  const commRef13 = useRef<HTMLImageElement>(null);
  const commRef14 = useRef<HTMLImageElement>(null);
  const commRef15 = useRef<HTMLImageElement>(null);
  const commRef16 = useRef<HTMLImageElement>(null);
  const commRef17 = useRef<HTMLImageElement>(null);

  const openBubble = (i: number) => {
    setLayersOn(true);
    if (bubbleTimer.current)  clearTimeout(bubbleTimer.current);
    if (typingTimer.current)  clearInterval(typingTimer.current);

    const r = ROLES[i];
    const sayArr = r.say[localeRef.current as "ru" | "en"];
    const rawText = sayArr[rnd(0, sayArr.length - 1)];
    const fullText = rawText.replace("{n}", String(rnd(5, 200)));

    setBubble(i);
    setBubbleFullText(fullText);
    setTypedLen(0);

    // typewriter: 38 мс / символ
    let idx = 0;
    typingTimer.current = setInterval(() => {
      idx++;
      setTypedLen(idx);
      if (idx >= fullText.length) {
        clearInterval(typingTimer.current!);
        typingTimer.current = null;
      }
    }, 38);

    // автозакрытие
    const delay = fullText.length * 38 + 2000;
    bubbleTimer.current = setTimeout(() => setBubble(null), delay);

    // look-сцена: только этот персонаж поднимает голову
    clickLookRefs.forEach((r) => {
      if (r.current) { gsap.killTweensOf(r.current); gsap.set(r.current, { opacity: 0 }); }
    });
    const el = clickLookRefs[i]?.current;
    if (el) {
      const playLook = () => {
        gsap.killTweensOf(el);
        gsap.timeline()
          .to(el, { opacity: 1, duration: 0.4, ease: "power2.inOut" })
          .to(el, { opacity: 0, duration: 0.5, ease: "power2.inOut" }, "+=1.5");
      };
      if (el.currentSrc) {
        playLook();
      } else {
        const onLoad = () => {
          el.removeEventListener("load", onLoad);
          playLook();
        };
        el.addEventListener("load", onLoad);
      }
    }
  };

  // Активный агент по кругу + лог
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const emit = (r: Role) => {
      const tpl = r.tasks[rnd(0, r.tasks.length - 1)];
      const text = tpl[locale].replace("{n}", String(rnd(3, 240)));
      evId.current += 1;
      setEvents((p) => [{ id: evId.current, color: r.color, who: r.name[locale], text }, ...p].slice(0, 8));
    };
    if (reduce) { ROLES.forEach(emit); return; }
    const tick = () => {
      const i = rnd(0, ROLES.length - 1);
      startTransition(() => {
        setActive(i);
        emit(ROLES[i]);
      });
    };
    tick();
    const id = setInterval(tick, 2800);
    return () => clearInterval(id);
  }, [locale]);

  // GSAP: параллакс
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        const layer = layerRef.current;
        if (!layer) return;
        gsap.set(layer, { scale: 1.06 });
        const lx = gsap.quickTo(layer, "xPercent", { duration: 0.7, ease: "power3" });
        const ly = gsap.quickTo(layer, "yPercent", { duration: 0.7, ease: "power3" });
        let rafId = 0;
        const onMove = (e: MouseEvent) => {
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            const r = scene.getBoundingClientRect();
            lx(-(e.clientX - r.left) / r.width  * 2.4 + 1.2);
            ly(-(e.clientY - r.top)  / r.height * 2.4 + 1.2);
          });
        };
        const onLeave = () => { cancelAnimationFrame(rafId); lx(0); ly(0); };
        scene.addEventListener("mousemove", onMove);
        scene.addEventListener("mouseleave", onLeave);
        return () => { scene.removeEventListener("mousemove", onMove); scene.removeEventListener("mouseleave", onLeave); };
      });
    }, scene);
    return () => ctx.revert();
  }, []);

  // GSAP: авто-crossfade overlay-сцен — только после pointer (когда src уже есть)
  useEffect(() => {
    if (!layersOn) return;
    const scene = sceneRef.current;
    if (!scene) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let cancelled = false;
        const TEAM_WHO: L = { ru: "Команда", en: "Team" };
        const overlays = [
          { el: lookImgRef.current,  pool: LOOK_EVENTS,    color: "#94a3b8",      who: TEAM_WHO },
          { el: chatImgRef.current,  pool: CHAT_EVENTS[0], color: ROLES[0].color, who: ROLES[0].name },
          { el: chat2ImgRef.current, pool: CHAT_EVENTS[1], color: ROLES[1].color, who: ROLES[1].name },
          { el: chat3ImgRef.current, pool: CHAT_EVENTS[2], color: ROLES[2].color, who: ROLES[2].name },
          // comm scenes: 0-7, 9-17, 19
          { el: commRef0.current,  pool: COMM_EVENTS[0],  color: ROLES[0].color, who: TEAM_WHO },
          { el: commRef1.current,  pool: COMM_EVENTS[1],  color: ROLES[1].color, who: ROLES[1].name },
          { el: commRef2.current,  pool: COMM_EVENTS[2],  color: ROLES[2].color, who: TEAM_WHO },
          { el: commRef3.current,  pool: COMM_EVENTS[3],  color: ROLES[3].color, who: TEAM_WHO },
          { el: commRef4.current,  pool: COMM_EVENTS[4],  color: ROLES[0].color, who: ROLES[0].name },
          { el: commRef5.current,  pool: COMM_EVENTS[5],  color: ROLES[1].color, who: TEAM_WHO },
          { el: commRef6.current,  pool: COMM_EVENTS[6],  color: ROLES[4].color, who: ROLES[4].name },
          { el: commRef7.current,  pool: COMM_EVENTS[7],  color: ROLES[1].color, who: ROLES[1].name },
          { el: commRef8.current,  pool: COMM_EVENTS[8],  color: "#94a3b8",      who: TEAM_WHO },
          { el: commRef9.current,  pool: COMM_EVENTS[9],  color: ROLES[2].color, who: TEAM_WHO },
          { el: commRef10.current, pool: COMM_EVENTS[10], color: ROLES[4].color, who: TEAM_WHO },
          { el: commRef11.current, pool: COMM_EVENTS[11], color: ROLES[1].color, who: TEAM_WHO },
          { el: commRef12.current, pool: COMM_EVENTS[12], color: ROLES[0].color, who: ROLES[0].name },
          { el: commRef13.current, pool: COMM_EVENTS[13], color: ROLES[2].color, who: TEAM_WHO },
          { el: commRef14.current, pool: COMM_EVENTS[14], color: ROLES[3].color, who: ROLES[3].name },
          { el: commRef15.current, pool: COMM_EVENTS[15], color: ROLES[1].color, who: TEAM_WHO },
          { el: commRef16.current, pool: COMM_EVENTS[16], color: ROLES[0].color, who: ROLES[0].name },
          { el: commRef17.current, pool: COMM_EVENTS[17], color: ROLES[4].color, who: ROLES[4].name },
        ].filter((o) => o.el) as { el: HTMLImageElement; pool: L[]; color: string; who: L }[];
        overlays.forEach((o) => gsap.set(o.el, { opacity: 0 }));
        clickLookRefs.forEach((r) => { if (r.current) gsap.set(r.current, { opacity: 0 }); });

        let seqIdx = 0;
        const showScene = (el: HTMLElement, hold: number, next: () => void) =>
          gsap.timeline({ onComplete: next })
            .to(el, { opacity: 1, duration: 0.7, ease: "power2.inOut" })
            .to(el, { opacity: 0, duration: 0.7, ease: "power2.inOut" }, `>+${hold}`);

        const tick = () => {
          if (cancelled) return;
          const pick = overlays[seqIdx % overlays.length];
          seqIdx++;
          if (!pick) { gsap.delayedCall(frnd(2, 5), tick); return; }
          if (!pick.el.currentSrc) { gsap.delayedCall(frnd(2, 5), tick); return; }
          evId.current += 1;
          const ev = pick.pool[rnd(0, pick.pool.length - 1)];
          setEvents((p) => [{ id: evId.current, color: pick.color, who: pick.who[localeRef.current], text: ev[localeRef.current] }, ...p].slice(0, 8));
          showScene(pick.el, frnd(1, 2), () => gsap.delayedCall(frnd(1, 3), tick));
        };
        gsap.delayedCall(0.8, tick);
        return () => { cancelled = true; };
      });
    }, scene);
    return () => ctx.revert();
  }, [layersOn]);

  // Синхронизируем высоту лог-панели со сценой
  useEffect(() => {
    const scene = sceneRef.current;
    const log   = logRef.current;
    if (!scene || !log) return;
    let rafId = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => { log.style.maxHeight = `${scene.offsetHeight}px`; });
    });
    ro.observe(scene);
    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, []);

  const hint = locale === "en" ? "Click an agent" : "Кликни на агента";

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div
        ref={sceneRef}
        className="relative aspect-[16/9] overflow-hidden rounded-2xl border bg-[#1a130d]"
        onPointerEnter={() => setLayersOn(true)}
        onPointerDown={() => setLayersOn(true)}
      >
        <div ref={layerRef} className="absolute inset-0 will-change-transform">
          {/* База */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SCENE_WORK} alt={locale === "en" ? "AI agents office" : "Офис ИИ-агентов"} fetchPriority="high" decoding="async" width={1918} height={1078} sizes="(min-width: 1024px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
          {/* Авто-overlays */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={lookImgRef}  src={layersOn ? SCENE_LOOK : undefined}  alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={chatImgRef}  src={layersOn ? SCENE_CHAT : undefined}  alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={chat2ImgRef} src={layersOn ? SCENE_CHAT2 : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={chat3ImgRef} src={layersOn ? SCENE_CHAT3 : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* Click-look overlays — по одному на каждого персонажа */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={clickLookRef0} src={layersOn ? SCENE_LOOKS[0] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={clickLookRef1} src={layersOn ? SCENE_LOOKS[1] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={clickLookRef2} src={layersOn ? SCENE_LOOKS[2] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={clickLookRef3} src={layersOn ? SCENE_LOOKS[3] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={clickLookRef4} src={layersOn ? SCENE_LOOKS[4] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* Авто-overlay: сцены коммуникаций 0-7, 9-17, 19 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef0} src={layersOn ? SCENE_COMMS[0] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef1} src={layersOn ? SCENE_COMMS[1] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef2} src={layersOn ? SCENE_COMMS[2] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef3} src={layersOn ? SCENE_COMMS[3] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef4} src={layersOn ? SCENE_COMMS[4] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef5} src={layersOn ? SCENE_COMMS[5] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef6} src={layersOn ? SCENE_COMMS[6] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef7} src={layersOn ? SCENE_COMMS[7] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef8}  src={layersOn ? SCENE_COMMS[8] : undefined}  alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef9}  src={layersOn ? SCENE_COMMS[9] : undefined}  alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef10} src={layersOn ? SCENE_COMMS[10] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef11} src={layersOn ? SCENE_COMMS[11] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef12} src={layersOn ? SCENE_COMMS[12] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef13} src={layersOn ? SCENE_COMMS[13] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef14} src={layersOn ? SCENE_COMMS[14] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef15} src={layersOn ? SCENE_COMMS[15] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef16} src={layersOn ? SCENE_COMMS[16] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={commRef17} src={layersOn ? SCENE_COMMS[17] : undefined} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />

          {/* Хотспоты (кольца + ping) — на уровне стола/тела */}
          {ROLES.map((r, i) => (
            <button
              key={r.name.ru}
              onClick={() => openBubble(i)}
              aria-label={r.name[locale]}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${r.spot.x}%`, top: `${r.spot.y}%` }}
            >
              {active === i && (
                <span
                  className="absolute left-1/2 top-1/2 -z-0 size-16 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full opacity-30"
                  style={{ backgroundColor: r.color }}
                />
              )}
              <span
                className="block size-9 rounded-full ring-2 ring-transparent transition group-hover:bg-white/10 group-hover:ring-white/70"
                style={bubble === i ? { boxShadow: `0 0 0 2px ${r.color}` } : undefined}
              />
            </button>
          ))}

          {/* Пузыри — позиционируются относительно головы персонажа */}
          {ROLES.map((r, i) =>
            bubble === i ? (
              <span
                key={`bubble-${i}`}
                className="pointer-events-none absolute z-20 animate-in fade-in zoom-in-95 duration-200"
                style={{
                  left: `${r.head.x}%`,
                  top:  `${r.head.y}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                {/* Тело пузыря — всегда тёмный фон */}
                <span
                  className="flex flex-col items-center gap-0.5 rounded-xl border bg-zinc-900/95 px-3 py-2 shadow-xl backdrop-blur-sm"
                  style={{ borderColor: r.color + "80" }}
                >
                  <span className="text-[11px] font-semibold" style={{ color: r.color }}>
                    {r.name[locale]}
                  </span>
                  <span className="whitespace-nowrap text-[10px] text-zinc-300 min-h-[1.1em]">
                    {bubbleFullText.slice(0, typedLen)}
                    {typedLen < bubbleFullText.length && (
                      <span className="inline-block w-px h-[10px] bg-zinc-400 ml-px align-middle animate-pulse" />
                    )}
                  </span>
                </span>
                {/* Хвостик — вниз к персонажу */}
                <span
                  className="mx-auto block h-2 w-2 rotate-45 border-b border-r bg-zinc-900/95"
                  style={{ borderColor: r.color + "80", marginTop: "-5px" }}
                />
              </span>
            ) : null
          )}
        </div>

        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs backdrop-blur">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-green-500" />
          </span>
          {locale === "en" ? "5 agents · live" : "5 агентов · в работе"}
        </div>
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border bg-background/60 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
          {hint}
        </div>
      </div>

      <div ref={logRef} className="flex flex-col overflow-hidden rounded-2xl border bg-card">
        <div className="shrink-0 border-b px-4 py-3 text-sm font-semibold">
          {locale === "en" ? "Live event log" : "Живой лог событий"}
        </div>
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 text-xs">
          {events.map((e) => (
            <li key={e.id} className="flex gap-2 leading-snug">
              <span className="mt-1 size-2 shrink-0 rounded-full" style={{ backgroundColor: e.color }} />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{e.who}</span> {e.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
