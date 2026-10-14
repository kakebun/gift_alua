import json, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
M=sys.argv[1]
k=Kokoro(M+"/kokoro-v1.0.int8.onnx",M+"/voices-v1.0.bin")
spec=json.load(open("script.json"))
import os; os.makedirs("build/vo",exist_ok=True)
for s in spec:
    for i,l in enumerate(s["lines"]):
        a,sr=k.create(l,voice="am_michael",speed=1.0,lang="en-us")
        # trim silence
        idx=np.where(np.abs(a)>0.01)[0]
        a=a[max(0,idx[0]-240):idx[-1]+2400]
        sf.write(f"build/vo/{s['id']}_{i}.wav",a,sr)
        print(s['id'],i,len(a)/sr,flush=True)
