# Verification record

Verified on October 7, 2026, during the Week 1 window.

- Ten unit tests passed; the browser worker built successfully and syntax/local asset checks passed.
- Five actual multilingual-e5-small WASM requests returned eligible activities. Raw ranking and timing evidence is in `evidence/browser-inference.json`.
- The visible UI generated a 20-minute English color-observation plan from its normal form controls.
- An active 10-minute timer reopened at 07:51 after reload and resumed without resetting. Finishing removed the active session and focused the reflection choices. The test chose “Prefer not to record”; it did not claim an outdoor visit.
- The saved card generator includes all three steps, escapes user text, and references no scripts or external assets.
- A same-origin iframe supplied a 390px CSS viewport after the browser viewport override proved ineffective. The frame reported viewport 390px and page width 390px, with no horizontal overflow. Its complete page was visually inspected and saved as evidence/mobile-en.jpg.
- The in-app browser did not expose a download event for the generated blob card. The self-contained card generator passed the automated content/security check; native browser download behavior needs verification outside this in-app surface.

Strict browser-wide offline network emulation and broad device/browser performance were not tested. Offline model reuse is conditional on retained caches; the portable HTML card does not need inference or the app.

The initial deployment rejected an unused runtime file over 25 MiB. The final build aliases ONNX Runtime to its WASM-only entry and explicitly selects a matching 14,264,838-byte binary and JavaScript loader. Real inference then again selected B for the Portuguese colors request (144 ms inference, 2.5 s total with model cache); see evidence/wasm-only-inference.json.
