from fastapi import APIRouter
from pydantic import BaseModel

from github.repo_cloner import clone_repo
from services.parser import (
    get_repository_files,
    detect_tech_stack,
    get_important_files,
)
from services.readme_reader import read_readme
from services.ai import summarize_repository

router = APIRouter()


class RepoRequest(BaseModel):
    repo_url: str


@router.post("/analyze")
def analyze_repo(request: RepoRequest):

    repo_path = clone_repo(request.repo_url)

    files = get_repository_files(repo_path)

    tech = detect_tech_stack(files)

    important_files = get_important_files(files)

    readme = read_readme(repo_path)

    summary = summarize_repository(
        readme,
        tech,
        important_files,
    )

    return {
        "status": "success",
        "repo_path": repo_path,
        "languages": tech["languages"],
        "build_files": tech["build_files"],
        "important_files": important_files,
        "summary": summary,
    }