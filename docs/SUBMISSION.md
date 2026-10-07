---
title: "Outside in 20: open AI that gives your phone a stopping point"
published: true
published_url: https://dev.to/brunof94_debug/outside-in-20-open-ai-that-gives-your-phone-a-stopping-point-2427
ai_disclosure: fully_autonomous
tags: devchallenge, hf26challenge, ai, opensource
---
*Entry for the [Hacktoberfest Open-Source AI Challenge Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest-week1-2026-10-05).*

## What I Built

You have twenty minutes and somewhere familiar to go: a courtyard, a nearby park, or another outdoor place you already know. Opening your phone to decide what to do can become the activity itself.

I built **Outside in 20**, or **Saia em 20** in Portuguese, to give that interaction a stopping point. Enter your preferences, mobility constraints, and a place you know. Get a short outdoor activity, an instruction card, and a timer. Prepare the card, put the phone away, and return when you want to reflect.

The app asks for no GPS access and does not discover destinations. An optional reflection stays on the device. English and Portuguese instructions come from a curated catalogue; open AI matches your preference to an eligible activity.

## Demo

[Open Outside in 20](https://brunof94-debug.github.io/saia-em20-week1/).

![Outside in 20 with its terracotta, sand and deep blue interface](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/ufc5e0jjszgcojdmmjne.jpg)

*Browser demonstration. Forest photograph: Wolfgang Hasselmann, Unsplash.*

Try a preference about noticing colours, listening to birds, or taking a gentle walk. You can inspect the matching details, save a self-contained HTML pocket card, and start the timer. Reloading restores the selected plan and its original end time.

The first AI setup needs an internet connection and a substantial download. Prepare it before heading outside. The saved pocket card has no scripts or external assets.

## Code

[Public repository](https://github.com/Brunof94-debug/saia-em20-week1).

**Ten automated tests pass.** They check meaningful application boundaries, including activity eligibility and safe handling of text. The public [GitHub Actions run](https://github.com/Brunof94-debug/saia-em20-week1/actions/runs/37581580997) completed successfully. It installs locked dependencies, runs tests, builds and checks the app, uploads the browser bundle, and publishes the verified result to GitHub Pages.

Actual model execution has separate [browser evidence](https://github.com/Brunof94-debug/saia-em20-week1/blob/main/docs/evidence/wasm-only-inference.json).

## How I Built It

My first approach used SmolLM2-135M with constrained output. It produced valid activity IDs, but repeatedly chose **A**, even when the preference described a different activity. A successful format check was hiding a recommendation failure.

I switched to **multilingual-e5-small**, an open embedding model that turns text into comparable numerical representations. The [original intfloat model](https://huggingface.co/intfloat/multilingual-e5-small) uses the MIT licence. The app runs its Xenova q8 conversion through [Transformers.js](https://huggingface.co/docs/transformers.js/en/index), using WebAssembly on the person's device.

The flow has four steps:

1. Filter activities by mobility and goal using deterministic rules.
2. Encode the preference with `query:` and eligible descriptions with `passage:`.
3. Average and normalize the representations, then rank by cosine similarity.
4. Resolve the selected ID into curated bilingual instructions.

The model cannot override the eligibility filters or invent a route. Displayed scores describe similarity; they are **not confidence percentages** or guarantees that an activity suits a particular place.

On October 7, browser checks distinguished Portuguese requests about colours and bird/leaf sounds, and English requests about textures and gentle walking. A conflicting walking request also stayed within the seated filter.

After switching the deployment to a WASM-only runtime, I repeated the Portuguese colour check. It selected B with **144 ms of inference** and **2,500 ms total**, with model assets already cached. The evidence records the model revision and ranking. These are observations from one test environment, not cross-browser benchmarks or a broad quality evaluation.

The model and tokenizer require approximately **135.4 MB**, plus application/runtime assets. Cached inference depends on completed setup and browser storage that has not been cleared or evicted. The downloadable card provides a simpler way to carry the selected activity offline.

## Why Does Open Innovation Matter?

Openness changes where this decision happens. Preferences are processed locally rather than sent to a remote model API. The model, filters, and catalogue can be inspected and changed independently.

That separation made the engineering correction possible: I could replace the generator that kept selecting A with a model designed for matching descriptions, while keeping the activity flow. The repository pins the model revision so that choice is reproducible.

This suits Touch Grass: prepare briefly, then carry an activity instead of an ongoing conversation. I have not conducted an outdoor trial, user study, or interviews. Whether it actually helps people spend less time on their phones still needs testing outside the browser.

## My Agent Session

I used **Codex** for implementation, interface iteration, documentation, validation, and writing support. The [development log](https://github.com/Brunof94-debug/saia-em20-week1/blob/main/docs/AI-DEVELOPMENT.md) explains the model change, timer persistence fix, cache decisions, and real browser checks.

## Prize Categories

**Overall prize**, and **Best Use of GitHub Copilot through GitHub Actions**.

The [published category](https://dev.to/challenges/hacktoberfest-week1-2026-10-05#best-use-of-github-copilot) explicitly includes automating a project with GitHub Actions. My entry uses that route: the linked successful workflow verifies and packages the application. Development assistance came from Codex; the sponsor integration is GitHub Actions.
