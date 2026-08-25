# Trip Ledger — deploying on Netlify

No Claude account, no login for your friends — just a link they open in
any browser. This version is built for Netlify: a static page plus one
small serverless function, using Netlify's free built-in storage
(Netlify Blobs) to save the trip data.

## What's in this folder
- `public/index.html` — the app itself
- `netlify/functions/state.js` — a tiny function that loads/saves the trip data
- `netlify.toml` — tells Netlify where everything is and routes `/api/state`
  to the function
- `package.json` — declares the one dependency the function needs

## Steps to deploy (free, no credit card)

1. **Put this folder in a GitHub repo.** If you don't have GitHub, create a
   free account at github.com, make a new repository (e.g. `trip-ledger`),
   and upload all these files/folders via the "Add file → Upload files"
   button (drag-and-drop the whole folder contents in — keep the folder
   structure intact).
2. Go to **netlify.com** and sign up (you can sign up with GitHub
   directly).
3. Click **Add new site → Import an existing project**, and pick the
   `trip-ledger` repo.
4. Netlify will read `netlify.toml` automatically and fill in:
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
   - **Build command:** `npm install`
   You shouldn't need to change anything — just click **Deploy**.
5. After a minute you'll get a live link like
   `https://trip-ledger-xxxx.netlify.app`. Share that with your friends —
   anyone who opens it sees and edits the same trip, no sign-in needed.

That's it — no separate database to set up. Netlify Blobs (the storage
this app uses) is included free with every Netlify site.

## Good to know
- Netlify's free tier comfortably covers a use case like this (occasional
  reads/writes from a handful of friends).
- Data lives in Netlify Blobs tied to this site — it persists across
  redeploys, so you don't need to worry about losing the trip if you push
  an update later.

## Trying it locally first (optional, needs Node.js + Netlify CLI)
```
npm install -g netlify-cli
npm install
netlify dev
```
Then open the local URL it prints. (Netlify Blobs works locally too when
run this way.)
