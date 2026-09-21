---
name: testing-glowai-web
description: Run GlowAI Expo web end-to-end flows with a synthetic camera and verify locally persisted reports.
---

# Local web setup
- Use the installed Node from `~/.nvm/versions/node/*/bin` if npm is not on PATH.
- Run `npm install`, then `npm run web -- --port 8081` from the repo.
- Launch Chrome with `--use-fake-device-for-media-stream` and `--use-fake-ui-for-media-stream` before starting camera flows. Adding flags to an already running browser process does not apply them; relaunch using its existing profile/debugging configuration when safe.
- Maximize with `wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`.
- Analysis can use a configured vision backend or local estimates. Explicitly label synthetic camera usage and distinguish newly accepted vision results from historical vision fixtures.

## Devin Secrets Needed
None for local estimates/history. Real vision needs a reachable authorized proxy holding `OPENAI_API_KEY`, or a development-only public Expo key. Never expose a server key in artifacts or production bundles. Optional ingredient enrichment uses a public service and is not required for generating reports.

# Vision setup and evidence
- Expo inlines literal `process.env.EXPO_PUBLIC_*` accesses at bundling time. Start with `EXPO_PUBLIC_ANALYSIS_URL=http://localhost:<port>/ npm run web -- --port 8081 --clear` and reload when switching configurations.
- A deployed proxy may restrict browser CORS to the published site. For approved local testing, use a CORS-permissive localhost pass-through that forwards the app's POST body unchanged to that proxy. Log only model/image-count/detail metadata, status, and response JSON, not photo data URLs or keys.
- Prove real vision with browser POST/200 evidence and the actual model confidence/flags. A working estimate alone does not demonstrate that configuration was inlined or that the API was called.
- To test transport fallback without rebuilding, stop the localhost pass-through: the configured URL becomes unreachable. Expect a local estimate, `vision_unavailable`, and an expected browser network connection-refused log. Distinguish it from an uncaught exception.
- Synthetic Chrome camera images have no face. Inspect the returned flags and confidence; LOW_CONFIDENCE may precede a separate NO_FACE check, so observing the former does not prove the latter.
- For a legitimate optional face fixture, scikit-image distributes NASA's public-domain Eileen Collins portrait (`skimage/data/astronaut.png` in its v0.25.2 source). Convert with `ffmpeg -loop 1 -i astronaut.png -t 2 -r 10 -pix_fmt yuv420p face.y4m`, then relaunch Chrome with `--use-file-for-fake-video-capture=/absolute/path/face.y4m`.
- A repeated portrait in three capture slots tests integration, not clinical accuracy or real three-angle quality. Models may return contradictory confidence/flags; disclose these rather than manufacturing acceptance. Respect the approved paid-call budget.
- For production testing, use the deployed site and its direct authorized Worker origin rather than a localhost pass-through. Count POSTs (OPTIONS preflights are not paid analysis calls), and reserve a call for synthetic rejection before retrying portraits.
- If a small portrait is rejected, an approved retry can use a larger/brighter genuine crop: `ffmpeg -loop 1 -i astronaut.png -vf 'crop=190:220:130:0,scale=760:880,eq=brightness=0.025:gamma=1.06' -t 2 -r 10 -pix_fmt yuv420p face-crop.y4m`. These coordinates suit the 512px NASA fixture; visually confirm the crop in Capture. Acceptance remains model-dependent.
- Verify source subtitles both immediately and after Progress reopening: storage uses `id` whereas fresh analyses may use `analysisId`.
- When validating old-format history, create a genuine report through an archived pre-change build served on the same origin; preserve the current repo checkout and reuse dependencies if compatible.
- Capture a fresh storage baseline after any developer hot reload. Fast Refresh may rerun mounted Result effects and change a creation timestamp; compare fixed-build reopen/reload behavior against its own baseline, not only a pre-update snapshot.

# UI and persistence
- For zero-paid-call transport tests, point Expo at a non-forwarding CORS localhost stub and switch its responses among 429, 500, and 200 without rebuilding. Successful responses need `choices[0].message.content` as JSON and the current `CONCERN_IDS` keys; Fine lines is `wrinkles`, not `fine_lines`.
- A 429 should save a `local-` report with `vision_rate_limited` and the daily-limit note; generic transport failures use `vision_unavailable` and the unavailable note. Verify the note again through Progress and after reload, comparing serialized history for duplicates.
- A schema-valid 200 fixture proves vision integration only, not actual model output. Check exact supplied radar scores, `vision-` ID, and absence of fallback notes. Keep analysis POST logging to confirm no accidental upstream requests.
- When production budget is zero, do not exhaust live rate limits. If authorized, one invalid-body POST can check HTTP 400/CORS without a valid analysis payload; it does not prove KV thresholds, UTC reset, private logs, or no-upstream-on-429 behavior.
- Get Started -> capture and confirm Front, Left Side, Right Side -> concerns -> lifestyle -> budget -> Analyze My Skin.
- Camera confirmation has a 400ms double-tap guard. Wait at least 400ms after preview appears before Use this photo.
- Lifestyle is scrollable; Skip for now is near the bottom.
- Result has a View progress link at the bottom. Progress has Back to start; use it rather than browser back because native-stack routes have no URL linking.
- For isolated fresh-state tests remove only `glowai.history.v1` from localStorage and reload.
- Generate reports through the UI, not storage injection. Compare the full serialized history before/after reopening a stored report to detect duplicate saves or timestamp changes.
- For local estimates, selected concerns score 72, others 30; overall score is `round(100 - averageSeverity * 0.6)`. Vision scores instead come from the real response; compare those exact values with the radar and stored report.
- Use Chrome viewport emulation for 390px checks and verify `innerWidth`; capture screenshots for actual visual assertions. If clearing emulation does not restore the viewport, explicitly restore desktop metrics.
- Capture Runtime console events and exceptions across reloads. React Native web deprecation/animation and CameraView-child warnings may appear; distinguish warnings from errors in reports.
