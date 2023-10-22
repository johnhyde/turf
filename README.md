# turf

## Dev Ship Setup

- `npm install`
- `npm run init`
- Spin up a comet or distribution ship, or a fakeship. Such as, for example, the command ./urbit -F nec in wherever you keep your urbits. (Fakeships seem to take about 10 minutes to spin up on my machine.)
- If need be, edit `VITE_SHIP_URL` in `.env.local` to point to your dev ship's web interface. This should be the url your ship gives you in its boilerplate output when starting up, in the line like `http: web interface live on http://localhost:8080`. In fact, this is almost certainly the value you will see, which is why that is the default in the .env.local file. (This value technically could change a bunch, but in practice is usually just the same one.)
- Set TURF_DESK in .env.local if the path to your desk directory will be different than the default (it probably will be different). This should be the file system path to the turf folder in your ship folder; that is, something like path/to/nec/turf. It can be a relative or absolute path, whatever works best for you.
- `npm run desk`
    - As part of that script, the following commands will be run in your ship as though you had run them from the ship's dojo. If the script fails for some reason, feel free to run them manually:
    - `|new-desk %turf`
    - `|mount %turf`
    - `|commit %turf`
    - `|install our %turf`
- Make sure that your versions are cromulent. An error message like `clay: wait-for-kelvin, [need=[%zuse %415] have=[n=[lal=%zuse num=413] l={} r={}]]` when you try to `|commit` means you are NOT crom, you will NOT pass go, and you will NEVER collect $200. Try updating urbit in such a case.

## Dev Ship Running

- From the turf source folder:
 - `npm start`
- Visit http://127.0.0.1:3000/ and sign in with your access code (`+code` in the dojo to get this access code) (you will get cryptic Urbit api and file-not-found errors in the web console if you forget this step. Notably, session.js will be missing, although other errors will also cause this.)
- Visit http://127.0.0.1:3000/apps/turf/
- If you make changes to the front-end, you will have to refresh the web page, or possibly hit r on the command line window running vite, depending on your operating system or perhaps other factors (it's supposed to hot-reload, but wasn't designed to work with phaser so it often doesn't really work properly). You can, however, leave this open while you modify the back-end with `npm run desks`, which is orthogonal.

### Setting Up And Running Multiple Ships

For multiple ships, eg to test multiplayer:
- An important thing to remember is that fakeships also use hierarchical networking, as described in https://developers.urbit.org/guides/core/environment#local-networking. This is inconvenient, so your best bet is to run two fake galaxies, like ~bud and ~nec. You can also just add more running ships to your setup to sponsor appropriately.
- Do the ship setup steps multiple times, setting TURF_DESK2 to your second desk, and running `npm run desks` instead of `npm run desk`. Don't worry: this is idempotent, so you can do it again even if you've already installed the first ship, no problem. (It will update the turf code in the other ship to the newest version, however.)
- `npm start` like usual. Or, I suppose you can use `npm start&` to start it as a background process in your shell (at least in bash). (You may find background processes too annoying and cumbersome, however. Here's a hint: use fg to resume a stopped background procress.)
- start a second ui dev server like so: `SHIP_URL="http://127.0.0.1:8081" npm run dev -- --port 3001`. This is what `npm run start2` does.
- the command `npm run tmux` runs the four processes you'll need (including the urbit ships), in one convenient package, and lets you see all the processes in a tmux instance. Note: this script may be broken. Testing has been inconclusive, but sometimes it seems that it doesn't update properly, and may not report error messages correctly.

## Syncing Source Code To The Ships

To push the hoon source code to the ships, run `npm run desks` or `npm run desks`. Since this script includes a `|commit` to the desks, they will hot-reload automatically when the new source code is pushed to them thereby.

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

The page will reload if you make edits (maybe).<br>

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)

## Addendum

Further documentation on this project can be found in [./desk/doc/](./desk/doc/)
