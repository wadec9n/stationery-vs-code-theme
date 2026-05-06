# Stationery — Sample Document

> A markdown demo file exercising headings, emphasis, lists, tables,
> code blocks, links, blockquotes, footnotes, and task lists.

![banner](https://example.com/banner.png "A pencil and a sheet of paper")

## Table of contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Usage](#usage)
4. [API](#api)
5. [Roadmap](#roadmap)

---

## Overview

**Stationery** is a low-contrast editor theme designed for long writing
sessions. It pairs warm paper tones with restrained accent colors, so that
_emphasis_ still feels emphatic and `inline code` reads cleanly against prose.

You can read the [design notes][notes] or jump straight to the
[contribution guide](./CONTRIBUTING.md). The theme is distributed under
the MIT license.

[notes]: https://example.com/stationery/design-notes

## Installation

```bash
# from the marketplace
code --install-extension user.listing

# or pack a local build
npm run build && code --install-extension stationery-*.vsix
```

Make sure you have:

- VS Code **1.80** or newer
- Node `>=20` for development
- ~~Internet Explorer~~ (jk)

## Usage

After installing, open the command palette and run **Preferences: Color
Theme**. Pick one of:

| Variant | Background | Best for                  |
| ------- | :--------: | ------------------------- |
| Light   | `#fdfaf3`  | daytime, prose-heavy work |
| Dark    | `#15161c`  | low-light environments    |
| Sepia   | `#f4ead8`  | extended reading sessions |

> [!TIP]
> Pair Stationery with a serif UI font like **iA Writer Quattro** for the
> full effect.

### A code sample

```ts
import { createTheme } from "stationery";

const theme = createTheme({
  name: "stationery-light",
  base: "vs",
  inherit: true,
  rules: [
    { token: "comment", foreground: "8a7e6b", fontStyle: "italic" },
    { token: "keyword", foreground: "3b6ea0" },
  ],
});

export default theme;
```

## API

`createTheme(options)` accepts the following:

- `name` — display name shown in the picker
- `base` — `"vs"` | `"vs-dark"` | `"hc-black"`
- `rules` — array of token rules; later rules override earlier ones[^precedence]
- `colors` — flat map of UI element colors

[^precedence]: The merge order matches VS Code's own theme cascade.

## Roadmap

- [x] Light variant
- [x] Dark variant
- [ ] Sepia variant
- [ ] Bracket pair colors
- [ ] Markdown front-matter highlighting

---

<details>
<summary>FAQ</summary>

**Is it semantic-token aware?**
Yes. Semantic tokens take precedence when the language server provides them.

**Can I use it in JetBrains IDEs?**
Not yet, but a port is on the roadmap.

</details>

<sub>Last updated 2026-05-05.</sub>
