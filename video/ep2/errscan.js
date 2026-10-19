const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage();
await p.goto('file://'+__dirname+'/render3.html');const tl=JSON.parse(fs.readFileSync('build/timeline.json'));
await p.evaluate(tl=>setTimeline(tl),tl);const end=tl.reduce((a,s)=>a+s.dur,0);
const r=await p.evaluate(end=>{const errs=[];let maxLen=0,maxT=0;for(let t=0;t<end;t+=0.1){try{const s=frameSVG(t);if(s.length>maxLen){maxLen=s.length;maxT=t;} if(/NaN|undefined/.test(s)) errs.push(t.toFixed(1)+' NaN/undef');}catch(e){errs.push(t.toFixed(1)+' '+e.message);}}return {errs:errs.slice(0,40),n:errs.length,maxLen,maxT};},end);
console.log(JSON.stringify(r,null,1));await b.close();})();
