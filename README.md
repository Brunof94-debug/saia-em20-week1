# Saia em 20 · Outside in 20

A bilingual outdoor-break planner with an open multilingual embedding model running in the browser. Created from scratch during DEV Hacktoberfest Open-Source AI Challenge Week 1 (October 5–11, 2026).

## Use it

1. Choose 10, 20, or 30 minutes and a place you already know.
2. Select a goal, optionally request a seated break, and add a short preference in Portuguese or English.
3. Prepare with local AI. First use downloads approximately 135 MB of model/tokenizer files, plus runtime assets.
4. Save a self-contained pocket card and put the screen away. A saved pause resumes after the page is closed or reloaded, using its original end time.

Places and preferences are not sent to an inference server. There are no routes, GPS, accounts, or analytics. Hosting and model-file providers still receive ordinary request metadata.

## Run locally

Requirements: Node.js 22+ and npm.

```sh
npm ci
npm run build
npm test
npm run check
npm start
```

Open `http://127.0.0.1:4318`. HTTPS or localhost is required for service workers. The browser needs WebAssembly and module Web Workers; recent Chromium is the primary target. Other browsers remain subject to their WASM/runtime compatibility.

## What the AI does

`src/ai-worker.js` → Transformers.js 4.3.0 → multilingual-e5-small q8 → normalized embeddings → cosine ranking of allowed activities → validated bilingual plan.

- Model conversion: [Xenova/multilingual-e5-small](https://huggingface.co/Xenova/multilingual-e5-small), based on the MIT-licensed [intfloat/multilingual-e5-small](https://huggingface.co/intfloat/multilingual-e5-small).
- Pinned conversion revision: `761b726dd34fb83930e26aab4e9ac3899aa1fa78`.
- Runtime: `@huggingface/transformers` 4.3.0, WASM, one thread.
- The selected goal filters candidates. A seated preference always removes walking; if movement and sitting conflict, sitting takes precedence.
- Preference text uses `query: ` and each activity description uses `passage: `. Mean pooling and normalization make the dot product a cosine similarity. Scores are **not confidence percentages**.
- Passage vectors are reused within the worker. Each new preference still requires actual model inference.
- The model chooses an activity; authored catalog text supplies instructions. It cannot invent a route or override a hard constraint.
- The plan exposes the actual model, revision, ranking and measured runtime. If inference fails, an optional catalog suggestion is visibly labeled **NO AI / SEM IA**.

Semantic matching is imperfect, particularly for negation and ambiguous preferences. A small catalog is an intentional scope limit; this is not a wildlife identifier or a route safety service.

## Why the model changed

The initial SmolLM2-135M experiment produced valid constrained JSON but repeated activity A even when the request explicitly asked for colors. Valid syntax did not demonstrate useful selection. A multilingual retrieval model suits this finite-choice task better. It remains an open AI feature at the center of the product, without relying on generated Portuguese prose.

## Offline and storage limits

The service worker installs a versioned set of core app files; Transformers.js uses browser caches for model files. First use requires internet. Offline reuse depends on retained caches and storage space; cache eviction can require another download. The self-contained HTML pocket card opens without the application or model. Optional reflections stay on the device. Storage errors are reported instead of claiming a note was saved.

The timer uses an absolute end time and a saved copy of the active plan. Closing the plan dialog offers resume rather than resetting the countdown. A change to the device clock can affect the display.

## Verification

Ten unit tests cover mobility and goal constraints, malformed output/vectors, order-independent ranking, exact durations, escaped text, timer math and fallback attribution. Build checks verify JavaScript syntax, local asset references and the browser worker bundle.

Real browser inference on October 7, 2026 returned:

| Preference | Result | Measured inference |
|---|---|---:|
| Portuguese: five colors in leaves and sky | B · colors | 189 ms, including initial passage embeddings |
| Portuguese: birds and rustling leaves | A · sounds | 20 ms, warm worker |
| English: rough bark and stone | D · textures | 20 ms, warm worker |
| English: gentle walk | E · walk | 72 ms, including two new passage embeddings |
| Request to walk with sitting selected | A · seated sounds; no walking candidate admitted | 19 ms |

The first run took 12.65 seconds overall on the test device. Timings are device-specific, not performance guarantees. Raw evidence is in [docs/evidence/browser-inference.json](docs/evidence/browser-inference.json). Unit tests alone do not prove browser inference or offline loading. No user study or outdoor trial is claimed.

GitHub Actions builds the browser worker and runs checks on push/PR (`.github/workflows/ci.yml`). Browser WebMCP exposes `read_outdoor_plan` and `prepare_outdoor_plan` when supported; preparation uses the same validated flow as the UI and does not start the timer.

## Attribution

- Application: MIT, see `LICENSE`.
- multilingual-e5-small: MIT original model by the E5 authors; ONNX conversion by Xenova.
- [Transformers.js](https://github.com/huggingface/transformers.js): Apache 2.0, Hugging Face.
- [ONNX Runtime](https://github.com/microsoft/onnxruntime): MIT, Microsoft.
- [Forest photograph](https://unsplash.com/photos/a-lush-green-forest-path-with-sunlight-filtering-through-trees-9LU8RJCh8Hk): Wolfgang Hasselmann, Unsplash License. Generic woodland imagery with no geographic claim.
- DM Sans and Manrope: optional Google Fonts, SIL Open Font License; system fonts remain usable offline.

Codex assisted implementation, documentation and testing. No use of GitHub Copilot is claimed. The partner-category claim concerns the real GitHub Actions workflow.

## Contest history and hosting

The project was initiated after the Week 1 start on October 5, 2026, at 13:00 BRT. The public GitHub repository was created on October 7. All substantive application code is new in this window. Commits after October 12, 2026, at 03:59 BRT must be disclosed before further contest claims.

Static assets are served from `dist/`. `.openai/hosting.json` records the Sites project. Locked source generates ignored browser/runtime bundles during `npm run build`; no paid inference API key is required.