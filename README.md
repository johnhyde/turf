# turf

## Dev Setup

- `npm install`
- `npm run init`
- Edit `VITE_SHIP_URL` in `.env.local` to point to your dev ship
- `npm start`
- Visit http://127.0.0.1:3000/ and sign in with your access code
- Visit http://127.0.0.1:3000/apps/turf/

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

### `npm dev` or `npm start`

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

> The turf readme is garbage, but the steps to install things and get set up are basically the same as my last project: https://github.com/johnhyde/monkey
> The main difference is that npm run install:desk is now npm run desk and there's also npm run desks to install on multiple ships at once.
> Also you can use |new-desk %turf to create the desk instead of |merge %turf our %base.
> Also, I forgot that you need to run |install our %turf after you sync files for the first time.

Further documentation on this project can be found in [./desk/doc/](./desk/doc/)