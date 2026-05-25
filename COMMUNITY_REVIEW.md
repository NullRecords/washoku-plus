# Community Review Workflow

This site is static GitHub Pages, so community dishes and votes are not stored on a server by default. The Sprout Kitchen game keeps them in browser local storage until you export them.

## What changed

- The game now has three community review controls on the Community Board:
  - `Export Local Snapshot`
  - `Import Snapshot`
  - `Refresh Checked-In`
- Tracked submissions live in `docs/assets/data/community-submissions.json`.
- `docs/tools/community_menu_sync.py` merges exported snapshots into that tracked file and can promote selected recipes into `docs/assets/data/menu-content.json`.

## Recommended review loop

1. Pull before changing menu data.

```bash
git pull --rebase origin main
```

2. Get exported snapshot JSON files.

- From your browser: open Sprout Kitchen and click `Export Local Snapshot`.
- From another user: have them export their local snapshot and send you the `.json` file.

3. Merge those snapshots into the tracked inbox.

```bash
python3 docs/tools/community_menu_sync.py merge ~/Downloads/sprout-community-snapshot-2026-05-25.json
```

4. Review the tracked submissions locally.

- Reload `docs/sprout-kitchen.html` locally.
- Click `Refresh Checked-In` in the Community Board.
- The checked-in recipes render read-only with their votes and review status.

5. Print a quick terminal report if you want a sortable list.

```bash
python3 docs/tools/community_menu_sync.py report --eligible-only
```

6. Promote recipes you want into the real menu JSON.

```bash
python3 docs/tools/community_menu_sync.py promote --ids r_1716595000000 r_1716595001234
```

Or preview without writing:

```bash
python3 docs/tools/community_menu_sync.py promote --eligible --dry-run
```

7. Review and commit the updated files.

```bash
git status
git add docs/assets/data/community-submissions.json docs/assets/data/menu-content.json
git commit -m "feat: import reviewed community dishes"
git push origin main
```

## Important limitation

Votes are only globally shared after they are exported and merged into `community-submissions.json`. On pure GitHub Pages there is no live shared database unless you add a backend or external store.