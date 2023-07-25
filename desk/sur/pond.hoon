/-  *turf
/+  *turf
=<
|%
++  name  %pond
+$  rock  ^rock
+$  wave  ^wave
++  wash
  |=  [=rock =wave]
  ^-  ^rock
  =/  grit  grit.wave
  ?:  ?=([%batch *] grit)
    =/  poly  +.grit
    |-  ^-  ^rock
    ?~  poly  rock
    %=  $
      rock  ^$(wave wave(grit i.poly))
      poly  t.poly
    ==
  =?  stir-ids.rock  &(?=(^ src.wave) ?=(^ id.wave))
    (~(put by stir-ids.rock) (need src.wave) (need id.wave))
  :-  stir-ids.rock
  =/  uturf  turf.rock
  ?~  uturf
    ?@  grit  ~  :: %del-turf or %inc-counter
    ?+  -.grit  ~
      %set-turf  `turf.grit
    ==
  =*  turf  u.uturf
  =*  players  players.ephemera.turf
  ?@  grit
    ?-  grit
      %noop  uturf
      %del-turf  ~
        %inc-counter
      uturf(stuff-counter.plot.u +(stuff-counter.plot.turf))
    ==
  ?-  -.grit
    %set-turf  `turf.grit
    %size-turf
  :-  ~
  %=  turf
    offset.plot  offset.grit
    size.plot  size.grit
    ::
      players.ephemera
    %-  ~(run by players)
    |=  =player
    player(pos (clamp-pos pos.player offset.grit size.grit))
  ==
    %add-husk  `(add-husk turf +.grit)
    %del-shade  `(del-shade turf +.grit)
    %cycle-shade  `(cycle-shade turf +.grit)
    %set-shade-var  `(set-shade-var turf +.grit)
      %chat
    uturf(chats.ephemera.u [chat.grit (scag 19 chats.ephemera.turf)])
      %move
    =.  players
      %^  jab-by-players  players  ship.grit
      |=  =player
      player(pos pos.grit)
    uturf
      %face
    =.  players
      %^  jab-by-players  players  ship.grit
      |=  =player
      player(dir dir.grit)
    uturf
      %set-avatar
    =.  players
      %^  jab-by-players  players  ship.grit
      |=  =player
      player(avatar avatar.grit)
    uturf
      %add-player
    =.  players
      (~(put by players) ship.grit player.grit)
    uturf
      %del-player
    =.  players
      (~(del by players) ship.grit)
    uturf
  ==
--
|%
+$  rock
  $:  stir-ids=(map ship @t)
      turf=(unit turf)
  ==
+$  wave
  $+  pond-wave
  $:  id=stir-id
      src=(unit ship)
      =grit
  ==
+$  grit
  $+  pond-grit
  $@  mono-grit
  $%  poly-grit
      mono-grit
  ==
+$  poly-grit  [%batch (list mono-grit)]
+$  mono-grit
  $+  pond-mono-grit
  $@  ?(%del-turf %inc-counter %noop)
  $%  set-turf-wave
      size-turf-wave
      add-husk-wave
      del-shade-wave
      cycle-shade-wave
      set-shade-var-wave
      chat-wave
      move-wave
      face-wave
      set-avatar-wave
      add-player-wave
      del-player-wave
  ==
+$  set-turf-wave  [%set-turf =turf]
+$  size-turf-wave  [%size-turf off-size]
+$  add-husk-wave  [%add-husk husk-spec]
+$  del-shade-wave  [%del-shade =shade-id]
+$  cycle-shade-wave  [%cycle-shade =shade-id amt=@ud]
+$  set-shade-var-wave  [%set-shade-var =shade-id variation=@ud]
+$  chat-wave  [%chat =chat]
+$  move-wave  [%move =ship pos=svec2]
+$  face-wave  [%face =ship =dir]
+$  set-avatar-wave  [%set-avatar =ship =avatar]
+$  add-player-wave  [%add-player =ship =player]
+$  del-player-wave  [%del-player =ship]
::
+$  stir-id  (unit @t)
+$  stir
  $+  pond-stir
  $:  =turf-id
      id=stir-id
      =goal
  ==
+$  goal
  $+  pond-goal
  $@  mono-goal
  $%  poly-goal
      mono-goal
  ==
+$  poly-goal  [%batch (list mono-goal)]
+$  mono-goal
  $+  pond-mono-goal
  $%  mono-grit
      [%send-chat from=ship text=cord]
      [%join-player =ship =avatar]
  ==
+$  stirred
    $%  [what=%rock =rock]
        [what=%wave id=stir-id grit=(unit grit)]
    ==
--