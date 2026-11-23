import json
T=json.load(open('tools/timing.json'))
a=[0,15.3,round(T['s9'][0]-.2,3),round(T['s11'][0]-.15,3),round(T['s16'][0]-.3,3),round(T['s18'][0]-.3,3),round(T['s20'][0]-.12,3),round(T['s23'][0]+.9,3),round(T['s26'][0]-.5,3),round(T['s29'][0]-.05,3),round(T['s30'][0]-.25,3),120]
names=[('kitchen','scene_kitchen.mjs','buildKitchen'),('ascent','scene_space.mjs','buildAscent'),('sun','scene_sun.mjs','buildSun'),('flight','scene_space.mjs','buildFlight'),('body','scene_body.mjs','buildBody'),('planet','scene_planet.mjs','buildPlanet'),('doors','scene_doors.mjs','buildDoors'),('ice','scene_ice.mjs','buildIce'),('flash','scene_flash.mjs','buildFlash'),('source','scene_source.mjs','buildSource'),('end','scene_end.mjs','buildEnd')]
L=[{"id":n,"src":s,"fn":f,"start":a[i],"dur":round(a[i+1]-a[i],3)} for i,(n,s,f) in enumerate(names)]
json.dump(L,open('tools/scenes.json','w'),indent=1); print(a)
