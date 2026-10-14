import sys,glob
from PIL import Image
fs=sorted(glob.glob(sys.argv[1]+"_*.png")); cols=3
w,h=640,360; rows=(len(fs)+cols-1)//cols
im=Image.new("RGB",(w*cols,h*rows),"white")
for i,f in enumerate(fs): im.paste(Image.open(f).resize((w,h)),((i%cols)*w,(i//cols)*h))
im.save(sys.argv[2])
