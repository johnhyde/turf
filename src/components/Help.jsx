import { useState } from 'stores/state.jsx';
import StateSummary from "@/StateSummary";

export default function Help() {
  const state = useState();

  return (
    <div class="m-1 p-4 space-y-4 bg-yellow-950 rounded-lg text-yellow-50">
      {import.meta.env.DEV && <StateSummary />}
      <p>
        Use arrow keys or WASD to move
      </p>
      <p>
        Scroll up/down to zoom in/out
      </p>
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
            Press Escape to exit the chat box without sending a message
          </li>
        </ul>
      </div>
      <div>
        <p>
          Switching between tabs:
        </p>
        <ul class="list-disc list-inside">
          <li>
            Press E to open the turf editor
          </li>
          <li>
            Press P to customize your profile/avatar
          </li>
          <li>
            Press G to place portals to other turfs
          </li>
          <li>
            Press H or ? to bring up this help page
          </li>
          <li>
            Press Escape to exit the current tab, close the sidebar, or open the sidebar
          </li>
        </ul>
      </div>
      <div>
        <p>
          Using the turf editor:
        </p>
        <ul class="list-disc list-inside">
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
            Press Enter to return to the pointer tool (the default)
          </li>
        </ul>
      </div>
      <div class="border-t border-yellow-50"></div>
      <p>
        Turf is in Season -1: Alpha Testing. Anything you create will be erased on October 1st, 2023 (if not sooner).
      </p>
      <p>
        You are currently opted {state.mist.config.enabled ? 'in to' : 'out of' } daily usage tracking. When enabled, Turf tells {state.mist.config.vitaParent} whether you used app once per day.
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
  );
}
