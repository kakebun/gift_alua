const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('ERR',e.message));
await p.goto('file://'+__dirname+'/render.html');await p.evaluate(()=>document.fonts.ready);
await p.evaluate(e=>{window.show(eval(e))},process.argv[3]);
await p.screenshot({path:process.argv[2]});await b.close();})();
