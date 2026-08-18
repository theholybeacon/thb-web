#!/usr/bin/env python3
"""
Extracts word-level Strong's alignment from CrossWire SWORD modules to JSONL.

Why Python: SWORD's zText format is a compressed binary index with no usable
JavaScript reader. `pysword` handles it in ~40 lines, so this stays a one-off
extraction step and `scripts/import-alignment.ts` (the house-style tsx importer)
consumes the JSONL it produces.

    python3 -m venv .venv && .venv/bin/pip install pysword
    .venv/bin/python scripts/alignment/extract_sword.py BSB ASV FreJND

Output: scripts/alignment/data/<code>.jsonl, one JSON object per verse.

IMPORTANT: a module's .conf advertising `Feature=StrongsNumbers` proves nothing —
CrossWire's `SpaRV` claims it and ships no markup at all. This asserts on the
parsed output and refuses to emit a source that yields no Strong's numbers.
"""
import io
import json
import os
import re
import sys
import urllib.request
import zipfile

RAWZIP = "http://crosswire.org/ftpmirror/pub/sword/packages/rawzip/{module}.zip"
HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
WORK = os.path.join(HERE, ".modules")

# Registry code (must match ALIGNMENT_SOURCES in AlignmentSource.ts) -> SWORD module.
#
# ASV is deliberately absent. It is public domain and parses cleanly, but its
# Strong's tags are offset by a word or two ("lovest thou" unwrapped, "to"
# carrying G3004 λέγω) — see the exclusion note in AlignmentSource.ts. It can
# still be extracted explicitly for inspection: `extract_sword.py ASV`.
MODULES = {"BSB": "bsb", "FreJND": "frejnd", "ASV": "asv"}
DEFAULT_MODULES = ["BSB", "FreJND"]

# pysword book name -> USFM abbreviation. Same canonical vocabulary as
# canon.ts and scripts/import-bible-people.ts.
USFM = {
    "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM",
    "Deuteronomy": "DEU", "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT",
    "I Samuel": "1SA", "II Samuel": "2SA", "I Kings": "1KI", "II Kings": "2KI",
    "I Chronicles": "1CH", "II Chronicles": "2CH", "Ezra": "EZR", "Nehemiah": "NEH",
    "Esther": "EST", "Job": "JOB", "Psalms": "PSA", "Proverbs": "PRO",
    "Ecclesiastes": "ECC", "Song of Solomon": "SNG", "Isaiah": "ISA", "Jeremiah": "JER",
    "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN", "Hosea": "HOS",
    "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA", "Jonah": "JON", "Micah": "MIC",
    "Nahum": "NAM", "Habakkuk": "HAB", "Zephaniah": "ZEP", "Haggai": "HAG",
    "Zechariah": "ZEC", "Malachi": "MAL", "Matthew": "MAT", "Mark": "MRK",
    "Luke": "LUK", "John": "JHN", "Acts": "ACT", "Romans": "ROM",
    "I Corinthians": "1CO", "II Corinthians": "2CO", "Galatians": "GAL",
    "Ephesians": "EPH", "Philippians": "PHP", "Colossians": "COL",
    "I Thessalonians": "1TH", "II Thessalonians": "2TH", "I Timothy": "1TI",
    "II Timothy": "2TI", "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB",
    "James": "JAS", "I Peter": "1PE", "II Peter": "2PE", "I John": "1JN",
    "II John": "2JN", "III John": "3JN", "Jude": "JUD", "Revelation of John": "REV",
}

W_OPEN = re.compile(r'<w\b([^>]*)>')
TAGS = re.compile(r"<[^>]+>")
ATTR = re.compile(r'(\w[\w:-]*)="([^"]*)"')


def download(module):
    os.makedirs(WORK, exist_ok=True)
    target = os.path.join(WORK, module)
    if os.path.isdir(target):
        return target
    url = RAWZIP.format(module=module)
    print(f"  downloading {url}")
    with urllib.request.urlopen(url, timeout=180) as r:
        blob = r.read()
    if blob[:2] != b"PK":
        raise SystemExit(f"{module}: not a zip (got {blob[:40]!r}) — check case-sensitive filename")
    zipfile.ZipFile(io.BytesIO(blob)).extractall(target)
    return target


def parse_verse(raw):
    """[(surface, strongs_attr, morph_attr)] in reading order, tags stripped.

    Self-closing `<w .../>` elements must be skipped explicitly rather than
    matched by a combined regex. They carry a Strong's number for an original
    word the translation renders with no text of its own (Greek articles,
    resumptive conjunctions), and a naive `<w[^>]*>(.*?)</w>` treats the `/>`
    as an ordinary open tag — swallowing the *next* real element and silently
    attributing its words to the wrong lemma. That mis-assigned "I love" in
    John 21:15 to ὅτι instead of φιλῶ, which is exactly the distinction this
    whole feature exists to show.
    """
    out = []
    cursor = 0
    for m in W_OPEN.finditer(raw):
        if m.start() < cursor:
            continue  # inside a group already consumed
        attrs = m.group(1)
        if attrs.rstrip().endswith("/"):
            continue
        close = raw.find("</w>", m.end())
        if close == -1:
            continue
        cursor = close + 4
        text = TAGS.sub("", raw[m.end():close]).strip()
        if not text:
            continue
        a = dict(ATTR.findall(attrs))
        out.append((text, a.get("lemma", ""), a.get("morph", "")))
    return out


def main(argv):
    from pysword.modules import SwordModules

    modules = argv or DEFAULT_MODULES
    os.makedirs(DATA, exist_ok=True)

    for module in modules:
        code = MODULES.get(module)
        if not code:
            raise SystemExit(f"unknown module {module}; known: {', '.join(MODULES)}")

        print(f"\n=== {module} -> {code} ===")
        path = download(module)
        sw = SwordModules(path)
        keys = sw.parse_modules()
        bible = sw.get_bible_from_module(list(keys)[0])
        structure = bible.get_structure()

        out_path = os.path.join(DATA, f"{code}.jsonl")
        verses = words = tagged = 0

        with open(out_path, "w", encoding="utf-8") as fh:
            for testament in ("ot", "nt"):
                try:
                    books = structure.get_books()[testament]
                except (KeyError, TypeError):
                    continue
                for book in books:
                    usfm = USFM.get(book.name)
                    if not usfm:
                        continue
                    for chapter_no, verse_count in enumerate(book.chapter_lengths, start=1):
                        for verse_no in range(1, verse_count + 1):
                            try:
                                raw = bible.get(books=[book.name], chapters=[chapter_no],
                                                verses=[verse_no], clean=False)
                            except Exception:
                                continue
                            if not raw or "<w" not in raw:
                                continue
                            parsed = parse_verse(raw)
                            if not parsed:
                                continue
                            verses += 1
                            words += len(parsed)
                            tagged += sum(1 for _, lemma, _ in parsed if re.search(r"[GgHh]\d", lemma))
                            fh.write(json.dumps({
                                "b": usfm, "c": chapter_no, "v": verse_no,
                                "w": [{"s": s, "l": l, "m": m} for s, l, m in parsed],
                            }, ensure_ascii=False) + "\n")

        # The SpaRV trap: refuse to ship a source whose text carries no Strong's.
        if tagged == 0:
            os.remove(out_path)
            raise SystemExit(
                f"{module}: parsed {words} words but ZERO carry Strong's numbers. "
                f"Its .conf lies about Feature=StrongsNumbers — do not use this module.")

        print(f"  verses={verses} words={words} tagged={tagged} ({tagged * 100 // max(words, 1)}%)")
        print(f"  -> {out_path}")


if __name__ == "__main__":
    main(sys.argv[1:])
