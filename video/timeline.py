import json, soundfile as sf
spec=json.load(open("script.json"))
GAP={"gear":0.55,"night":0.6,"tent":0.5,"camp":0.5}
t=0; out=[]
for s in spec:
    lines=[]; lt=s["pre"]
    for i,_ in enumerate(s["lines"]):
        d=sf.info(f"build/vo/{s['id']}_{i}.wav").duration
        lines.append([round(lt,3),round(lt+d,3)]); lt+=d+GAP.get(s["id"],0.4)
    dur=lines[-1][1]+s["post"]
    out.append({"id":s["id"],"start":round(t,3),"dur":round(dur,3),"lines":lines}); t+=dur
json.dump(out,open("build/timeline.json","w"),indent=1)
for o in out: print(o["id"],o["start"],o["dur"],[l[0] for l in o["lines"]])
print("total",t)
