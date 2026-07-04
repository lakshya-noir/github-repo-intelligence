from pathlib import Path

IGNORE_DIRS = {
    ".git",
    "node_modules",
    "__pycache__",
    "dist",
    "build",
    ".next",
    ".venv",
    "venv",
}


def get_repository_files(repo_path: str):
    files = []

    for path in Path(repo_path).rglob("*"):
        if not path.is_file():
            continue

        if any(part in IGNORE_DIRS for part in path.parts):
            continue

        files.append(str(path.relative_to(repo_path)))

    return files


def detect_tech_stack(files):
    tech = {
        "languages": set(),
        "build_files": []
    }

    file_set = set(files)

    rules = {
        "pyproject.toml": "Python",
        "requirements.txt": "Python",
        "requirements-dev.txt": "Python",
        "package.json": "JavaScript/TypeScript",
        "go.mod": "Go",
        "Cargo.toml": "Rust",
        "pom.xml": "Java",
        "composer.json": "PHP",
    }

    for build_file, language in rules.items():
        if build_file in file_set:
            tech["languages"].add(language)
            tech["build_files"].append(build_file)

    tech["languages"] = sorted(tech["languages"])

    return tech


def get_important_files(files):
    priority = [
        "README.md",
        "README.rst",
        "README.txt",
        "pyproject.toml",
        "package.json",
        "requirements.txt",
        "requirements-dev.txt",
        "Cargo.toml",
        "go.mod",
        "pom.xml",
        "Dockerfile",
        "docker-compose.yml",
        ".env.example",
        "main.py",
        "app.py",
        "manage.py",
        "src/main.py",
        "src/main.ts",
        "src/index.ts",
        "src/index.js",
    ]

    important = []

    for file in priority:
        if file in files:
            important.append(file)

    return important