# turf

## Dev Setup

- `npm install`
- `npm run init`
- Spin up a comet or distribution ship, or a fakeship.
- Edit `VITE_SHIP_URL` in `.env.local` to point to your dev ship, if need be. This should be the url your ship gives you in its boilerplate output when starting up, in the line like `http: web interface live on http://localhost:8080`
- Mount a %turf desk to said ship. In its Dojo:
 - `|new-desk %turf`
 - `|mount %turf`
- Set TURF_DESK in .env.local if the path to your desk directory is different. This should be the file system path to the turf folder in your ship folder. It can be a relative or absolute path, whatever works best for you.
- From the turf source folder:
 - `npm run desk`
- In the dojo:
 - `|commit %turf`
- Make sure that your versions are cromulent. An error message like `clay: wait-for-kelvin, [need=[%zuse %415] have=[n=[lal=%zuse num=413] l={} r={}]]` when you try to `|commit` means you are NOT crom, you will NOT pass go, and you will NEVER collect $200. Try updating urbit in such a case.
 - `|install our %turf`

## Dev Running

- From the turf source folder:
 - `npm start`
- Visit http://127.0.0.1:3000/ and sign in with your access code (`+code` in the dojo to get this access code) (you will get cryptic Urbit api and file-not-found errors in the web console if you forget this step. Notably, session.js will be missing, although other errors will also cause this.)
- Visit http://127.0.0.1:3000/apps/turf/ (the trailing slash is crucial)
- If you make changes to the front-end, you will have to kill and start this process again (it's supposed to hot-reload, but wasn't designed to work with phaser so it often doesn't really work properly). You can, however, leave this open while you modify the back-end with `npm run desks`

### Setting Up And Running Multiple Ships

For multiple ships, eg to test multiplayer:
- Do the ship steps multiple times, setting TURF_DESK2 to your second desk, and running `npm run desks` instead of `npm run desk`. Don't worry: this is idempotent, so you can do it again even if you've already installed the first ship, no problem. (It will update the turf code in the other ship to the newest version, however.)
- `npm start` like usual. Or, I suppose you can use `npm start&` to start it as a background process in your shell (at least in bash). (You may find background processes too annoying and cumbersome, however. Here's a hint: use fg to resume a stopped background procress.)
- start a second ui dev server like so: `SHIP_URL="http://127.0.0.1:8081" npm run dev -- --port 3001`. This is what `npm run start2` does.
- then you can use the `/join ~zod` (or whatever your other fakeship is) command in the chat

## Updating Source Code

To push the hoon source code to the ships, run `npm run desks` or `npm run desks`. Since(?) we've `|install`ed the desks, they will hot-reload automatically when the new source code is pushed to them thereby.

# Vite Template Stuff
## Usage

Those templates dependencies are maintained via [pnpm](https://pnpm.io) via `pnpm up -Lri`.

This is the reason you see a `pnpm-lock.yaml`. That being said, any package manager will work. This file can be safely be removed once you clone a template.

```bash
$ npm install # or pnpm install or yarn install
```

### Learn more on the [Solid Website](https://solidjs.com) and come chat with us on our [Discord](https://discord.com/invite/solidjs)

## Available Scripts

In the project directory, you can run:

### `npm run dev` or (equivalently) `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)

## Addendum

Further documentation on this project can be found in [./desk/doc/](./desk/doc/)
