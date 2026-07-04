import os
import subprocess

CLONE_DIR = "repos"

os.makedirs(CLONE_DIR, exist_ok=True)

# 

def clone_repo(repo_url: str):
    repo_name = repo_url.rstrip("/").split("/")[-1].replace(".git", "")

    local_path = os.path.join(CLONE_DIR, repo_name)

    if os.path.exists(local_path):
        git_dir = os.path.join(local_path, ".git")

        if os.path.exists(git_dir):
            return local_path

        # Incomplete clone. Remove it and try again.
        import shutil
        shutil.rmtree(local_path)

    subprocess.run(
        ["git", "clone", "--depth", "1", repo_url, local_path],
        check=True,
        capture_output=True,
        text=True
    )

    return local_path