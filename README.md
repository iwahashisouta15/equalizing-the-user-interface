# Equalizing the User Interface

**Connect or switch AI providers without redesigning an existing interface.** This repository contains a Copilot skill for integrating AI services while preserving the UI's existing appearance and behavior.

> **Status:** The skill specification is available. Provider adapters and project-specific integration files are created only after the target provider and the existing UI/API details are known.

## What this is

The `equalizing-the-user-interface` skill guides an integrator to connect an AI provider to an existing app while keeping its visual design intact. It focuses on:

- Preserving existing markup, styles, design tokens, component structure, and interaction flow.
- Using a provider-neutral TypeScript contract and separate provider adapters.
- Supporting streaming responses and request cancellation with `AbortSignal`.
- Checking provider API details against official documentation instead of guessing.
- Keeping API credentials out of source code and reading them from environment variables where applicable.

## Use the skill

Open [the skill specification](.github/skills/equalizing-the-user-interface/SKILL.md) and provide the information needed for your project:

1. **Existing UI/design source:** for example, the relevant component, `DESIGN.md`, or design tokens.
2. **Target provider:** for example, Ollama or Gemini.
3. **Project stack:** for example, TypeScript with React or Next.js.

Example request:

> Add an Ollama adapter to my existing chat UI. Keep the UI unchanged. The project uses TypeScript and React; here is the chat component: …

If the UI structure or official API details are unclear, the skill requires the integrator to ask before implementing rather than assume.

## Expected integration layout

When the project details are available, integration files can be kept separate from existing UI components:

```text
ui-contract.ts
adapters/
  <provider>.ts
providerRegistry.ts
visual-regression.test.ts
README-skill.md
```

This is an example layout, not a claim that those integration files already exist in this repository. The skill itself is at `.github/skills/equalizing-the-user-interface/SKILL.md`.

## Safety and compatibility principles

- Use an OpenAI-compatible API only when the provider supports it and its endpoint and schema are verified in official documentation.
- Use provider-specific formats where required; label unverified API details clearly as **belum diverifikasi** (“not verified”).
- Pass `AbortSignal` to network requests so cancellation works.
- Do not put API keys or other secrets in committed source code.
- Keep provider-specific names out of UI component code.
- Add adapter contract tests and a pixel-exact visual regression test when project fixtures and a test setup are available.

## License

The repository's skill and documentation are licensed under [CC BY-NC 4.0](LICENSE). You may share and adapt them with attribution, but not for commercial purposes. See the license for full terms.

---

**Bahasa Indonesia:** Skill ini membantu menghubungkan atau mengganti provider AI tanpa mengubah tampilan dan perilaku UI yang sudah ada. Siapkan sumber UI/desain, provider tujuan, dan stack proyek sebelum meminta implementasi. Detail endpoint atau skema API yang belum dicek melalui dokumentasi resmi harus ditandai **belum diverifikasi**.
