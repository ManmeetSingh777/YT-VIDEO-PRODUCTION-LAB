#!/usr/bin/env python3
"""Validate GPT's creative packet structurally and across connected film obligations.
Requires: pip install jsonschema>=4.18
Exit 0 means STRUCTURALLY_VALID_PENDING_REVIEW, never an approved film.
"""
import argparse, json, math, pathlib, sys
from jsonschema import Draft202012Validator

HERE=pathlib.Path(__file__).resolve().parent
def validate(packet):
    errors=[]
    schema=json.loads((HERE/"creative_packet.schema.json").read_text(encoding="utf-8"))
    for x in Draft202012Validator(schema).iter_errors(packet):
        errors.append({"code":"SCHEMA_INVALID","path":"/".join(map(str,x.path)), "reason":x.message})
    if errors:
        return {"status":"BLOCKED","errors":errors}
    total=packet["stage"]["total_frames"]
    def err(code,who,reason): errors.append({"code":code,"id":who,"reason":reason})
    def interval(who,r,parent=None):
        s,e=r
        if not 0 <= s < e <= total: err("INVALID_FRAME_INTERVAL",who,f"{r} outside [0,{total}) or empty")
        if parent and not(parent[0]<=s and e<=parent[1]):
            err("INTERVAL_OUTSIDE_OWNER",who,f"{r} outside owner {parent}")
    groups=["shots","decisions","actions","art_requirements","audio_cues"]
    ids={}
    for group in groups:
        for x in packet[group]:
            if x["id"] in ids: err("DUPLICATE_ID",x["id"],f"also used by {ids[x['id']]}")
            ids[x["id"]]=group
    for m in packet["story"]["mechanisms"]:
        if m["epistemic_status"]=="SOURCED" and not m.get("source_refs"):
            err("MISSING_CLAIM_SOURCE",m["id"],"SOURCED claim has no references")
    narr=set()
    for n in packet["story"]["narration"]:
        if n["id"] in narr: err("DUPLICATE_NARRATION",n["id"],"duplicate narration ID")
        narr.add(n["id"]);interval(n["id"],n["frames"])
    shotby={s["id"]:s for s in packet["shots"]}
    artby={a["id"]:a for a in packet["art_requirements"]}
    actionby={a["id"]:a for a in packet["actions"]}
    decby={d["id"]:d for d in packet["decisions"]}
    cueby={a["id"]:a for a in packet["audio_cues"]}
    actual=sorted(packet["shots"],key=lambda x:x["frames"][0])
    at=0
    for s in actual:
        interval(s["id"],s["frames"])
        if s["frames"][0]!=at: err("SHOT_TILING",s["id"],f"expected shot start {at}, got {s['frames'][0]}")
        at=max(at,s["frames"][1])
    if at!=total: err("SHOT_TILING","film",f"shot coverage ends at {at}, needs {total}")
    for d in packet["decisions"]:
        sh=shotby.get(d["shot_id"])
        if not sh: err("UNKNOWN_SHOT",d["id"],d["shot_id"])
        interval(d["id"],d["frames"],sh["frames"] if sh else None)
        for c in d["consumer_ids"]:
            if c not in actionby and c not in cueby:
                err("DIRECTION_CONSUMER_MISSING",d["id"],f"{c} is not an action/audio cue")
            else:
                owner=actionby.get(c) or cueby.get(c)
                if owner["frames"][1]<=d["frames"][0] or owner["frames"][0]>=d["frames"][1]:
                    err("DIRECTION_CONSUMER_INERT",d["id"],f"{c} does not overlap direction frame window")
    for a in packet["actions"]:
        sh=shotby.get(a["shot_id"])
        if not sh: err("UNKNOWN_SHOT",a["id"],a["shot_id"])
        interval(a["id"],a["frames"],sh["frames"] if sh else None)
        phases=sorted(a["phases"],key=lambda x:x["frames"][0]); cur=a["frames"][0]
        for p in phases:
            interval(a["id"]+":"+p["name"],p["frames"],a["frames"])
            if p["frames"][0]!=cur: err("ACTION_PHASE_GAP_OR_OVERLAP",a["id"],f"phase {p['name']} starts {p['frames'][0]}, expected {cur}")
            cur=p["frames"][1]
        if cur!=a["frames"][1]: err("ACTION_PHASE_GAP_OR_OVERLAP",a["id"],f"phases end {cur}, action ends {a['frames'][1]}")
        for ref in a["art_ids"]:
            if ref not in artby:err("MISSING_ART_REQUIREMENT",a["id"],f"art {ref}")
        for ref in a["direction_ids"]:
            if ref not in decby:err("DIRECTION_REF_MISSING",a["id"],ref)
            elif a["id"] not in decby[ref]["consumer_ids"]:err("DIRECTION_LINK_ASYMMETRIC",a["id"],f"{ref} does not consume {a['id']}")
        for c in a.get("contact_events",[]):
            interval(a["id"]+":contact",c["frames"],a["frames"])
            if c["release_required"] and c["frames"][1]>=a["frames"][1]:
                err("CONTACT_RELEASE_UNPROVEN",a["id"],"contact ends at action endpoint; no remaining action window for release proof; use a separate related release action if appropriate")
        if not a["visible_result"].strip():err("MISSING_VISUAL_CONSEQUENCE",a["id"],"no visible result")
    for art in packet["art_requirements"]:
        if art["kind"]!="MASTER" and art.get("master_id") and art["master_id"] not in artby:err("MISSING_MASTER",art["id"],art["master_id"])
        for ref in art["required_by"]:
            if ref not in actionby and ref not in shotby:
                err("ORPHAN_ART",art["id"],f"unknown consuming action/shot {ref}")
            if ref in actionby and art["id"] not in actionby[ref]["art_ids"]:
                err("ART_USAGE_LINK_ASYMMETRIC",art["id"],f"action {ref} doesn't include this asset")
        for part in art["required_parts"]:
            if part not in artby:err("MISSING_SUBPART",art["id"],part)
        if art["kind"]=="MASTER" and art.get("master_id"):err("MASTER_CYCLE",art["id"],"master cannot descend from another master")
    for cue in packet["audio_cues"]:
        interval(cue["id"],cue["frames"])
        if cue.get("related_action") and cue["related_action"] not in actionby:err("AUDIO_ACTION_UNKNOWN",cue["id"],cue["related_action"])
    if packet["approval"]["status"]=="CREATIVE_APPROVED" and not packet["approval"]["receipt"]:
        err("UNVERIFIED_APPROVAL",packet["film_id"],"approval claims human authority without referenced receipt")
    if not any(c["kind"]=="NARRATION" for c in packet["audio_cues"]):
        err("NARRATION_CUE_MISSING","audio","narration exists but no scheduled narration cue")
    return {"status":"BLOCKED" if errors else "STRUCTURALLY_VALID_PENDING_REVIEW",
            "errors":errors,
            "counts":{k:len(packet[k]) for k in groups},
            "frames":total,
            "note":"Only structural and cross-reference validation. NOT physical feasibility, genuine provenance, creative excellence, human approval, or final rendering evidence."}
def main():
    p=argparse.ArgumentParser()
    p.add_argument("packet")
    p.add_argument("--output")
    a=p.parse_args()
    try:
        doc=json.loads(pathlib.Path(a.packet).read_text(encoding="utf-8"))
        report=validate(doc)
    except Exception as exc:
        report={"status":"BLOCKED","errors":[{"code":"VALIDATION_EXCEPTION","reason":str(exc)}]}
    s=json.dumps(report,indent=2)
    print(s)
    if a.output:pathlib.Path(a.output).write_text(s+"\n",encoding="utf-8")
    return 0 if report["status"]=="STRUCTURALLY_VALID_PENDING_REVIEW" else 1
if __name__=="__main__":sys.exit(main())
