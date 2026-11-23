BI-PLANE BATTLE v9.24 — complete source and GitHub Pages export

Original Site: https://sky-joust-biplane-arcade.speedskate.chatgpt.site
Site project: appgprj_6aa00f34817c819196cdf37a059848bc
Source commit: d4136336ad74651685a07229e063816efb2bcdad
Export date: November 23, 2026

HOST THE GAME
Extract this ZIP. Upload its contents to the root of a GitHub repository.
The top-level index.html is the ready-built game. In repository Settings >
Pages, select Deploy from a branch, your branch, and / (root).
Keep .nojekyll and the aircraft, scenery, audio and assets directories.
No build step, ChatGPT account, or server backend is needed to play.
The build uses relative URLs and supports a GitHub Pages repository subpath.

WHAT IS INCLUDED
- Root index.html, assets/: compiled playable HTML/CSS/JavaScript and source map.
- aircraft/, scenery/, audio/: every original public game asset.
- source/source-original/: all 204 tracked original repository files, unchanged,
  including TypeScript/React game code, CSS, assets, tests, docs, package manifests
  and the original pnpm dependency lockfile.
- source/: static launch entry, build config and package manifest.
- ORIGINAL-SOURCE-SHA256.json: hashes of every original tracked file.
- THIRD-PARTY-LICENSES/: licenses from locally installed build dependencies.

REBUILD (OPTIONAL)
Use Node.js 22.13 or newer. In the source directory:
  npm install
  npm run build
The rebuilt static game is in source/playable/. Copy its contents to the root
hosting directory. Keep the root .nojekyll.
Run the original regression suite with npm test (37 test files).

PRESERVATION
The original source files were not edited. A separate React entry mounts the
original app/page.tsx and imports its original styles. The build config replaces
only root-relative aircraft/scenery/audio URLs and the home link with relative
URLs, so they work under a GitHub Pages repository path. The Sites/Vinext server
wrapper is unnecessary for this client-side game and is retained in the original
source. No game rules, UI, progression, art or sound were redesigned.
All 37 original test files passed. The built game launched and entered Quick Play
under a subfolder URL without browser errors. Every original public asset was
checked byte-for-byte against the exported asset.

SAVES AND AUDIO
Progress remains in browser localStorage. Moving from chatgpt.site to GitHub Pages
creates a new browser origin, so old local saves do not transfer automatically.
Sound starts after a player interaction, as required by browsers.
For local play, serve the root over HTTP (for example python -m http.server 8000).
Do not rely on double-clicking index.html with file://.

This export does not modify or redeploy the original ChatGPT Site.
