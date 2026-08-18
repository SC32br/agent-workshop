/**
 * Генерация 5 look-сцен: только один персонаж смотрит на зрителя.
 * Модель: nano-banana-2 | Реф: scene-work-ref.png (PIXEL-PERFECT)
 * Результат: public/lab/scene-look-0.jpg … scene-look-4.jpg
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const KEY = process.env.KIE_API_KEY || process.env.KIE_GEN_KEY;
if (!KEY) { console.log("NO KEY: set KIE_API_KEY"); process.exit(1); }

const BASE = "https://api.kie.ai";
const H = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const BASE_KEEP = `Image 1 is the base office scene  -  keep it PIXEL-PERFECT: same НейроСинк logo, same brick walls, same desks, same monitors, same plants, same lamps, same floor, same sofa, same everything.\n\n`;
const BASE_DONOT = `\n\nAll other 4 characters continue working exactly as in Image 1  -  they do NOT look up, do NOT change pose.\n\nDo NOT redraw the room. Do NOT move furniture. Do NOT change lighting. Do NOT change clothing or character appearance. Do NOT add new objects.\n\nStyle: same photorealistic 3D render style, same warm amber lighting, same isometric perspective.`;

const CHARS = [
  {
    idx: 0,
    name: "Директор",
    prompt: BASE_KEEP +
      `ONLY change: the MAN IN DARK BLUE BUSINESS SUIT at the FAR LEFT desk has turned his head and is looking directly at the viewer/camera with a calm, confident expression  -  slight head raise, eyes to camera.` +
      BASE_DONOT,
  },
  {
    idx: 1,
    name: "Аналитик",
    prompt: BASE_KEEP +
      `ONLY change: the GREY-HAIRED MAN in grey vest at the CENTER-BACK monitors has turned his head and is looking directly at the viewer/camera with a focused, intelligent expression  -  slight head raise, eyes to camera.` +
      BASE_DONOT,
  },
  {
    idx: 2,
    name: "Коммуникатор",
    prompt: BASE_KEEP +
      `ONLY change: the WOMAN at the desk on the RIGHT SIDE of the scene has turned her head and is looking directly at the viewer/camera with a friendly, professional expression  -  slight head raise, eyes to camera.` +
      BASE_DONOT,
  },
  {
    idx: 3,
    name: "Архитектор",
    prompt: BASE_KEEP +
      `ONLY change: the YOUNG MAN at the RIGHT FRONT desk has turned his head and is looking directly at the viewer/camera with a calm, attentive expression  -  slight head raise, eyes to camera.` +
      BASE_DONOT,
  },
  {
    idx: 4,
    name: "Куратор",
    prompt: BASE_KEEP +
      `ONLY change: the YOUNG MAN at the CENTER FRONT desk has turned his head and is looking directly at the viewer/camera with a natural, calm expression  -  slight head raise, eyes to camera.` +
      BASE_DONOT,
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
  w(o);
  return f;
}

async function upload(filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
  const buf = fs.readFileSync(abs);
  const mime = abs.endsWith(".png") ? "image/png" : "image/jpeg";
  const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
  const r = await fetch("https://kieai.redpandaai.co/api/file-base64-upload", {
    method: "POST", headers: H,
    body: JSON.stringify({ base64Data: dataUrl, uploadPath: "nss-lab", fileName: path.basename(abs) }),
  });
  const j = await r.json();
  const url = j?.data?.downloadUrl;
  if (!url) { console.log("UPLOAD FAIL", JSON.stringify(j).slice(0, 200)); process.exit(1); }
  console.log("  uploaded:", path.basename(abs), "→", url.slice(0, 70) + "...");
  return url;
}

async function genOne(char, refUrl) {
  const outPath = path.join(ROOT, "public", "lab", `scene-look-${char.idx}.jpg`);
  console.log(`\n[${char.idx}] Generating ${char.name}...`);

  const r = await fetch(`${BASE}/api/v1/jobs/createTask`, {
    method: "POST", headers: H,
    body: JSON.stringify({
      model: "nano-banana-2",
      input: { image_input: [refUrl], prompt: char.prompt, aspect_ratio: "16:9", output_format: "png", resolution: "2K" },
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
        console.log(`  OK ${Math.round(buf.length / 1024)}KB → scene-look-${char.idx}.jpg`);
        return;
      }
    }
    if (["fail", "failed", "error"].includes(st)) { console.log("  FAILED", JSON.stringify(data).slice(0, 200)); return; }
    if (i % 3 === 0) console.log(`  ...polling (${i * 5}s) state=${st || "?"}`);
  }
  console.log("  TIMEOUT");
}

// Реф  -  scene-work-ref.png (PNG, точная исходная сцена)
console.log("Uploading reference (scene-work-ref.png)...");
const refUrl = await upload("scripts/gen-out/scene-work-ref.png");

for (const char of CHARS) {
  await genOne(char, refUrl);
}
console.log("\nAll done → public/lab/scene-look-0..4.jpg");
