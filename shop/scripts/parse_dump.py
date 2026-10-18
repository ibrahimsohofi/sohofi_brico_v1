"""Tiny MySQL dump parser: extracts rows of the `products` table."""

import sys

COLS = None


def parse_values(s, i):
    """Parse a sequence of (...) tuples starting at index i until ';'. Yields lists."""
    n = len(s)
    while i < n:
        c = s[i]
        if c == "(":
            i += 1
            row = []
            while True:
                while s[i] in " \n\t":
                    i += 1
                if s[i] == "'":
                    i += 1
                    buf = []
                    while True:
                        ch = s[i]
                        if ch == "\\":
                            nxt = s[i + 1]
                            buf.append({"n": "\n", "r": "\r", "t": "\t", "0": ""}.get(nxt, nxt))
                            i += 2
                        elif ch == "'":
                            if s[i + 1] == "'":
                                buf.append("'")
                                i += 2
                            else:
                                i += 1
                                break
                        else:
                            buf.append(ch)
                            i += 1
                    row.append("".join(buf))
                else:
                    j = i
                    while s[j] not in ",)":
                        j += 1
                    tok = s[i:j].strip()
                    row.append(None if tok == "NULL" else tok)
                    i = j
                while s[i] in " \n\t":
                    i += 1
                if s[i] == ",":
                    i += 1
                    continue
                if s[i] == ")":
                    i += 1
                    break
            yield row
        elif c == ";":
            return
        else:
            i += 1


def load_products(path):
    txt = open(path, encoding="utf-8").read()
    rows = []
    marker = "INSERT INTO `products` ("
    pos = 0
    cols = None
    while True:
        k = txt.find(marker, pos)
        if k < 0:
            break
        ce = txt.index(")", k + len(marker))
        cols = [c.strip(" `") for c in txt[k + len(marker) : ce].split(",")]
        vi = txt.index("VALUES", ce) + len("VALUES")
        for r in parse_values(txt, vi):
            rows.append(dict(zip(cols, r)))
        pos = txt.index(";\n", vi)
    return rows


if __name__ == "__main__":
    rows = load_products(sys.argv[1])
    print(len(rows))
    print(rows[0])
