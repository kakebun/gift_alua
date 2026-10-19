import json, soundfile as sf
spec=json.load(open("script2.json")); t=0; out=[]
for s in spec:
    lines=[]; lt=s["pre"]
    for i,_ in enumerate(s["lines"]):
        d=sf.info(f"build/vo/{s['id']}_{i}.wav").duration
        lines.append([round(lt,3),round(lt+d,3)]); lt+=d+s.get("gap",0.6)
    dur=lines[-1][1]+s["post"]; out.append({"id":s["id"],"start":round(t,3),"dur":round(dur,3),"lines":lines}); t+=dur
json.dump(out,open("build/timeline.json","w"),indent=1)
for o in out: print(f"{o['id']:10s} start {o['start']:7.2f}  dur {o['dur']:6.2f}")
print("TOTAL", round(t,1), "s =", round(t/60,2), "min")
