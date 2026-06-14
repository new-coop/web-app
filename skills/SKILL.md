---
name: Mifos Web App Agent Skills
description: Core capabilities and rules for AI agents contributing to the MifosX Web App (Angular).
---

# Mifos Web App Skills

This file defines the procedural knowledge required for AI agents to successfully contribute to the Mifos X Web App.

## 1. UI Component Generation Skill

**When to Apply:** Creating new screens or views.

**Rules:**

- Follow the **Noir design system** (see `.cursor/rules/mifos-x-style-guide.mdc` and `src/theme/_design-tokens.scss`).
- Use CSS design tokens (`--mifos-*`, `--space-*`, `--text-*`, `--radius-*`) — never hardcode hex colors or arbitrary spacing.
- **Landing / hub pages:** use `<mifosx-nav-hub>` with typed `NavHubSection[]` config (see `accounting.component.ts`).
- **Buttons & icons:** use `<mifosx-m3-button>` and `<mifosx-m3-icon>`, not raw `<button>` or Font Awesome for new UI.
- **Forms & wizards:** use global layout classes (`.form-workspace`, `.form-page`, `.form-grid`, `.form-ledger`) from `_design-tokens.scss`.
- **Data tables & fields:** Angular Material (`<mat-table>`, `<mat-form-field>`, `<input matInput>`).
- Spacing must use the 4px token grid (`--space-*` or multiples of 4px). Values like `10px` or `15px` are prohibited.
- No inline `style=""` attributes in templates.

**Correct Example (hub landing):**

```html
<div class="container">
  <mifosx-nav-hub hubSubtitle="labels.text.Accounting hub welcome" filterPlaceholder="labels.text.Filter accounting tasks" [sections]="sections" />
</div>
```

**Correct Example (form workspace):**

```html
<div class="container form-page">
  <div class="form-workspace">
    <header class="form-workspace-header">…</header>
    <form class="form-workspace-form">
      <section class="form-section">
        <h2 class="form-section-title">{{ 'labels.heading.Details' | translate }}</h2>
        <div class="form-grid">…</div>
      </section>
      <footer class="form-workspace-footer">
        <mifosx-m3-button variant="filled" [label]="'labels.buttons.Submit' | translate" />
      </footer>
    </form>
  </div>
</div>
```

## 2. Forms & Data Binding Skill

**When to Apply:** Building forms to submit to the Fineract backend.

**Rules:**

- Use Angular **Reactive Forms** (`FormBuilder`, `FormGroup`, `FormControl`). Do NOT use Template-driven forms (`[(ngModel)]`).
- Always inject the `FormBuilder` in the constructor.

## 3. Translation & i18n Skill

**When to Apply:** Any time you are adding user-facing text to an HTML template or component.

**Rules:**

- Hardcoded English text is strictly prohibited in HTML templates.
- **ALWAYS** use the `@ngx-translate/core` pipe in templates.
- **Syntax:** `{{ 'Your.String.Here' | translate }}`
- If you add _new_ strings, you MUST run `npm run translations:extract` after modifying the HTML so it generates inside `src/translations/template.json`.

## 4. API & Data Fetching Skill

**When to Apply:** Connecting a UI component to Apache Fineract endpoints.

**Rules:**

- Data fetching should happen via Angular `Resolve` classes on the Route, OR via injected Services. Do not execute heavy HTTP logic directly inside the Component's `ngOnInit` if it blocks initial render unnecessarily.
- The UI exclusively communicates with the backend via REST. Use standard Angular `HttpClient`.

## 5. File Headers Compliance Skill

**When to Apply:** Whenever you create a **new** file (`.ts`, `.html`, `.scss`).

**Rules:**

- Before finalizing a PR or task, you MUST run `npm run headers:add` to prepend the required Mozilla Public License 2.0 (MPL-2.0) headers to your files.
- Verify with `npm run headers:check`.
