---
name: testing-glowai-web
description: Run GlowAI Expo web end-to-end flows with a synthetic camera and verify locally persisted reports.
---

# Local web setup
- Use the installed Node from `~/.nvm/versions/node/*/bin` if npm is not on PATH.
- Run `npm install`, then `npm run web -- --port 8081` from the repo.
- Launch Chrome with `--use-fake-device-for-media-stream` and `--use-fake-ui-for-media-stream` before starting camera flows. Adding flags to an already running browser process does not apply them; relaunch using its existing profile/debugging configuration when safe.
- Maximize with `wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`.
- Analysis is currently local placeholder scoring, not real vision inference; explicitly label synthetic camera usage in results.

## Devin Secrets Needed
None for local analysis/history. Optional ingredient enrichment uses a public service and is not required for generating reports.

# UI and persistence
- Get Started -> capture and confirm Front, Left Side, Right Side -> concerns -> lifestyle -> budget -> Analyze My Skin.
- Camera confirmation has a 400ms double-tap guard. Wait at least 400ms after preview appears before Use this photo.
- Lifestyle is scrollable; Skip for now is near the bottom.
- Result has a View progress link at the bottom. Progress has Back to start; use it rather than browser back because native-stack routes have no URL linking.
- For isolated fresh-state tests remove only `glowai.history.v1` from localStorage and reload.
- Generate reports through the UI, not storage injection. Compare the full serialized history before/after reopening a stored report to detect duplicate saves or timestamp changes.
- At present selected concerns score 72, others 30; overall score is `round(100 - averageSeverity * 0.6)`.
- Use Chrome viewport emulation for 390px checks and verify `innerWidth`; capture screenshots for actual visual assertions. If clearing emulation does not restore the viewport, explicitly restore desktop metrics.
- Capture Runtime console events and exceptions across reloads. React Native web deprecation/animation and CameraView-child warnings may appear; distinguish warnings from errors in reports.
