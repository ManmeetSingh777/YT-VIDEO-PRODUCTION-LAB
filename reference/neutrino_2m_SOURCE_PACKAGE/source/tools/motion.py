# Frame-difference QA at real playback rate: cuts (spikes), holds (near-zero runs), black frames.
import subprocess, sys, numpy as np
f=sys.argv[1]; W,H=96,54
p=subprocess.run(["ffmpeg","-v","error","-i",f,"-vf",f"scale={W}:{H},format=gray","-f","rawvideo","-"],capture_output=True).stdout
a=np.frombuffer(p,dtype=np.uint8).reshape(-1,H,W).astype(float); d=np.abs(np.diff(a,axis=0)).mean((1,2)); n=len(a)
print("frames",n,"sec",n/30,"mean diff",round(d.mean(),2))
print("cuts >",round(d.mean()*5,1),":",[round((i+1)/30,2) for i in np.where(d>max(14,d.mean()*5))[0]][:60])
hold=d<0.12; runs=[];s=None
for i,h in enumerate(hold):
    if h and s is None:s=i
    if not h and s is not None:
        if i-s>=15:runs.append((round(s/30,2),round(i/30,2)))
        s=None
if s is not None and n-1-s>=15:runs.append((round(s/30,2),round((n-1)/30,2)))
print("holds >=0.5s:",runs)
print("black (mean<8):",[round(i/30,2) for i in np.where(a.mean((1,2))<8)[0]][:30])
