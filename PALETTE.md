# Stationery Palette Reference

How the colors in `themes/stationery-light.json` and `themes/stationery-dark.json` are produced, and where to edit when you want to change a specific part of the editor.

## How the build works

`scripts/build-themes.mjs` defines two palette objects — `light` and `dark` — at the bottom of the file. Each palette is a flat map of named colors (`bg`, `accent`, `string`, …). Three transformers turn a palette into a slice of the theme JSON:

| Transformer            | What it produces                       | VS Code surface area                                |
| ---------------------- | -------------------------------------- | --------------------------------------------------- |
| `sharedColors(p)`      | `colors`                               | Workbench / UI chrome (sidebar, tabs, status bar, …) |
| `tokenColors(p)`       | `tokenColors`                          | TextMate scopes — language syntax highlighting      |
| `semanticTokenColors(p)` | `semanticTokenColors`                | LSP semantic tokens                                 |

To change a color:

1. Find the palette key controlling it in the section below.
2. Edit the value in the `light` or `dark` object in `scripts/build-themes.mjs`.
3. Run `npm run build` (or `npm run package` to also build a `.vsix`).

The build validates that both palettes have the same set of keys, that every value is a valid 6/8-digit hex, and that no transformer references an undefined key.

---

## Where to change a specific part of the editor

### Foundation surfaces

| You want to change…                                            | Edit palette key |
| -------------------------------------------------------------- | ---------------- |
| Editor canvas background, gutter, terminal, peek editor, diff editor | `bg`             |
| Sidebar, status bar, activity bar, inactive tabs, editor group header, panel section header | `surface`        |
| Hover surfaces, menus, command center, suggest widget, peek result, notifications, modals | `panel`          |
| Bottom panel background (terminal/output panel container)      | `panelBg`        |
| Active tab, title bar, breadcrumb, sticky scroll               | `chrome`         |

> Note: `panel` and `panelBg` are different keys. `panelBg` only drives `panel.background` (the bottom panel container). Everything else "menu-like" uses `panel`.

### Foreground text

| You want to change…                                | Edit palette key |
| -------------------------------------------------- | ---------------- |
| Editor text, terminal text, status bar text, title bar text | `fg`             |
| Sidebar text, breadcrumb text, description text    | `secondaryText`  |
| Inactive tab text, placeholders, disabled text     | `muted`          |
| Line numbers (inactive)                            | `lineNumber`     |
| Active line number                                 | `secondaryText`  |
| Cursor color                                       | `cursor`         |
| Character under the cursor                         | `cursorCharacterForeground` |

### Borders & separators

| You want to change…                                | Edit palette key |
| -------------------------------------------------- | ---------------- |
| Tabs, panels, sidebar, status bar, title bar, group borders, indent guide (active), tree indent | `border` |
| Editor ruler, indent guide (inactive), line highlight border, range highlight border | `subtleBorder` |

### Active line / range / hover

| You want to change…                                | Edit palette key |
| -------------------------------------------------- | ---------------- |
| Active line background                             | `lineHighlight`  |
| Range highlight (Go to Definition target, etc.)    | `rangeHighlight` |
| Folded region background                           | `fold`           |

### Selection & word highlights

| You want to change…                                | Edit palette key |
| -------------------------------------------------- | ---------------- |
| Selected text background (active editor)           | `selection`      |
| Selected text in inactive editor                   | `inactiveSelection` |
| Other matching selections                          | `selectionHighlight` (bg), `selectionBorder` (border) |
| Word under cursor (read)                           | `wordHighlight` (bg), `wordHighlightBorder` (border) |
| Word under cursor (write)                          | `wordHighlightStrong` (bg), `wordHighlightStrongBorder` (border) |
| Foreground color when a row is selected            | `selectedFg`     |

### Find / search

| You want to change…                                | Edit palette key |
| -------------------------------------------------- | ---------------- |
| Current find match                                 | `findMatch` (bg), `findMatchBorder` (border) |
| Other find matches                                 | `findMatchHighlight` |
| Find in selection range                            | `findRange`      |

### Lists, menus, suggest widget

| You want to change…                                | Edit palette key |
| -------------------------------------------------- | ---------------- |
| Active row in list / menu                          | `listActive`     |
| Focused row                                        | `listFocus`      |
| Hover row (sidebar files, etc.)                    | `listHover`      |
| Inactive selected row                              | `listInactive`   |
| Drag-and-drop target                               | `drop`           |
| Highlighted match text inside list / suggest       | `accent`         |

### Tabs

| You want to change…                                | Edit palette key |
| -------------------------------------------------- | ---------------- |
| Active tab background                              | `chrome`         |
| Active tab top border accent                       | `accent`         |
| Inactive tab background                            | `surface`        |
| Inactive tab text                                  | `muted`          |
| Modified-but-not-saved indicator                   | `warning`        |

### Status bar

| You want to change…                                | Edit palette key |
| -------------------------------------------------- | ---------------- |
| Status bar (default) bg / fg                       | `surface` / `fg` |
| Debugging status bar bg                            | `accent`         |
| Remote indicator background                        | `accent2Fill`    |
| Error item bg / fg                                 | `statusBarErrorBg` / `errorFg` |
| Warning item bg / fg                               | `warning` / `buttonFg` |

### Buttons, badges, inputs

| You want to change…                                | Edit palette key |
| -------------------------------------------------- | ---------------- |
| Primary button bg / fg / hover                     | `buttonBg` / `buttonFg` / `buttonHoverBg` |
| Secondary button bg / fg                           | `accent2Fill` / `badgeLight` |
| Activity bar badge (the unread-count chip)         | `accent` (bg), `badgeFg` (fg) |
| General badge bg / fg                              | `accent2Fill` / `badgeLight` |
| Input bg, dropdown bg, checkbox bg                 | `panel`          |
| Input border / placeholder                         | `border` / `muted` |

### Inlay hints

| You want to change…                                | Edit palette key |
| -------------------------------------------------- | ---------------- |
| Default inlay chip bg / fg                         | `inlayBg` / `inlayFg` |
| Type inlay chip bg / fg                            | `inlayTypeBg` / `inlayTypeFg` |
| Parameter inlay chip bg / fg                       | `inlayParamBg` / `inlayParamFg` |

### Diff editor

| You want to change…                                | Edit palette key |
| -------------------------------------------------- | ---------------- |
| Inserted line / text bg                            | `diffInserted`   |
| Removed line / text bg                             | `diffRemoved`    |
| Diagonal-fill empty side                           | `panel`          |

### Merge conflict markers

| You want to change…                                | Edit palette key |
| -------------------------------------------------- | ---------------- |
| Current change header / content                    | `mergeCurrentHeader` / `mergeCurrentContent` |
| Incoming change header / content                   | `mergeIncomingHeader` / `mergeIncomingContent` |
| Common ancestor header / content                   | `mergeCommonHeader` / `mergeCommonContent` |

### Diagnostics

| You want to change…                                | Edit palette key |
| -------------------------------------------------- | ---------------- |
| Error text and squiggle                            | `error`          |
| Warning text and squiggle                          | `warning`        |
| Info text and squiggle                             | `info`           |
| Hint                                               | `accent2Bright`  |
| Invalid (`invalid.illegal`) underline color        | `error`          |
| Invalid background tint                            | `invalidBg`      |

### Bracket pair colorization

`editorBracketHighlight.foreground1`–`6` use, in order: `accent`, `accent2Bright`, `secondaryText`, `warning`, `type`, `bracketAlt`. Unexpected brackets use `error`.

### Git decorations (file tree)

| State                  | Edit palette key |
| ---------------------- | ---------------- |
| Modified               | `accent`         |
| Added                  | `accent2`        |
| Deleted                | `accentMuted`    |
| Renamed                | `type`           |
| Untracked              | `accent2Bright`  |
| Ignored                | `muted`          |
| Stage modified         | `warning`        |
| Stage deleted          | `accent`         |

### Terminal ANSI palette

Eight standard + eight bright slots. Edit individually:

`terminalAnsiBlack`, `terminalAnsiRed`, `terminalAnsiGreen`, `terminalAnsiYellow`, `terminalAnsiBlue`, `terminalAnsiMagenta`, `terminalAnsiCyan`, `terminalAnsiWhite`, plus the matching `terminalAnsiBright*` variants.

Command decorations: `terminalCommandDefault`, `terminalCommandSuccess`, `terminalCommandError`.

---

## Syntax token map

These keys drive `tokenColors` (TextMate) and `semanticTokenColors` (LSP). When two languages share a concept (e.g. JSON key vs. YAML key vs. JSX attribute), each typically has its own key so you can tune them independently.

### Comments

| Token                                        | Palette key   |
| -------------------------------------------- | ------------- |
| Line / block comments                        | `comment`     |
| Doc comments (`/** … */`, `///`)             | `commentDoc`  |

### Keywords, operators, decorators

| Token                                                  | Palette key      |
| ------------------------------------------------------ | ---------------- |
| `keyword`, `storage`, `keyword.control`                | `keyword`        |
| Decorators (`@logCalls`), preprocessor, annotations    | `decorator`      |
| Escape sequences (`\n`), template-string punctuation   | `escape`         |
| Generic operators (`->`, `=>`)                         | `operator`       |
| Assignment / comparison / logical / arithmetic         | `operatorStrong` |
| Punctuation (braces, accessor `.`, separators)         | `punctuation`    |

### Identifiers & types

| Token                                                  | Palette key      |
| ------------------------------------------------------ | ---------------- |
| `entity.name.type`, `support.type`, namespace, module  | `type`           |
| `entity.name.class`, `entity.name.struct`, `entity.name.interface`, `entity.name.enum` | `typeBright` |
| `entity.name.function`, `support.function`, methods    | `function`       |
| Method calls / member access (TextMate `meta.method-call`) | `property`       |
| Variables                                              | `variable`       |
| Function parameters                                    | `parameter`      |
| Built-ins (`this`, `super`, `null`, `undefined`)       | `builtin`        |
| Imported names (TS / generic)                          | `imported`       |

### Literals

| Token                                                  | Palette key      |
| ------------------------------------------------------ | ---------------- |
| Strings, template strings, fenced code blocks          | `string`         |
| Regex literals and quantifiers                         | `regex`          |
| Numbers, booleans, `null`, `undefined`, `NaN`          | `number`         |

### JavaScript / TypeScript-specific overrides

The default token keys above cover most languages. JS/TS layer on extra keys when their roles differ from the default:

| Token                                                  | Palette key      |
| ------------------------------------------------------ | ---------------- |
| Imported names (`import { foo } from …`)               | `jsImported`     |
| Built-in objects (`console`, `Math`, `import.meta`)    | `jsBuiltin`      |
| Function names and calls in JS/TS                      | `jsFunction`     |
| Property access on objects                             | `jsProperty`     |
| Plain variables and consts                             | `jsVariable`     |
| Object-literal keys (across JS/TS/TSX/Astro)           | `objectKey`      |
| Read-only object keys (semantic)                       | `objectKeyReadonly` |
| Read-only property (semantic, `property.readonly`)     | `propertyReadonly` |
| `meta.import` quoted path                              | `importPath`     |

### Markup / template tags

| Token                                                  | Palette key      |
| ------------------------------------------------------ | ---------------- |
| HTML / Astro native tag names (`<div>`)                | `tag`            |
| Component tag names (`<MyComponent>`)                  | `componentTag`   |
| Attribute names (`href`, `class`, JSX/Astro attrs, CSS property names) | `attribute` |
| Attribute values (quoted strings inside tags)          | `attributeString`|
| Plain text inside JSX/Astro children                   | `jsxText`        |

### CSS / SCSS

| Token                                                  | Palette key       |
| ------------------------------------------------------ | ----------------- |
| Selectors (tag, class, id)                             | `cssSelector`     |
| Property names                                         | `cssProperty`     |
| Custom properties (`--var-name`)                       | `cssCustomProperty` |
| Functions (`var()`, `oklch()`, `clamp()`, …)           | `cssFunction`     |
| Numbers, units, color literals                         | `cssNumber`       |
| Keyword values, color names, `!important`              | `cssValue`        |
| Punctuation, separators                                | `cssPunctuation`  |

### JSON

| Token                                                  | Palette key      |
| ------------------------------------------------------ | ---------------- |
| Object keys                                            | `jsonKey`        |
| Quoted string values                                   | `jsonString`     |
| Numbers, booleans, `null`                              | `jsonConstant`   |
| Punctuation (`:`, `"`)                                 | `jsonPunctuation`|

### YAML / frontmatter

| Token                                                  | Palette key       |
| ------------------------------------------------------ | ----------------- |
| Frontmatter prose (default text inside `---` blocks)   | `frontmatterText` |
| Mapping keys                                           | `frontmatterKey`  |
| Mapping values, scalars                                | `frontmatterValue`|

### Markdown / MDX

| Token                                                  | Palette key       |
| ------------------------------------------------------ | ----------------- |
| Plain prose paragraphs                                 | `prose`           |
| Headings (`#`, `##`, …)                                | `markupHeading`   |
| Italic text                                            | `markupItalic`    |
| Bold text                                              | `fg`              |
| Links and link text                                    | `markupLink`      |
| Block quotes                                           | `markupQuote`     |
| List bullets / numbers                                 | `accentStrong`    |
| Inserted (diff)                                        | `accent2Bright`   |
| Deleted (diff)                                         | `accentMuted`     |
| Changed (diff)                                         | `warning`         |

### Section / label tokens

`entity.name.label`, `entity.name.section`, `entity.name.filename` use `warning` (a warm tan) so labels read distinctly from identifiers.

### Inline completion / ghost text

`editorGhostText.foreground` uses `ghostText`.

---

## Palette key glossary

Quick definition of every palette key, grouped by purpose. Edit any of these directly in `scripts/build-themes.mjs`.

### Surfaces

- `bg` — Editor canvas, gutter, terminal, peek editor, diff editor.
- `surface` — Sidebar, status bar, activity bar, inactive tabs, panel section header.
- `panel` — Hover surfaces, menus, suggest, command center, peek result, notifications.
- `panelBg` — Bottom panel container only (terminal/output/problems shell).
- `chrome` — Active tab, title bar, breadcrumb, sticky scroll.

### Foregrounds

- `fg` — Primary text everywhere it appears in chrome (editor, terminal, status bar, title bar).
- `secondaryText` — Sidebar text, descriptions, breadcrumb, active line number.
- `muted` — Inactive tab text, placeholders, disabled.
- `comment`, `commentDoc` — Line / doc comments.
- `lineNumber` — Inactive gutter numbers.
- `cursor` — Cursor caret.
- `cursorCharacterForeground` — Character drawn under the caret.
- `prose` — Plain Markdown prose.
- `frontmatterText` — Default frontmatter text.

### Brand accents

- `accent` — Primary brand accent (terracotta). Keywords, focus border, links, modified gutter, active tab indicator.
- `accentStrong` — Hover/pressed state of `accent`. Text-link active, decorators, list bullets, bracket constructor.
- `accentMuted` — Deprecated/deleted variants of `accent`.
- `accent2` — Secondary brand accent (sage green). Added gutter, badge background.
- `accent2Bright` — Brightened sage. Strings (semantic enum members, hints), bracket pair 2.
- `accent2Fill`, `accent2FillHover` — Sage fill for secondary buttons, remote badge.

### Status / functional colors

- `error`, `errorFg` — Error red and the white-ish text drawn on error fills.
- `invalidBg` — Tint behind invalid syntax tokens.
- `statusBarErrorBg` — Status-bar item error background (more saturated).
- `warning` — Warning amber. Also drives section labels, modified-tab indicator.
- `info` — Informational blue.
- `bracketAlt` — Alternate bracket pair color.
- `chartPurple` — Purple chart accent.
- `ghostText` — Inline completion suggestion.

### Syntax — keywords and operators

- `keyword` — Keywords, storage, control flow.
- `decorator` — Decorators, annotations, preprocessor.
- `escape` — Escape sequences, template-expression delimiters.
- `operator` — Generic operators.
- `operatorStrong` — Assignment, comparison, logical, arithmetic.
- `punctuation` — Braces, separators, accessors.

### Syntax — identifiers

- `type`, `typeBright` — Types/namespaces vs. classes/structs/interfaces/enums.
- `function`, `method` — Function/method names.
- `variable`, `parameter` — Variables vs. parameters.
- `property`, `propertyReadonly` — Property access vs. readonly.
- `builtin` — Language built-ins (`this`, `super`, `null`).
- `imported` — Imported identifiers (generic).

### Syntax — literals

- `string` — String literals, template strings, fenced code.
- `regex` — Regex.
- `number` — Numbers, booleans, null/undefined.

### Syntax — JS/TS specifics

- `jsImported`, `jsBuiltin`, `jsFunction`, `jsProperty`, `jsVariable`.
- `objectKey`, `objectKeyReadonly` — Object-literal keys.
- `importPath` — Quoted module path in `import` statements.

### Syntax — markup / templates

- `tag`, `componentTag` — Native vs. component tag names.
- `attribute`, `attributeString`, `jsxText` — Attribute name, attribute value, JSX text node.

### Syntax — CSS

- `cssSelector`, `cssProperty`, `cssCustomProperty`, `cssFunction`, `cssNumber`, `cssValue`, `cssPunctuation`.

### Syntax — JSON

- `jsonKey`, `jsonString`, `jsonConstant`, `jsonPunctuation`.

### Syntax — YAML / frontmatter

- `frontmatterKey`, `frontmatterValue` (`frontmatterText` listed under foregrounds).

### Syntax — Markdown / MDX

- `markupHeading`, `markupItalic`, `markupLink`, `markupQuote`.

### Borders & rules

- `border` — Tabs, panels, sidebar, status bar, group borders, indent guide (active), tree indent.
- `subtleBorder` — Editor ruler, indent guide (inactive), line/range highlight border.

### Selection & highlights

- `selection`, `inactiveSelection` — Active vs. inactive editor selection bg.
- `selectionHighlight`, `selectionBorder` — Other matching selections.
- `wordHighlight` / `wordHighlightBorder` — Word under cursor (read).
- `wordHighlightStrong` / `wordHighlightStrongBorder` — Word under cursor (write).
- `findMatch`, `findMatchHighlight`, `findMatchBorder` — Find current/other matches.
- `findRange` — "Find in selection" range.
- `lineHighlight` — Active line bg.
- `rangeHighlight` — Range highlight (Go to Definition target, symbol highlight).
- `fold` — Folded region bg.

### List / menu interaction

- `listActive`, `listFocus`, `listHover`, `listInactive` — Row states.
- `drop` — Drag-and-drop target.
- `selectedFg` — Foreground when a row is selected/active.

### Inlay hints

- `inlayBg` / `inlayFg` — Default inlay chip.
- `inlayTypeBg` / `inlayTypeFg` — Type inlay.
- `inlayParamBg` / `inlayParamFg` — Parameter inlay.

### Diff & merge

- `diffInserted`, `diffRemoved` — Inserted/removed line/text bg in diff editor.
- `mergeCurrentHeader`, `mergeCurrentContent` — Merge: current side.
- `mergeIncomingHeader`, `mergeIncomingContent` — Merge: incoming side.
- `mergeCommonHeader`, `mergeCommonContent` — Merge: common ancestor.

### Buttons & badges

- `buttonBg`, `buttonHoverBg`, `buttonFg` — Primary button.
- `badgeFg` — Activity bar badge text (drawn on `accent`).
- `badgeLight` — Light text drawn on saturated accents (badges, status bar remote, secondary buttons).
- `selectedFg` — Foreground for selected list rows.

### Terminal

- `terminalAnsiBlack`, `terminalAnsiRed`, `terminalAnsiGreen`, `terminalAnsiYellow`, `terminalAnsiBlue`, `terminalAnsiMagenta`, `terminalAnsiCyan`, `terminalAnsiWhite` — Standard ANSI.
- `terminalAnsiBrightBlack`, …`BrightWhite` — Bright ANSI.
- `terminalCommandDefault`, `terminalCommandSuccess`, `terminalCommandError` — Command decoration dots.

---

## Tips for tuning

- Keep `bg`, `surface`, `panel`, `chrome` as a clear hierarchy. The current dark theme keeps them at brand spec (Ink Black / Carbon / Graphite); the light theme uses pure-ish white canvas with cream chrome so the chrome carries the warmth.
- Reserve the highest contrast for keywords, strings, important function calls, and active selections. If everything is loud, nothing scans.
- After any change, run `npm run audit:contrast` and walk through `demos/` with **Developer: Inspect Editor Tokens and Scopes** to confirm tokens still land on the keys you expect.
- For workbench colors not listed here, search `scripts/build-themes.mjs` — every workbench key is wired explicitly, so you can grep for the VS Code color name (e.g. `editorWidget.background`) and follow the mapping back to a palette key.
