# Review request creative_packet__ceba69013b3b885e39a1f4e25ad4021b630cb0bd8cb9fd1f2e1f5a4895817696__ff12eaabd594

1. Inspect the files in `look_at/` (for a final film: play `the listed file` in the film folder; its SHA-256 is in REVIEW_REQUEST.json).
2. On YOUR machine, with YOUR private key kept outside this repository, run in an interactive terminal:

   node engine/tools/reviewer_sign_offline.mjs --request "<this folder>/REVIEW_REQUEST.json" --key "<path to your private key>" --reviewer <your reviewer id> --verdict APPROVED|REJECTED|REVISE_AT_ART_SOURCE|REVISE_AT_RIG_SOURCE --out SIGNED_REVIEW.json

3. Return SIGNED_REVIEW.json; import it with `node engine/tools/review_sign.mjs import --film <film> --signed SIGNED_REVIEW.json`.

Your PUBLIC key must be listed in the trust-anchor file named by ART_BRIDGE_REVIEWER_KEYS_FILE (outside the repository). First time only:

   openssl genpkey -algorithm ed25519 -out reviewer_private.pem
   openssl pkey -in reviewer_private.pem -pubout -out reviewer_public.pem

REVIEWERS.json = {"reviewers":[{"id":"<your reviewer id>","public_key_pem":"<contents of reviewer_public.pem>"}]}. To revoke a key add "revoked_utc".
