// Pattern playground.
// Showcases the regex lane specifically: literal regex, capture and named
// groups, lookarounds, character classes, unicode property escapes,
// quantifiers, alternation, backreferences, and flags.

// --- Anchors, classes, and quantifiers ---------------------------------------

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR = /^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})\b/i;
const SEMVER = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/;

// --- Named capture, lookarounds, alternation ---------------------------------

const ISO_DATETIME =
  /^(?<year>\d{4})-(?<month>0[1-9]|1[0-2])-(?<day>0[1-9]|[12]\d|3[01])T(?<hour>[01]\d|2[0-3]):(?<minute>[0-5]\d):(?<second>[0-5]\d)(?:\.(?<ms>\d{1,3}))?(?<tz>Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

const PASSWORD_OK = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{12,}/;
const NOT_PRECEDED_BY_BACKSLASH = /(?<!\\)"([^"\\]|\\.)*"/g;

// --- Unicode property escapes + flags ----------------------------------------

const EMOJI = /\p{Extended_Pictographic}/gu;
const WORD_LIKE = /[\p{L}\p{N}_]+/gu;
const RTL_RUN = /[\p{Script=Hebrew}\p{Script=Arabic}]+/u;

// --- Backreferences and inline classes ---------------------------------------

const REPEATED_WORD = /\b(\w+)\s+\1\b/gi;
const TAG_PAIR = /<([a-z][\w-]*)\b[^>]*>(.*?)<\/\1>/is;

// --- Replacement helpers -----------------------------------------------------

function highlight(input, terms) {
  if (terms.length === 0) return input;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "giu");
  return input.replace(pattern, "<mark>$1</mark>");
}

function parseQuery(qs) {
  const out = Object.create(null);
  for (const [, key, value] of qs.matchAll(/([^&=?]+)=([^&]*)/g)) {
    out[decodeURIComponent(key)] = decodeURIComponent(value);
  }
  return out;
}

function compactWhitespace(text) {
  return text
    .replace(/[\t\v\f]+/g, " ")
    .replace(/ {2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// --- Regex constructed from a string (different scope from /literal/) --------

const FLAG_RE = new RegExp(String.raw`--?(?<flag>[a-zA-Z][\w-]*)(?:=(?<value>[^\s]+))?`, "g");

// --- Demo --------------------------------------------------------------------

const samples = [
  { kind: "slug",     input: "stationery-vs-code-theme" },
  { kind: "color",    input: "#ff8800ee" },
  { kind: "semver",   input: "v1.2.3-beta.4+sha.abc" },
  { kind: "datetime", input: "2026-05-05T12:30:00.250Z" },
  { kind: "tag",      input: "<section data-x='1'><h1>Hi</h1></section>" },
];

for (const { kind, input } of samples) {
  const tests = {
    slug:     () => SLUG.test(input),
    color:    () => HEX_COLOR.test(input),
    semver:   () => SEMVER.exec(input)?.slice(1),
    datetime: () => ISO_DATETIME.exec(input)?.groups,
    tag:      () => TAG_PAIR.exec(input)?.[2],
  };
  console.log(`${kind.padEnd(8)} → ${JSON.stringify(tests[kind]())}`);
}

console.log(highlight("the quick brown fox", ["quick", "fox"]));
console.log(parseQuery("?theme=stationery&variant=dark&debug=true"));
console.log(compactWhitespace("hello   world\n\n\n\nhello"));
console.log([..."Stationery 🖋️ עברית".matchAll(EMOJI)].length);
console.log(REPEATED_WORD.test("the the cat sat"));
