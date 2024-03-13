/-  spider
/+  *strandio
=,  strand=strand:spider
=,  strand-fail=strand-fail:libstrand:spider
^-  thread:spider
|=  arg=vase
=/  m  (strand ,vase)
^-  form:m
=+  !<([noob=ship c-id=path] arg)
=/  scry-path=path
  (snoc `path`[%players c-id] %noun)
;<  players=(set ship)  bind:m
  (scry (set ship) %gx %turf scry-path)
?.  (~(has in players) noob)
  (strand-fail %not-in-turf ~)
(pure:m !>(~))
