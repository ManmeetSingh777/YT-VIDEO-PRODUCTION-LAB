# Blender host-pass renderer (Better One TBO-G14; production master §G). Run INSIDE Blender:
#   blender -b [HOST.blend] --python engine/host3d/blender_host_passes.py -- --request REQUEST.json --out DIR
# REQUEST.json (written by engine/host3d/host_pass.mjs#writeRenderRequest):
#   { film_frames:[a,b), blender_frame_offset, frames:[film frames to render], resolution:[W,H], camera:{type:"ORTHO", location, rotation_euler_deg, ortho_scale},
#     host_object, ground:{z}, contact_points:[{id, object, vertex_group|bone|empty}], diagnostic_fixture: bool }
# For every requested FILM frame f it sets the Blender frame f - blender_frame_offset (one Blender frame per film frame, no resampling) and
# renders two straight-alpha RGBA PNGs: HOST (ground hidden) and SHADOW (host invisible to camera but casting onto a shadow-catcher ground).
# It writes PASSES.json with the camera Blender ACTUALLY used (matrix_world, ortho_scale, resolution) and each contact point's world position
# and its projection into pixels (bpy_extras.object_utils.world_to_camera_view), so the engine can verify calibration instead of trusting it.
# diagnostic_fixture=true builds a labelled DIAGNOSTIC capsule figure (NOT a host design) to prove the mechanism only.
import bpy, sys, json, math, os, hashlib
from mathutils import Vector, Euler
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index("--") + 1:]
req = json.load(open(argv[argv.index("--request") + 1], encoding="utf8"))
out = os.path.abspath(argv[argv.index("--out") + 1])
os.makedirs(out, exist_ok=True)
sc = bpy.context.scene

def sha(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()

def build_diagnostic():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=1.4, location=(0, 0, 0.7))
    body = bpy.context.object; body.name = "DIAG_HOST"
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.3, location=(0, 0, 1.75))
    head = bpy.context.object; head.parent = body; head.location = (0, 0, 1.05)
    mat = bpy.data.materials.new("diag_host_mat"); mat.use_nodes = True
    mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.85, 0.35, 0.1, 1)
    for o in (body, head): o.data.materials.append(mat)
    bpy.ops.object.empty_add(location=(0, 0, 0)); foot = bpy.context.object; foot.name = "DIAG_FOOT"; foot.parent = body; foot.location = (0, -0.35, -0.7)  # visible front edge of the sole (the contact the camera sees)
    # walk along +X: 2 world units over the film interval (keyed in BLENDER frames)
    a, b = req["film_frames"]; off = req["blender_frame_offset"]
    body.location = (-1.0, 0, 0.7); body.keyframe_insert("location", frame=a - off)
    body.location = (1.0, 0, 0.7); body.keyframe_insert("location", frame=b - 1 - off)
    for fc in body.animation_data.action.fcurves if hasattr(body.animation_data.action, "fcurves") else []:
        for k in fc.keyframe_points: k.interpolation = "LINEAR"
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, req["ground"]["z"])); g = bpy.context.object; g.name = "GROUND"
    bpy.ops.object.light_add(type="SUN", location=(0, -4, 8)); sun = bpy.context.object; sun.rotation_euler = Euler((math.radians(35), 0, math.radians(-30))); sun.data.energy = 4
    bpy.ops.object.camera_add(); sc.camera = bpy.context.object
    return body

host = build_diagnostic() if req.get("diagnostic_fixture") else bpy.data.objects[req["host_object"]]
ground = bpy.data.objects.get("GROUND")
if ground is None:
    raise SystemExit("HOST_INTEGRATION_INVALID: the .blend has no GROUND shadow-receiver object")
cam = sc.camera
c = req["camera"]
if c["type"] == "ORTHO":
    cam.data.type = "ORTHO"; cam.data.ortho_scale = c["ortho_scale"]
elif c["type"] == "PERSP":  # P08 E03: calibrated perspective (fixed lens, horizontal sensor fit, square pixels)
    cam.data.type = "PERSP"; cam.data.lens = c["lens_mm"]; cam.data.sensor_fit = "HORIZONTAL"; cam.data.sensor_width = c["sensor_width_mm"]; cam.data.shift_x = 0; cam.data.shift_y = 0
else:
    raise SystemExit("HOST_INTEGRATION_INVALID: camera type must be ORTHO or PERSP")
cam.location = Vector(c["location"]); cam.rotation_euler = Euler([math.radians(x) for x in c["rotation_euler_deg"]])
W, H = req["resolution"]
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = W, H, 100
sc.render.engine = "CYCLES"; sc.cycles.samples = req.get("samples", 16); sc.cycles.use_denoising = False; sc.cycles.seed = 1
sc.render.film_transparent = True; sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"
sc.view_settings.view_transform = "Standard"

host_objs = [host] + list(host.children_recursive)
sc.render.fps = int(req.get("fps", 60)); sc.render.fps_base = 1.0
import hashlib
def mesh_sha(objs):  # P06 §5.1: the REST geometry/rig that rendered the passes (a changed mesh without a re-render is STALE)
    h = hashlib.sha256()
    for o in sorted(objs, key=lambda x: x.name):
        h.update(("%s|%s;" % (o.name, o.type)).encode())
        if o.type == "MESH":
            for v in o.data.vertices: h.update(("%.6f,%.6f,%.6f;" % tuple(v.co)).encode())
            for p in o.data.polygons: h.update((",".join(str(i) for i in p.vertices) + ";").encode())
        if o.type == "ARMATURE":
            for b in o.data.bones: h.update(("%s<%s@%.6f,%.6f,%.6f;" % (b.name, b.parent.name if b.parent else "", *tuple(b.head_local))).encode())
    return h.hexdigest()
perf_h = hashlib.sha256()  # the PERFORMANCE as rendered: evaluated world matrices of every host object and pose bone, per rendered frame
def perf_update():
    for o in sorted(host_objs, key=lambda x: x.name):
        perf_h.update((o.name + ":" + ",".join("%.6f" % v for r in o.matrix_world for v in r) + ";").encode())
        if o.type == "ARMATURE" and o.pose:
            for pb in o.pose.bones: perf_h.update((pb.name + ":" + ",".join("%.6f" % v for r in pb.matrix for v in r) + ";").encode())
host_mesh_sha = mesh_sha(host_objs)
contact_objs = [bpy.data.objects[p["object"]] for p in req["contact_points"]]
rows = []
for f in req["frames"]:
    bf = f - req["blender_frame_offset"]; sc.frame_set(bf); perf_update()
    # HOST pass: ground not rendered
    ground.hide_render = True
    for o in host_objs: o.visible_camera = True
    p_host = os.path.join(out, f"host_{f:06d}.png"); sc.render.filepath = p_host; bpy.ops.render.render(write_still=True)
    # SHADOW pass: host invisible to the camera but still casting; ground is a shadow catcher
    ground.hide_render = False; ground.is_shadow_catcher = True
    for o in host_objs: o.visible_camera = False
    p_sh = os.path.join(out, f"shadow_{f:06d}.png"); sc.render.filepath = p_sh; bpy.ops.render.render(write_still=True)
    for o in host_objs: o.visible_camera = True
    contacts = []
    for p, o in zip(req["contact_points"], contact_objs):
        wp = o.matrix_world.translation; v = world_to_camera_view(sc, cam, wp)
        contacts.append({"id": p["id"], "world": [wp.x, wp.y, wp.z], "px": [v.x * W, (1 - v.y) * H]})
    rows.append({"film_frame": f, "blender_frame": bf, "host": {"file": os.path.basename(p_host), "sha256": sha(p_host)}, "shadow": {"file": os.path.basename(p_sh), "sha256": sha(p_sh)}, "contacts": contacts})

json.dump({"adapter_version": "1.1.0", "blender_version": bpy.app.version_string, "blend_file": bpy.data.filepath or None, "diagnostic_fixture": bool(req.get("diagnostic_fixture")),
           "fps": sc.render.fps / sc.render.fps_base, "alpha_mode": "STRAIGHT", "color_view_transform": sc.view_settings.view_transform, "host_mesh_sha256": host_mesh_sha, "rig_action_sha256": perf_h.hexdigest(), "pass_list": ["host_rgba", "shadow_catcher_rgba"],
           "camera_used": {"type": cam.data.type, "ortho_scale": cam.data.ortho_scale, "lens_mm": cam.data.lens, "sensor_width_mm": cam.data.sensor_width, "matrix_world": [list(r) for r in cam.matrix_world], "resolution": [W, H]},
           "frames": rows}, open(os.path.join(out, "PASSES.json"), "w", encoding="utf8"), indent=1)
print("PASSES_WRITTEN", len(rows))
