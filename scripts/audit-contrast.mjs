import { readFileSync } from "node:fs";

const themePaths = [
  ["light", "themes/stationery-light.json"],
  ["dark", "themes/stationery-dark.json"],
];

const parseHex = (value) => {
  const hex = value?.replace("#", "");
  if (!hex || !/^[0-9a-fA-F]{6,8}$/.test(hex)) return null;

  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
    a: hex.length >= 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1,
  };
};

const composite = (fg, bg) => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a),
  g: fg.g * fg.a + bg.g * (1 - fg.a),
  b: fg.b * fg.a + bg.b * (1 - fg.a),
  a: 1,
});

const channel = (value) => {
  const sRGB = value / 255;
  return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
};

const luminance = (color) =>
  0.2126 * channel(color.r) +
  0.7152 * channel(color.g) +
  0.0722 * channel(color.b);

const contrast = (foreground, background) => {
  let fg = parseHex(foreground);
  const bg = parseHex(background);
  if (!fg || !bg) return null;

  if (fg.a < 1) fg = composite(fg, bg);

  const lighter = Math.max(luminance(fg), luminance(bg));
  const darker = Math.min(luminance(fg), luminance(bg));
  return (lighter + 0.05) / (darker + 0.05);
};

const uiPairs = [
  ["editor.foreground", "editor.background"],
  ["editorLineNumber.foreground", "editor.background"],
  ["editorCodeLens.foreground", "editor.background"],
  ["input.placeholderForeground", "input.background"],
  ["button.secondaryForeground", "button.secondaryBackground"],
  ["badge.foreground", "badge.background"],
  ["terminal.ansiBlack", "terminal.background"],
  ["terminal.ansiGreen", "terminal.background"],
  ["terminal.ansiCyan", "terminal.background"],
];

for (const [name, file] of themePaths) {
  const theme = JSON.parse(readFileSync(file, "utf8"));
  const editorBg = theme.colors["editor.background"];
  const tokenRows = [];

  for (const rule of theme.tokenColors) {
    const fg = rule.settings?.foreground;
    if (!fg) continue;

    const bg = rule.settings?.background || editorBg;
    const ratio = contrast(fg, bg);
    if (!ratio) continue;

    tokenRows.push({
      ratio,
      fg,
      bg,
      scope: rule.name || String(rule.scope).slice(0, 90),
    });
  }

  tokenRows.sort((a, b) => a.ratio - b.ratio);

  console.log(`\n${name.toUpperCase()} lowest token contrasts`);
  for (const row of tokenRows.slice(0, 12)) {
    console.log(`${row.ratio.toFixed(2)} ${row.fg} on ${row.bg} ${row.scope}`);
  }

  console.log(`\n${name.toUpperCase()} UI pairs`);
  for (const [fgKey, bgKey] of uiPairs) {
    const ratio = contrast(theme.colors[fgKey], theme.colors[bgKey]);
    console.log(
      `${ratio.toFixed(2)} ${fgKey} on ${bgKey}: ${theme.colors[fgKey]} / ${theme.colors[bgKey]}`,
    );
  }

  console.log("\nSemantic lanes");
  console.log({
    keyword: theme.semanticTokenColors.keyword,
    property: theme.semanticTokenColors.property,
    string: theme.semanticTokenColors.string,
    function: theme.semanticTokenColors.function,
    type: theme.semanticTokenColors.type,
    operator: theme.semanticTokenColors.operator,
  });
}
