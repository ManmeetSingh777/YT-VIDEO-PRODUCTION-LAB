# BETTER ONE — STAGE 3 PRE-ART ENGINEERING HANDOFF SOURCE PACK

**Read LATER, after the pilot story, script and Experience Director plan exist.** These are the actual strict packet and P06 runtime interface contracts for translating creative intent into an executable machine package. None of these documents certify P06 runtime completed. Do not substitute a custom invented packet or fabricate file hashes/human approvals. Generate exact source artifacts, then ask the actual Claude P06 engineering branch to validate, preflight and report precise missing operations/art states before paid/final image production.

1. schemas/creative_packet_v1_1.schema.json — blob SHA 296d91f1fa87a1153df4cbde39d81c452019d7e7
2. docs/gpt-creative-control/OPERATOR_WORKFLOW.md — blob SHA 808e5779342388f21bcff4fb44cb8fca2a2c0406
3. docs/the-better-one/PERFORMANCE_COMMAND_SCHEMA_V1.json — blob SHA d2c723fd942351fc1aa5bee83e3b18d76ad1686f
4. docs/the-better-one/P06_13S_PERFORMANCE_SYSTEM_IMPLEMENTATION_DIRECTIVE.md — blob SHA 0085cf648c81d81a4c85a8cb284354b381701ac6
5. docs/the-better-one/PRODUCTION_QUALITY_GATE_REGISTRY.json — blob SHA 665f6927db7350754d7966da04c2c9a8abc619e9

---
# DOCUMENT 1
SOURCE: schemas/creative_packet_v1_1.schema.json
SOURCE_BLOB: 296d91f1fa87a1153df4cbde39d81c452019d7e7

{
 "$schema": "https://json-schema.org/draft/2020-12/schema",
 "$id": "https://motion-native.local/schemas/creative_packet_v1_1.schema.json",
 "title": "Motion Native GPT creative packet v1.1 (executable superset of the v1.0.0 draft)",
 "type": "object",
 "additionalProperties": false,
 "required": [
  "version",
  "film_id",
  "stage",
  "source",
  "intent",
  "story",
  "identities",
  "worlds",
  "shots",
  "decisions",
  "actions",
  "transitions",
  "art_requirements",
  "audio_cues",
  "approval"
 ],
 "properties": {
  "version": {
   "const": "1.1.0"
  },
  "film_id": {
   "$ref": "#/$defs/id"
  },
  "stage": {
   "type": "object",
   "additionalProperties": false,
   "required": [
    "width",
    "height",
    "fps",
    "total_frames"
   ],
   "properties": {
    "width": {
     "const": 1920
    },
    "height": {
     "const": 1080
    },
    "fps": {
     "const": 60
    },
    "total_frames": {
     "type": "integer",
     "minimum": 1,
     "maximum": 216000
    }
   }
  },
  "source": {
   "type": "object",
   "additionalProperties": false,
   "required": [
    "script_file",
    "script_sha256",
    "direction_spec",
    "direction_spec_sha256",
    "art_skill",
    "art_skill_sha256",
    "source_witness_manifest",
    "documents"
   ],
   "properties": {
    "script_file": {
     "$ref": "#/$defs/text"
    },
    "script_sha256": {
     "$ref": "#/$defs/sha"
    },
    "direction_spec": {
     "$ref": "#/$defs/text"
    },
    "direction_spec_sha256": {
     "$ref": "#/$defs/sha"
    },
    "art_skill": {
     "const": "construct-kurzgesagt-art"
    },
    "art_skill_sha256": {
     "$ref": "#/$defs/sha"
    },
    "source_witness_manifest": {
     "type": [
      "string",
      "null"
     ]
    },
    "documents": {
     "type": "array",
     "items": {
      "type": "object",
      "additionalProperties": false,
      "required": [
       "role",
       "file",
       "sha256"
      ],
      "properties": {
       "role": {
        "$ref": "#/$defs/text"
       },
       "file": {
        "$ref": "#/$defs/text"
       },
       "sha256": {
        "$ref": "#/$defs/sha"
       }
      }
     }
    }
   }
  },
  "intent": {
   "type": "object",
   "additionalProperties": false,
   "required": [
    "topic",
    "audience",
    "objectives",
    "quality_bar",
    "constraints",
    "provenance",
    "decision_maker",
    "source_policy"
   ],
   "properties": {
    "topic": {
     "$ref": "#/$defs/text"
    },
    "audience": {
     "$ref": "#/$defs/text"
    },
    "objectives": {
     "type": "array",
     "items": {
      "$ref": "#/$defs/text"
     },
     "minItems": 1
    },
    "quality_bar": {
     "$ref": "#/$defs/text"
    },
    "constraints": {
     "type": "array",
     "items": {
      "$ref": "#/$defs/text"
     }
    },
    "provenance": {
     "$ref": "#/$defs/text"
    },
    "decision_maker": {
     "$ref": "#/$defs/text"
    },
    "source_policy": {
     "$ref": "#/$defs/text"
    }
   }
  },
  "story": {
   "type": "object",
   "additionalProperties": false,
   "required": [
    "audience_question",
    "central_insight",
    "mechanisms",
    "narration",
    "contract"
   ],
   "properties": {
    "audience_question": {
     "$ref": "#/$defs/text"
    },
    "central_insight": {
     "$ref": "#/$defs/text"
    },
    "mechanisms": {
     "type": "array",
     "items": {
      "type": "object",
      "additionalProperties": false,
      "required": [
       "id",
       "claim",
       "epistemic_status",
       "visual_mechanism"
      ],
      "properties": {
       "id": {
        "$ref": "#/$defs/id"
       },
       "claim": {
        "$ref": "#/$defs/text"
       },
       "epistemic_status": {
        "enum": [
         "SOURCED",
         "HYPOTHESIS",
         "METAPHOR",
         "UNVERIFIED"
        ]
       },
       "visual_mechanism": {
        "$ref": "#/$defs/text"
       },
       "source_refs": {
        "type": "array",
        "items": {
         "$ref": "#/$defs/text"
        }
       }
      }
     },
     "minItems": 1
    },
    "narration": {
     "type": "array",
     "items": {
      "type": "object",
      "additionalProperties": false,
      "required": [
       "id",
       "text",
       "frames",
       "claim_ids"
      ],
      "properties": {
       "id": {
        "$ref": "#/$defs/id"
       },
       "text": {
        "$ref": "#/$defs/text"
       },
       "frames": {
        "$ref": "#/$defs/frames"
       },
       "claim_ids": {
        "type": "array",
        "items": {
         "$ref": "#/$defs/id"
        }
       }
      }
     },
     "minItems": 1
    },
    "contract": {
     "type": "object",
     "additionalProperties": false,
     "required": [
      "claims",
      "mechanisms",
      "obstacles"
     ],
     "properties": {
      "claims": {
       "type": "array",
       "items": {
        "type": "object"
       }
      },
      "mechanisms": {
       "type": "array",
       "items": {
        "type": "object"
       }
      },
      "obstacles": {
       "type": "array",
       "items": {
        "type": "object"
       }
      }
     }
    }
   }
  },
  "identities": {
   "type": "array",
   "items": {
    "type": "object",
    "additionalProperties": false,
    "required": [
     "id",
     "kind",
     "master_art",
     "views",
     "method_ids",
     "palette_roles",
     "on_stage_height_px",
     "rig",
     "acting"
    ],
    "properties": {
     "id": {
      "$ref": "#/$defs/id"
     },
     "kind": {
      "enum": [
       "CHARACTER",
       "PROP",
       "MACHINE",
       "WORLD",
       "DIAGRAM",
       "EFFECT"
      ]
     },
     "master_art": {
      "$ref": "#/$defs/id"
     },
     "views": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/id"
      },
      "minItems": 1
     },
     "method_ids": {
      "type": "array",
      "items": {
       "type": "string",
       "pattern": "^F(0[1-9]|[1-7][0-9]|80)$"
      },
      "minItems": 1
     },
     "palette_roles": {
      "type": "object",
      "additionalProperties": {
       "type": "string"
      }
     },
     "on_stage_height_px": {
      "anyOf": [
       {
        "type": "number",
        "exclusiveMinimum": 0
       },
       {
        "type": "null"
       }
      ]
     },
     "rig": {
      "anyOf": [
       {
        "type": "null"
       },
       {
        "$ref": "#/$defs/rig"
       }
      ]
     },
     "acting": {
      "anyOf": [
       {
        "type": "null"
       },
       {
        "$ref": "#/$defs/acting"
       }
      ]
     }
    }
   },
   "minItems": 1
  },
  "worlds": {
   "type": "array",
   "items": {
    "type": "object",
    "additionalProperties": false,
    "required": [
     "id",
     "identity",
     "planes",
     "coverage_purpose"
    ],
    "properties": {
     "id": {
      "$ref": "#/$defs/id"
     },
     "identity": {
      "$ref": "#/$defs/id"
     },
     "planes": {
      "type": "array",
      "items": {
       "type": "object",
       "additionalProperties": false,
       "required": [
        "art_id",
        "band"
       ],
       "properties": {
        "art_id": {
         "$ref": "#/$defs/id"
        },
        "band": {
         "enum": [
          "FAR",
          "MID",
          "FOCAL",
          "NEAR",
          "FOREGROUND"
         ]
        }
       }
      },
      "minItems": 1
     },
     "coverage_purpose": {
      "$ref": "#/$defs/text"
     }
    }
   }
  },
  "shots": {
   "type": "array",
   "items": {
    "type": "object",
    "additionalProperties": false,
    "required": [
     "id",
     "frames",
     "world_id",
     "opening_state",
     "ending_state",
     "content_kinds",
     "attention",
     "camera",
     "entry_states",
     "exit_states",
     "hold_purpose",
     "contract"
    ],
    "properties": {
     "id": {
      "$ref": "#/$defs/id"
     },
     "frames": {
      "$ref": "#/$defs/frames"
     },
     "world_id": {
      "anyOf": [
       {
        "$ref": "#/$defs/id"
       },
       {
        "type": "null"
       }
      ]
     },
     "opening_state": {
      "$ref": "#/$defs/text"
     },
     "ending_state": {
      "$ref": "#/$defs/text"
     },
     "content_kinds": {
      "type": "array",
      "items": {
       "enum": [
        "physical_action",
        "spatial_layout",
        "data_relation",
        "quantity_change",
        "inner_state",
        "scale_jump",
        "screen_content",
        "comparison",
        "world_within_world"
       ]
      },
      "minItems": 1
     },
     "attention": {
      "type": "array",
      "items": {
       "type": "object",
       "additionalProperties": false,
       "required": [
        "frames",
        "target"
       ],
       "properties": {
        "frames": {
         "$ref": "#/$defs/frames"
        },
        "target": {
         "$ref": "#/$defs/id"
        }
       }
      },
      "minItems": 1
     },
     "camera": {
      "type": "object",
      "additionalProperties": false,
      "required": [
       "track_id",
       "moves"
      ],
      "properties": {
       "track_id": {
        "anyOf": [
         {
          "$ref": "#/$defs/id"
         },
         {
          "type": "null"
         }
        ]
       },
       "moves": {
        "type": "array",
        "items": {
         "type": "object",
         "additionalProperties": false,
         "required": [
          "frames",
          "operation",
          "purpose"
         ],
         "properties": {
          "frames": {
           "$ref": "#/$defs/frames"
          },
          "operation": {
           "enum": [
            "STATIC",
            "PAN",
            "PUSH",
            "PULL",
            "ROTATE",
            "FOLLOW",
            "ORBIT",
            "DOLLY_3D"
           ]
          },
          "purpose": {
           "$ref": "#/$defs/text"
          }
         }
        },
        "minItems": 1
       }
      }
     },
     "entry_states": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/carried"
      }
     },
     "exit_states": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/carried"
      }
     },
     "hold_purpose": {
      "type": [
       "string",
       "null"
      ]
     },
     "contract": {
      "type": "object",
      "additionalProperties": false,
      "required": [
       "narrative_purpose",
       "viewer_experience",
       "starting_image",
       "main_action",
       "secondary_choreography",
       "character_acting",
       "camera_choreography",
       "transformation_choreography",
       "attention_path",
       "narration_and_sound",
       "exit_and_handoff",
       "failure_conditions"
      ],
      "properties": {
       "narrative_purpose": {
        "$ref": "#/$defs/text"
       },
       "viewer_experience": {
        "$ref": "#/$defs/text"
       },
       "starting_image": {
        "$ref": "#/$defs/text"
       },
       "main_action": {
        "$ref": "#/$defs/text"
       },
       "secondary_choreography": {
        "$ref": "#/$defs/text"
       },
       "character_acting": {
        "$ref": "#/$defs/text"
       },
       "camera_choreography": {
        "$ref": "#/$defs/text"
       },
       "transformation_choreography": {
        "$ref": "#/$defs/text"
       },
       "attention_path": {
        "$ref": "#/$defs/text"
       },
       "narration_and_sound": {
        "$ref": "#/$defs/text"
       },
       "exit_and_handoff": {
        "$ref": "#/$defs/text"
       },
       "failure_conditions": {
        "$ref": "#/$defs/text"
       }
      }
     }
    }
   },
   "minItems": 1
  },
  "decisions": {
   "type": "array",
   "items": {
    "type": "object",
    "additionalProperties": false,
    "required": [
     "id",
     "shot_id",
     "frames",
     "script_span",
     "viewer_effect",
     "intent",
     "intended_experience",
     "consumer_ids",
     "operation",
     "art_capabilities",
     "audio_consequence"
    ],
    "properties": {
     "id": {
      "$ref": "#/$defs/id"
     },
     "shot_id": {
      "$ref": "#/$defs/id"
     },
     "frames": {
      "$ref": "#/$defs/frames"
     },
     "script_span": {
      "$ref": "#/$defs/text"
     },
     "viewer_effect": {
      "$ref": "#/$defs/text"
     },
     "intent": {
      "$ref": "#/$defs/text"
     },
     "intended_experience": {
      "$ref": "#/$defs/text"
     },
     "consumer_ids": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/id"
      },
      "minItems": 1
     },
     "operation": {
      "type": "object",
      "additionalProperties": false,
      "required": [
       "owner",
       "operation"
      ],
      "properties": {
       "owner": {
        "type": "string",
        "pattern": "^[A-Za-z][A-Za-z0-9_.-]{0,95}(->[A-Za-z][A-Za-z0-9_.-]{0,95})?$"
       },
       "operation": {
        "$ref": "#/$defs/text"
       },
       "joint": {
        "$ref": "#/$defs/id"
       },
       "channel": {
        "$ref": "#/$defs/id"
       },
       "state": {
        "$ref": "#/$defs/id"
       },
       "target": {
        "$ref": "#/$defs/id"
       },
       "min_px": {
        "type": "number"
       },
       "min_deg": {
        "type": "number"
       },
       "reason": {
        "$ref": "#/$defs/text"
       }
      }
     },
     "art_capabilities": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/id"
      }
     },
     "audio_consequence": {
      "type": [
       "string",
       "null"
      ]
     }
    }
   },
   "minItems": 1
  },
  "actions": {
   "type": "array",
   "items": {
    "type": "object",
    "additionalProperties": false,
    "required": [
     "id",
     "shot_id",
     "owner",
     "target",
     "frames",
     "mode",
     "verb_class",
     "no_verb_reason",
     "intent",
     "phases",
     "precondition",
     "postcondition",
     "visible_result",
     "target_state",
     "min_angle_deg",
     "art_ids",
     "direction_ids",
     "staging",
     "contact_events",
     "pose_events",
     "view_events",
     "state_events",
     "secondary_purpose"
    ],
    "properties": {
     "id": {
      "$ref": "#/$defs/id"
     },
     "shot_id": {
      "$ref": "#/$defs/id"
     },
     "owner": {
      "$ref": "#/$defs/id"
     },
     "target": {
      "anyOf": [
       {
        "$ref": "#/$defs/id"
       },
       {
        "type": "null"
       }
      ]
     },
     "frames": {
      "$ref": "#/$defs/frames"
     },
     "mode": {
      "enum": [
       "RIGID",
       "ARTICULATED",
       "REGISTERED_CELS",
       "REGISTERED_MORPH",
       "EXPLICIT_DEFORM",
       "PROCEDURAL",
       "CAMERA_WORLD",
       "TRANSITION"
      ]
     },
     "verb_class": {
      "type": [
       "string",
       "null"
      ]
     },
     "no_verb_reason": {
      "type": [
       "string",
       "null"
      ]
     },
     "intent": {
      "$ref": "#/$defs/text"
     },
     "phases": {
      "type": "array",
      "items": {
       "type": "object",
       "additionalProperties": false,
       "required": [
        "name",
        "frames",
        "state"
       ],
       "properties": {
        "name": {
         "$ref": "#/$defs/text"
        },
        "frames": {
         "$ref": "#/$defs/frames"
        },
        "state": {
         "$ref": "#/$defs/text"
        }
       }
      },
      "minItems": 1
     },
     "precondition": {
      "$ref": "#/$defs/text"
     },
     "postcondition": {
      "$ref": "#/$defs/text"
     },
     "visible_result": {
      "$ref": "#/$defs/text"
     },
     "target_state": {
      "type": [
       "string",
       "null"
      ]
     },
     "min_angle_deg": {
      "anyOf": [
       {
        "type": "number"
       },
       {
        "type": "null"
       }
      ]
     },
     "art_ids": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/id"
      },
      "minItems": 1
     },
     "direction_ids": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/id"
      },
      "minItems": 1
     },
     "staging": {
      "type": "array",
      "items": {
       "type": "object",
       "additionalProperties": false,
       "required": [
        "rig",
        "root_xy",
        "scale"
       ],
       "properties": {
        "rig": {
         "$ref": "#/$defs/id"
        },
        "root_xy": {
         "type": "array",
         "minItems": 2,
         "maxItems": 2,
         "items": {
          "type": "number"
         }
        },
        "scale": {
         "type": "number",
         "exclusiveMinimum": 0
        }
       }
      }
     },
     "contact_events": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/contact"
      }
     },
     "pose_events": {
      "type": "array",
      "items": {
       "type": "object",
       "additionalProperties": false,
       "required": [
        "frame",
        "state",
        "rig",
        "transition"
       ],
       "properties": {
        "frame": {
         "type": "integer",
         "minimum": 0
        },
        "state": {
         "$ref": "#/$defs/id"
        },
        "rig": {
         "$ref": "#/$defs/id"
        },
        "transition": {
         "$ref": "#/$defs/policy"
        }
       }
      }
     },
     "view_events": {
      "type": "array",
      "items": {
       "type": "object",
       "additionalProperties": false,
       "required": [
        "frame",
        "from",
        "to",
        "rig",
        "transition"
       ],
       "properties": {
        "frame": {
         "type": "integer",
         "minimum": 0
        },
        "from": {
         "$ref": "#/$defs/id"
        },
        "to": {
         "$ref": "#/$defs/id"
        },
        "rig": {
         "$ref": "#/$defs/id"
        },
        "transition": {
         "$ref": "#/$defs/policy"
        }
       }
      }
     },
     "state_events": {
      "type": "array",
      "items": {
       "type": "object",
       "additionalProperties": false,
       "required": [
        "frame",
        "channel",
        "state",
        "rig",
        "transition"
       ],
       "properties": {
        "frame": {
         "type": "integer",
         "minimum": 0
        },
        "channel": {
         "$ref": "#/$defs/id"
        },
        "state": {
         "$ref": "#/$defs/id"
        },
        "rig": {
         "$ref": "#/$defs/id"
        },
        "transition": {
         "$ref": "#/$defs/policy"
        }
       }
      }
     },
     "secondary_purpose": {
      "type": [
       "string",
       "null"
      ]
     }
    }
   },
   "minItems": 1
  },
  "transitions": {
   "type": "array",
   "items": {
    "type": "object",
    "additionalProperties": false,
    "required": [
     "from_shot",
     "to_shot",
     "mode",
     "frames",
     "reason",
     "continuity_invariant",
     "out",
     "middle",
     "in",
     "masks",
     "shared_landmarks"
    ],
    "properties": {
     "from_shot": {
      "$ref": "#/$defs/id"
     },
     "to_shot": {
      "$ref": "#/$defs/id"
     },
     "mode": {
      "enum": [
       "CUT",
       "CONTINUOUS"
      ]
     },
     "frames": {
      "$ref": "#/$defs/frames"
     },
     "reason": {
      "$ref": "#/$defs/text"
     },
     "continuity_invariant": {
      "$ref": "#/$defs/text"
     },
     "out": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/id"
      }
     },
     "middle": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/id"
      }
     },
     "in": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/id"
      }
     },
     "masks": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/id"
      }
     },
     "shared_landmarks": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/id"
      }
     }
    }
   }
  },
  "phrases": {
   "type": "array",
   "items": {
    "type": "object"
   }
  },
  "art_requirements": {
   "type": "array",
   "items": {
    "type": "object",
    "additionalProperties": false,
    "required": [
     "id",
     "identity",
     "kind",
     "medium",
     "master_id",
     "purpose",
     "state",
     "required_by",
     "required_parts",
     "landmarks",
     "construction",
     "review_checks",
     "alpha_mode",
     "depth_band",
     "method_ids",
     "joint",
     "pivot_landmark",
     "hidden_surfaces",
     "underpaint",
     "no_underpaint_reason",
     "draw_order",
     "overscan_required",
     "overscan_rect"
    ],
    "properties": {
     "id": {
      "$ref": "#/$defs/id"
     },
     "identity": {
      "$ref": "#/$defs/id"
     },
     "kind": {
      "enum": [
       "MASTER",
       "PART",
       "CEL",
       "CLEAN_PLATE",
       "UNDERPAINT",
       "OCCLUDER",
       "MASK",
       "WORLD_PLANE",
       "SYMBOL",
       "VECTOR_PATH",
       "TYPE",
       "MATERIAL_PLANE",
       "EFFECT_STATE",
       "TRANSITION_PLATE"
      ]
     },
     "medium": {
      "enum": [
       "RASTER",
       "VECTOR"
      ]
     },
     "master_id": {
      "anyOf": [
       {
        "$ref": "#/$defs/id"
       },
       {
        "type": "null"
       }
      ]
     },
     "purpose": {
      "$ref": "#/$defs/text"
     },
     "state": {
      "type": "object",
      "additionalProperties": false,
      "required": [
       "view",
       "pose",
       "expression",
       "eyes",
       "mouth",
       "hand",
       "lighting",
       "occlusion"
      ],
      "properties": {
       "view": {
        "type": [
         "string",
         "null"
        ]
       },
       "pose": {
        "type": [
         "string",
         "null"
        ]
       },
       "expression": {
        "type": [
         "string",
         "null"
        ]
       },
       "eyes": {
        "type": [
         "string",
         "null"
        ]
       },
       "mouth": {
        "type": [
         "string",
         "null"
        ]
       },
       "hand": {
        "type": [
         "string",
         "null"
        ]
       },
       "lighting": {
        "type": [
         "string",
         "null"
        ]
       },
       "occlusion": {
        "type": [
         "string",
         "null"
        ]
       }
      }
     },
     "required_by": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/id"
      },
      "minItems": 1
     },
     "required_parts": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/id"
      }
     },
     "landmarks": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/id"
      }
     },
     "construction": {
      "$ref": "#/$defs/text"
     },
     "review_checks": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/text"
      },
      "minItems": 1
     },
     "alpha_mode": {
      "enum": [
       "OPAQUE",
       "STRAIGHT",
       "PREMULTIPLIED",
       "BINARY_MASK"
      ]
     },
     "depth_band": {
      "enum": [
       "FAR",
       "MID",
       "FOCAL",
       "NEAR",
       "FOREGROUND",
       "SCREEN"
      ]
     },
     "method_ids": {
      "type": "array",
      "items": {
       "type": "string",
       "pattern": "^F(0[1-9]|[1-7][0-9]|80)$"
      }
     },
     "joint": {
      "anyOf": [
       {
        "$ref": "#/$defs/id"
       },
       {
        "type": "null"
       }
      ]
     },
     "pivot_landmark": {
      "anyOf": [
       {
        "$ref": "#/$defs/id"
       },
       {
        "type": "null"
       }
      ]
     },
     "hidden_surfaces": {
      "type": "array",
      "items": {
       "$ref": "#/$defs/id"
      }
     },
     "underpaint": {
      "type": "object",
      "additionalProperties": {
       "$ref": "#/$defs/id"
      }
     },
     "no_underpaint_reason": {
      "type": [
       "string",
       "null"
      ]
     },
     "draw_order": {
      "type": "array",
      "items": {
       "type": "object",
       "additionalProperties": false,
       "required": [
        "relation",
        "art_id"
       ],
       "properties": {
        "relation": {
         "enum": [
          "ABOVE",
          "BELOW"
         ]
        },
        "art_id": {
         "$ref": "#/$defs/id"
        }
       }
      }
     },
     "overscan_required": {
      "type": "boolean"
     },
     "overscan_rect": {
      "anyOf": [
       {
        "type": "array",
        "minItems": 4,
        "maxItems": 4,
        "items": {
         "type": "number"
        }
       },
       {
        "type": "null"
       }
      ]
     }
    }
   },
   "minItems": 1
  },
  "audio_cues": {
   "type": "array",
   "items": {
    "type": "object",
    "additionalProperties": false,
    "required": [
     "id",
     "kind",
     "frames",
     "intent",
     "related_action",
     "source_file",
     "gain_db",
     "narration_line",
     "relation",
     "event",
     "word_index",
     "max_frames",
     "hold_frames"
    ],
    "properties": {
     "id": {
      "$ref": "#/$defs/id"
     },
     "kind": {
      "enum": [
       "NARRATION",
       "SFX",
       "MUSIC",
       "SILENCE"
      ]
     },
     "frames": {
      "$ref": "#/$defs/frames"
     },
     "intent": {
      "$ref": "#/$defs/text"
     },
     "related_action": {
      "anyOf": [
       {
        "$ref": "#/$defs/id"
       },
       {
        "type": "null"
       }
      ]
     },
     "source_file": {
      "type": [
       "string",
       "null"
      ]
     },
     "gain_db": {
      "anyOf": [
       {
        "type": "number"
       },
       {
        "type": "null"
       }
      ]
     },
     "narration_line": {
      "anyOf": [
       {
        "$ref": "#/$defs/id"
       },
       {
        "type": "null"
       }
      ]
     },
     "relation": {
      "anyOf": [
       {
        "enum": [
         "PRECEDES",
         "LANDS_ON",
         "FOLLOWS"
        ]
       },
       {
        "type": "null"
       }
      ]
     },
     "event": {
      "anyOf": [
       {
        "$ref": "#/$defs/id"
       },
       {
        "type": "null"
       }
      ]
     },
     "word_index": {
      "anyOf": [
       {
        "type": "integer",
        "minimum": 0
       },
       {
        "type": "null"
       }
      ]
     },
     "max_frames": {
      "anyOf": [
       {
        "type": "integer",
        "minimum": 0
       },
       {
        "type": "null"
       }
      ]
     },
     "hold_frames": {
      "anyOf": [
       {
        "type": "integer",
        "minimum": 0
       },
       {
        "type": "null"
       }
      ]
     }
    }
   },
   "minItems": 1
  },
  "approval": {
   "type": "object",
   "additionalProperties": false,
   "required": [
    "status",
    "receipt"
   ],
   "properties": {
    "status": {
     "enum": [
      "DRAFT",
      "CREATIVE_REVIEW_REQUIRED",
      "CREATIVE_APPROVED"
     ]
    },
    "receipt": {
     "type": [
      "string",
      "null"
     ]
    }
   }
  }
 },
 "$defs": {
  "id": {
   "type": "string",
   "pattern": "^[A-Za-z][A-Za-z0-9_.-]{0,95}$"
  },
  "text": {
   "type": "string",
   "minLength": 1
  },
  "sha": {
   "type": "string",
   "pattern": "^[a-f0-9]{64}$"
  },
  "frames": {
   "type": "array",
   "minItems": 2,
   "maxItems": 2,
   "items": {
    "type": "integer",
    "minimum": 0
   }
  },
  "carried": {
   "type": "object",
   "additionalProperties": false,
   "required": [
    "owner",
    "channel",
    "state"
   ],
   "properties": {
    "owner": {
     "$ref": "#/$defs/id"
    },
    "channel": {
     "$ref": "#/$defs/id"
    },
    "state": {
     "$ref": "#/$defs/id"
    }
   }
  },
  "policy": {
   "type": "object",
   "additionalProperties": false,
   "required": [
    "policy",
    "reason",
    "intermediate_states"
   ],
   "properties": {
    "policy": {
     "enum": [
      "SWAP",
      "INTERMEDIATE"
     ]
    },
    "reason": {
     "$ref": "#/$defs/text"
    },
    "intermediate_states": {
     "type": "array",
     "items": {
      "$ref": "#/$defs/id"
     }
    }
   }
  },
  "rig": {
   "type": "object",
   "additionalProperties": false,
   "required": [
    "id",
    "root",
    "joints",
    "parts",
    "sockets",
    "ik",
    "channels",
    "poses",
    "views",
    "edges"
   ],
   "properties": {
    "id": {
     "$ref": "#/$defs/id"
    },
    "root": {
     "$ref": "#/$defs/id"
    },
    "joints": {
     "type": "array",
     "items": {
      "type": "object",
      "additionalProperties": false,
      "required": [
       "id",
       "parent",
       "landmark",
       "limits_deg"
      ],
      "properties": {
       "id": {
        "$ref": "#/$defs/id"
       },
       "parent": {
        "anyOf": [
         {
          "$ref": "#/$defs/id"
         },
         {
          "type": "null"
         }
        ]
       },
       "landmark": {
        "$ref": "#/$defs/id"
       },
       "limits_deg": {
        "type": "array",
        "minItems": 2,
        "maxItems": 2,
        "items": {
         "type": "number"
        }
       }
      }
     },
     "minItems": 1
    },
    "parts": {
     "type": "array",
     "items": {
      "type": "object",
      "additionalProperties": false,
      "required": [
       "art_id",
       "joint"
      ],
      "properties": {
       "art_id": {
        "$ref": "#/$defs/id"
       },
       "joint": {
        "$ref": "#/$defs/id"
       }
      }
     },
     "minItems": 1
    },
    "sockets": {
     "type": "array",
     "items": {
      "type": "object",
      "additionalProperties": false,
      "required": [
       "id",
       "joint",
       "landmark",
       "role"
      ],
      "properties": {
       "id": {
        "$ref": "#/$defs/id"
       },
       "joint": {
        "$ref": "#/$defs/id"
       },
       "landmark": {
        "$ref": "#/$defs/id"
       },
       "role": {
        "$ref": "#/$defs/text"
       }
      }
     }
    },
    "ik": {
     "type": "array",
     "items": {
      "type": "object",
      "additionalProperties": false,
      "required": [
       "id",
       "chain",
       "bend_sign"
      ],
      "properties": {
       "id": {
        "$ref": "#/$defs/id"
       },
       "chain": {
        "type": "array",
        "minItems": 3,
        "maxItems": 3,
        "items": {
         "$ref": "#/$defs/id"
        }
       },
       "bend_sign": {
        "enum": [
         1,
         -1
        ]
       }
      }
     }
    },
    "channels": {
     "type": "array",
     "items": {
      "type": "object",
      "additionalProperties": false,
      "required": [
       "id",
       "kind",
       "slots",
       "default",
       "states"
      ],
      "properties": {
       "id": {
        "$ref": "#/$defs/id"
       },
       "kind": {
        "enum": [
         "EXPRESSION",
         "EYES",
         "MOUTH",
         "HAND",
         "CLOTHING",
         "LIGHTING",
         "OCCLUSION"
        ]
       },
       "slots": {
        "type": "array",
        "items": {
         "$ref": "#/$defs/id"
        },
        "minItems": 1
       },
       "default": {
        "$ref": "#/$defs/id"
       },
       "states": {
        "type": "array",
        "items": {
         "type": "object",
         "additionalProperties": false,
         "required": [
          "id",
          "bindings"
         ],
         "properties": {
          "id": {
           "$ref": "#/$defs/id"
          },
          "bindings": {
           "type": "object",
           "additionalProperties": {
            "$ref": "#/$defs/id"
           }
          }
         }
        },
        "minItems": 1
       }
      }
     }
    },
    "poses": {
     "type": "array",
     "items": {
      "type": "object",
      "additionalProperties": false,
      "required": [
       "id",
       "bindings",
       "landmarks"
      ],
      "properties": {
       "id": {
        "$ref": "#/$defs/id"
       },
       "bindings": {
        "type": "object",
        "additionalProperties": {
         "$ref": "#/$defs/id"
        }
       },
       "landmarks": {
        "type": "array",
        "items": {
         "$ref": "#/$defs/id"
        }
       }
      }
     },
     "minItems": 1
    },
    "views": {
     "type": "array",
     "items": {
      "type": "object",
      "additionalProperties": false,
      "required": [
       "id",
       "facing",
       "bindings",
       "landmarks"
      ],
      "properties": {
       "id": {
        "$ref": "#/$defs/id"
       },
       "facing": {
        "$ref": "#/$defs/id"
       },
       "bindings": {
        "type": "object",
        "additionalProperties": {
         "$ref": "#/$defs/id"
        }
       },
       "landmarks": {
        "type": "array",
        "items": {
         "$ref": "#/$defs/id"
        }
       }
      }
     }
    },
    "edges": {
     "type": "array",
     "items": {
      "type": "object",
      "additionalProperties": false,
      "required": [
       "from",
       "to",
       "mode",
       "landmarks",
       "max_transition_frames",
       "occluder"
      ],
      "properties": {
       "from": {
        "$ref": "#/$defs/id"
       },
       "to": {
        "$ref": "#/$defs/id"
       },
       "mode": {
        "enum": [
         "RIGID_CONTINUOUS",
         "CEL_SEQUENCE",
         "MATCHED_VECTOR_MORPH",
         "REGISTERED_SWAP",
         "EXPLICIT_DEFORM"
        ]
       },
       "landmarks": {
        "type": "array",
        "items": {
         "$ref": "#/$defs/id"
        },
        "minItems": 1
       },
       "max_transition_frames": {
        "type": "integer",
        "minimum": 0
       },
       "occluder": {
        "anyOf": [
         {
          "$ref": "#/$defs/id"
         },
         {
          "type": "null"
         }
        ]
       }
      }
     }
    }
   }
  },
  "acting": {
   "type": "object",
   "additionalProperties": false,
   "required": [
    "intent"
   ],
   "properties": {
    "intent": {
     "$ref": "#/$defs/text"
    },
    "blink": {
     "type": "object",
     "additionalProperties": false,
     "required": [
      "channel",
      "open",
      "closed"
     ],
     "properties": {
      "channel": {
       "$ref": "#/$defs/id"
      },
      "open": {
       "$ref": "#/$defs/id"
      },
      "closed": {
       "$ref": "#/$defs/id"
      }
     }
    },
    "speech": {
     "type": "object",
     "additionalProperties": false,
     "required": [
      "channel",
      "rest",
      "open",
      "mid"
     ],
     "properties": {
      "channel": {
       "$ref": "#/$defs/id"
      },
      "rest": {
       "$ref": "#/$defs/id"
      },
      "open": {
       "$ref": "#/$defs/id"
      },
      "mid": {
       "$ref": "#/$defs/id"
      }
     }
    },
    "breath": {
     "type": "boolean"
    },
    "gaze": {
     "type": "boolean"
    },
    "follow": {
     "type": "array",
     "items": {
      "$ref": "#/$defs/id"
     }
    },
    "lag": {
     "type": "boolean"
    }
   }
  },
  "contact": {
   "type": "object",
   "additionalProperties": false,
   "required": [
    "type",
    "source_socket",
    "target_socket",
    "target_world",
    "frames",
    "release_required",
    "near_far",
    "topology",
    "topology_reason",
    "finger_layers",
    "closure_channel",
    "closure_state",
    "palm_landmarks",
    "handle_landmarks"
   ],
   "properties": {
    "type": {
     "enum": [
      "GRIP",
      "PLANT",
      "SUPPORT",
      "HINGE",
      "SLIDE",
      "COLLISION",
      "FOLLOW",
      "PINCH"
     ]
    },
    "source_socket": {
     "$ref": "#/$defs/id"
    },
    "target_socket": {
     "anyOf": [
      {
       "$ref": "#/$defs/id"
      },
      {
       "type": "null"
      }
     ]
    },
    "target_world": {
     "type": "boolean"
    },
    "frames": {
     "$ref": "#/$defs/frames"
    },
    "release_required": {
     "type": "boolean"
    },
    "near_far": {
     "$ref": "#/$defs/text"
    },
    "topology": {
     "anyOf": [
      {
       "enum": [
        "WRAP",
        "SINGLE_LAYER"
       ]
      },
      {
       "type": "null"
      }
     ]
    },
    "topology_reason": {
     "type": [
      "string",
      "null"
     ]
    },
    "finger_layers": {
     "anyOf": [
      {
       "type": "object",
       "additionalProperties": false,
       "required": [
        "near",
        "far"
       ],
       "properties": {
        "near": {
         "type": "array",
         "items": {
          "$ref": "#/$defs/id"
         },
         "minItems": 1
        },
        "far": {
         "type": "array",
         "items": {
          "$ref": "#/$defs/id"
         },
         "minItems": 1
        }
       }
      },
      {
       "type": "null"
      }
     ]
    },
    "closure_channel": {
     "anyOf": [
      {
       "$ref": "#/$defs/id"
      },
      {
       "type": "null"
      }
     ]
    },
    "closure_state": {
     "anyOf": [
      {
       "$ref": "#/$defs/id"
      },
      {
       "type": "null"
      }
     ]
    },
    "palm_landmarks": {
     "type": "array",
     "items": {
      "$ref": "#/$defs/id"
     }
    },
    "handle_landmarks": {
     "type": "array",
     "items": {
      "$ref": "#/$defs/id"
     }
    }
   }
  }
 }
}

---

# DOCUMENT 2
SOURCE: docs/gpt-creative-control/OPERATOR_WORKFLOW.md
SOURCE_BLOB: 808e5779342388f21bcff4fb44cb8fca2a2c0406

# Operator workflow: from a new GPT creative package to a finished 600-frame film

This is the executable workflow. Everything in `<angle brackets>` is yours. The engine authors no story, direction or art, and approves nothing. Every step that cannot continue prints a typed reason and the next permitted operation.

The packet version that can be executed is **1.1.0** (`schemas/creative_packet_v1_1.schema.json`). A 1.0.0 draft packet can be validated, but it cannot be imported: it has no typed place for verbs, measurable operations, the 12-part shot contract, rig topology, states, transitions or layering. `preflight` lists exactly what is missing and nothing is guessed.

## Once, before the first film

1. Reviewer key, on the reviewer's own machine, outside every repository:
   `openssl genpkey -algorithm ed25519 -out reviewer_private.pem` and `openssl pkey -in reviewer_private.pem -pubout -out reviewer_public.pem`
2. `REVIEWERS.json`, also outside the repository: `{"reviewers":[{"id":"<you>","public_key_pem":"<contents of reviewer_public.pem>"}]}`. Set `ART_BRIDGE_REVIEWER_KEYS_FILE` to its path. Add `"revoked_utc"` to an entry to revoke that key.
3. The F01–F80 source witnesses must be present under `reference/construct-kurzgesagt-art/assets` (they are not published).
4. Decide the length. 10 seconds = `total_frames: 600`. Any length from 1 to 216000 frames is accepted.

Signing any request: `node engine/tools/reviewer_sign_offline.mjs --request <folder>/REVIEW_REQUEST.json --key <private key> --reviewer <you> --verdict APPROVED --out SIGNED_REVIEW.json` (interactive terminal only), then `node engine/tools/review_sign.mjs import --film <FILM> --signed SIGNED_REVIEW.json`.

## Stage 1–3: the creative package (ChatGPT + you)

1. New ChatGPT conversation with `NEW_CHAT_CREATIVE_DIRECTOR.md`, the complete `inputs/EXPERIENCE_DIRECTOR_V1.md`, the F01–F80 skill and `schemas/creative_packet_v1_1.schema.json`.
2. Return one folder: `CREATIVE_PACKET.json` (v1.1.0) plus the files it names (`01_SCRIPT.md`, documents), with their SHA-256 in `source`.
3. `node engine/tools/creative_handoff.mjs validate --packet <FOLDER>/CREATIVE_PACKET.json`
4. `node engine/tools/creative_handoff.mjs preflight --packet <FOLDER>/CREATIVE_PACKET.json` → the capability ledger and typed feedback.
   If it is not supported: `node engine/tools/creative_handoff.mjs export-feedback --film <FILM> --packet <FOLDER>/CREATIVE_PACKET.json --out FEEDBACK.json`, give that file to ChatGPT, get a new packet revision, repeat. The engine never simplifies the direction.

What the preflight refuses today (it must be directed differently or implemented first): verbs without an executed visual measure (LOAD_CONTAINER, INSERT_TOKEN, CARRY and anything not in the registry); contacts HINGE, SLIDE, COLLISION, PINCH (mechanism hinges are executed as REACT decisions); camera ORBIT and DOLLY_3D; a view with no drawings of its own.

## Stage 3 approval

5. `node engine/tools/creative_handoff.mjs import --film <FILM> --packet <FOLDER>/CREATIVE_PACKET.json` (immutable, hashes checked; prints the digest).
6. `node engine/tools/review_sign.mjs request --film <FILM> --scope creative_packet --id <DIGEST>` → inspect → sign → import.
7. `node engine/tools/creative_handoff.mjs accept --film <FILM> --packet-digest <DIGEST>` compiles the story, direction, semantic actions, shot score, manifest draft, art plan and motion obligations. That one signature covers story and direction only while every compiled file still equals the approved packet.

## Stage 4: artwork (manual ChatGPT, no API)

8. Per master: write `art_designs/<MASTER>.design.json` with the F01–F80 skill (`art_designs/DESIGN_REQUESTS.json` lists what it must decide), check it with `node engine/tools/art_outbox.mjs check-design --film <FILM> --asset <MASTER>` and approve it (`review_sign.mjs request --film <FILM> --scope design --id <MASTER>` → sign → import).
9. `node engine/tools/art_outbox.mjs export --film <FILM> --out <OUTBOX>`; a job that cannot be exported says why (`blocked_reason` in `OUTBOX_INDEX.json`).
10. For every job and every stage K (one drawing can need several ordered stages):
    - `node engine/tools/art_outbox.mjs export-gpt-job --film <FILM> --out <OUTBOX> --job <JOB> --stage <K>` writes one zip.
    - New ChatGPT conversation, exactly as `WHAT_TO_DO_IN_CHATGPT.md` inside the zip says. Put the unmodified PNG (SVG for a VECTOR drawing) and the filled `IMPORT_MANIFEST.json` in one folder.
    - `node engine/tools/art_outbox.mjs import-gpt-candidates --film <FILM> --out <OUTBOX> --bundle <FOLDER>`
    - `node engine/tools/art_outbox.mjs select-candidate --out <OUTBOX> --job <JOB> --stage <K> --candidate <CANDIDATE>`
11. Masters first: `node engine/tools/art_outbox.mjs ingest-master --film <FILM> --out <OUTBOX> --asset <ID> --file <selected candidate> --landmarks <sidecar.json> --provenance GPT_OPERATOR_HANDOFF`, then `review_sign.mjs request --film <FILM> --scope master --id <IDENTITY>` → sign → import. The sidecar contains the reviewed pixel position of every landmark the packet names. The rig is measured from these pixels; no provisional geometry exists.

## Stage 5–6: motion

12. Engineering writes `handoff/MOTION_PLAN.json` against `handoff/MOTION_OBLIGATIONS.json`. Before any part artwork is released, the measured masters must be physically able to perform every action (parts stay `BLOCKED_FEASIBILITY_NOT_EVALUATED` or `BLOCKED_RIG_FIT_INFEASIBLE` until then).
13. Step 9 again, then step 10 for parts, cels, underpaint, planes and vectors, then `node engine/tools/art_outbox.mjs ingest-part --film <FILM> --out <OUTBOX> --asset <ID> --file <selected candidate> --landmarks <sidecar.json> --provenance GPT_OPERATOR_HANDOFF` (a `.svg` file is registered as a vector), then `review_sign.mjs` for parts, states (`RIG::STATE`, `RIG::CHANNEL.STATE`), edges and deformations.
14. `node engine/tools/creative_handoff.mjs post-art --film <FILM>`: every required frame, on the approved art. Every failure names who changes what: MISSING_ART_STATE, BAD_MEASUREMENT_OR_ART, RESTAGING (needs your approval), MOTION_PLAN (engineering) or ENGINE_DEFECT. `export-feedback` writes it for ChatGPT.

## Stage 7: film

15. Recorded narration with a measured forced alignment, SFX and music go into `audio/` and the plan's `audio_buses`. Without them the stage stops with AUDIO_INPUT_MISSING and no timing is invented.
16. `node engine/tools/production_run.mjs preflight --film <FILM>` (read-only), then `start --film <FILM>`, `status --film <FILM>`, `why --film <FILM> --failure <ID>`, `resume --film <FILM>`.
17. Watch `render/film_final.mp4` with sound, then `review_sign.mjs request --film <FILM> --scope final_film` → sign → import → `resume`. Any changed byte makes the decision stale.

`node engine/tools/creative_handoff.mjs status --film <FILM>` shows the computed status of every gate and the next operation at any time.

## Revising an approved package

Import the new packet, approve its digest, accept it. The result lists exactly what became stale. Delivered drawings whose own requirement did not change are kept; nothing is deleted.

## How the seven stages map to the production stages

| Contract stage | Gate | Executable tasks |
|---|---|---|
| 1 story | CREATIVE_STRUCTURALLY_VALID, CREATIVE_APPROVED | `creative_handoff validate`; S00 `film_intent`; S01 `creative_packet`, `story_contract`, `story_approval` |
| 2 direction | CREATIVE_APPROVED | S02 `attention_*`, `direction_approval`; S03 `tiling`, `actions_*`, `manifest_integrity`, `narration_timeline` |
| 3 art plan | PREART_FEASIBLE | `creative_handoff preflight`; S03 `creative_preflight`; S04 `demand_*`, `creative_art_complete` |
| 4 artwork | ART_CANDIDATES_DELIVERED, ART_APPROVED | `art_outbox` export/import/select; S05 `asset_*`; S06 `registration_*`, `states_edges` |
| 5 fit | POSTART_MOTION_FEASIBLE | `creative_handoff post-art`; S06 `geometry_measured`, `motion_plan_source`, `motion_obligations`, `feasibility_*`, `feasibility_complete_*`, `support_*`, `reaction_*`, `grip_*`, `deform_*`, `morph_*`, `semantic_consequences`, `direction_decisions`, `framing`, `contact_patch`, `shadow_continuity`, `production_ir` |
| 6 motion | MOTION_EXECUTION_QUALIFIED | S07 `chunk_*`, `assemble`; S08 `render_receipt`, `frame_trace_index`, `coverage_gate` (own-pixel decisions) |
| 7 film | FINAL_FILM_REVIEWED | S09 `audio_mix`, `av_sync`, `final_mux`, `final_media`, `film_review` |

In a film whose rigs are measured from artwork, every measured motion task belongs to S06, because nothing geometric can be known at S03.

---

# DOCUMENT 3
SOURCE: docs/the-better-one/PERFORMANCE_COMMAND_SCHEMA_V1.json
SOURCE_BLOB: d2c723fd942351fc1aa5bee83e3b18d76ad1686f

{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:the-better-one:performance-command-v1",
  "title": "The Better One reusable semantic performance command packet v1",
  "description": "Proposed normalized adapter input. Does NOT certify render consumer, frame closure, human approvals or art quality until wired and proved on P05.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schema_version",
    "film_id",
    "fps",
    "total_frames",
    "characters",
    "commands"
  ],
  "properties": {
    "schema_version": {
      "const": "1.0.0"
    },
    "film_id": {
      "type": "string",
      "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
    },
    "fps": {
      "const": 60
    },
    "total_frames": {
      "type": "integer",
      "minimum": 1
    },
    "characters": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "actor_rig_id",
          "master_sha",
          "topology_kind",
          "character_profile_id",
          "role_map",
          "approved_state_channels",
          "approved_motion_routes"
        ],
        "properties": {
          "actor_rig_id": {
            "type": "string",
            "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
          },
          "master_sha": {
            "type": "string",
            "pattern": "^[a-f0-9]{64}$"
          },
          "topology_kind": {
            "enum": [
              "BIPED",
              "QUADRUPED",
              "NONHUMAN",
              "MECHANISM",
              "ABSTRACT"
            ]
          },
          "character_profile_id": {
            "type": "string",
            "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
          },
          "role_map": {
            "type": "object",
            "additionalProperties": {
              "type": "string",
              "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
            }
          },
          "approved_state_channels": {
            "type": "array",
            "items": {
              "type": "string",
              "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
            }
          },
          "approved_motion_routes": {
            "type": "array",
            "items": {
              "enum": [
                "RIGID_2D",
                "PART_RIG_2D",
                "APPROVED_CELS",
                "APPROVED_DEFORM",
                "BLENDER_3D",
                "SEMANTIC_GRAPHICS",
                "WORLD_CAMERA_TRANSITION"
              ]
            }
          }
        }
      }
    },
    "commands": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "id",
          "action_id",
          "direction_decision_ids",
          "actor_rig_id",
          "character_profile_id",
          "verb",
          "frames",
          "intent",
          "required_prestate",
          "required_poststate",
          "phases",
          "motion_routes",
          "required_art_refs",
          "expected_effects",
          "override_policy",
          "source_digest"
        ],
        "properties": {
          "id": {
            "type": "string",
            "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
          },
          "action_id": {
            "type": "string",
            "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
          },
          "direction_decision_ids": {
            "type": "array",
            "minItems": 1,
            "items": {
              "type": "string",
              "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
            },
            "uniqueItems": true
          },
          "actor_rig_id": {
            "type": "string",
            "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
          },
          "character_profile_id": {
            "type": "string",
            "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
          },
          "verb": {
            "enum": [
              "look_at",
              "blink",
              "turn_head",
              "speak",
              "reach",
              "grip",
              "release",
              "walk",
              "react",
              "change_expression",
              "point",
              "idle",
              "turn_body",
              "hold"
            ]
          },
          "frames": {
            "type": "array",
            "prefixItems": [
              {
                "type": "integer",
                "minimum": 0
              },
              {
                "type": "integer",
                "minimum": 1
              }
            ],
            "items": false,
            "minItems": 2,
            "maxItems": 2
          },
          "target": {
            "anyOf": [
              {
                "oneOf": [
                  {
                    "type": "object",
                    "additionalProperties": false,
                    "required": [
                      "kind",
                      "xy",
                      "space"
                    ],
                    "properties": {
                      "kind": {
                        "const": "WORLD_POINT"
                      },
                      "xy": {
                        "type": "array",
                        "prefixItems": [
                          {
                            "type": "number"
                          },
                          {
                            "type": "number"
                          }
                        ],
                        "items": false,
                        "minItems": 2,
                        "maxItems": 2
                      },
                      "space": {
                        "enum": [
                          "WORLD_CSS_PX",
                          "CANONICAL_2D"
                        ]
                      }
                    }
                  },
                  {
                    "type": "object",
                    "additionalProperties": false,
                    "required": [
                      "kind",
                      "rig_id",
                      "socket_id"
                    ],
                    "properties": {
                      "kind": {
                        "const": "RIG_SOCKET"
                      },
                      "rig_id": {
                        "type": "string",
                        "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
                      },
                      "socket_id": {
                        "type": "string",
                        "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
                      }
                    }
                  },
                  {
                    "type": "object",
                    "additionalProperties": false,
                    "required": [
                      "kind",
                      "cue_id"
                    ],
                    "properties": {
                      "kind": {
                        "const": "AUDIO_CUE"
                      },
                      "cue_id": {
                        "type": "string",
                        "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
                      }
                    }
                  },
                  {
                    "type": "object",
                    "additionalProperties": false,
                    "required": [
                      "kind",
                      "object_id"
                    ],
                    "properties": {
                      "kind": {
                        "const": "OBJECT"
                      },
                      "object_id": {
                        "type": "string",
                        "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
                      }
                    }
                  }
                ]
              },
              {
                "type": "null"
              }
            ]
          },
          "intent": {
            "type": "string",
            "minLength": 3
          },
          "required_prestate": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "channel_states",
              "possession"
            ],
            "properties": {
              "channel_states": {
                "type": "object",
                "additionalProperties": {
                  "type": "string",
                  "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
                }
              },
              "possession": {
                "type": "object",
                "additionalProperties": {
                  "type": [
                    "string",
                    "null"
                  ]
                }
              },
              "pose_id": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "view_id": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "support_socket_ids": {
                "type": "array",
                "items": {
                  "type": "string",
                  "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
                }
              }
            }
          },
          "required_poststate": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "channel_states",
              "possession"
            ],
            "properties": {
              "channel_states": {
                "type": "object",
                "additionalProperties": {
                  "type": "string",
                  "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
                }
              },
              "possession": {
                "type": "object",
                "additionalProperties": {
                  "type": [
                    "string",
                    "null"
                  ]
                }
              },
              "pose_id": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "view_id": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "support_socket_ids": {
                "type": "array",
                "items": {
                  "type": "string",
                  "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
                }
              }
            }
          },
          "phases": {
            "type": "array",
            "minItems": 1,
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "id",
                "frames",
                "goal",
                "expected_owner_effect"
              ],
              "properties": {
                "id": {
                  "type": "string",
                  "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
                },
                "frames": {
                  "type": "array",
                  "prefixItems": [
                    {
                      "type": "integer",
                      "minimum": 0
                    },
                    {
                      "type": "integer",
                      "minimum": 1
                    }
                  ],
                  "items": false,
                  "minItems": 2,
                  "maxItems": 2
                },
                "goal": {
                  "type": "string",
                  "minLength": 3
                },
                "expected_owner_effect": {
                  "type": "string",
                  "minLength": 3
                }
              }
            }
          },
          "motion_routes": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true,
            "items": {
              "enum": [
                "RIGID_2D",
                "PART_RIG_2D",
                "APPROVED_CELS",
                "APPROVED_DEFORM",
                "BLENDER_3D",
                "SEMANTIC_GRAPHICS",
                "WORLD_CAMERA_TRANSITION"
              ]
            }
          },
          "required_art_refs": {
            "type": "array",
            "items": {
              "type": "string",
              "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
            },
            "uniqueItems": true
          },
          "expected_effects": {
            "type": "array",
            "minItems": 1,
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "kind",
                "owner_id",
                "frames",
                "test_id",
                "human_quality_check"
              ],
              "properties": {
                "kind": {
                  "enum": [
                    "GazeTowardTarget",
                    "EyeStateTransition",
                    "ApprovedViewTransition",
                    "SpeechAudioVisualSync",
                    "ContactApproach",
                    "PaintedGripMaintained",
                    "ReleaseAndSeparation",
                    "PlantedFootStable",
                    "PurposefulEmotionRendered",
                    "ExpressionStateReached",
                    "ApprovedPointerAligned",
                    "LegalIdleHold",
                    "ApprovedBodyTurn",
                    "PoseContactHold",
                    "PropReaction",
                    "CameraWorldCoverage",
                    "ModelResultRendered"
                  ]
                },
                "owner_id": {
                  "type": "string",
                  "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
                },
                "frames": {
                  "type": "array",
                  "prefixItems": [
                    {
                      "type": "integer",
                      "minimum": 0
                    },
                    {
                      "type": "integer",
                      "minimum": 1
                    }
                  ],
                  "items": false,
                  "minItems": 2,
                  "maxItems": 2
                },
                "test_id": {
                  "type": "string",
                  "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
                },
                "human_quality_check": {
                  "type": "string",
                  "minLength": 3
                },
                "minimum": {
                  "type": "number"
                },
                "units": {
                  "enum": [
                    "px",
                    "deg",
                    "frames",
                    "ratio",
                    "none"
                  ]
                }
              }
            }
          },
          "override_policy": {
            "enum": [
              "DIRECTOR_PRIORITY_STRICT",
              "STRICT_CONFLICT"
            ]
          },
          "source_digest": {
            "type": "string",
            "pattern": "^[a-f0-9]{64}$"
          }
        },
        "allOf": [
          {
            "if": {
              "properties": {
                "verb": {
                  "const": "look_at"
                }
              },
              "required": [
                "verb"
              ]
            },
            "then": {
              "required": [
                "target"
              ]
            }
          },
          {
            "if": {
              "properties": {
                "verb": {
                  "const": "speak"
                }
              },
              "required": [
                "verb"
              ]
            },
            "then": {
              "properties": {
                "target": {
                  "type": "object",
                  "additionalProperties": false,
                  "required": [
                    "kind",
                    "cue_id"
                  ],
                  "properties": {
                    "kind": {
                      "const": "AUDIO_CUE"
                    },
                    "cue_id": {
                      "type": "string",
                      "pattern": "^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$"
                    }
                  }
                }
              },
              "required": [
                "target"
              ]
            }
          },
          {
            "if": {
              "properties": {
                "verb": {
                  "enum": [
                    "reach",
                    "grip",
                    "release",
                    "point"
                  ]
                }
              },
              "required": [
                "verb"
              ]
            },
            "then": {
              "required": [
                "target"
              ]
            }
          }
        ]
      }
    }
  }
}

---

# DOCUMENT 4
SOURCE: docs/the-better-one/P06_13S_PERFORMANCE_SYSTEM_IMPLEMENTATION_DIRECTIVE.md
SOURCE_BLOB: 0085cf648c81d81a4c85a8cb284354b381701ac6

# P06 — ONE-RUN REUSABLE PERFORMANCE + HYBRID FILM INTEGRATION CONTRACT
**Normative specification and implementation order. Not a declaration of existing software support.**
**Task:** after the two active P05/development regressions complete, make one controlled engineering implementation pass to connect the six quality failures, reusable semantic commands, Blender host, truthful decoder and 13-second **actual first-film** vertical integration. Do not pause for unrelated long demo renders. Do not fabricate human/GPT external assets or approvals.

**Source:** \`production/better-one-mia-first-film\` branch; P05 code baseline \`945464697dc680956bea670e543c8e0c7beebf1b\`, evidence base \`711ed0fe715d893a56e1aa8fcbed1c89fd702055\`. The currently working local branch from the user's screenshot is \`hv2-system-correction\` and has an unpushed local commit \`6c9201e\`. *Treat that number as screenshot information, not independently fetched and verified source.* Never switch/merge/overwrite while the two reported regressions are running. **First retrieve their actual exit statuses and preserve logs, then examine exact local and remote diff before deciding how to integrate.** Working-tree uncommitted files must be saved without destructive reset/clean.

## 0. Architecture is LOCKED at interfaces, not locked to a bad implementation

**Authority:** approved GPT/user film + Channel Bible → typed per-shot action/acting/art requirements → source-grounded actual GPT images → measured art-first rig → Neutrino 2D + Blender 3D host + source-model-linked motion graphics → one 60fps compositor → actual human-reviewed video. All paths use one film clock and exact source hashes. The human approves new creative/metaphorical decisions. Claude implements real operators and may choose internals only when the observable specified result is preserved and tests prove it. If exact missing art/model/approval blocks completion, it returns a concrete file/ID/constraint rather than silently substituting.

**Reusability is about filmmaking functions, not reusing Mia's face.** New fictional characters have unique masters, geometry, view cels, palettes and performance personalities. Host is uniquely recurring. Shared behavior operators include \`look_at\`, \`blink\`, \`turn_head\`, \`speak\`, \`reach\`, \`grip\`, \`release\`, \`walk\`, \`react\`, \`change_expression\`, plus \`idle\`, \`point\`, \`turn_body\`, \`hold\`, \`prop_react\` where actual film demands them. Each command maps to *that character's own* registered parts, legal cels, limits and approved timing style.

**Motion route per operation:** (A) rigid painted part, (B) articulated fitted part/IK, (C) approved alternate cel/view, (D) bounded approved deform/morph, (E) real Blender rig/pass, (F) model-driven 2D graphics/world/camera. More than one route may act on different layers of the same shot. A missing mode cannot be replaced by a visually inferior technique without approved change.

## 1. Non-negotiable engineering invariant and API shape

**Normative machine-readable draft schema:** `docs/the-better-one/PERFORMANCE_COMMAND_SCHEMA_V1.json` (JSON Schema 2020-12, 14 verb types). First run it under an actual validator; its draft correctness is not established by this document. Wire cross-reference, frame-boundary, capability and rendering rules in actual code rather than treating structural JSON validation as proof of performance.

Introduce a *pure*, versioned semantic performance adapter (suggested module \`engine/art_bridge/performance_commands.mjs\`; check existing code before creating). It consumes a **PerformanceCommand[]** attached to the APPROVED direction action and produces the existing plan surfaces; it is NOT a second parallel timeline or new Neutrino runtime.

Canonical command record (fields are required unless named optional):
- \`id\`: globally stable within film, not the character name.
- \`action_id\` and \`direction_decision_ids[]\`: exact approved creative lineage.
- \`actor_rig_id\`: actual unique rig in the manifest, \`character_profile_id\`: approved separate performance profile.
- \`verb\`: one of the explicitly registered supported command names.
- \`frames:[start,end)\`: integer film frames; time and shot continuity known.
- \`target\`: typed target by canonical world point, subject rig+socket, object+socket, or dialogue/audio-cue ID; never ambiguous text lookup.
- \`intent\`: approved semantic emotional/physical purpose, e.g. "hesitant reach", not a generic easing preset.
- \`required_prestate\` / \`required_poststate\`: structured channel/possession/pose/view/support records, not prose alone.
- \`style_profile_ref\`: approved character-specific movement characteristics, bounded by actual rig limits and the Director's timing.
- \`phases\`: ordered \`{id,frames,goal,expected_owner_effect}\` with gap-free coverage or an explicitly explained hold. No two phases own a single transform at the same instant.
- \`motion_route\`: selected supported route and capability evidence; may require multiple qualified producers for one command.
- \`required_art_refs[]\`: complete canonical master/part/cel/occlusion requirements; machine-derived dependency closure before art generation.
- \`expected_effects[]\`: owner-specific measurable consequences, frame interval, technical negative and human visual criterion.
- \`override_policy\`: explicit precedence / intentional interactions with other commands; no implicit last-writer-wins.
- \`source_digest\`: exact approved creative packet revision.

**Reject** unknown verb, invalid target, unknown rig/joint/socket, unsupported anatomy, missing art, missing approved state edge, unsatisfiable contact, conflicting transform owner, overlapping contradictory state, out-of-film frame, stale packet/asset, missing evidence producer. All are typed failures with \`action_id, command_id, owner, frame_range, failed_invariant, earliest_producer, needed_art_or_capability, user_approval_needed\`.

**Actor rig capability profile** must be derived from actual APPROVED artwork/mesh:
- \`rig_id, identity_master_sha, topology_kind, coordinate_spaces, root, measured_joint_chain_ids, legal_angles, sockets/contact_patch/palm_axis/feet, state_channel_ids, approved_view_cels/edges, deform_map_ids, supported_commands[], style_profile_id, approved_art_sha\`.
- Character profile gives semantics, not bones: \`reaction_delay_frames, preferred anticipation_fraction, ease vocabulary, stride/rhythm/energy limits, gaze speed, follow-through gains, emotional expression-state map\`; actual values require Director/character approval and must fit real measured art.
- **Do not hardcode arm_upper/hand/right** as universal for organisms or diagram objects. Use capability roles + explicitly reviewed rig maps, and refuse if a demanded role has no real approved interface.
- Actor-specific parameters may never override director-required frame boundaries, contacts or approved cels.

**Phase/time laws:** all numbers finite; half-open integer frame ranges; phases ordered; position/angle/velocity constraints measured in a declared space/units. Movie clip 13s = **780 actual frames**, 1920×1080 at 60 fps. A 13-minute final is 46,800 frames, a *separate scale milestone*. Do not bake 780 into a reusable schema.

## 2. Existing P05 sources — EXACT integration points, no wholesale rewrite

| Existing source | Existing responsibility and required P06 connection |
|---|---|
| \`engine/story/creative_adapter.mjs\`, \`creative_packet.mjs\`, \`engine/story/authoring_handoff.mjs\` | Ingest sealed, human-approved GPT decision/action records; compile command intent with no missing decision IDs or invented approval |
| \`engine/story/action_coverage.mjs\` | Typed action ontology and event phases; add only named supported semantic verbs with actual executed consequence measures |
| \`engine/art_bridge/motion_systems.mjs#compilePhrase\` | Multi-owner synchronized phrase tracks. **Not every command needs two owner kinds**: a blink can be a valid single-owner channel operation. Preserve causal-multi-owner checks for actions requiring object consequences; route isolated acting commands through acting/state channel with relevant evidence instead of weakening all phrases |
| \`engine/art_bridge/acting.mjs#compileActing\` | Existing lag, anticipation, settle, breath, follow, gaze, blink and rest/mid/open speech; wire typed commands to valid existing plan. Guard non-finite periods, bad keys, state demand and prompt source ownership |
| \`engine/art_bridge/state_channels.mjs\`, \`asset_state.mjs\`, \`state_timeline.mjs\` | One persistent state history for independent EYES/MOUTH/HAND/EXPRESSION/VIEW etc; command compilation must not reconstruct per-action defaults |
| \`engine/art_bridge/art_demand.mjs#deriveArtDemands\` | Closure of ACTUAL needed images: rest/pose/view/intermediate hand/finger/underpaint, speaking mouth states, blink, mask, world. Generate exact ArtJobs BEFORE real art |
| \`engine/art_bridge/art_intake.mjs\`, \`registration.mjs\` | Import true image bytes, reviewed landmarks, alpha/hidden regions, rest recomposition, fitted rigs; plan infeasibility must not return false success on zero checked frames |
| \`engine/art_bridge/temporal.mjs#compileMotionTracks/#stateAtFrame\` | Real exact-frame motion, constrained IK/support/contact, compiled acting, pose/view channels, no hidden fallbacks; the single normalized adapter compiles into existing plan |
| \`engine/art_bridge/scene_graph.mjs#composeShot\` | Actual painted image pass & grip art, near/far occlusion and shadows; collect correct per-frame actual-owner data including blur |
| \`engine/film/semantic_qa.mjs#verifySemanticConsequences\` | Real consequences for the exact named command; reject \`UNVERIFIED\` as pass for demanded action; full grip hold, requested angle/aperture outcome, directed expression, released possession |
| \`engine/production/stages.mjs\`, \`engine/film/chrome_frames.mjs\` | Bind commands and art/Blender/graphics passes into actual production gate/task and deterministic 60fps Chrome/video; no actor motion hidden by camera/background |
| \`engine/film/audio_mix.mjs\` and final mux | Real measured dialogue alignment, speech-cel schedule, sound cues and exact actual final MP4; don't claim true phoneme sync from three syllable-based mouth states |

**First inspect and reuse exact reachable consumers.** Do not create \`semantic_motion_v2\` sidecar JSON that the renderer never reads. The criterion is one approved command → actual Neutrino/Blender/graphics changes → actual owner pixels/audio; delete the producer in a negative control → named visual consequence fails.

## 3. Per-command behavior obligations and negative controls

| Command | Producer/output required | Crucial negative control |
|---|---|---|
| \`look_at\` | Aim correct eye/gaze or approved head joint toward actual world/rig target in film space; obey available eye art and limited angle; visual eye state must correspond | Remove pupil/head movement while rotating camera; FAIL target gaze despite global pixel difference |
| \`blink\` | Approved EYES open→closed→open cels in exact intended interval; identity and visual layer stable; no blink during prohibited sustained squint | Delete closed-eye cel or suppress state edge; FAIL even if torso moves |
| \`turn_head\` | For small allowed motion, legal rig rotation; when view silhouette changes demand actual approved alternate view cels/inbetweens, shared landmarks and near/far paint; user-chosen threshold per design | Fake three-quarter head with flat front PNG rotation; FAIL |
| \`speak\` | Actual audio line/cue ID, measured temporal alignment, approved MOUTH states; good performance with gaze/face/gesture where director demands it; if only rest/mid/open, explicitly label coarse limited-mouth style | Wrong recorded line or mismatched mouth interval while body sways; FAIL; never claim phoneme-accurate lip sync without phoneme/viseme producer |
| \`reach\` | Anticipation → actual chain IK with measured shoulder/elbow/wrist/palm → object target, stable limits/bend branch and painted seam; no contact claimed before touching | Wrist arrives while elbow stretches/tears or body remains unbalanced; FAIL |
| \`grip\` | Contact target + HAND closure cel, palm basis, near/far fingers, proper occlusion, holder ownership and prop reaction for EVERY required held frame | Inject one middle held frame with open hand/no object link; FAIL regardless of camera/background |
| \`release\` | End of locked contact at specified frame, appropriate HAND opening, true separation/prop after-state and no further holder ownership | Contact record ends but prop stays stuck to hand; FAIL |
| \`walk\` | Approved planted foot intervals, weight/hip body shift, alternating supported steps if biped, silhouette/foot contact and correct transition to rest; topology-specific locomotion or refusal for nonbiped | Move root and swing limbs but planted foot slides by illegal amount; FAIL |
| \`react\` | Character-specific intent drives actual face/gaze/pose/anticipation/recovery and timing; should not be generic "rotation 5°" | Swap reaction intent while leaving owner-expression pixels unchanged; FAIL |
| \`change_expression\` | Approved EXPRESSION channel target and identity-consistent painted face cels; preserve director event priority | Missing target cel or silent same-state substitution; FAIL |
| \`point\` | Actual approved pointed-hand art, arm aim and target focus, correct socket/view/hand layer and elbow silhouette | Hand points opposite object while elbow moves; FAIL |
| \`idle\` | Declared purposeful stillness or approved subtle breathing/eye microstate; optional motion only inside physical/visual limits | Breathing dislocates grasp/contact or steals camera focus; FAIL |
| \`turn_body\` | Source-approved body view/pose transition, actual hips/feet and foreground order where applicable | Mirror front image or teleport feet; FAIL |
| \`hold\` | Preserve pose/contact/object ownership or intentional stillness throughout interval with no unapproved state resets | First/last frame correct but middle frame breaks; FAIL |

**Negative tests must use real production consumers**, not only pure lookup routines. Run on at least TWO geometrically different approved diagnostic rigs (e.g. energetic short figure and elongated narrow figure); after true GPT art arrives, rerun on two actually different commissioned designs and mark real-art transfer status separately. You do not need to force \`walk\` onto non-legged organisms; unsupported topologies must refuse correctly.

## 4. Six historical artwork/animation failure classes — release predicates

**C1 mismatched parts:** master/source-attached generation → actual separated parts → approved rest reassembly with alpha edge/paint seam/bbox/identity check. Test alternate view and unlike rig. Registered fit is NOT a human appearance review.

**C2 impossible drawing:** action-route and art-state closure BEFORE generation; post-art actual joint/hand/view/occlusion feasibility across every required frame. Missing inbetween → precise source-attached new drawing with frame/identity/part requirement. Never stretch a static arm or rotate flat face across an unsupported viewpoint.

**C3 lifeless motion:** director acting track controls preparation, speed/easing, gaze, expression, body support, pauses, delayed follow-through and recovery; combine with character profile without overwriting contact. Test real 13s performance + user native-resolution watch. No pixel-hash trick can declare animation beautiful.

**C4 view identity drift:** canonical master profile, linked multi-view family and approved source-attached images; numerical landmark topology PLUS actual visual review at view-cut/intermediate frames. Wrong face/hair/costume fails identity.

**C5 pasted 3D host:** real approved Blender mesh+armature+face+action, camera calibration and original 2D world proxy ground; exact 60fps RGBA/depth/matte/shadow frame outputs, matching scale/color/light direction/foot contact, foreground occlusion across time. Test actual mixed frame; no faux 2.5D substitute.

**C6 expensive repetition:** reuse command interpreter, art-demand planner, motion operators, scene renderers, performance/style profile framework, host model + action library, graphic calculation primitives and failure regression memory. Do not reuse unrelated characters' faces/meshes/costumes. Track real human work time, candidate rerolls, accepted footage seconds, and changes needed for the second unique character.

A motion operator is *not* qualified merely because it exists. It must have an actual output, actual downstream consumer, negative test, unlike-character transfer and applicable visual review.

## 5. Blender and strategy motion graphics are separate real production modules

### 5.1 Blender host adapter contract
Proposed adapter inputs: \`film_sha, shot_id, [frame0,frame1), scene_blend_sha, host_mesh_sha, rig_action_sha, blender_version, fps=60, shot_camera(3D world→screen), ground_plane, lighting_profile, pass_list, foreground_occluder_ids, sound_cue_ids\`.
Outputs: aligned frame-numbered **RGBA** color pass; shadow catcher/contact pass; depth or object-ID/matte where needed; per-frame camera metadata and source hash; native-resolution composite pass with actual 2D art. Reject mismatched count, camera, color alpha/premultiplication, incorrect occluder ordering, missing shadow/ground, changed mesh without re-render.
Integration proof: approved host enter/stop/point/speak with actual foot/hand contacts; 13s first Mia sequence need not cram in host. A separate real host scene can qualify the Blender route.
**Do not generate a final "approved host" placeholder.** A Blender file with demo cube or dummy stick figure is only a technical adapter test.

### 5.2 Strategy decoder contract
Input: source claim/model card; model variable IDs with unit/source/truth mode; formula graph with constraints/capacity; time-dependent parameter changes; directed animation effect owner per model output; 60fps scene layers and cue IDs.
Output: valid, recomputable model time series and frame-addressed SVG/Neutrino visual state linked one-to-one; clear cause→effect, readable labels, no false scales/percentages; cinematic but legible staging.
Negative: change one value but hold result graph static; replace real counterexample with fake success; invert margin sign; wrongly imply hypothetical Mia data is survey fact — FAIL.

### 5.3 Shared compositor
One absolute frame from film clock selects Neutrino layer state, Blender host pass if in shot, decoder state if in shot, camera depth/occluder layering and audio. Each composite pass has source ID/hash and producer; color/alpha/size consistent. Supports independent source selection and deterministic rerender. Final audio WAV/mux must be checked inside actual final MP4 and tied to same code/art/camera/audio revisions.

**No rigid instruction to install Motion Canvas or Remotion now.** Current SVG/DOM/Neutrino may already provide the needed decoder operators. Specialist package only when approved first film shot requires it and current measured producer fails.

## 6. EXACT staged implementation order after the existing two regressions finish

1. **Preserve tests:** capture frozen P05/regression *actual* exit codes, source commits, log paths, warnings/skips; do not re-run successful full suites just to watch them twice.
2. **Safety diff:** \`git status\`, current local branch \`hv2-system-correction\`, unpushed \`6c9201e\` from screenshot, and \`production/better-one-mia-first-film\` remote. Do not assume these match. Make a non-destructive merge plan; isolate a working child branch from the code containing complete repairs, then cherry-pick/port only authority docs without replacing tested engine files. Any new shared engine change requires fresh affected tests.
3. **Code-to-command matrix:** enumerate current exported \`compileActing\`, \`layerPhrases\`, \`compilePhrase\`, \`compileMotionTracks\`, \`stateAtFrame\`, \`channelEvents\`, \`deriveArtDemands\`, \`verifySemanticConsequences\`, \`composeShot\`, \`art_intake\`. For each command: exact producer, art/interface requirement, plan field, runtime consumer and emitted owner proof.
4. **Implement semantic adapter + strict schema** in a new isolated module that converts approved per-shot performance commands to existing plan structures and checks all capabilities; add versioned performance profile registry that refers to actual rig IDs/role maps. No duplicate clock or fallback source.
5. **Implement complete pre-art demand pass** taking commands + planned action/camera/Blender effects: every reached cel/hand/eye/mouth/view/underpaint/occluder/lighting and transition art requirement must create exact ArtJobs before generation. This is a cross-stage DAG obligation; absent art data produces exact request.
6. **Complete post-art runtime wiring**, actual measured rig, precedence of states and exclusive transform ownership. Verify state persistence and every-frame contact/standing/prop/face visual binding.
7. **Close semantic measures:** all 14 supported commands have named owner effects or refuse. A required 60° open can't pass at 7°. One correct grip frame can't pass a 100-frame hold. An isolated blink cannot be rejected because a multi-owner action phrase demands a prop effect. For unsupported commands fail BEFORE art.
8. **Blender compositing adapter** with explicit source/camera/alpha/frame contract and test-only technical frame passes; if host asset not approved, leave creative host status pending and do not forge one.
9. **Math-backed decoder route** to existing SVG/Chrome renderer with actual variable-to-pixel negative. No new graphics framework unless necessary.
10. **Source-level test suite**: schema, capability/refusal, two unlike rigs, command→Neutrino actual pixels, grip/turn/cel/deform/foot/face negatives, Blender pass metadata/camera/matte, model-driven graphics, audio mux, dirty-revision invalidate, async crash/resume.
11. **Short integration proof** on *bounded* DIAGNOSTIC art proves the software. Run only once and label diagnostic. Do not repeat 120 seconds of artless footage.
12. **First REAL E01 13s film sequence** after GPT/user supply approved creative packet, real images, actual sound and approvals. Select a genuinely directed contiguous shot interval of **780 frames**. Render exact real approved art, all required acting/contacts, and actual mix; inspect 1080p60 moving playback plus crucial frames. User is final artistic authority. The 13s actual shot is retained as finished film footage when approved.
13. **Other modality proofs**: distinct original host+decoder shots, likely each 8–13s, using real film absolute frame windows and approved sources. Don't cram 2D character arc, host entrance and full decoder into 13s if it destroys narrative pacing. Build 90–120s contiguous professional hybrid opening, then full 8–12min feature (13min if editorially earned).
14. **Publish proven exact SHA** and an enforceable quality-gate report for all 20 TBO gates. Status per gate: \`VERIFIED_CODE\`, \`VERIFIED_REAL_ART\`, \`NEEDS_EXTERNAL_ART\`, \`NEEDS_HUMAN\`, \`FAILED\`, \`NOT_APPLICABLE_WITH_REASON\`. No green check by asserting a function exists.

**Critical single-run restriction:** Do all engineering changes supported by available source and test evidence without additional chat prompts; produce a complete, actionable external asset request at the real human/GPT boundary. The single engineering pass is NOT permission to fabricate inputs or override creative locks. No test can guarantee all future artistic problems; system must refuse unproven requirements rather than falsely succeed.

## 7. Minimum evidence artifacts (all required)

\`ENGINE_SOURCE_AND_BRANCH_PROVENANCE.md\`: exact frozen SHA of code tested, remote/working branch differences, existing background task outputs.

\`PERFORMANCE_COMMAND_SCHEMA.json\` + test fixture examples: own normalized representation; adapter to actual P05 plan, no unconsumed creative IDs.

\`PERFORMANCE_COMMAND_IMPLEMENTATION_MATRIX.json\`: each command, actual producer/consumer and plan fields, required art/state, real supported/refused status, positive/negative/transfer test IDs.

\`ART_STATE_CLOSURE_AND_FIT.json\`: output of actual demand closure on two unlike rig families and the approved first film; registered actual art when delivered, no silently missing states.

\`BLENDER_HOST_PASS_CONTRACT.json\`: versioned input/output, camera/transforms, frame order, full compositor requirements and negative tests. Distinguish test-only dummy from approved real host.

\`STRATEGY_DECODER_MODEL_CONTRACT.json\`: variables, source modes/units, formulas, computation→graphics causal tests.

\`13_SECOND_E01_ACCEPTANCE_PLAN.md\`: exact source-approved film script/shot and required assets, 780 frames, audible line(s), state/action/visual test, cost/time, actual render proof; until script exists this is an honest *unfilled exact template*, not an invented approved story.

\`FINAL_ENGINEERING_TAP.tap\`, \`SHORT_INTEGRATION_EVIDENCE.json\`, \`SIX_DEFECT_TRANSFER_MATRIX.json\`, \`TBO_20_GATE_RELEASE_REPORT.json\`: actual tests run and real source hashes; no skipped/unknown counted as pass.

\`REAL_FOOTAGE_LEDGER.csv\`: accepted film source, absolute frames, image/blender/audio SHA, review, human minutes and actual cost. Empty until the first real film shot is approved.

## 8. No-improvisation QA contract

**Never:**
- substitute generic vector/tube limbs or a flat unapproved face for approved GPT artwork;
- make a 3D host out of an unmodeled flat illustration;
- use a "success" field, JSON owner record, whole-frame pixel hash or unrelated camera motion to prove a character's intended acting;
- mark gaze/hand/speech correct because any joint/eye pixel changed;
- silently relax approved mouth/hand/view states or motion intensity to get an easy pass;
- hide abnormal hand/elbow/foot anatomy with camera motion, blur, shadow patches or extra particles;
- self-sign human approvals, invent witness media, claim actual source-backed image creation without the files;
- use old main/P02 schemas and hardcoded 7200 frames to render a 780-frame clip;
- create an entirely new animation backend or add paid generation providers without specific benchmark or approval;
- redo full regressions every edit without evidence that the changed producing source affects those cases;
- declare first film finished from diagnostics or a contact sheet.

**Must always:** produce the intended real pixels on actual asset owner, collect full-range owner evidence, use explicit typed failures, preserve user-approved art and direction, repair earliest faulty producer, and inspect continuous film at normal playback speed.

**Stop/hand off only when:** all code-accessible obligations in this implementation run have been implemented and tested, and the next blocker is real script/GPT images/voice/approved host or human review. Then return exact ArtJobs/assets/actions and status; do not pretend these external inputs are available.

**The real goal:** the first genuine 13-second scene of The Better One, then a coherent hybrid 90–120-second sample and an exceptional complete 8–12-minute film. Code and proof are means to making that film, not separate products.

---

# DOCUMENT 5
SOURCE: docs/the-better-one/PRODUCTION_QUALITY_GATE_REGISTRY.json
SOURCE_BLOB: 665f6927db7350754d7966da04c2c9a8abc619e9

{
  "schema_version": "1.0.0",
  "authority": [
    "docs/the-better-one/THE_BETTER_ONE_MASTER_CHANNEL_BIBLE_v1.md",
    "docs/the-better-one/ART_MOTION_AND_HYBRID_QUALITY_GATES.md",
    "docs/the-better-one/FIRST_FILM_PRODUCTION_MASTER.md"
  ],
  "release_policy": {
    "required_when_applicable": true,
    "status_enum": [
      "NOT_TESTED",
      "BLOCKED_EXTERNAL",
      "FAILED",
      "VERIFIED_WITH_EVIDENCE",
      "NOT_APPLICABLE_WITH_EVIDENCE"
    ],
    "implicit_pass": false,
    "human_approval_required_for": [
      "TBO-G02",
      "TBO-G05",
      "TBO-G06",
      "TBO-G14",
      "TBO-G18",
      "TBO-G20"
    ],
    "evidence_required": [
      "fixed_source_sha",
      "producer_function",
      "consumer_function",
      "input_hashes",
      "artifact_hashes",
      "frame_range_or_film_scope",
      "test_id",
      "negative_test_result",
      "human_receipt_if_relevant"
    ],
    "cannot_self_certify_artistic_quality": true,
    "accepted_seconds_only_real_approved_film": true,
    "note": "This is a normative requirements registry; it is NOT connected to P05 runtime until the engineer implements and tests its actual production-stage enforcer."
  },
  "gates": [
    {
      "id": "TBO-G01",
      "phase": "story_truth",
      "owner": "GPT_EDITOR",
      "required_proof": "Verified source ledger, F/R/M/H/X modes, model card, payoff proof",
      "negative_control": "Remove citation or use fictional outcome as real fact",
      "failure_code": "CLAIM_TRUTH_UNVERIFIED",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G02",
      "phase": "viewer_story",
      "owner": "GPT_EDITOR",
      "required_proof": "Value Blueprint, meaningful acts, 12-part shot direction, audio-first animatic, human review",
      "negative_control": "Delete causal clue or main character decision",
      "failure_code": "DIRECTOR_DECISION_MISSING",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G03",
      "phase": "creative_runtime_mapping",
      "owner": "ENGINE",
      "required_proof": "Every approved direction/action ID maps to real supported producer and observable visual or audio outcome",
      "negative_control": "Remove actual motion consumer but keep director JSON",
      "failure_code": "DIRECTION_CONSUMER_INERT",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G04",
      "phase": "preart_state_closure",
      "owner": "ENGINE",
      "required_proof": "All reachable poses, views, expressions, eyes, mouths, hand states, masks, lighting, underpaint, world/camera planes have ArtJobs",
      "negative_control": "Demand complex grip but remove required fingers-underpaint cel",
      "failure_code": "MISSING_ART_REQUIREMENT",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G05",
      "phase": "f_methods_image",
      "owner": "GPT_ART_HUMAN",
      "required_proof": "Actual current F01-F80 skill and authorized witnesses, method→request→approved image review, real PNG bytes",
      "negative_control": "Use nonexistent witness or generic style label instead",
      "failure_code": "ART_METHOD_EVIDENCE_MISSING",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G06",
      "phase": "canonical_identity",
      "owner": "GPT_ART_HUMAN",
      "required_proof": "Approved master and source-attached derived views/states with human whole-look review",
      "negative_control": "Use different face for profile with matching landmarks",
      "failure_code": "CHARACTER_IDENTITY_DRIFT",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G07",
      "phase": "image_ingest",
      "owner": "ENGINE",
      "required_proof": "Original bytes, hash, dimensions, alpha, crop, provenance and matching requirement id",
      "negative_control": "Import flattened screenshot as transparent arm part",
      "failure_code": "ART_ASSET_INVALID",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G08",
      "phase": "registration",
      "owner": "ENGINE",
      "required_proof": "Reviewed pixels/landmarks, transforms, pivots, rest recomposition, seams/underpaint/near-far",
      "negative_control": "Remove hidden torso area under raised arm",
      "failure_code": "ART_RECOMPOSITION_FAILED",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G09",
      "phase": "motion_feasibility",
      "owner": "ENGINE",
      "required_proof": "All required frame evaluations, joint limits, state/paint, contacts, camera and exceptions",
      "negative_control": "Return 0 checked frames with no errors",
      "failure_code": "FRAME_NOT_EVALUATED",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G10",
      "phase": "acting_motion",
      "owner": "NEUTRINO",
      "required_proof": "Actual registered artwork moves with anticipation/gaze/weight/body timing/follow-through and human watch review",
      "negative_control": "Keep flat puppet arm while root moves",
      "failure_code": "ACTING_INTENT_UNRENDERED",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G11",
      "phase": "painted_grip_release",
      "owner": "NEUTRINO",
      "required_proof": "HAND state, palm basis, finger near-far, full hold, weight, prop reaction, release in all required frames",
      "negative_control": "Open palm in middle of grip while particles still animate",
      "failure_code": "GRIP_VISUAL_FAILED",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G12",
      "phase": "view_cel_deform",
      "owner": "NEUTRINO",
      "required_proof": "Approved alternate heads/views/cels and valid mesh/alpha/transition across motion",
      "negative_control": "Rotate frontal face as fake three-quarter or fold mesh",
      "failure_code": "VIEW_OR_DEFORMATION_INVALID",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G13",
      "phase": "camera_world",
      "owner": "COMPOSITOR",
      "required_proof": "Full painted world/crop/depth/foreground masks for all camera positions",
      "negative_control": "Push camera to reveal empty world patch",
      "failure_code": "UNCOVERED_WORLD",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G14",
      "phase": "host_3d",
      "owner": "BLENDER_COMPOSITOR",
      "required_proof": "Real approved mesh/rig, matching projection/world, frame aligned RGBA/depth/shadow/occlusion and visually approved performance",
      "negative_control": "Shift host camera or remove foreground occluder/shadow",
      "failure_code": "HOST_INTEGRATION_INVALID",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G15",
      "phase": "strategy_decoder",
      "owner": "MODEL_COMPOSITOR",
      "required_proof": "Model card, input provenance, equations, changing variable→actual animated result with understandable units",
      "negative_control": "Change food cost but freeze displayed profit graph",
      "failure_code": "DECODER_INERT_OR_MISLEADING",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G16",
      "phase": "owner_attribution",
      "owner": "RENDER_QA",
      "required_proof": "Relevant actual owner/cel/pixel evidence including blur frames and every expected action interval",
      "negative_control": "Freeze Mia while background and camera move",
      "failure_code": "REQUIRED_OWNER_MOTION_MISSING",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G17",
      "phase": "final_audio",
      "owner": "AUDIO_MUX",
      "required_proof": "Actual measured dialogue/audio buses/cues and final mux stream verified against final MP4 SHA",
      "negative_control": "Publish old mix or silent MP4",
      "failure_code": "FINAL_AUDIO_MISMATCH",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G18",
      "phase": "editorial_final",
      "owner": "HUMAN",
      "required_proof": "Full running video reviewed for clarity, emotion, humor, artistic beauty, acting, credible model, rights and packaging; exact signed receipt",
      "negative_control": "Technically valid ugly/stiff scene marked approved without watch",
      "failure_code": "ARTISTIC_REVIEW_MISSING",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G19",
      "phase": "source_revision",
      "owner": "LEDGER",
      "required_proof": "Versioned sources/images/code/audio/approvals/chunks and reproducible rerun with invalidation",
      "negative_control": "Change image bytes, reuse previous render proof",
      "failure_code": "STALE_EVIDENCE_ACCEPTED",
      "initial_status": "NOT_TESTED"
    },
    {
      "id": "TBO-G20",
      "phase": "film_progress",
      "owner": "FILM_LEDGER",
      "required_proof": "8–10s accepted actual E01 segments, contiguous 90–120s proof, final film review and cost/effort ledger",
      "negative_control": "Count diagnostic test MP4 as finished Mia scene",
      "failure_code": "DIAGNOSTIC_PROMOTED_TO_FILM",
      "initial_status": "NOT_TESTED"
    }
  ]
}

---
