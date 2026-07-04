from pathlib import Path


def read_readme(repo_path: str):

    candidates = [
        "README.md",
        "README.rst",
        "README.txt",
    ]

    for file in candidates:
        path = Path(repo_path) / file

        if path.exists():
            return path.read_text(encoding="utf-8", errors="ignore")

    return "No README found."