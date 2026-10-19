const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.error('CONSOLE',m.text())});
await p.goto('file://'+__dirname+'/thumb.html');await p.evaluate(()=>document.fonts.ready);
for(const k of process.argv.slice(2)){await p.evaluate(k=>{setTimeline([{id:'x',start:0,dur:1,lines:[[0,1]]}]);show(THUMBS[k]())},k);await p.waitForTimeout(150);await p.screenshot({path:`build/thumb_${k}.png`});}
await b.close();})();
