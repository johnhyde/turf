#!/bin/bash
# Does this actually need to be bash? Who knows! You'll definitely need tmux, though.

echo Running commands to guarantee up-to-date...
# The below commands are independent, so they can be run in parallel, but we do want to `wait` for them both to finish before proceeding, to make sure there's no funny business that will require a reload once we are in the tmux. I mean, you could just also not do that, I guess. For the glory of speed.
npm run desks &
npm install &
wait
echo Muxing our teas...
tmux \
  new-session 'echo "This is tmux, a program that is paneful to use.
  I find it rather unergonomic, but it lets me run all of these commands at once, and continue to interact with them.
  Ctrl-b is the "prefix key" to send commands to tmux. If you need to send Ctrl-b through to some other program running INSIDE tmux, use the sequence Ctrl-b Ctrl-b to do so.
  You can press Ctrl-b q [number] (quickly!) to jump to that pane directly, or Ctrl-b [arrow key] (slowly!) to navigate between panes.
  This pane will become a bash session in the source code directory once you exit this less session, in case you find that helpful.
  Use Ctrl-b : kill-session to exit the entire tmux session (I have also aliased this to Ctrl-b : q)." | less && bash' \; \
  set -s command-alias[100] q='kill-session' \; \
  split-window -h "npm run urbit" \; \
  split-window -h 'npm run start' \; \
  split-window 'npm run urbit2' \; \
  split-window 'npm run start2' \; \
  select-layout even-horizontal \;
# The 100 in command-alias[100] is an arbitrary number, but it seems that you just have to use an arbitrary number and hope you don't clobber anyone else trying to set an alias in the array
