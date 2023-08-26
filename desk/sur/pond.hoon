/-  *turf
/+  *turf
=<
|%
++  name  %pond
+$  rock  ^rock
+$  goal  ^goal
+$  foam  ^foam  :: from lib/turf
+$  grit  ^grit
++  wash  wash-grit
--
|%
+$  rock
  $:  stir-ids=(map ship @t)
      core
  ==
+$  core  turf=(unit turf)
+$  grits  (list grit)
+$  grit
  $+  pond-grit
  $@  ?(%del-turf %inc-counter %noop)
  $%  set-turf-grit
      size-turf-grit
      add-husk-grit
      del-shade-grit
      cycle-shade-grit
      set-shade-var-grit
      set-shade-effect-grit
      add-portal-grit
      del-portal-grit
      add-shade-to-portal-grit
      del-shade-from-portal-grit
      del-portal-from-shade-grit
      portal-confirmed-grit
      chat-grit
      move-grit
      face-grit
      set-avatar-grit
      add-port-offer-grit
      del-port-offer-grit
      add-port-req-grit
      del-port-req-grit
      add-port-rec-grit
      del-port-rec-grit
      del-port-recs-grit
      add-player-grit
      del-player-grit
  ==
::
+$  set-turf-grit  [%set-turf =turf]
+$  size-turf-grit  [%size-turf off-size]
+$  add-husk-grit  [%add-husk husk-spec]
+$  del-shade-grit  [%del-shade =shade-id]
+$  cycle-shade-grit  [%cycle-shade =shade-id amt=@ud]
+$  set-shade-var-grit  [%set-shade-var =shade-id variation=@ud]
+$  set-shade-effect-grit
  $:  %set-shade-effect
      =shade-id
      =trigger
      effect=(unit possible-effect)
  ==
::  we are managing our portals
+$  add-portal-grit  [%add-portal for=turf-id at=(unit portal-id)]
+$  del-portal-grit  [%del-portal from=portal-id loud=?]
::  secret waves
+$  add-shade-to-portal-grit  [%add-shade-to-portal from=portal-id =shade-id]
+$  del-shade-from-portal-grit  [%del-shade-from-portal from=portal-id =shade-id]
+$  del-portal-from-shade-grit  [%del-portal-from-shade =shade-id =portal-id]
::  we are receiving updates about a peer's portal
::  these are produced by set-shade-effect and create-bridge as roars
+$  portal-requested-goal  [%portal-requested for=turf-id at=portal-id]
+$  portal-retracted-goal  [%portal-retracted for=turf-id at=portal-id]
+$  portal-discarded-goal  [%portal-discarded from=portal-id]
+$  portal-confirmed-grit  [%portal-confirmed from=portal-id at=portal-id]
::
+$  chat-grit  [%chat =chat]
+$  move-grit  [%move =ship pos=svec2]
+$  face-grit  [%face =ship =dir]
+$  set-avatar-grit  [%set-avatar =ship =avatar]
+$  add-port-offer-grit  [%add-port-offer =ship from=portal-id]
+$  del-port-offer-grit  [%del-port-offer =ship]
+$  add-port-req-grit  [%add-port-req =ship from=portal-id =avatar]
+$  del-port-req-grit  [%del-port-req =ship]
+$  add-port-rec-grit  [%add-port-rec from=portal-id =ship]
+$  del-port-rec-grit  [%del-port-rec from=portal-id =ship]
+$  del-port-recs-grit  [%del-port-recs from=portal-id]
+$  add-player-grit  [%add-player =ship =player]
+$  del-player-grit  [%del-player =ship]
::
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
      create-bridge-goal
      portal-requested-goal
      portal-retracted-goal
      portal-discarded-goal
      port-offer-accepted-goal
      port-offer-rejected-goal
      import-player-goal
  ==
::  let's us create a shade and/or portal
::  and link them in one transaction
+$  create-bridge-goal
  $:  %create-bridge
      shade=?(shade-id husk-spec) 
      =trigger
      portal=?(portal-id turf-id)
  ==
+$  port-offer-accepted-goal  [%port-offer-accepted =ship from=portal-id]
+$  port-offer-rejected-goal  [%port-offer-rejected =ship from=portal-id]
+$  import-player-goal  [%import-player =ship from=portal-id =avatar]
+$  stirred
    $%  [what=%rock =rock]
        [what=%wave id=stir-id =grits]
    ==
::
:: roars are turf-scoped effects emitted by filters
:: which update state and produce cards
+$  portal-event  ?(%requested %retracted %confirmed %rejected %discarded)
+$  roar
  $%  [%portal-request from=portal-id for=turf-id]
      [%portal-retract from=portal-id for=turf-id]
      [%portal-confirm from=portal-id for=turf-id at=portal-id]
      [%portal-discard for=turf-id at=portal-id]
      [%portal-hark event=portal-event from=portal-id for=turf-id]
      [%port =ship for=turf-id at=portal-id]
      [%port-offer =ship from=portal-id for=turf-id at=portal-id]
      [%player-add =ship]
      [%player-del =ship]
  ==
+$  roars  (list roar)
::
::
++  wash-grit
  |=  [=rock [id=stir-id src=(unit ship)] =grit]
  ^-  ^rock
  =?  stir-ids.rock  &(?=(^ src) ?=(^ id))
    (~(put by stir-ids.rock) (need src) (need id))
  :-  stir-ids.rock
  ^-  core
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
      %add-port-offer
    =.  port-offers.deed.turf
      (~(put by port-offers.deed.turf) ship.grit from.grit)
    turf
      %del-port-offer
    =.  port-offers.deed.turf
      (~(del by port-offers.deed.turf) ship.grit)
    turf
      %add-port-req
    =.  port-reqs.deed.turf
      (~(put by port-reqs.deed.turf) ship.grit [from.grit avatar.grit])
    turf
      %del-port-req
    =.  port-reqs.deed.turf
      (~(del by port-reqs.deed.turf) ship.grit)
    turf
      %add-port-rec
    =.  port-recs.deed.turf
      (~(put ju port-recs.deed.turf) from.grit ship.grit)
    turf
      %del-port-rec
    =.  port-recs.deed.turf
      (~(del ju port-recs.deed.turf) from.grit ship.grit)
    turf
      %del-port-recs
    =.  port-recs.deed.turf
      (~(del by port-recs.deed.turf) from.grit)
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