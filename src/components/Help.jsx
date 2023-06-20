import StateSummary from "@/StateSummary";

export default function Help() {
  return (
    <div class="m-1 p-4 space-y-4 bg-yellow-950 rounded-lg text-yellow-50">
      <p>
        Use arrow keys or WASD to move
      </p>
      <p>
        Scroll up/down to scroll in/out
      </p>
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
      {/* <p>
        Select the Shovel to enter Edit Mode
      </p> */}
      <StateSummary />
    </div>
  );
}
