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
  $%  rock-0
  ==
:: :: +$  rock-old
:: ::   $:  stir-ids=(map ship @t)
:: ::       core-old
::   ==
:: +$  core-old  turf=(unit turf:turf-old)
+$  rock-0
  $:  %0
      stir-ids=(map ship @t)
      core-0
  ==
+$  core-0  turf=(unit turf)
+$  grits  (list grit)
+$  grit
  $+  pond-grit
  $@  ?(%del-turf %inc-counter %noop)
  $%  [%set-turf =turf]
      [%size-turf off-size]
      [%add-form form-spec]
      [%del-form =form-id]
      [%add-husk add-husk-spec]
      [%del-shade =shade-id]
      [%move-shade =shade-id pos=svec2]
      [%cycle-shade =shade-id amt=@ud]
      [%set-shade-var =shade-id variation=@ud]
      [%set-shade-effect =shade-id =trigger effect=(unit possible-effect)]
      [%set-lunk lunk=(unit lunk)]
      [%set-dink =portal-id approved=?]
      [%del-dink =portal-id]
      [%add-portal for=turf-id at=(unit portal-id)]
      [%del-portal from=portal-id loud=?]
      ::  secret waves
      [%add-shade-to-portal from=portal-id =shade-id]
      [%del-shade-from-portal from=portal-id =shade-id]
      [%del-portal-from-shade =shade-id =portal-id]
      portal-confirmed-grit
      [%chat =chat]
      [%move =ship pos=svec2]
      [%tele =ship pos=svec2]
      [%face =ship =dir]
      [%ping-player =ship by=ship]
      [%set-avatar =ship =avatar]
      [%add-port-offer =ship from=portal-id]
      [%del-port-offer =ship]
      [%add-port-req =ship from=(unit portal-id) =avatar]
      [%del-port-req =ship]
      [%add-port-rec from=portal-id =ship]
      [%del-port-rec from=portal-id =ship]
      [%del-port-recs from=portal-id]
      [%add-player =ship =player]
      [%del-player =ship]
  ==
::  we are receiving updates about a peer's portal
::  these are produced from roars of various goals
+$  portal-requested-goal  [%portal-requested for=turf-id at=portal-id is-link=?]
+$  portal-retracted-goal  [%portal-retracted for=turf-id at=portal-id]
+$  portal-discarded-goal  [%portal-discarded from=portal-id]
+$  portal-confirmed-grit  [%portal-confirmed from=portal-id at=portal-id]
::
::
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
      [%approve-dink =portal-id]
      create-bridge-goal
      portal-requested-goal
      portal-retracted-goal
      portal-discarded-goal
      [%port-offer-accepted =ship from=portal-id]
      [%port-offer-rejected =ship from=portal-id]
      [%import-player =ship from=(unit portal-id) =avatar]
  ==
::  let's us create a shade and/or portal
::  and link them in one transaction
+$  create-bridge-goal
  $:  %create-bridge
      shade=?(shade-id add-husk-spec) 
      =trigger
      portal=?(portal-id turf-id)
      :: link=(unit ?(%lunk %dink))
  ==
+$  stirred
    $%  [what=%rock =rock]
        [what=%wave id=stir-id =grits]
    ==
::
:: roars are turf-scoped effects emitted by filters
:: which update state and produce cards
+$  portal-event  ?(%requested %retracted %confirmed %rejected %discarded)
+$  roar
  $%  [%portal-request from=portal-id for=turf-id is-link=?]
      [%portal-retract from=portal-id for=turf-id]
      [%portal-confirm from=portal-id for=turf-id at=portal-id]
      [%portal-discard for=turf-id at=portal-id]
      [%portal-hark event=portal-event is-link=? from=portal-id for=turf-id]
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
  :-  -.rock
  :-  stir-ids.rock
  ^-  core-0
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
    =.  turf  %=  turf
      offset.plot  offset.grit
      size.plot  size.grit
      ::
        players.ephemera
      %-  ~(run by players)
      |=  =player
      player(pos (clamp-pos pos.player offset.grit size.grit))
    ==
    (fill-empty-space turf /grass)
    ::
    %add-form  (add-form turf +.grit)
    %del-form  (del-form turf form-id.grit)
    %add-husk  (add-husk turf +>.grit)
    %del-shade  (del-shade turf +.grit)
    %move-shade  (move-shade turf +.grit)
    %cycle-shade  (cycle-shade turf +.grit)
    %set-shade-var  (set-shade-var turf +.grit)
    %set-shade-effect  (set-shade-effect turf +.grit)
    ::
    %set-lunk  turf(lunk.deed lunk.grit)
      %set-dink
    =.  dinks.deed.turf
      (~(put by dinks.deed.turf) portal-id.grit approved.grit)
    turf
      %del-dink
    =.  dinks.deed.turf
      (~(del by dinks.deed.turf) portal-id.grit)
    turf
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
      ?(%move %tele)
    %^  jab-by-players  turf  ship.grit
    |=  =player
    player(pos pos.grit)
      %face
    %^  jab-by-players  turf  ship.grit
    |=  =player
    player(dir dir.grit)
      %ping-player
    turf
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
    ?~  from.grit  turf
    =.  port-reqs.deed.turf
      (~(put by port-reqs.deed.turf) ship.grit [u.from.grit avatar.grit])
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