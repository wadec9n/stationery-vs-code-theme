"""Weather telemetry analyzer.

Showcases dataclasses, type hints, decorators, f-strings,
context managers, and pattern matching.
"""

from __future__ import annotations

import json
import statistics
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum, auto
from functools import cached_property, wraps
from pathlib import Path
from typing import Iterable, Iterator


class Unit(Enum):
    CELSIUS = auto()
    FAHRENHEIT = auto()


@dataclass(frozen=True, slots=True)
class Reading:
    timestamp: datetime
    temperature: float
    humidity: float
    station: str = "default"
    tags: tuple[str, ...] = field(default_factory=tuple)

    def convert(self, unit: Unit) -> float:
        match unit:
            case Unit.CELSIUS:
                return self.temperature
            case Unit.FAHRENHEIT:
                return self.temperature * 9 / 5 + 32


def memoize(func):
    """Cache results based on positional args."""
    cache: dict[tuple, object] = {}

    @wraps(func)
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]

    return wrapper


class WeatherStation:
    """Aggregates and reports on a stream of readings."""

    THRESHOLDS = {"hot": 30.0, "cold": 0.0}

    def __init__(self, name: str, *, readings: Iterable[Reading] = ()) -> None:
        self.name = name
        self._readings: list[Reading] = list(readings)

    def __len__(self) -> int:
        return len(self._readings)

    def __repr__(self) -> str:
        return f"<WeatherStation {self.name!r} readings={len(self)}>"

    @cached_property
    def average_temp(self) -> float:
        if not self._readings:
            return float("nan")
        return statistics.fmean(r.temperature for r in self._readings)

    @memoize
    def hottest(self) -> Reading | None:
        return max(self._readings, default=None, key=lambda r: r.temperature)

    def within(self, span: timedelta) -> Iterator[Reading]:
        cutoff = datetime.now() - span
        yield from (r for r in self._readings if r.timestamp >= cutoff)

    def classify(self, reading: Reading) -> str:
        t = reading.temperature
        if t >= self.THRESHOLDS["hot"]:
            return "hot"
        elif t <= self.THRESHOLDS["cold"]:
            return "cold"
        return "moderate"


@contextmanager
def open_log(path: Path) -> Iterator[list[Reading]]:
    """Read a JSON-lines log into Reading objects, then write summary back."""
    records: list[Reading] = []
    with path.open(encoding="utf-8") as f:
        for line in f:
            data = json.loads(line)
            records.append(
                Reading(
                    timestamp=datetime.fromisoformat(data["ts"]),
                    temperature=data["temp"],
                    humidity=data["humidity"],
                    station=data.get("station", "default"),
                    tags=tuple(data.get("tags", [])),
                )
            )
    try:
        yield records
    finally:
        path.with_suffix(".summary").write_text(f"count={len(records)}\n")


if __name__ == "__main__":
    sample = [
        Reading(datetime(2026, 1, 1, 8), 18.4, 0.62, tags=("morning",)),
        Reading(datetime(2026, 1, 1, 14), 31.2, 0.45, tags=("afternoon",)),
        Reading(datetime(2026, 1, 1, 22), -2.1, 0.81, tags=("night",)),
    ]
    station = WeatherStation("rooftop", readings=sample)
    print(station, f"avg={station.average_temp:.1f}°C")
    for r in sample:
        print(f"  {r.timestamp:%H:%M} → {station.classify(r)}")
