# updategit

Push the project to GitHub with a clean, safe, well-documented state.

## Steps

### 1 — Secrets scan (block if anything found)

Before touching git, grep the working tree for common secret patterns. Run all three checks:

**Check A — API keys, tokens, and credentials:**
```
grep -rn --include="*.js" --include="*.html" --include="*.css" --include="*.json" --include="*.env" --include="*.md" \
  -E "(api[_-]?key|apikey|secret|token|bearer|private[_-]?key|auth[_-]?key|access[_-]?key|sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36})" \
  --exclude-dir=node_modules --exclude-dir=.git .
```

**Check B — Hardcoded passwords** (catches `password: "..."`, `password="..."`, `passwd=...` but NOT the harmless `<input type="password">`):
```
grep -rn --include="*.js" --include="*.html" --include="*.css" --include="*.json" --include="*.env" --include="*.md" \
  -E "(password|passwd)\s*[:=]\s*[\"'][^\"']{3,}[\"']" \
  --exclude-dir=node_modules --exclude-dir=.git .
```

**Check C — Untracked `.env` files:**
```
find . -name ".env" -not -path "./.git/*"
```

**If any match is found in A, B, or C**: stop immediately, show the matched line(s) to the user, and do NOT proceed. Ask the user to remove or rotate the secret first.

**If all checks are clean**: proceed to the next step.

### 2 — Fix 404 image links

Read `index.html` and extract every Unsplash image URL (pattern: `images.unsplash.com/photo-{ID}`). For each URL, check its HTTP status:

```bash
curl -o /dev/null -s -w "%{http_code}" "<url>"
```

For any URL that returns a status other than `200`, it is broken. Replace the `photo-{ID}` segment in `index.html` with a working Unsplash photo ID that fits the same visual theme (French/fine dining, food, restaurant interiors, etc.). Use these as known-good fallbacks if needed:

| Theme | Known-good ID |
|-------|--------------|
| Restaurant interior | 1414235278468-a1d47c1837b0 |
| French cuisine / plated food | 1504674900247-0877df9cc836 |
| Wine / ambiance | 1510812431401-41d2bd2722f3 |
| Dessert / pastry | 1551024601-bec78aea704b |
| Chef / kitchen | 1581299894007-e56d15f0b09a |

After replacing, re-run `curl` on each updated URL to confirm it returns 200 before continuing. Keep the existing query string `?auto=format&fit=crop&w=800&q=80` on every URL.

If all URLs are already returning 200, skip this step and note "all images OK" in the final report.

### 3 — Ensure GitHub Actions workflow for Pages

Check whether `.github/workflows/` contains a deploy workflow:

```bash
ls .github/workflows/
```

**If no workflow file exists**, create `.github/workflows/deploy.yml` with this exact content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - id: deployment
        uses: actions/deploy-pages@v4
```

**If a workflow file already exists**, read it and verify it has `permissions: pages: write` and `id-token: write`. If either is missing, add them.

Then enable GitHub Pages on the remote repo (sets source to GitHub Actions, not a branch):

```bash
gh api repos/supriaa/RestaurantBooking/pages \
  --method POST \
  -f build_type=workflow \
  -f source='{"branch":"main","path":"/"}' 2>/dev/null || \
gh api repos/supriaa/RestaurantBooking/pages \
  --method PUT \
  -f build_type=workflow
```

If the Pages API call fails with "already enabled", that is fine — continue. If it fails with an auth error, tell the user to run `gh auth login` with the `repo` and `workflow` scopes.

### 4 — Update README.md

Read the current state of `index.html`, `styles.css`, and `script.js`. Then rewrite `README.md` so it accurately reflects the project as it exists now. The README must include:

- Project name and one-sentence description
- Live demo link (preserve the existing GitHub Pages URL: `https://supriaa.github.io/RestaurantBooking/`)
- Feature list (derived from actual sections/functionality in the code)
- Tech stack
- Getting started instructions (no build step — `open index.html` or `python3 -m http.server 8080`)
- Project structure table
- Deployment note referencing the GitHub Actions workflow in `.github/workflows/`

Do not add sections about things that don't exist in the code.

### 5 — Stage, commit, and push

```bash
git add -A
git status   # show the user what will be committed
```

Write a commit message that summarises what changed since the last commit (read `git diff HEAD` to understand the changes). Format:

```
<type>: <short summary>

<optional body — bullet list of key changes if more than one file changed>
```

Types: `feat`, `fix`, `style`, `refactor`, `docs`, `chore`.

Then commit and push:

```bash
git commit -m "<message>"
git push origin main
```

If the push fails because the branch doesn't exist remotely yet, run `git push -u origin main` instead.

### 6 — Update GitHub repo About (description + topics)

Use the GitHub CLI to set the repository description and topic tags so the public repo page is informative:

```bash
gh repo edit --description "Elegant restaurant website with reservation form — vanilla HTML/CSS/JS, no dependencies" \
             --homepage "https://supriaa.github.io/RestaurantBooking/"
gh repo edit --add-topic "html" --add-topic "css" --add-topic "javascript" \
             --add-topic "restaurant" --add-topic "landing-page" --add-topic "vanilla-js"
```

If `gh` is not authenticated, tell the user to run `gh auth login` first.

### 7 — Confirm

Report back with a summary table:

| Check | Result |
|-------|--------|
| Secrets scan | Clean / Blocked (list findings) |
| Image 404s | All OK / Fixed N URLs |
| GitHub Pages | Already enabled / Enabled now / Workflow created |
| Commit | `<hash>` — `<message>` |
| README | Updated / No changes needed |
| Repo About | Description and topics set |
| Live URL | https://supriaa.github.io/RestaurantBooking/ |
| Repo URL | https://github.com/supriaa/RestaurantBooking |
