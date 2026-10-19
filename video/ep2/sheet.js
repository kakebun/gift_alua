const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('ERR',e.message));
await p.goto('file://'+__dirname+'/render.html');await p.evaluate(()=>document.fonts.ready);
await p.evaluate(tl=>setTimeline(tl),JSON.parse(fs.readFileSync(process.env.TLF||'build/timeline.json')));
const pre=process.argv[2];const ts=process.argv.slice(3).map(Number);
for(let i=0;i<ts.length;i++){await p.evaluate(t=>show(frameSVG(t)),ts[i]);await p.screenshot({path:`${pre}_${String(i).padStart(2,'0')}.png`});}
await b.close();})();
