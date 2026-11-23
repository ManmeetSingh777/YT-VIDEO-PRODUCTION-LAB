# Source observation: measure colour structure of native witness PIXELS (area-weighted OKLCH quantiles). Output: STYLE_MEASUREMENTS.json
# Run: python -I engine/methods/proofs/measure_witnesses.py   (style-only statistics; no shape or content is extracted)
import json, math, hashlib, sys, os
from PIL import Image
def lin(c): c/=255; return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def oklch(r,g,b):
    r,g,b=lin(r),lin(g),lin(b); l=(0.4122214708*r+0.5363015719*g+0.0514459929*b)**(1/3); m=(0.2119034982*r+0.6806995451*g+0.1073969566*b)**(1/3); s=(0.0883024619*r+0.2817188376*g+0.6299787005*b)**(1/3)
    L=0.2104542553*l+0.793617785*m-0.0040720468*s; A=1.9779984951*l-2.428592205*m+0.4505937099*s; B=0.0259040371*l+0.7827717662*m-0.808675766*s
    return L, math.hypot(A,B)
def q(vals, w, p):
    o=sorted(zip(vals,w)); acc=0; tot=sum(w)
    for v,x in o:
        acc+=x
        if acc>=p*tot: return v
    return o[-1][0]
A="reference/construct-kurzgesagt-art/assets/"
WIT={"MEMORIES@10101":A+"conditional_native_anchors/MEMORIES_10101_close_human.jpg","NUCLEAR@145":A+"question_native_witnesses/NUCLEAR_0145_lab_procedural_people.jpg","BRAIN@386":A+"character_native_anchors/BRAIN_0386_runner_human.jpg","BRAIN@334":A+"question_native_witnesses/BRAIN_0334_full_actor_sparse_world.jpg","AI@285":A+"question_native_witnesses/AI_0285_machine_actor_interior.jpg","AI@35":A+"question_native_witnesses/AI_0035_oblique_built_space.jpg","NUCLEAR@271":A+"question_native_witnesses/NUCLEAR_0271_mechanism_scale_world.jpg","AI@555":A+"molecular_native_anchors/AI_0555_server_perspective.jpg"}
out={}
for k,f in WIT.items():
    im=Image.open(f).convert("RGB").resize((480,270)); qi=im.quantize(24); pal=qi.getpalette(); cnt=qi.getcolors()
    tot=sum(c for c,_ in cnt); Ls=[];Cs=[];w=[]
    for c,i in cnt: L,C=oklch(*pal[i*3:i*3+3]); Ls.append(L); Cs.append(C); w.append(c/tot)
    big=max(range(len(w)),key=lambda i:w[i])
    out[k]={"file":f,"sha256":hashlib.sha256(open(f,"rb").read()).hexdigest(),"chroma_p25":round(q(Cs,w,.25),3),"chroma_p50":round(q(Cs,w,.5),3),"chroma_p75":round(q(Cs,w,.75),3),"chroma_p90":round(q(Cs,w,.9),3),
      "L_p10":round(q(Ls,w,.1),3),"L_p50":round(q(Ls,w,.5),3),"L_p90":round(q(Ls,w,.9),3),"substrate":{"L":round(Ls[big],3),"chroma":round(Cs[big],3),"area":round(w[big],3)},"colorsOver2pct":sum(1 for x in w if x>0.02)}
json.dump(out,open("engine/methods/evidence/stage1/STYLE_MEASUREMENTS.json","w"),indent=1)
for k,v in out.items(): print(k.ljust(16),{x:v[x] for x in ["chroma_p50","chroma_p90","L_p10","L_p90","substrate","colorsOver2pct"]})
