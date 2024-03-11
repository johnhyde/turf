/-  *turf, turf-0, turf-1, turf-2=turf
/+  *turf
=<
|%
++  name  %pond
+$  rock  ^rock
+$  goal  ^goal
+$  foam  ^foam  :: from sur/turf
+$  foam-all  ^foam-all
+$  grit  ^grit
++  wash  wash-grit
--
|%
+$  rock
  $+  pond-rock
  $%  rock-0
      rock-1
      rock-2
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
+$  rock-1
  $:  %1
      stir-ids=(map ship @t)
      core-1
  ==
+$  rock-2
  $:  %2
      stir-ids=(map ship @t)
      core-2
  ==
+$  current-rock  rock-2
+$  current-rock-v  _-:*current-rock
+$  core-0  turf=(unit turf:turf-0)
+$  core-1  turf=(unit turf:turf-1)
+$  core-2  turf=(unit turf:turf-2)
+$  grit-0
  $+  pond-grit-0
  $@(grit-0-atom grit-0-cell)
+$  grit-0-atom  ?(%del-turf %inc-counter %noop)
++  grit-0-cell
  =,  turf-0
  $%  [%noop ~]
      [%upgrade ~]
      [%set-turf =turf]
      [%del-turf ~]
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
      ::  secret grits
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
      [%add-port-req =ship from=$@(?(~ invite-id) [~ u=portal-id]) =avatar]
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
++  grit-1
  =,  turf-1
  $%  [%set-turf =turf]  :: should be included when turf and grit versions change together
      [%add-invite id=invite-id =invite]
      [%del-invite id=invite-id]
      $<  %set-turf  :: properly override previous definition
      grit-0-cell
  ==
++  grit-2
  =,  turf-2
  $%  [%wake ~]
      [%set-turf =turf]  :: should be included when turf and grit versions change together
      [%add-player =ship =player]
      $<  ?(%set-turf %add-player)  :: properly override previous definition
      grit-1
  ==
+$  cur-grit  grit-2
+$  cur-grit-v  %2
+$  grit
  $+  pond-grit
  $@  grit-0
  $%  grit-0
      [%1 grit-1]
      [%2 grit-2]
  ==
+$  grits  (list grit)
+$  cur-grits  (list cur-grit)
::
::
::
+$  stir
  $+  pond-stir
  $:  =turf-id
      id=stir-id
      =goals
  ==
+$  goal-0
  $+  pond-goal-0
  $@(grit-0-atom goal-0-cell)
++  goal-0-cell  $%(grit-0-cell goal-0-only)
++  goal-0-only
  =,  turf-0
  $%  [%send-chat from=ship text=cord]
      [%join-player =ship =avatar]
      [%approve-dink =portal-id]
      create-bridge-goal
      portal-requested-goal
      portal-retracted-goal
      portal-discarded-goal
      [%port-offer-accepted =ship from=portal-id]
      [%port-offer-rejected =ship from=portal-id]
      [%import-player =ship from=$@(?(~ invite-id) [~ u=portal-id]) =avatar]
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
+$  goal-1
  $%  grit-1
      goal-0-only
  ==
+$  goal-2
  $%  [%call ships=(set ship) ~]
      grit-2
      goal-0-only
  ==
+$  cur-goal  goal-2
+$  cur-goal-v  cur-grit-v
+$  goal
  $+  pond-goal
  $@  grit-0-atom
  $%  goal-0-cell
      [%1 goal-1]
      [%2 goal-2]
  ==
+$  goals  (list goal)
+$  cur-goals  (list cur-goal)
::
+$  stirred
    $%  [what=%rock =rock]
        [what=%wave foam =grits]
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
      [%port-reject =ship]
      [%player-add =ship]
      [%player-del =ship]
      [%host-call ships=(set ship) ~]
  ==
+$  roars  (list roar)
::
++  wash-grit
  |=  [=rock =foam =grit]
  ^-  ^rock
  =,  foam
  =?  stir-ids.rock  &(?=(^ src) ?=(^ id))
    (~(put by stir-ids.rock) (need src) (need id))
  ?:  ?=(?([%upgrade ~] [* %upgrade ~]) grit)
    (fully-upgrade-rock rock)
  (wash-grit-v rock foam grit)
++  wash-grit-v
  |*  [=rock =foam =grit]
  ^-  _rock
  ?-    grit
      [%2 *]
    ?.  ?=(%2 -.rock)
      rock
    (wash-grit-2 rock foam +.grit)
      [%1 *]
    ?.  ?=(%1 -.rock)
      rock
    (wash-grit-1 rock foam +.grit)
    ::
      *
    ?.  ?=(%0 -.rock)
      rock
    (wash-grit-0 rock foam grit)
  ==
::
++  wash-grit-2
  |=  [rock=rock-2 =foam grit=grit-2]
  ^-  rock-2
  ?:  =(%upgrade grit)  rock  :: upgrade should have been handled by +wash-grit
  :-  -.rock
  :-  stir-ids.rock
  ?:  ?=([%set-turf *] grit)  `turf.grit
  :: only %set-turf can change a null turf
  ?:  ?=([%del-turf *] grit)  ~
  ?~  turf.rock  ~
  :-  ~
  =*  turf  u.turf.rock
  =*  players  players.ephemera.turf
  =?  players  &(?=(^ wen.foam) ?=(^ src.foam))
    ?.  (~(has by players) u.src.foam)  players
    %+  ~(jab by players)  u.src.foam
    |=  =player
    player(wake wen.foam)
  ?-    -.grit
    ?(%noop %wake %upgrade)  turf
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
    ?@  from.grit  turf
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
      %add-invite
    =.  invites.deed.turf
      (~(put by invites.deed.turf) id.grit invite.grit)
    turf
      %del-invite
    =.  invites.deed.turf
      (~(del by invites.deed.turf) id.grit)
    turf
  ==
++  wash-grit-1
  |=  [rock=rock-1 =foam grit=grit-1]
  ^-  rock-1
  :-  -.rock
  :-  stir-ids.rock
  ?:  ?=([%set-turf *] grit)  `turf.grit
  :: only %set-turf can change a null turf
  ?~  turf.rock  ~
  =*  turf  u.turf.rock
  =*  players  players.ephemera.turf
  ?-    -.grit
      %add-player
    =.  players
      (~(put by players) ship.grit player.grit)
    `turf
      *
    turf:(wash-newer `rock-1`rock foam 1+grit)
  ==
++  wash-grit-0
  |=  [rock=rock-0 =foam grit=grit-0]
  ^-  rock-0
  :-  -.rock
  :-  stir-ids.rock
  ?:  ?=([%set-turf *] grit)  `turf.grit
  :: only %set-turf can change a null turf
  ?~  turf.rock  ~
  =*  turf  u.turf.rock
  ?@  grit
    ?-  grit
      %noop  turf.rock
      %del-turf  ~
        %inc-counter
      `turf(stuff-counter.plot +(stuff-counter.plot.turf))
    ==
  ?-    -.grit
      *
    turf:(wash-newer `rock-0`rock foam grit) :: would be 0+grit if everything was versioned properly
  ==
++  wash-newer
  |*  [=rock =foam =grit]
  ^+  rock
  (downgrade-rock (wash-grit-v (upgrade-rock rock) foam grit))
++  fully-upgrade-rock
  |=  =rock
  ^-  current-rock
  |-
  ?:  ?=(current-rock-v -.rock)
    rock
  $(rock (upgrade-rock rock))
  :: =?  rock  ?=(%0 -.rock)
  ::   (rock-0-to-1 rock)
  :: ?>  ?=(current-rock-v -.rock)
  :: rock
++  upgrade-rock
  |*  [=rock]
  ?-  -.rock
    %0  (rock-0-to-1 rock)
    %1  (rock-1-to-2 rock)
    %2  rock
  ==
++  downgrade-rock
  |*  =rock
  ?-  -.rock
    %0  rock
    %1  (rock-1-to-0 rock)
    %2  (rock-2-to-1 rock)
  ==
++  rock-0-to-1
  |=  rock=rock-0
  ^-  rock-1
  :-  %1
  :-  stir-ids.rock
  ?~  turf.rock  ~
  :-  ~
  =*  turf  u.turf.rock
  =/  =deed:turf-1
    :-  *invites:turf-1
    deed.turf
  [ephemera.turf deed plot.turf]
++  rock-1-to-0
  |=  rock=rock-1
  ^-  rock-0
  :-  %0
  :-  stir-ids.rock
  ?~  turf.rock  ~
  :-  ~
  =*  turf  u.turf.rock
  =/  =deed:turf-0  +.deed.turf
  [ephemera.turf deed plot.turf]
++  rock-1-to-2
  |=  rock=rock-1
  ^-  rock-2
  :-  %2
  :-  stir-ids.rock
  ?~  turf.rock  ~
  :-  ~
  =*  turf  u.turf.rock
  =/  =players:turf-2
    %-  ~(run by players.ephemera.turf)
    |=  =player:turf-1
    ^-  player:turf-2
    [~ player]
  turf(players.ephemera players)
++  rock-2-to-1
  |=  rock=rock-2
  ^-  rock-1
  :-  %1
  :-  stir-ids.rock
  ?~  turf.rock  ~
  :-  ~
  =*  turf  u.turf.rock
  =/  =players:turf-1
    %-  ~(run by players.ephemera.turf)
    |=  =player:turf-2
    ^-  player:turf-1
    +.player
  turf(players.ephemera players)
--