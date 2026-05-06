// Merge-conflict fixture.
// Showcases the conflict-marker scopes (current, incoming, separator) layered
// on top of normal TypeScript syntax. Useful for verifying that conflict
// regions remain readable without overwhelming the editor.

export interface ThemeConfig {
  readonly name: string;
  readonly variant: "light" | "dark";
  readonly contrastFloor: number;
  readonly accents: readonly string[];
}

<<<<<<< HEAD
export const DEFAULT_CONFIG: ThemeConfig = {
  name: "Stationery Light",
  variant: "light",
  contrastFloor: 8.5,
  accents: ["#b04a3a", "#3e7a4e", "#3b6ea0", "#77501f"],
};

export function describe(config: ThemeConfig): string {
  return `${config.name} — ${config.variant} (≥ ${config.contrastFloor}:1)`;
}
=======
export const DEFAULT_CONFIG: ThemeConfig = {
  name: "Stationery Dark",
  variant: "dark",
  contrastFloor: 7.0,
  accents: ["#f1a373", "#9bd3a6", "#9cc7e0", "#d6b56a"],
};

export function describe({ name, variant, contrastFloor }: ThemeConfig): string {
  return `[${variant}] ${name} (floor=${contrastFloor})`;
}
>>>>>>> feature/dark-default

export function load(overrides: Partial<ThemeConfig> = {}): ThemeConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}

// A second conflict region — nested inside a function body.
export function summarize(configs: readonly ThemeConfig[]): string {
  const lines: string[] = [];

  for (const config of configs) {
<<<<<<< HEAD
    lines.push(`- ${config.name}: ${config.accents.length} accents`);
=======
    lines.push(`* ${describe(config)} [${config.accents.join(", ")}]`);
>>>>>>> feature/dark-default
  }

  return lines.join("\n");
}

console.log(describe(load()));
console.log(summarize([load(), load({ variant: "dark", contrastFloor: 7 })]));
