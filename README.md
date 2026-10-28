# Gantt Timeline React Module

A reusable React SVG Gantt component distributed as an npm package. The chart is built with React and SVG and does not depend on a third-party charting library.

## Project links and maintainer

- **Author / maintainer:** Sam Broda
- **Contact:** [nasadorbs@gmail.com](mailto:nasadorbs@gmail.com)
- **GitHub repository:** https://github.com/sambroda/gantt-timeline
- **Documentation:** https://github.com/sambroda/gantt-timeline#readme
- **Issue tracker:** https://github.com/sambroda/gantt-timeline/issues
- **npm package:** https://www.npmjs.com/package/@sambroda/gantt-timeline
- **License:** MIT

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

**Import the package stylesheet explicitly.** The JavaScript entry points do not automatically load the extracted CSS file. Without this import, the component can render while visual details such as the legend symbols are unstyled.

```jsx
import GanttTimeline from "@sambroda/gantt-timeline";
import "@sambroda/gantt-timeline/style.css";

const records = [
  {
    id: "V-01",
    label: "Here is a descriptive text",
    validFrom: "2025-09-26",
    mandatoryFrom: "2026-10-16",
    invalidFrom: null,
    url: "https://example.com/record/V-01",
  },
  {
    id: "A-01",
    label: "Current record",
    validFrom: "2026-10-12",
    mandatoryFrom: "2026-11-05",
    invalidFrom: "2026-12-29",
    url: "https://example.com/record/A-01",
  },
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
  validFrom: string; // required ISO date: YYYY-MM-DD
  mandatoryFrom: string; // required ISO date: YYYY-MM-DD
  invalidFrom: string | null; // ISO date, or null for open-ended
  url?: string; // optional absolute URL
  [key: string]: unknown;
};
```

Records render in exactly the order they appear in `data`; no role/category field is required. Keep `validFrom <= mandatoryFrom`. If `invalidFrom` is set, it should not be earlier than `validFrom`. Validate business rules and URLs in the consuming application.

## API reference

| Prop                | Type               | Default         | Description                                                                                     |
| ------------------- | ------------------ | --------------- | ----------------------------------------------------------------------------------------------- |
| `data`              | `GanttRecord[]`    | `[]`            | Records, in display order.                                                                      |
| `today`             | `string`           | Current date    | ISO date for the vertical today marker.                                                         |
| `locale`            | `string`           | `en-GB`         | Locale used by `Intl.DateTimeFormat`.                                                           |
| `labels`            | `object`           | English labels  | Overrides `validFrom`, `mandatoryFrom`, `invalidFrom`, `today`, `openEnded`, and `ariaLabel`.   |
| `colors`            | `object`           | Built-in colors | Overrides `bar`, `validFrom`, `mandatoryFrom`, and `invalidFrom`.                               |
| `showToday`         | `boolean`          | `true`          | Show today line and legend entry.                                                               |
| `showLegend`        | `boolean`          | `true`          | Show the marker legend.                                                                         |
| `showRecordLabels`  | `boolean`          | `true`          | Show IDs, labels and URLs to the left of the timeline.                                          |
| `className`         | `string`           | `""`            | Adds a class to the component root.                                                             |
| `minWidth`          | `number`           | `760`           | Minimum SVG width; narrow containers scroll horizontally.                                       |
| `rowHeight`         | `number`           | `72`            | Vertical spacing per record.                                                                    |
| `labelWidth`        | `number`           | `280`           | Width of the record information column.                                                         |
| `chartWidth`        | `number`           | `850`           | Width of the date plotting area.                                                                |
| `onRecordClick`     | `(record) => void` | —               | Optional click callback. If supplied, it takes precedence over opening `record.url`.            |
| `openLinksInNewTab` | `boolean`          | `true`          | Open record URLs in a new tab when no callback is supplied. New tabs use `noopener,noreferrer`. |

### Colors

```jsx
<GanttTimeline
  data={records}
  colors={{
    bar: "#438cf0",
    validFrom: "#438cf0",
    mandatoryFrom: "#526782",
    invalidFrom: "#27a66a",
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
    ariaLabel: "Gantt-Zeitachse",
  }}
/>
```

### URL behavior

Set `url` on a record to make its row interactive. By default the URL opens in a new browser tab. Provide `onRecordClick` to handle navigation yourself (for example with React Router); when supplied, it overrides the built-in URL behavior. The URL is not rendered as trusted HTML. Validate or allowlist external URLs in the host application if input data is untrusted.

## CSS and customization

Import `@sambroda/gantt-timeline/style.css` once in your application (for example, in the component/module that uses `GanttTimeline` or in your app entry point). This is the package's public stylesheet export. It includes the component layout, timeline markers, and legend symbols. Vite and other CSS-aware bundlers will then include the stylesheet in the application build.

Class names use the `gt-` prefix to reduce collisions. Theme the chart with CSS custom properties:

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

1. From the repository root, install dependencies and build the package:

   ```bash
   npm install
   npm run build
   ```

2. Install and run the demo:

   ```bash
   cd demo
   npm install
   npm run dev
   ```

The demo dependency is `file:..`, so it uses the local package directory. After changing package source, rerun `npm run build` in the root and restart or refresh the demo if needed. If npm has cached the local package contents, run `npm install` in `demo` again.

## Build output

`npm run build` creates distributable ESM and CommonJS bundles plus TypeScript declaration output under `dist/`. React is a peer dependency, so consumers use their own React installation.

## Release workflow (maintainers)

Run these commands from the repository root. Review the changes and make sure the working tree is in the expected state before releasing.

1. Validate the package:

   ```bash
   npm run lint
   npm run build
   npm pack --dry-run
   ```

   If the repository defines a format-check script, run that too. Confirm that `dist/style.css` is generated and contains the component and legend styles.

2. Commit the intended source/documentation changes:

   ```bash
   git add .
   git commit -m "docs: clarify stylesheet import and release workflow"
   ```

   Adjust the commit message to describe the actual changes.

3. Before versioning, check the current package version and whether the next Git tag is already present:

   ```bash
   node -p "require('./package.json').version"
   git tag --list "v*"
   git status
   ```

   `npm version patch` increments the version in the local `package.json` (and lockfile, if present) by one patch level and creates a version commit and Git tag. It does **not** find the next unused version by checking npm or existing Git tags. If the next tag already exists, stop and investigate; do not delete or force-move a published tag.

4. If the working tree is clean and the next version/tag is confirmed to be unused, create the release version:

   ```bash
   npm version patch
   ```

5. Push the commits and tags:

   ```bash
   git push
   git push --tags
   ```

6. Verify the CI/release workflow and the published package. For example:

   ```bash
   npm pack @sambroda/gantt-timeline@<version>
   ```

   Inspect the archive to confirm it contains `package/dist/style.css`, the JavaScript bundles, and the expected `package.json` exports. Only consider the release complete once the intended version is available on npm and its contents are verified.

## License

MIT. See `LICENSE`.
