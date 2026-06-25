# Kevin Valencia — Personal Website

A single-page academic site (HTML/CSS/JS, no build step) ready for GitHub Pages.

```
index.html      → the page (structure + content)
styles.css      → all styling
script.js       → nav, scroll reveals, and the bell→stag animation
images/         → rainier.jpg, headshot.jpg, omnifield.png, coral.jpg, stag_sprite.png
.nojekyll       → tells GitHub Pages to serve files as-is
```

Everything is plain static files — what you see locally is exactly what ships.

---

## 1. Prerequisites (one-time)

- A **GitHub account** — https://github.com/join
- **Git** — https://git-scm.com/downloads (check with `git --version`)
- A **paid Claude plan** (Pro, Max, Team, or Console/API). The free plan does not include Claude Code.
- **Claude Code** (next step)

## 2. Install Claude Code

The native installer is recommended (no Node.js needed):

- **macOS / Linux / WSL:** `curl -fsSL https://claude.ai/install.sh | bash`
- **Windows (PowerShell):** `irm https://claude.ai/install.ps1 | iex`
- **Homebrew:** `brew install --cask claude-code`

Or via npm (needs Node.js 18+): `npm install -g @anthropic-ai/claude-code`

Open a new terminal and verify:

```bash
claude --version
claude doctor      # optional: checks install + auth
```

Prefer no terminal? There's also a Claude Code desktop app (macOS/Windows).
Docs: https://docs.claude.com/en/docs/claude-code/overview

## 3. Create the GitHub repo

For a clean URL like `https://YOURNAME.github.io`, the repo **must** be named exactly:

```
YOURNAME.github.io
```

(replace `YOURNAME` with your GitHub username, lowercase). Create it on github.com → New repository → Public. Don't add a README (you already have one).

> Prefer a project URL instead? Name the repo anything (e.g. `website`); it'll serve at `https://YOURNAME.github.io/website/`.

## 4. Put these files in the repo and open in Claude Code

Unzip this folder, then in a terminal:

```bash
cd path/to/this/folder      # the folder containing index.html
claude                      # first run opens a browser to sign in
```

Now Claude Code is running inside your site folder. You can just talk to it — e.g.:

> Initialize a git repo here, set the remote to https://github.com/YOURNAME/YOURNAME.github.io, and push everything to the main branch.

Or do it yourself:

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOURNAME/YOURNAME.github.io.git
git push -u origin main
```

## 5. Preview locally before/after editing

From the site folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 . (A local server is better than double-clicking `index.html`, so paths and the animation behave exactly like production.)

## 6. Turn on GitHub Pages

1. On github.com, go to your repo → **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source = Deploy from a branch**.
3. Branch = **main**, folder = **/ (root)** → **Save**.
4. Wait ~1 minute, then visit **https://YOURNAME.github.io** .

For a `YOURNAME.github.io` repo it publishes automatically on every push to `main`.

## 7. Make edits (the fun part)

Edit by hand, or ask Claude Code in plain English. Good first prompts:

> Replace the placeholder email `you@umich.edu` and the GitHub/Scholar/LinkedIn links throughout with my real ones: <paste them>.

> In the Research section, swap the NeuroX-Field and RobustX placeholder bubbles (the inline SVGs) for `images/neuroxfield.png` and `images/robustx.png`. I'll add those files to the images folder.

> Tune the stag: in script.js, change `walkPxPerSec` to 95 and `grazeLoopCycles` to 5.

When you're happy:

```bash
git add . && git commit -m "Update content" && git push
```

…or just tell Claude Code: *"commit and push these changes."* The live site updates within a minute.

---

## What's still placeholder

- **Email + social links** (`you@umich.edu`, `#` hrefs) — replace with real ones.
- **NeuroX-Field** and **RobustX** research bubbles — currently generated SVGs; swap for real figures.
- **Research text** (titles, descriptions, venues) — verify and edit.
- **CV** — add `cv.pdf` to the folder and point the CV links at `cv.pdf`.

## Optional: custom domain

Add a file named `CNAME` (no extension) containing your domain (e.g. `kevinvalencia.com`), push it, then set the DNS records GitHub shows under Settings → Pages → Custom domain.

## Stag animation knobs (top of script.js, the `CFG` object)

- `frameMs` — leg speed (120 = matches the original GIF)
- `walkPxPerSec` — how fast it crosses (lower = slower stroll)
- `grazeLoopCycles` — how long it grazes
- `dispH` — stag size in pixels
