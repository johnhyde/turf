import StateSummary from "@/StateSummary";

export default function Help() {
  return (
    <div class="m-1 p-4 space-y-4 bg-yellow-950 rounded-lg text-yellow-50">
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
        Turf is in super-pre-alpha. Anything you create will be erased in future updates.
      </p>
      <p>
        Come ask questions or give feedback in the group:
        &nbsp;
        {/* <a href="/1/group/~poster-hoster-midlev-mindyr/turf"> */}
          <code>~poster-hoster-midlev-mindyr/turf</code>
        {/* </a> */}
      </p>
      {import.meta.env.DEV && <StateSummary />}
    </div>
  );
}
