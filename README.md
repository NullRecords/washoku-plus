# Washoku Plus Marketing Site

Static GitHub Pages marketing site starter for Washoku Plus.

## Repository

- GitHub repo: `https://github.com/NullRecords/washoku-plus`
- Default branch: `main`
- GitHub Pages deploy source: `main` branch, `/docs` folder

## Structure

- `docs/` is the deployable site folder for GitHub Pages branch deploy mode.
- `docs/guides/` contains starter free nutrition/education guides.
- `.github/workflows/` is optional for CI; GitHub Pages deploy is branch-based (no deploy workflow required).

## ForgeWeb

ForgeWeb is configured as a git submodule at `ForgeWeb/` so it can be used to manage content and deployment workflows while staying version-pinned in this repository.

Initialize/update the submodule after cloning this repo:

```bash
git submodule update --init --recursive
cd ForgeWeb
./start.sh
```

Then use ForgeWeb to maintain the static pages and guide content.

When using ForgeWeb prompts/scripts that mention `website/`, map that to `docs/` in this repository.

If ForgeWeb updates are needed:

```bash
git submodule update --remote ForgeWeb
git add ForgeWeb
git commit -m "chore: update ForgeWeb submodule"
```

## Deploy, Test, and Manage Content

- Deploy: push to `main`; GitHub Pages publishes from `/docs`.
- Test: run your content/build checks in `ForgeWeb/` before pushing.
- Manage content: edit site files under `docs/` and use ForgeWeb tooling to streamline updates.

## Notes

- The signup form is static and needs to be connected to an email provider.
- The companion character is HTML/CSS/JS, so it is lightweight and easy to animate.
- Avoid medical claims. Use educational language and “possible contributor” wording for health insights.

## Social Automation (Phase 1)

- Daily shorts pack generator: `docs/tools/generate_shorts_pack.py`
- Connector-ready publisher interface: `docs/tools/publish_social_content.py`
- Unified local runner: `ops/startup.sh`
- Daily workflow: `.github/workflows/daily-social-pack.yml`
- Operations guide: `devdocs/SOCIAL-AUTOMATION.md`
- Account setup guide with platform links: `devdocs/SOCIAL-ACCOUNT-SETUP.md`

Quick local workflow:

```bash
bash ops/startup.sh social-setup
bash ops/startup.sh social-pack 3
bash ops/startup.sh social-media-plan
bash ops/startup.sh social-queue dry-run
```
