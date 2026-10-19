// node render2.js <fps> <workers> <endSec> <out.mp4>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs'),{spawn,execFileSync}=require('child_process');
const FPS=+(process.argv[2]||30),WK=+(process.argv[3]||3);
const tl=JSON.parse(fs.readFileSync(process.env.TLF||'build/timeline.json'));
const total=Math.min(+(process.argv[4]||1e9),tl.reduce((a,s)=>a+s.dur,0)),N=Math.ceil(total*FPS),OUT=process.argv[5]||'build/video.mp4';
async function page(b){const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
 await p.goto('file://'+__dirname+'/render.html');await p.evaluate(()=>document.fonts.ready);await p.evaluate(tl=>setTimeline(tl),tl);return p;}
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p0=await page(b);
 fs.writeFileSync('build/cues.json',JSON.stringify(await p0.evaluate(()=>allCues())));
 const per=Math.ceil(N/WK),t0=Date.now();let done=0;
 await Promise.all([...Array(WK).keys()].map(async w=>{const p=w===0?p0:await page(b);const a=w*per,e=Math.min(N,a+per);
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p',`build/seg${w}.mp4`]);
  for(let i=a;i<e;i++){await p.evaluate(t=>show(frameSVG(t),false),i/FPS);const buf=await p.screenshot({type:'jpeg',quality:94});
   if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(++done%300===0)console.log(`${done}/${N} ${((Date.now()-t0)/1000).toFixed(0)}s`);}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));}));
 await b.close();fs.writeFileSync('build/segs.txt',[...Array(WK).keys()].map(w=>`file 'seg${w}.mp4'`).join('\n'));
 execFileSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i','build/segs.txt','-c','copy',OUT]);
 console.log('done',N,'frames',((Date.now()-t0)/1000).toFixed(0),'s');})();
