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
  ?~  grits.wave  rock
  %=  $
    rock  (wash-grit rock id.wave src.wave i.grits.wave)
    grits.wave  t.grits.wave
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
      =grits
  ==
+$  grits  (list grit)
+$  grit
  $+  pond-grit
  $@  ?(%del-turf %inc-counter %noop)
  $%  set-turf-wave
      size-turf-wave
      add-husk-wave
      del-shade-wave
      cycle-shade-wave
      set-shade-var-wave
      set-shade-effect-wave
      add-portal-wave
      del-portal-wave
      add-shade-to-portal-wave
      del-shade-from-portal-wave
      del-portal-from-shade-wave
      portal-confirmed-wave
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
::  we are managing our portals
+$  add-portal-wave  [%add-portal for=turf-id at=(unit portal-id)]
+$  del-portal-wave  [%del-portal from=portal-id loud=?]
::  secret waves
+$  add-shade-to-portal-wave  [%add-shade-to-portal from=portal-id =shade-id]
+$  del-shade-from-portal-wave  [%del-shade-from-portal from=portal-id =shade-id]
+$  del-portal-from-shade-wave  [%del-portal-from-shade =shade-id =portal-id]
::  we are receiving updates about a peer's portal
::  these are produced by set-shade-effect and create-bridge as roars
+$  portal-requested-stir  [%portal-requested for=turf-id at=portal-id]
+$  portal-retracted-stir  [%portal-retracted for=turf-id at=portal-id]
+$  portal-discarded-stir  [%portal-discarded from=portal-id]
+$  portal-confirmed-wave  [%portal-confirmed from=portal-id at=portal-id]
::
+$  chat-wave  [%chat =chat]
+$  move-wave  [%move =ship pos=svec2]
+$  face-wave  [%face =ship =dir]
+$  set-avatar-wave  [%set-avatar =ship =avatar]
+$  add-port-req-wave  [%add-port-req =ship from=portal-id =avatar]
+$  add-port-rec-wave  [%add-port-rec from=portal-id =ship]
+$  add-player-wave  [%add-player =ship =player]
+$  del-player-wave  [%del-player =ship]
::
+$  stir-id  (unit @t)
+$  stir
  $+  pond-stir
  $:  =turf-id
      id=stir-id
      =goals
  ==
+$  goals  (list goal)
+$  goal
  $+  pond-goal
  $%  grit
      [%send-chat from=ship text=cord]
      [%join-player =ship =avatar]
      create-bridge-stir
      portal-requested-stir
      portal-retracted-stir
      portal-discarded-stir
  ==
::  let's us create a shade and/or portal
::  and link them in one transaction
+$  create-bridge-stir
  $:  %create-bridge
      shade=?(shade-id husk-spec) 
      =trigger
      portal=?(portal-id turf-id)
  ==
+$  stirred
    $%  [what=%rock =rock]
        [what=%wave id=stir-id =grits]
    ==
::
::
::
++  wash-grit
  |=  [=rock id=stir-id src=(unit ship) =grit]
  =?  stir-ids.rock  &(?=(^ src) ?=(^ id))
    (~(put by stir-ids.rock) (need src) (need id))
  :-  stir-ids.rock
  ^-  (unit turf)
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
    %add-portal  (add-portal turf for.grit at.grit)
    %del-portal  (del-portal turf from.grit)
      %add-shade-to-portal
    %^  jab-by-portals  turf  from.grit
    |=  =portal
    portal(shade-id `shade-id.grit)
      %del-shade-from-portal
    %^  jab-by-portals  turf  from.grit
    |=  =portal
    ?.  =(shade-id.portal `shade-id.grit)
      portal
    portal(shade-id ~)
      %del-portal-from-shade
    ?.  (~(has by cave.plot.turf) shade-id.grit)
      turf
    =.  cave.plot.turf
      %+  ~(jab by cave.plot.turf)  shade-id.grit
      |=  =shade
      =+  (get-effects-by-shade turf shade)
      =/  overrides
        %-  malt
        %+  murn  ~(tap by full-fx)
        |=  [=trigger eff=(unit possible-effect)]
        ^-  (unit [_trigger _eff])
        ?~  eff  ~
        ?@  u.eff  ~
        ?.  ?=(%port -.u.eff)  ~
        ?.  =(portal-id.u.eff portal-id.grit)
          ~
        `[trigger `%port]
      shade(effects (~(uni by husk-fx) overrides))
    turf
    ::
      %portal-confirmed
    %^  jab-by-portals  turf  from.grit
    |=  =portal
    portal(at `at.grit)
    ::
      %chat
    turf(chats.ephemera [chat.grit (scag 19 chats.ephemera.turf)])
      %move
    %^  jab-by-players  turf  ship.grit
    |=  =player
    player(pos pos.grit)
      %face
    %^  jab-by-players  turf  ship.grit
    |=  =player
    player(dir dir.grit)
      %set-avatar
    %^  jab-by-players  turf  ship.grit
    |=  =player
    player(avatar avatar.grit)
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