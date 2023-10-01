import { createSignal, createMemo, createSelector, onMount, onCleanup } from 'solid-js';
import { useState } from 'stores/state.jsx';
import StateSummary from "@/StateSummary";

export default function Help() {
  const state = useState();
  const weAreHost = our.length <= 7;
  const [tab, $tab] = createSignal('tabs');

  return (<div class="h-full overflow-y-auto">
    <div class="m-1 p-4 space-y-4 bg-yellow-950 rounded-lg text-yellow-50">
      {dev && <StateSummary />}
      <p>
        Use arrow keys, WASD, or tap/click to move
      </p>
      <p>
        Scroll up/down to zoom in/out
      </p>
      <p>
        Click on a player to get their attention
      </p>
      <div class="-m-2 p-2 rounded-md border border-yellow-700">
      <div class="mb-1 flex flex-wrap items-justify gap-2 text-black">
        <button class={'px-1 rounded-sm ' + (tab() === 'tabs' ? 'bg-yellow-600' : 'bg-yellow-700')} onClick={[$tab, 'tabs']}>Tabs</button>
        <button class={'px-1 rounded-sm ' + (tab() === 'chat' ? 'bg-yellow-600' : 'bg-yellow-700')} onClick={[$tab, 'chat']}>Chat</button>
        <button class={'px-1 rounded-sm ' + (tab() === 'editor' ? 'bg-yellow-600' : 'bg-yellow-700')} onClick={[$tab, 'editor']}>Editor</button>
        <button class={'px-1 rounded-sm ' + (tab() === 'town' ? 'bg-yellow-600' : 'bg-yellow-700')} onClick={[$tab, 'town']}>Town</button>
        <button class={'px-1 rounded-sm ' + (tab() === 'portals' ? 'bg-yellow-600' : 'bg-yellow-700')} onClick={[$tab, 'portals']}>Portals</button>
      </div>
        <Switch>
          <Match when={tab() === 'tabs'}>
            <div>
              <p>
                Switching between tabs:
              </p>
              <ul class="list-disc list-inside">
                <li>
                  Press H or ? to bring up this help page
                </li>
                <li>
                  Press P to customize your profile/avatar
                </li>
                <li>
                  Press E to open the turf editor
                </li>
                <li>
                  Press T to manage about your Town and Gate
                </li>
                <li>
                  Press G to place portals to other turfs
                </li>
                <li>
                  Press M to mute or unmute ping sounds and voice synthesis
                </li>
                <li>
                  Press Escape to exit the current tab, close the sidebar, or open the sidebar
                </li>
              </ul>
            </div>
          </Match>
          <Match when={tab() === 'chat'}>
            <div>
              <p>
                Using the chat box:
              </p>
              <ul class="list-disc list-inside">
                <li>
                  Press Space to select the chat box
                </li>
                <li>
                  Press Enter to send a chat message
                </li>
                <li>
                  Send a DM like this "/dm ~sampel-palnet Hello"
                </li>
                <li>
                  Press Escape to exit the chat box without sending a message
                </li>
              </ul>
            </div>
          </Match>
          <Match when={tab() === 'editor'}>
            <div>
              <p>
                Using the turf editor:
              </p>
              <ul class="list-disc list-inside">
                <li>
                  Click on an item see its info
                </li>
                <li>
                  Click and drag an item to move it
                </li>
                <li>
                  Press R to resize the turf
                </li>
                <li>
                  Press C to use the cycler tool. This lets you cycle through variations of an item (e.g. walls)
                </li>
                <li>
                  Press Delete or Backspace to use the eraser tool. This lets you remove items
                </li>
                <li>
                  Click on a tile or item sprite from the library to place it in the world
                </li>
                <li>
                  Press Escape to return to the pointer tool (the default). This tool lets you select objects and see their properties.
                </li>
              </ul>
            </div>
          </Match>
          <Match when={tab() === 'town'}>
            <div>
              <p>
                Using the Town tab:
              </p>
              <ol class="list-decimal list-inside">
                <li>
                  Move Gate to set your default spawn point
                </li>
                {weAreHost ?
                  <li>
                    Approve or reject requests from planets/moons/comets to place houses in your Town
                  </li>
                : <>
                  <li>
                    Select a star to be your home Town. Most stars will need to manually approve you, but ~pandux accepts all requests automatically
                  </li>
                  <li>
                    In your home Town, Place House to create a portal back to your turf
                  </li>
                </>}
              </ol>
            </div>
          </Match>
          <Match when={tab() === 'portals'}>
            <div>
              <p>
                Using the portals tab:
              </p>
              <ol class="list-decimal list-inside">
                <li>
                  Type the @p you want to visit
                </li>
                <li>
                  Press Enter or click the + button and place the portal on the turf
                </li>
                <li>
                  Wait for it to be accepted by the other ship
                </li>
                <li>
                  Step onto the portal to travel through it
                </li>
              </ol>
            </div>
          </Match>
        </Switch>
      </div>
      <div class="border-t border-yellow-50"></div>
      <p>
        Turf is in Season 0: Beta Testing Testing. Anything you create will likely be wiped away in a future version.
      </p>
      <p>
        You are currently opted {state.mist.config.enabled ? 'in to' : 'out of' } daily usage tracking. When enabled, Turf tells {state.mist.config.vitaParent} whether you used the app once per day.
      </p>
      <p>
        Sharing your data helps us get funding to keep improving Turf.
      </p>
      <p class="w-full text-center">
        <button
          class="bg-yellow-700 px-2 py-1 rounded-md"
          onClick={state.mist.toggleVitaEnabled.bind(state.mist)}
        >
          {state.mist.config.enabled ? 'Opt Out' : 'Opt In'}
        </button>
      </p>
      <p>
        Come ask questions or give feedback in the group:
        &nbsp;
        {/* <a href="/1/group/~poster-hoster-midlev-mindyr/turf"> */}
          <code>~poster-hoster-midlev-mindyr/turf</code>
        {/* </a> */}
      </p>
    </div>
  </div>);
}
