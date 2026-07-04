# CodeAtlas Frontend

React/Vite frontend for the existing CodeAtlas FastAPI backend.

## Run Locally

1. Install dependencies:
   `npm install`
2. Optional: configure the backend URL in `.env.local`:
   `VITE_API_URL="http://localhost:8000"`
3. Start the FastAPI backend from the repository root.
4. Run the frontend:
   `npm run dev`

The frontend posts repository URLs to `${VITE_API_URL}/analyze`.
