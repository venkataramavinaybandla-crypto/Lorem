# Lorem

Interactive course companion and platform for **Generative AI and AI Platform Engineering (25CS2207E)**, covering Course Outcomes CO1 through CO6.

## Features
- **Outside-In Curriculum**: Structured trajectory from raw tokenization through transformer architectures, retrieval (RAG), prompt patterns, fine-tuning/PEFT, and cloud platform deployment.
- **Typed Build-Time YAML Loader**: Automatically imports all YAML files placed in `/content/` at build time without runtime network overhead.
- **Progress Tracking**: Section completion tracking persisted to `localStorage` with live status bars across the home dashboard and sidebar.
- **Global Search**: Modal search across all concept titles, codes, ELI5 summaries, formulas, and deep-dive technical notes via `Ctrl+K` / `Cmd+K`.
- **Interactive Visualization Engine**: Purely data-driven SVG/Canvas components with real-time parameter controls, formula diagnostics, and cause-and-effect outcome panels.
- **Luminous Design System**: Soft warm lavender canvas (`#f3effb`) paired with translucent glassmorphic cards (`#fdfcff`), clean typography (`Plus Jakarta Sans`), and restrained accents (`#9f4122`, `#ff8a65`).

## Getting Started

### Prerequisites
- Node.js 18+ (tested with v24.19.0)
- npm 9+

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Adding a New CO or Module Part
Adding a new YAML file to `/content/` automatically registers it into the curriculum and navigation:
1. Create or place your file under `/content/CO-N/` (e.g. `c:/Lorem/content/CO-1/co1_11_new_topic.yaml`).
2. Ensure the YAML adheres to `SCHEMA.md`:
   ```yaml
   part:
     id: co1-part-11
     co: CO1
     title: Your Module Part Title
     order: 11
     concept_ids:
       - your-concept-id
   concepts:
     - id: your-concept-id
       code: GA-CO1.1.11
       title: Concept Heading
       session: 11
       eli5: Simple plain-language summary.
       key_points:
         - Key takeaway point
       deep_dive: In-depth technical explanation.
       formulas: []
       common_mistakes: []
       mini_task: Exercise description.
       quiz: []
       exam_tags: [mid-term]
   ```
3. Run `npm run build` — Vite detects the new file via `import.meta.glob` and bundles it into the route index automatically.

## Deployment (Vercel)
The repository includes a ready `vercel.json` SPA rewrite configuration.
To deploy via the Vercel CLI:
```bash
npx vercel
```
Or link the repository directly in the Vercel dashboard with:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
