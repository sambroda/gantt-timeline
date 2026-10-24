# Gantt Timeline React Module

A reusable React SVG Gantt component distributed as an npm package. The chart is built with React and SVG and does not depend on a third-party charting library.


## Project links and maintainer

- **Author / maintainer:** Sam Broda
- **GitHub repository:** https://github.com/sambroda/gantt-timeline
- **Documentation:** https://github.com/sambroda/gantt-timeline#readme
- **Issue tracker:** https://github.com/sambroda/gantt-timeline/issues
- **npm package:** https://www.npmjs.com/package/@sambroda/gantt-timeline
- **License:** MIT

The `author`, `repository`, `homepage`, `bugs`, `license`, and `keywords` fields in `package.json` provide package metadata that npm can display on the package page. npm publishing permissions are managed by npm; the `author` field identifies the author but does not grant publish access.

## Features

- One bar per input record; array order determines row order.
- Date markers: `validFrom` (circle), `mandatoryFrom` (diamond), and `invalidFrom` (end circle).
- Optional record label and optional URL.
- Open-ended records (`invalidFrom: null`) extend to the right edge of the visible timeline.
- Configurable today line, colors, labels, locale, dimensions, legend and row labels.
- CSS is scoped with a `gt-` class prefix.
- Local demo uses the package from the local filesystem; no npm publish is needed to test changes.

## Requirements

- Node.js 20+ recommended
- React 18 or later in the consuming application

## Install from npm

The package is scoped as `@sambroda/gantt-timeline`.

```bash
npm install @sambroda/gantt-timeline
```

## Basic usage

```jsx
import GanttTimeline from "@sambroda/gantt-timeline";

const records = [
  {
    id: "V-01",
    label: "Here is a descriptive text",
    validFrom: "2025-09-26",
    mandatoryFrom: "2026-10-16",
    invalidFrom: null,
    url: "https://example.com/record/V-01"
  },
  {
    id: "A-01",
    label: "Current record",
    validFrom: "2026-10-12",
    mandatoryFrom: "2026-11-05",
    invalidFrom: "2026-12-29",
    url: "https://example.com/record/A-01"
  }
];

export default function Page() {
  return <GanttTimeline data={records} today="2026-10-24" locale="en-GB" />;
}
```

## Record schema

```ts
type GanttRecord = {
  id: string;
  label: string;
  validFrom: string;       // required ISO date: YYYY-MM-DD
  mandatoryFrom: string;   // required ISO date: YYYY-MM-DD
  invalidFrom: string | null; // ISO date, or null for open-ended
  url?: string;            // optional absolute URL
  [key: string]: unknown;
};
```

Records render in exactly the order they appear in `data`; no role/category field is required. Keep `validFrom <= mandatoryFrom`. If `invalidFrom` is set, it should not be earlier than `validFrom`. Validate business rules and URLs in the consuming application.

## API reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `GanttRecord[]` | `[]` | Records, in display order. |
| `today` | `string` | Current date | ISO date for the vertical today marker. |
| `locale` | `string` | `en-GB` | Locale used by `Intl.DateTimeFormat`. |
| `labels` | `object` | English labels | Overrides `validFrom`, `mandatoryFrom`, `invalidFrom`, `today`, `openEnded`, and `ariaLabel`. |
| `colors` | `object` | Built-in colors | Overrides `bar`, `validFrom`, `mandatoryFrom`, and `invalidFrom`. |
| `showToday` | `boolean` | `true` | Show today line and legend entry. |
| `showLegend` | `boolean` | `true` | Show the marker legend. |
| `showRecordLabels` | `boolean` | `true` | Show IDs, labels and URLs to the left of the timeline. |
| `className` | `string` | `""` | Adds a class to the component root. |
| `minWidth` | `number` | `760` | Minimum SVG width; narrow containers scroll horizontally. |
| `rowHeight` | `number` | `72` | Vertical spacing per record. |
| `labelWidth` | `number` | `280` | Width of the record information column. |
| `chartWidth` | `number` | `850` | Width of the date plotting area. |
| `onRecordClick` | `(record) => void` | — | Optional click callback. If supplied, it takes precedence over opening `record.url`. |
| `openLinksInNewTab` | `boolean` | `true` | Open record URLs in a new tab when no callback is supplied. New tabs use `noopener,noreferrer`. |

### Colors

```jsx
<GanttTimeline
  data={records}
  colors={{
    bar: "#438cf0",
    validFrom: "#438cf0",
    mandatoryFrom: "#526782",
    invalidFrom: "#27a66a"
  }}
/>
```

### German labels and dates

```jsx
<GanttTimeline
  data={records}
  locale="de-DE"
  labels={{
    validFrom: "GÜLTIG AB",
    mandatoryFrom: "PFLICHT AB",
    invalidFrom: "UNGÜLTIG AB",
    today: "HEUTE",
    openEnded: "Offen",
    ariaLabel: "Gantt-Zeitachse"
  }}
/>
```

### URL behavior

Set `url` on a record to make its row interactive. By default the URL opens in a new browser tab. Provide `onRecordClick` to handle navigation yourself (for example with React Router); when supplied, it overrides the built-in URL behavior. The URL is not rendered as trusted HTML. Validate or allowlist external URLs in the host application if input data is untrusted.

## CSS customization

The component stylesheet is imported by the package entry point. Class names use the `gt-` prefix to reduce collisions. Theme the chart with CSS custom properties:

```css
.my-timeline {
  --gt-font: Inter, sans-serif;
  --gt-muted: #77849a;
  --gt-grid: #e8edf4;
  --gt-today: #dc4545;
}
```

Then use `<GanttTimeline className="my-timeline" data={records} />`.

## Development and local testing (without publishing)

The repository contains a `demo/` app that consumes the package from the local filesystem. This is the recommended way to iterate without publishing each change.

1. Replace `@sambroda` everywhere in `package.json`, `demo/package.json`, `demo/src.jsx`, and this README with your actual npm scope.
2. From the repository root, build the package:

   ```bash
   npm install
   npm run build
   ```

3. Install and run the demo:

   ```bash
   cd demo
   npm install
   npm run dev
   ```

The demo dependency is `file:..`, so it uses the local package directory. After changing package source, rerun `npm run build` in the root and restart/refresh the demo if needed. If npm has cached the local package contents, run `npm install` in `demo` again. Do not use `npm link` as the default workflow; a `file:` dependency is generally more predictable.

## Publishing through GitHub Actions

The workflow `.github/workflows/publish.yml` builds and publishes when a version tag like `v1.0.0` is pushed. It can also be started manually from the GitHub Actions tab.

1. Create an npm account and reserve the package name/scope.
2. The package scope is already configured as `@sambroda/gantt-timeline`.
3. Configure the GitHub repository secret `NPM_TOKEN` with an npm automation/access token that has permission to publish the package.
4. Commit and push your changes.
5. Update `version` in `package.json` before each release.
6. Tag and push the release:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

The workflow runs `npm ci`, builds the library, then runs `npm publish --access public`. Make sure the package name is available and the npm token is configured. npm's trusted publishing/OIDC configuration can be used instead of a token where your npm account and repository support it; the included workflow uses `NPM_TOKEN` for a straightforward initial setup.

## Build output

`npm run build` creates distributable ESM and CommonJS bundles plus TypeScript declaration output under `dist/`. React is a peer dependency, so consumers use their own React installation.

## License

MIT. See `LICENSE`.
