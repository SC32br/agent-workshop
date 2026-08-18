import fs from "node:fs"; import path from "node:path";
const ROOT = path.resolve(import.meta.dirname, "..");
// Разовая генерация ассета. Нужен KIE-ключ БЕЗ часового лимита (у nss-portfolio лимит 10/час).
const KEY = process.env.KIE_API_KEY || process.env.KIE_GEN_KEY;
const BASE = "https://api.kie.ai";
const H = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const PROMPT = "Isometric 3/4 top-down view of a cozy modern AI startup office inside an industrial loft. Exposed warm red-brick walls on the two back sides, honey-toned wooden plank floor, several wooden desks arranged around the open room each with a softly glowing computer monitor, a comfortable fabric sofa, big leafy potted plants, a round meeting table, warm hanging pendant lights casting soft amber glow. A few friendly cute round-headed AI-assistant characters in colorful shirts working at the desks. Cozy, inviting, premium, lived-in. Rich low-poly isometric video-game art and flat illustration, clean rounded shapes, soft ambient-occlusion shadows, warm amber and deep brown palette with subtle teal and indigo accents, dark vignette at the edges. No text, no letters, no numbers, no logos, no watermark, no UI overlays.";
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
function findImg(o){let f=null;const w=(n)=>{if(f)return;if(typeof n==='string'){if(/^https?:\/\/\S+\.(png|jpe?g|webp)(\?|$)/i.test(n))f=n}else if(Array.isArray(n))n.forEach(w);else if(n&&typeof n==='object')Object.values(n).forEach(w)};w(o);return f}
async function gen(){
  const r=await fetch(`${BASE}/api/v1/jobs/createTask`,{method:'POST',headers:H,body:JSON.stringify({model:'gpt-image-2-text-to-image',input:{prompt:PROMPT,aspect_ratio:'4:3',resolution:'2K'}})});
  const taskId=(await r.json())?.data?.taskId; if(!taskId){console.log('NO TASKID');return}
  for(let i=0;i<80;i++){await sleep(4000);let j;try{const rr=await fetch(`${BASE}/api/v1/jobs/recordInfo?taskId=${taskId}`,{headers:H});j=await rr.json()}catch{continue}
    const data=j?.data??j;const st=String(data?.state||'').toLowerCase();
    if(st==='success'||data?.resultJson){let img=null;if(data?.resultJson){try{img=findImg(JSON.parse(data.resultJson))}catch{}}if(!img)img=findImg(j);
      if(img){const buf=Buffer.from(await(await fetch(img)).arrayBuffer());const out=path.join(ROOT,'public','lab','office.png');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,buf);console.log('OK',Math.round(buf.length/1024)+'KB');return}}
    if(['fail','failed','error'].includes(st)){console.log('FAILED',JSON.stringify(data).slice(0,200));return}}
  console.log('TIMEOUT');
}
await gen();
