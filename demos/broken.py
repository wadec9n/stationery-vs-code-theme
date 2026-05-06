"""Intentionally broken Python fixture.

Parallel to ``broken.jsonc`` but in a stricter, indentation-sensitive
grammar. Exercises the error / invalid-token lane in a different language
family — unterminated strings, dangling decorators, mismatched brackets,
and bad indentation should all surface as invalid scopes without
swallowing the surrounding code.
"""

from dataclasses import dataclass
from typing import Iterable


# Unterminated triple-quoted string — should remain visible, not vanish.
NOTE = """This docstring is missing its closing quotes
and continues into the next definition by accident.

@dataclass
class Token:
    name: str
    value: int = 0      # trailing comma below is a deliberate syntax error,
    weight: float = 1.0,


def collect(items: Iterable[Token) -> list[Token]:   # mismatched bracket
    out = [
    for item in items:                               # bad indentation
        if item.value > 0
            out.append(item)                         # missing colon above
    return out


# Dangling decorator with no following definition.
@staticmethod


# Unterminated single-quoted string on the next line.
LABEL = 'stationery
VERSION = (0, 2, 0
