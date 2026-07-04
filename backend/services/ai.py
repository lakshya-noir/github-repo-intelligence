import os

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


def summarize_repository(readme: str, tech_stack: dict, important_files: list[str]):
    prompt = f"""
You are an expert software engineer.

Analyze this GitHub repository.

Tech Stack:
{tech_stack}

Important Files:
{important_files}

README:

{readme}

Return:

1. What this project does.
2. Main technologies used.
3. High-level architecture.
4. Main components.
5. How to run the project.
6. One paragraph summary.
"""

    response = model.generate_content(prompt)

    return response.text