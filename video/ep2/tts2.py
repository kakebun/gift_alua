import json, sys, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
M=sys.argv[1]; k=Kokoro(M+"/kokoro-v1.0.int8.onnx",M+"/voices-v1.0.bin")
spec=json.load(open("script2.json")); os.makedirs("build/vo",exist_ok=True)
for s in spec:
    for i,l in enumerate(s["lines"]):
        fn=f"build/vo/{s['id']}_{i}.wav"
        if os.path.exists(fn): continue
        a,sr=k.create(l,voice="am_michael",speed=0.95,lang="en-us")
        idx=np.where(np.abs(a)>0.01)[0]; a=a[max(0,idx[0]-240):idx[-1]+2400]
        sf.write(fn,a,sr); print(s['id'],i,round(len(a)/sr,2),flush=True)
