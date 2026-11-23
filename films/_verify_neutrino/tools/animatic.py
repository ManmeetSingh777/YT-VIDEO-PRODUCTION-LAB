# Rough 120 s editorial animatic: one board per beat, timed from the frozen narration.
# Hero frames are used where they exist; everything else is a quick shape sketch. Timing gate only.
import json, subprocess, os, textwrap
from PIL import Image, ImageDraw, ImageFont
T = json.load(open("tools/timing.json"))
W, H = 960, 540
I, S_, C_, O, A, K, Y, CH = "#111C3D", "#33C8B7", "#FFF0DA", "#F46E67", "#7CDCF5", "#284F95", "#F3D85F", "#E9B23B"
F = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 22)
FB = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 26)
def sparks(d, n, ang=1, c=S_):
    for i in range(n):
        x, y = (i * 137) % 960, (i * 229) % 500
        d.line([x, y, x + 46 * ang, y + 22], fill=c, width=3)
def person(d, x, y, s=1):
    d.rectangle([x - 26 * s, y - 60 * s, x + 26 * s, y + 40 * s], fill=CH)
    d.ellipse([x - 22 * s, y - 104 * s, x + 22 * s, y - 60 * s], fill="#D79A6B")
    d.ellipse([x - 26 * s, y - 118 * s, x, y - 96 * s], fill=O)
def globe(d, x, y, r, c=K):
    d.ellipse([x - r, y - r, x + r, y + r], fill=c, outline=A, width=3)
def b_room(d): d.rectangle([0, 0, W, 400], fill=K); d.rectangle([0, 400, W, H], fill="#3B2F58"); d.rectangle([70, 80, 280, 300], fill=I, outline=C_, width=6); person(d, 460, 340, 1.6)
def b(fn): return fn
BEATS = [
 (0, T["s2"][0], "hero/hero1_kitchen_0m02.png", "Spark goes through umbrella + chest; flinch"),
 (T["s2"][0], T["s4"][0], lambda d: (b_room(d), sparks(d, 4)), "Count: 1 ... 1,000 struck out; head darts"),
 (T["s4"][0], T["s5"][0], lambda d: (b_room(d), sparks(d, 40)), "FLOOD. 100,000,000,000,000 counts up; cringe under umbrella"),
 (T["s5"][0], T["s6"][0], lambda d: (b_room(d), sparks(d, 30)), "Deadpan shrug: feels nothing"),
 (T["s6"][0], 11.2, lambda d: (d.rectangle([0,0,W,H],fill="#B46A3F"), d.ellipse([180,120,800,450],fill=C_), d.ellipse([430,210,590,330],fill=Y), sparks(d,8)), "CLOSE: spark through the egg; fork stops"),
 (11.2, T["s8"][0] + 1.5, lambda d: (d.rectangle([0,0,W,H],fill="#8C4230"), d.rectangle([300,160,660,380],fill=K), person(d,480,330,.6)), "PULL OUT: window = one cell of a building. Tag: neutrino"),
 (T["s8"][0] + 1.5, T["s8"][0] + 2.6, lambda d: (d.rectangle([0,0,W,H],fill=I), globe(d,480,1100,720,"#2F8F6F"), [d.rectangle([40+i*80,300-i%3*30,90+i*80,380],fill="#1D2260") for i in range(11)]), "Through clouds, curved horizon: leave Earth"),
 (T["s8"][0] + 2.6, T["s8"][0] + 4.2, lambda d: (d.rectangle([0,0,W,H],fill=I), globe(d,720,380,110), d.ellipse([120,60,200,140],fill=Y)), "Earth shrinks lower-right, Sun tiny upper-left"),
 (T["s8"][0] + 4.2, T["s9"][0] - 0.2, lambda d: (d.rectangle([0,0,W,H],fill=I), d.ellipse([60,-60,720,600],fill=Y), sparks(d,10)), "Accelerate: Sun swells, sparks oncoming"),
 (T["s9"][0] - 0.2, T["s10"][0] - 1.0, lambda d: (d.rectangle([0,0,W,H],fill=I), d.ellipse([230,20,730,520],fill="#F2732A"), d.pieslice([230,20,730,520],-78,40,fill=Y), d.ellipse([430,220,530,320],fill=C_)), "Surface wedge OPENS; layers labelled; dive at core"),
 (T["s10"][0] - 1.0, T["s10"][0] + 1.0, lambda d: (d.rectangle([0,0,W,H],fill="#FFB63C"), [d.ellipse([x-30,y-30,x+30,y+30],fill=O) for x,y in [(280,130),(680,140),(300,420),(660,410)]]), "Four hydrogen nuclei drift in; collision anticipated"),
 (T["s10"][0] + 1.0, T["s10"][0] + 3.3, "hero/hero2_sun_core_0m29.png", "Fusion flash: helium. Energy ring sweeps; Earth glows"),
 (T["s10"][0] + 3.3, T["s11"][0] - 0.15, lambda d: (d.rectangle([0,0,W,H],fill="#FFB63C"), sparks(d,30,1,"#0AA192")), "One spark tagged, then a stream. White-out carries +x"),
 (T["s11"][0] - 0.15, T["s12"][0], lambda d: (d.rectangle([0,0,W,H],fill=I), d.ellipse([-260,0,200,540],fill=Y), sparks(d,14)), "Spark vs light-beam race leaving the Sun"),
 (T["s12"][0], T["s13"][0], lambda d: (d.rectangle([0,0,W,H],fill=I), sparks(d,10), d.ellipse([700,260,740,300],fill=O)), "Through space: planet flicks by"),
 (T["s13"][0], T["s14"][0], lambda d: (d.rectangle([0,0,W,H],fill=I), d.ellipse([280,-160,1100,660],fill="#BDB7C9"), sparks(d,14)), "Moon whips past as a huge foreground"),
 (T["s14"][0], T["s15"][0], lambda d: (d.rectangle([0,0,W,H],fill=I), globe(d,600,700,560), sparks(d,10)), "Earth rises fast: blue atmospheric rim"),
 (T["s15"][0], T["s16"][0] - 0.3, lambda d: (d.rectangle([0,0,W,H],fill=I), globe(d,480,900,560), d.polygon([(200,240),(240,300),(160,300)],fill=S_), d.polygon([(480,210),(530,270),(480,330),(430,270)],fill=Y), d.ellipse([720,220,800,300],fill=O)), "One spark MORPHS through 3 types (never splits)"),
 (T["s16"][0] - 0.3, T["s17"][0], lambda d: (d.rectangle([0,0,W,H],fill=I), d.ellipse([240,100,720,540],fill="#D79A6B"), sparks(d,10)), "Open hand, huge; cutaway through skin layers"),
 (T["s17"][0], T["s18"][0] - 0.3, lambda d: (d.rectangle([0,0,W,H],fill="#0A1030"), d.ellipse([240,100,720,540],outline=A,width=3), [d.line([300+i*90,420,320+i*80,180],fill=C_,width=14) for i in range(4)], sparks(d,10)), "X-ray sweep: bones. Sparks don't care"),
 (T["s18"][0] - 0.3, T["s19"][0], "hero/hero3_earth_0m50.png", "Globe: most pass; one tiny interaction flash"),
 (T["s19"][0], T["s20"][0] - 0.12, lambda d: (d.rectangle([0,0,W,300],fill=I), d.rectangle([0,300,W,H],fill="#54382D"), person(d,480,260,1), sparks(d,14,-.3)), "Ground section: sparks rising under the boots"),
 (T["s20"][0] - 0.12, T["s21"][0], lambda d: (d.rectangle([0,0,W,H],fill=I), [d.ellipse([70+i*170,120+j*140,170+i*170,220+j*140],fill=K) for i in range(5) for j in range(3)], d.line([250,260,720,260],fill=O,width=12)), "Atom lattice. 'Empty holes' struck out"),
 (T["s21"][0], T["s22"][0], lambda d: (d.rectangle([0,0,W,H],fill=I), [d.ellipse([70+i*170,120+j*140,170+i*170,220+j*140],fill=K) for i in range(5) for j in range(3)], d.line([0,150,300,180,500,320],fill=O,width=6), d.line([0,380,W,380],fill=S_,width=6)), "Charged particle deflects & stops; charge-0 spark runs straight"),
 (T["s22"][0], T["s23"][0], lambda d: (d.rectangle([0,0,W,H],fill="#21306A"), [d.rectangle([20+i*190,220,190+i*190,460],fill="#6E3030") for i in range(5)], [d.rectangle([70+i*190,330,130+i*190,460],outline=C_,width=2) for i in range(5)], d.rectangle([830,330,890,460],fill=Y)), "Street of invisible doors; one far door lit"),
 (T["s23"][0], T["s24"][0], lambda d: (d.rectangle([0,0,W,H],fill=I), d.arc([360,90,600,300],200,70,fill=A,width=12), d.line([480,310,480,380],fill=A,width=12), d.ellipse([468,410,492,434],fill=Y)), "Door light contracts into '?' of wire + sensors"),
 (T["s24"][0], T["s24"][0] + 3.6, lambda d: (d.rectangle([0,0,W,300],fill="#4A3F86"), d.rectangle([0,300,W,H],fill="#BFE6FF"), d.rectangle([390,240,560,300],fill=O), person(d,300,300,.25)), "Antarctic surface: station, drill tower, people, aurora"),
 (T["s24"][0] + 3.6, T["s25"][0], lambda d: (d.rectangle([0,0,W,H],fill="#BFE6FF"), d.rectangle([0,60,W,H],fill="#1B4C8E"), [d.line([120+i*80,60,120+i*80,520],fill=A,width=2) for i in range(10)]), "Cross-section: strings lowered; km scale drawn"),
 (T["s25"][0], T["s26"][0], lambda d: (d.rectangle([0,0,W,H],fill="#071A45"), [d.ellipse([60+i*180-30,100+(i%2)*160-30,60+i*180+30,100+(i%2)*160+30],outline=A,width=3) for i in range(6)]), "Camera races down strings; sensor close-up; cube drawn"),
 (T["s26"][0], T["s27"][0], "hero/hero4_icecube_1m31.png", "RARE EVENT: flash, charged particle, blue cone, sensors"),
 (T["s27"][0], T["s28"][0], lambda d: (d.rectangle([0,0,W,H],fill="#071A45"), d.polygon([(480,180),(530,280),(430,280)],outline=S_)), "Ghost outline: never seen directly"),
 (T["s28"][0], T["s29"][0], lambda d: (d.rectangle([0,0,W,H],fill="#050B24"), [d.ellipse([100+i*70,100+(i*93)%340,120+i*70,120+(i*93)%340],fill=[O,Y,S_,A][i%4]) for i in range(11)], d.line([40,500,900,60],fill=C_,width=4)), "Hits as data; timing -> direction arrow"),
 (T["s29"][0], T["s30"][0] - 0.25, lambda d: (d.rectangle([0,0,W,H],fill="#060A22"), globe(d,130,450,50), d.line([160,430,800,110],fill=C_,width=3), d.ellipse([740,70,860,150],fill="#A97CF0")), "Follow arrow out of Earth to a galaxy with a jet"),
 (T["s30"][0] - 0.25, 120, "hero/hero5_ending_1m56.png", "Back home: umbrella down, cosmic river through room; palm glint; spark exits"),
]
os.makedirs("proof/animatic", exist_ok=True)
lst = []
for i, (t0, t1, art, note) in enumerate(BEATS):
    if isinstance(art, str):
        img = Image.open(art).convert("RGB").resize((W, H))
    else:
        img = Image.new("RGB", (W, H), I); art(ImageDraw.Draw(img))
    d = ImageDraw.Draw(img)
    d.rectangle([0, H - 62, W, H], fill="#000000")
    d.text((14, H - 56), f"{i+1:02d}  {t0:5.1f}-{t1:5.1f}s", font=FB, fill=Y)
    d.text((14, H - 28), note[:88], font=F, fill="#fff")
    d.text((W - 150, 8), "ANIMATIC", font=F, fill=Y)
    fn = f"proof/animatic/b{i:02d}.png"; img.save(fn); lst.append(f"file 'animatic/b{i:02d}.png'\nduration {t1 - t0:.3f}\n")
open("proof/animatic.txt", "w").write("".join(lst) + f"file 'animatic/b{len(BEATS)-1:02d}.png'\n")
subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", "proof/animatic.txt", "-i", "assets/audio/narration.wav", "-t", "120", "-c:v", "libx264", "-r", "30", "-pix_fmt", "yuv420p", "-c:a", "aac", "-fps_mode", "cfr", "proof/animatic_rough_120s.mp4"])
print(len(BEATS), "beats")
