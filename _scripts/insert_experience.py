#!/usr/bin/env python3
"""Insert an experience file into a numbered Jekyll collection order.

The script renames every numbered file in the target collection so the given
file lands at the requested 1-based position and the remaining files shift
around it.

Example:
    python3 _scripts/insert_experience.py _experience/070-press-forward-integrations.html 1
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from uuid import uuid4


FILENAME_RE = re.compile(r"^(?P<prefix>\d+)-(?P<slug>.+)$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Insert a numbered experience file into a different position by "
            "renaming the collection files."
        )
    )
    parser.add_argument(
        "file",
        help="Path to the experience file to move.",
    )
    parser.add_argument(
        "position",
        type=int,
        help="1-based position to insert the file at.",
    )
    parser.add_argument(
        "--collection-dir",
        default="_experience",
        help="Collection directory to reorder. Default: _experience",
    )
    parser.add_argument(
        "--width",
        type=int,
        default=3,
        help="Zero-pad width for the numeric prefix. Default: 3",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the planned renames without changing files.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    collection_dir = Path(args.collection_dir).resolve()
    target = Path(args.file).resolve()

    if not collection_dir.is_dir():
        print(f"Collection directory not found: {collection_dir}", file=sys.stderr)
        return 1

    if not target.exists():
        print(f"Target file not found: {target}", file=sys.stderr)
        return 1

    if target.parent.resolve() != collection_dir:
        print(
            f"Target must live directly inside {collection_dir}: {target}",
            file=sys.stderr,
        )
        return 1

    files = sorted(
        [
            path
            for path in collection_dir.iterdir()
            if path.is_file() and FILENAME_RE.match(path.name)
        ],
        key=lambda path: path.name,
    )

    if target not in files:
        print(
            f"Target is not a numbered collection file: {target.name}",
            file=sys.stderr,
        )
        return 1

    files.remove(target)

    if args.position < 1 or args.position > len(files) + 1:
        print(
            f"Position must be between 1 and {len(files) + 1}, got {args.position}",
            file=sys.stderr,
        )
        return 1

    files.insert(args.position - 1, target)

    start_prefix = min(int(FILENAME_RE.match(path.name).group("prefix")) for path in files)

    rename_plan = []
    temp_plan = []

    for index, source in enumerate(files, start=start_prefix):
        match = FILENAME_RE.match(source.name)
        assert match is not None
        desired_name = f"{index:0{args.width}d}-{match.group('slug')}"
        if source.name != desired_name:
            temp_name = f".{source.name}.{uuid4().hex}.tmp"
            temp_path = source.with_name(temp_name)
            rename_plan.append((source.name, desired_name))
            temp_plan.append((source, temp_path, source.with_name(desired_name)))

    if not rename_plan:
        print("No changes needed.")
        return 0

    print("Planned renames:")
    for old_name, new_name in rename_plan:
        print(f"  {old_name} -> {new_name}")

    if args.dry_run:
        return 0

    for source, temp_path, _final_path in temp_plan:
        source.rename(temp_path)

    for _source, temp_path, final_path in temp_plan:
        temp_path.rename(final_path)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
