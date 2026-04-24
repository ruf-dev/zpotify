# Agent Pipeline — How to Use

The zpotify agent farm. Use this when you want to delegate a feature end-to-end.

---

## Roles

| Agent | Model | Input | Output |
|---|---|---|---|
| **You** | — | Strategic intent | Rough feature description |
| **Task Architect** | Claude Sonnet (this chat) | Your description + vault context | Filled `task-template.md` |
| **Backend Coder** | Claude Code | Task brief + backend `CLAUDE.md` + listed files | Working Go code |
| **Frontend Coder** | Claude Code | Task brief + frontend `CLAUDE.md` + listed files | Working TS/React code |
| **QA Reviewer** | Claude Sonnet or Deepseek V3 | Task brief + git diff | Tests + convention check |
| **Docs Agent** | Claude Sonnet or Deepseek V3 | Task brief + git diff | Updated vault notes |

---

## Step-by-step

### 1. You → Task Architect
Tell Claude (this chat) what you want to build in plain language.
Claude reads the vault, produces a filled [[agents/task-template]] brief.

### 2. Task Architect → Coder agents
Open Claude Code in the repo root.
Paste the task brief as the first message.
The `CLAUDE.md` file in the repo is picked up automatically.

For backend tasks: work in the Go repo root.
For frontend tasks: work in `pkg/web/ZpotifyUI/`.
For full-stack tasks: run two separate Claude Code sessions.

### 3. Coder → QA
Feed QA agent:
- The task brief
- `git diff` of the changes
- The relevant section from [[agents/context-pack]] (QA context)

Ask it to write tests and flag any violations.

### 4. QA → Docs
Feed Docs agent:
- The task brief
- `git diff`
- The Docs section from [[agents/context-pack]]

It updates `roadmap/` and any affected `architecture/` or `stack/` notes.

---

## Token cost tips

- Backend and frontend coders are the most expensive — keep task briefs tight and file lists short. The "max 3 files" rule in `CLAUDE.md` is your budget guard.
- QA and Docs agents only see the diff, not the whole codebase — keep them cheap by not giving extra context.
- Batch Task Architect sessions: define 3–5 task briefs in one conversation rather than one per session.
- For QA and Docs on simple tasks, Deepseek V3 or Qwen2.5 via Ollama works fine and costs near zero.

---

## Files in this folder

- [[agents/task-template]] — fill this per task before spawning a coder
- [[agents/context-pack]] — paste relevant sections into agent prompts
