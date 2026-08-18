/**
 * Генерация 12 сцен:
 *   - scene-comm-0.jpg  (перегенерация  -  был стоящий аналитик)
 *   - scene-comm-7.jpg  (перегенерация  -  был стоящий аналитик)
 *   - scene-comm-10.jpg … scene-comm-19.jpg (10 новых)
 * Все персонажи ПОЛНОСТЬЮ СИДЯТ. Модель: nano-banana-2
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const KEY = process.env.KIE_API_KEY || process.env.KIE_GEN_KEY;
if (!KEY) { console.log("NO KEY: set KIE_API_KEY"); process.exit(1); }

const BASE = "https://api.kie.ai";
const H = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const KEEP = `Image 1 is the base office scene  -  keep it PIXEL-PERFECT: same НейроСинк logo, same brick walls, same desks, same monitors, same plants, same lamps, same floor, same sofa, same everything.\n\nCRITICAL: ALL 5 characters remain FULLY SEATED in their chairs at their own desks  -  do NOT stand up, do NOT walk, do NOT lean off their chair, do NOT move to a different location under any circumstances. Every character stays seated at their own desk for the entire scene.\n\n`;
const DONOT = `\n\nDo NOT redraw the room. Do NOT move furniture. Do NOT change lighting. Do NOT move any character away from their desk. Do NOT change clothing or character appearance. Do NOT add new objects.\n\nStyle: same photorealistic 3D render style, same warm amber lighting, same isometric perspective.`;

const SCENES = [
  // ─── ПЕРЕГЕНЕРАЦИЯ ───────────────────────────────────────────────────────
  {
    idx: 0, file: "scene-comm-0",
    title: "Директор повернулся к Аналитику [v2]",
    prompt: KEEP +
      `ONLY change: the MAN IN DARK BLUE SUIT on the FAR LEFT remains SEATED in his chair but has rotated his body slightly toward the right. The GREY-HAIRED MAN in grey vest at CENTER-BACK remains SEATED and is pointing at his own monitor screen with one hand while turning his head toward the director. Both men are FULLY SEATED  -  only their upper bodies rotate slightly. The director is watching with an attentive expression from his own seated position.` +
      DONOT,
  },
  {
    idx: 7, file: "scene-comm-7",
    title: "Аналитик что-то обнаружил [v2]",
    prompt: KEEP +
      `ONLY change: the GREY-HAIRED MAN in grey vest at CENTER-BACK remains FULLY SEATED in his chair and has leaned slightly forward toward his monitors with an excited alert expression, pointing at his screen with one finger from his seated position  -  a discovery moment while sitting. The MAN IN DARK BLUE SUIT on the FAR LEFT has turned his head toward the analyst. Both remain COMPLETELY SEATED in their chairs.` +
      DONOT,
  },

  // ─── НОВЫЕ СЦЕНЫ ─────────────────────────────────────────────────────────
  {
    idx: 10, file: "scene-comm-10",
    title: "Коммуникатор показывает экран Директору",
    prompt: KEEP +
      `ONLY change: the WOMAN at the desk on the RIGHT SIDE remains SEATED and has turned her head toward the far left while gesturing toward her own monitor screen as if sharing something important. The MAN IN DARK BLUE SUIT on the FAR LEFT remains SEATED and has turned his head toward her with an interested expression. All other characters continue working normally.` +
      DONOT,
  },
  {
    idx: 11, file: "scene-comm-11",
    title: "Куратор и Директор переглянулись",
    prompt: KEEP +
      `ONLY change: the YOUNG MAN at the CENTER FRONT desk remains SEATED and has turned his head to the left toward the director with a quick acknowledging glance. The MAN IN DARK BLUE SUIT on the FAR LEFT remains SEATED and has turned his head toward the curator with a brief nod. A quick moment of mutual awareness  -  both remain seated. All other characters continue working normally.` +
      DONOT,
  },
  {
    idx: 12, file: "scene-comm-12",
    title: "Аналитик и Архитектор  -  взаимная проверка",
    prompt: KEEP +
      `ONLY change: the GREY-HAIRED MAN in grey vest at CENTER-BACK remains SEATED and has turned his head toward the right front area with a questioning look. The YOUNG MAN at the RIGHT FRONT desk remains SEATED and has turned his head toward the analyst and gives a subtle confirming nod  -  they have cross-checked their data. Both remain seated at their own desks. All other characters continue working normally.` +
      DONOT,
  },
  {
    idx: 13, file: "scene-comm-13",
    title: "Директор кивает Куратору  -  задача принята",
    prompt: KEEP +
      `ONLY change: the MAN IN DARK BLUE SUIT on the FAR LEFT remains SEATED and gives a clear deliberate nod toward the center front area, a firm "task accepted" gesture from his seated position. The YOUNG MAN at the CENTER FRONT desk remains SEATED and returns a brief acknowledging nod. A crisp team handoff moment  -  both fully seated. All other characters continue working normally.` +
      DONOT,
  },
  {
    idx: 14, file: "scene-comm-14",
    title: "Коммуникатор и Куратор синхронизируются",
    prompt: KEEP +
      `ONLY change: the WOMAN at the desk on the RIGHT SIDE remains SEATED and has turned her head toward the center front desk with a quick check-in expression. The YOUNG MAN at the CENTER FRONT desk remains SEATED and has turned his head toward her with a brief acknowledging smile  -  a quick sync moment. Both remain fully seated. All other characters continue working normally.` +
      DONOT,
  },
  {
    idx: 15, file: "scene-comm-15",
    title: "Архитектор указывает на свой экран  -  готово",
    prompt: KEEP +
      `ONLY change: the YOUNG MAN at the RIGHT FRONT desk remains SEATED and is pointing at his own monitor screen with a satisfied, proud expression  -  "it's done" gesture from his chair. The GREY-HAIRED MAN at CENTER-BACK has turned his head slightly toward him and gives a small approving nod. Both remain fully seated. All other characters continue working normally.` +
      DONOT,
  },
  {
    idx: 16, file: "scene-comm-16",
    title: "Аналитик и Коммуникатор  -  передача данных",
    prompt: KEEP +
      `ONLY change: the GREY-HAIRED MAN in grey vest at CENTER-BACK remains SEATED and has turned his head toward the right side with a knowing look, as if silently passing information. The WOMAN at the desk on the RIGHT SIDE remains SEATED, has turned her head toward him and gives a small acknowledging nod  -  data received. Both fully seated. All other characters continue working normally.` +
      DONOT,
  },
  {
    idx: 17, file: "scene-comm-17",
    title: "Директор сверяется с дедлайном",
    prompt: KEEP +
      `ONLY change: the MAN IN DARK BLUE SUIT on the FAR LEFT remains SEATED and has glanced down at his wrist (checking watch/time) with a focused, slightly urgent expression, then looks back at his monitor  -  a deadline moment. The YOUNG MAN at the CENTER FRONT desk has briefly turned his head toward the director with a concerned attentive look. Both fully seated. All other characters continue working normally.` +
      DONOT,
  },
  {
    idx: 18, file: "scene-comm-18",
    title: "Все одновременно повернулись к центральному монитору",
    prompt: KEEP +
      `ONLY change: all 5 characters have simultaneously turned their heads toward the CENTER-BACK monitors area where the GREY-HAIRED MAN works  -  something important appeared on the main screen. Everyone is looking in that direction from their own seated positions  -  a moment of collective attention. All remain fully seated at their desks.` +
      DONOT,
  },
  {
    idx: 19, file: "scene-comm-19",
    title: "Куратор и Архитектор  -  взаимное одобрение",
    prompt: KEEP +
      `ONLY change: the YOUNG MAN at the CENTER FRONT desk remains SEATED and has turned his head toward the right front desk giving a subtle thumbs-up gesture from his seated position. The YOUNG MAN at the RIGHT FRONT desk remains SEATED and returns a small appreciative nod with a slight smile  -  quiet mutual approval. Both fully seated. All other characters continue working normally.` +
      DONOT,
  },
];

function findImg(o) {
  let f = null;
  const w = (n) => {
    if (f) return;
    if (typeof n === "string") { if (/^https?:\/\/\S+\.(png|jpe?g|webp)(\?|$)/i.test(n)) f = n; }
    else if (Array.isArray(n)) n.forEach(w);
    else if (n && typeof n === "object") Object.values(n).forEach(w);
  };
  w(o); return f;
}

async function upload(filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
  const buf = fs.readFileSync(abs);
  const mime = abs.endsWith(".png") ? "image/png" : "image/jpeg";
  const r = await fetch("https://kieai.redpandaai.co/api/file-base64-upload", {
    method: "POST", headers: H,
    body: JSON.stringify({ base64Data: `data:${mime};base64,${buf.toString("base64")}`, uploadPath: "nss-lab", fileName: path.basename(abs) }),
  });
  const j = await r.json();
  const url = j?.data?.downloadUrl;
  if (!url) { console.log("UPLOAD FAIL", JSON.stringify(j).slice(0, 200)); process.exit(1); }
  console.log("  uploaded:", path.basename(abs), "→", url.slice(0, 70) + "...");
  return url;
}

async function genOne(scene, refUrl) {
  const outPath = path.join(ROOT, "public", "lab", `${scene.file}.jpg`);
  console.log(`\n[${scene.idx}] ${scene.title}`);
  const r = await fetch(`${BASE}/api/v1/jobs/createTask`, {
    method: "POST", headers: H,
    body: JSON.stringify({
      model: "nano-banana-2",
      input: { image_input: [refUrl], prompt: scene.prompt, aspect_ratio: "16:9", output_format: "png", resolution: "2K" },
    }),
  });
  const body = await r.json();
  const taskId = body?.data?.taskId;
  if (!taskId) { console.log("  NO TASKID", JSON.stringify(body).slice(0, 200)); return; }
  console.log("  taskId:", taskId);
  for (let i = 0; i < 120; i++) {
    await sleep(5000);
    let j;
    try { j = await (await fetch(`${BASE}/api/v1/jobs/recordInfo?taskId=${taskId}`, { headers: H })).json(); } catch { continue; }
    const data = j?.data ?? j;
    const st = String(data?.state || "").toLowerCase();
    if (st === "success" || data?.resultJson) {
      let img = null;
      if (data?.resultJson) { try { img = findImg(JSON.parse(data.resultJson)); } catch {} }
      if (!img) img = findImg(j);
      if (img) {
        const buf = Buffer.from(await (await fetch(img)).arrayBuffer());
        fs.writeFileSync(outPath, buf);
        console.log(`  OK ${Math.round(buf.length / 1024)}KB → ${scene.file}.jpg`);
        return;
      }
    }
    if (["fail", "failed", "error"].includes(st)) { console.log("  FAILED", JSON.stringify(data).slice(0, 200)); return; }
    if (i % 3 === 0) console.log(`  ...polling (${i * 5}s) state=${st || "?"}`);
  }
  console.log("  TIMEOUT");
}

console.log("Uploading reference (scene-work-ref.png)...");
const refUrl = await upload("scripts/gen-out/scene-work-ref.png");

for (const scene of SCENES) {
  await genOne(scene, refUrl);
}
console.log("\nAll done → public/lab/scene-comm-0,7,10..19.jpg");
