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
  :-  ~
  ?-  -.grit
    %set-turf  turf.grit
    ::
      %size-turf
    %=  turf
      offset.plot  offset.grit
      size.plot  size.grit
      ::
        players.ephemera
      %-  ~(run by players)
      |=  =player
      player(pos (clamp-pos pos.player offset.grit size.grit))
    ==
    ::
    %add-husk  (add-husk turf +.grit)
    %del-shade  (del-shade turf +.grit)
    %cycle-shade  (cycle-shade turf +.grit)
    %set-shade-var  (set-shade-var turf +.grit)
    %set-shade-effect  (set-shade-effect turf +.grit)
    ::
      %create-portal
    =/  portals  portals.deed.turf
    %=  turf
      portals.deed  (~(put by portals) stuff-counter.plot.turf [~ for.grit ~])
      stuff-counter.plot  +(stuff-counter.plot.turf)
    ==
    ::
    %discard-portal  (burn-bridge turf from.grit)
    ::
      %portal-requested
    =/  portals  portals.deed.turf
    %=  turf
      portals.deed  (~(put by portals) stuff-counter.plot.turf [~ for.grit `at.grit])
      stuff-counter.plot  +(stuff-counter.plot.turf)
    ==
      %portal-retracted
    =/  portals  ~(tap by portals.deed.turf)
    =/  portal-id
      |-  ^-  (unit portal-id)
      ?~  portals  ~
      =/  portal-id  q.i.portals
      ?:  &(=(for.grit for.portal-id) =(at.grit at.portal-id))
        `p.i.portals
      $(portals t.portals)
    ?~  portal-id  turf
    (burn-bridge turf u.portal-id)
      %portal-confirmed
    =*  portals  portals.deed.turf
    =?  portals  (~(has by portals) from.grit)
      %+  ~(jab by portals)
        from.grit
      |=  =portal
      portal(at `at.grit)
    turf
    ::
    %portal-discarded  (burn-bridge turf from.grit)
    ::
      %chat
    turf(chats.ephemera [chat.grit (scag 19 chats.ephemera.turf)])
      %move
    =.  players
      %^  jab-by-players  players  ship.grit
      |=  =player
      player(pos pos.grit)
    turf
      %face
    =.  players
      %^  jab-by-players  players  ship.grit
      |=  =player
      player(dir dir.grit)
    turf
      %set-avatar
    =.  players
      %^  jab-by-players  players  ship.grit
      |=  =player
      player(avatar avatar.grit)
    turf
      %add-player
    =.  players
      (~(put by players) ship.grit player.grit)
    turf
      %del-player
    =.  players
      (~(del by players) ship.grit)
    turf
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
      set-shade-effect-wave
      create-portal-wave
      discard-portal-wave
      portal-requested-wave
      portal-retracted-wave
      portal-confirmed-wave
      portal-discarded-wave
      chat-wave
      move-wave
      face-wave
      set-avatar-wave
      add-player-wave
      del-player-wave
  ==
::
+$  set-turf-wave  [%set-turf =turf]
+$  size-turf-wave  [%size-turf off-size]
+$  add-husk-wave  [%add-husk husk-spec]
+$  del-shade-wave  [%del-shade =shade-id]
+$  cycle-shade-wave  [%cycle-shade =shade-id amt=@ud]
+$  set-shade-var-wave  [%set-shade-var =shade-id variation=@ud]
+$  set-shade-effect-wave
  $:  %set-shade-effect
      =shade-id
      =trigger
      effect=(unit possible-effect)
  ==
::  let's us create a shade and/or portal
::  and link them in one transaction
+$  create-bridge-wave
  $:  %create-bridge
      shade=(each shade-id husk-spec) 
      =trigger
      portal=(each portal-id turf-id)
  ==
::  we are managing our portals
+$  create-portal-wave  [%create-portal for=turf-id]
+$  discard-portal-wave  [%discard-portal from=portal-id]
::  we are receiving updates about a peer's portal
::  these are produced by set-shade-effect and create-bridge as roars
+$  portal-requested-wave  [%portal-requested for=turf-id at=portal-id]
+$  portal-retracted-wave  [%portal-retracted for=turf-id at=portal-id]
+$  portal-confirmed-wave  [%portal-confirmed from=portal-id at=portal-id]
+$  portal-discarded-wave  [%portal-discarded from=portal-id]
::
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