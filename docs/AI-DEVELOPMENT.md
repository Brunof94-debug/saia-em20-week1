# Development with Codex

This project began during the DEV Hacktoberfest Week 1 development window. Codex assisted source implementation, interface iteration, documentation and testing. This is a concise engineering record, not a fabricated transcript of outdoor use.

## Decisions backed by checks

1. Start with a small outdoor task: choose an activity for a familiar place, carry a short plan, then leave the screen. No maps or wildlife identification were required.
2. Initially test SmolLM2-135M constrained to valid activity IDs. Real WASM execution succeeded, but it repeatedly chose A even for a request about colors. A schema-valid answer was insufficient evidence of recommendation quality.
3. Replace that experiment with multilingual-e5-small semantic retrieval. Pin the ONNX conversion revision, use q8 WASM, and follow the original model's query/passage prefixes, mean pooling and normalization.
4. Keep mobility and goal eligibility in deterministic code. An input asking to walk cannot override the seated filter. Curated instructions keep model prose and invented routes out of the plan.
5. Test contrasting preferences in the browser: Portuguese colors → B, Portuguese birds/leaves → A, English textures → D, English walking → E. Record actual ranking and timings in `evidence/browser-inference.json`.
6. Review persistence and correct a timer bug: saving an end time without restoring it lost an active pause after reload. The app now saves and restores both the active plan and its original end time. An observed 10:00 pause reopened at 07:51 and resumed without resetting.
7. Install a versioned core app cache as a set, and await runtime cache writes. Handle storage errors without claiming a reflection was saved.
8. Make the downloadable HTML card self-contained, with escaped place text and no scripts or external assets. Ten automated checks cover meaningful boundaries; browser inference remains a separate real execution check.

## Reproduction and limits

Follow the root README to install the locked dependencies, build, check and serve the app. Open the plan's details to inspect the model revision, ranking and measured runtime.

Measurements are observations from the test device, not benchmarks across browsers. The initial model/tokenizer download is approximately 135.4 MB plus runtime assets. Cache retention and browser storage affect offline reuse. No field trial, user interviews, health improvement, or adoption figures are claimed. Application development used Codex; the sponsor-category implementation is the actual GitHub Actions workflow.

Hosting required every asset below 25 MiB. A WASM-only ONNX Runtime build replaced the larger asyncify/WebGPU assets; a real browser rerun reproduced the color selection. This change concerns deployment size, without changing the pinned model or eligibility rules.
