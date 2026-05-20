# Washoku Plus Marketing Site

Static GitHub Pages marketing site starter for Washoku Plus.

## Repository

- GitHub repo: `https://github.com/NullRecords/washoku-plus`
- Default branch: `main`
- GitHub Pages deploy source: `website/` via Actions workflow

## Structure

- `website/` is the deployable site folder.
- `website/guides/` contains starter free nutrition/education guides.
- `.github/workflows/pages.yml` deploys the `website/` folder to GitHub Pages.

## ForgeWeb

ForgeWeb is configured as a git submodule at `ForgeWeb/` so it can be used to manage content and deployment workflows while staying version-pinned in this repository.

Initialize/update the submodule after cloning this repo:

```bash
git submodule update --init --recursive
cd ForgeWeb
./start.sh
```

Then use ForgeWeb to maintain the static pages and guide content.

If ForgeWeb updates are needed:

```bash
git submodule update --remote ForgeWeb
git add ForgeWeb
git commit -m "chore: update ForgeWeb submodule"
```

## Deploy, Test, and Manage Content

- Deploy: push to `main`; `.github/workflows/pages.yml` publishes `website/` to GitHub Pages.
- Test: run your content/build checks in `ForgeWeb/` before pushing.
- Manage content: edit site files under `website/` and use ForgeWeb tooling to streamline updates.

## Notes

- The signup form is static and needs to be connected to an email provider.
- The companion character is HTML/CSS/JS, so it is lightweight and easy to animate.
- Avoid medical claims. Use educational language and “possible contributor” wording for health insights.
