# Freezes narration: places each sentence wav, writes tools/timing.json and assets/audio/narration.wav
import json, subprocess, wave, struct
gaps = dict(s1=.12,s2=.1,s3=.08,s4=.12,s5=.15,s6=.12,s7=.15,s8=.15,s9=1.35,s10=.3,s11=.9,s12=.2,s13=.15,s14=.15,s15=.35,s16=.8,s17=.15,s18=.4,s19=.25,s20=.8,s21=.3,s22=.4,s23=.9,s24=.3,s25=.9,s26=.5,s27=1.1,s28=.2,s29=.5,s30=1.2,s31=.3,s32=.8,s33=.7)
sents = json.load(open('tools/script.json'))
sr=24000; out=[]; t=0; T={}
frames=b''
for k,txt in sents:
    w=wave.open(f'assets/audio/vo/{k}.wav','rb'); sr=w.getframerate(); assert w.getnchannels()==1
    data=w.readframes(w.getnframes()); d=w.getnframes()/sr; w.close()
    t+=gaps[k]; frames+=b'\0\0'*int(gaps[k]*sr)
    T[k]=[round(t,3),round(t+d,3)]; frames+=data; t+=d
frames+=b'\0\0'*int((120-t)*sr)
w=wave.open('assets/audio/narration.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(frames); w.close()
json.dump(T,open('tools/timing.json','w'),indent=0)
print({k:v[0] for k,v in T.items()}, 'end',t)
