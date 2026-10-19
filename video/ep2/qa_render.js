const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const tl=JSON.parse(fs.readFileSync('build/timeline_first.json'));const end=tl.reduce((a,s)=>a+s.dur,0);
const W=3, step=0.2, N=Math.floor(end/step);
await Promise.all([...Array(W).keys()].map(async w=>{const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('ERR',e.message));
await p.goto('file://'+__dirname+'/render3.html');await p.evaluate(()=>document.fonts.ready);await p.evaluate(tl=>setTimeline(tl),tl);
for(let i=w;i<N;i+=W){const t=+(i*step).toFixed(2);await p.evaluate(t=>show(frameSVG(t),false),t);await p.screenshot({path:`build/qa/f_${String(Math.round(t*10)).padStart(4,'0')}.png`});}}));
await b.close();})();
