## Interview Project Setup Guide: Cline + Free AI Models

## Here is the complete markdown guide combining the setup for the free AI agent workflow and your frontend project stack.

## Part 1: Setting Up the Free AI Agent (Cline)## 1. Install the Extension

1.  Open VS Code.
2.  Open the Extensions marketplace (Ctrl+Shift+X or Cmd+Shift+X).
3.  Search for Cline and click Install.

## 2. Get a Free, High-Powered AI API Key

1.  Go to [OpenRouter.ai](https://openrouter.ai/) and create a free account.
2.  Navigate to Keys and click Create Key (no credit card required).
3.  Copy your generated API key.

## 3. Configure Cline in VS Code

1.  Click the Cline icon (robot logo) in your VS Code sidebar.
2.  Click the Settings icon (gear) at the top of the Cline panel.
3.  Set API Provider to OpenRouter.
4.  Paste your OpenRouter API Key.
5.  In the Model dropdown, select or type a free-tier model:

- deepseek/deepseek-r1:free (Best for complex logic and debugging)
  - qwen/qwen-2.5-coder-32b-instruct:free (Best for fast, clean multi-file generation)

## Alternative: Fully Local & Offline Setup (Ollama)

If you want 100% privacy and zero internet dependence:

1.  Download and install [Ollama](https://ollama.com/).
2.  Open your terminal and run: ollama run qwen2.5-coder:7b (or 14b if your PC has 16GB+ RAM).
3.  In Cline's settings, change API Provider to Ollama.
4.  Set the Base URL to http://localhost:11434 and select your model.

---

## Part 2: Project Architecture & Initialization## Recommended Stack

- Build Tool: Vite
- Frontend: React + TypeScript (shows industry-standard type safety)
- Styling: Tailwind CSS + Shadcn UI (for a polished, professional look)

## Step 1: Initialize the Project Scaffolding

Run these commands manually in your terminal before starting the AI agent:

npm create vite@latest interview-project -- --template react-ts
cd interview-project
npm install

## Step 2: Kickstart Cline with the First Prompt

Open the interview-project folder in VS Code, open Cline, and paste this prompt:

We are building a frontend-only mini-project for an interview using React, TypeScript, and Tailwind CSS. All state must be managed locally in the frontend (using React state, Context, or localStorage if persistence is needed).

Please perform the following initial setup tasks autonomously:

1. Install Tailwind CSS and its configuration files.
2. Initialize and configure Shadcn UI components.
3. Install 'lucide-react' for clean iconography.
4. Clean up any default Vite placeholder styles or assets in src/App.tsx and src/index.css.

Once the setup is done, let me know so we can start building the core features.

---

## Part 3: Interview-Winning Frontend Practices

Since there is no database, you must make your frontend state architecture look robust and intentional. Direct Cline to build with these practices in mind:

- Mock Latency: Wrap mock data fetches in a setTimeout (e.g., 500ms) with a loading spinner. This simulates a real API infrastructure and showcases UX awareness.
- State Persistence: Sync vital application states with localStorage so data survives page refreshes.
- Advanced Client-Side Logic: Implement instant client-side filtering, searching, sorting, and pagination over your data arrays.
- Error Boundaries: Build a "simulate network error" toggle switch in your UI to show interviewers how gracefully your frontend handles runtime failures.

---

What kind of application idea are you leaning toward building (e.g., analytics dashboard, kanban board, e-commerce portal)? Let me know so I can provide the exact core feature prompt for Cline to generate next.
