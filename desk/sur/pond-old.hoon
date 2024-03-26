/-  *turf-2, turf-0, turf-1, turf-2
=<
|%
++  name  %pond
+$  rock  ^rock
+$  vock  ^vock
+$  grit  ^grit
+$  vrit  grit-all
+$  goal  ^goal
+$  foam  ^foam  :: from sur/turf
+$  foam-all  ^foam-all
++  urck  fully-upgrade-rock
++  ugrt  fully-upgrade-grit
:: ++  wash  wash-grit
--
|%
+$  rock  rock-2
+$  rock-v  _-:*rock
+$  vock
  $%  rock-0
      rock-1
      rock-2
  ==
+$  rock-0  [%0 =stir-ids turf=(unit turf:turf-0)]
+$  rock-1  [%1 =stir-ids turf=(unit turf:turf-1)]
+$  rock-2  [%2 =stir-ids turf=(unit turf:turf-2)]
+$  stir-ids  (map ship @t)

::
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
      [%add-form form-spec]
      [%set-shade-effect =shade-id =trigger effect=(unit possible-effect)]
      [%set-avatar =ship =avatar]
      [%add-port-req =ship from=$@(?(~ invite-id) [~ u=portal-id]) =avatar]
      [%add-player =ship =player]
      [%cycle-husk =husk-id amt=@ud]
      [%set-husk-var =husk-id variation=@ud]
      [%set-husk-effect =husk-id =trigger effect=(unit possible-effect)]
      [%set-husk-collidable =husk-id collidable=(unit ?)]
      :: properly override previous definition
      $<  $?  %set-turf
              %add-form
              %set-shade-effect
              %set-avatar
              %add-port-req
              %add-player
          ==
      grit-1
  ==
+$  cur-grit  grit-2
+$  cur-grit-v  %2
+$  grit
  $+  pond-grit
  $&  grit-all  fully-upgrade-grit
++  fully-upgrade-grit
  |=  g=grit-all
  ^-  [cur-grit-v cur-grit]
  ?:  ?=([cur-grit-v *] g)
    g
  $(g (upgrade-grit g))
++  upgrade-grit
  |*  grit=grit-all
  ?@  grit  (grit-0-to-1 grit)
  ?+  -.grit  (grit-0-to-1 grit)
    %1  (grit-1-to-2 grit)
    %2  grit
  ==
++  grit-0-to-1
  |=  grit=grit-0
  ^-  [%1 grit-1]
  :-  %1
  ?@  grit
    ?-  grit
      ?(%noop %inc-counter)  noop+~
      %del-turf  del-turf+~
    ==
  ?+    -.grit  grit
      %set-turf
    grit(turf (turf-0-to-1 turf.grit))
  ==
++  grit-1-to-2
  |=  [%1 grit=grit-1]
  ^-  [%2 grit-2]
  :-  %2
  ?+    -.grit  grit
      %set-turf
    grit(turf (turf-1-to-2 turf.grit))
      %add-player
    grit(player (player-1-to-2 player.grit))
  ==
::
+$  grit-all
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
  $%  grit-2
      goal-2-only
  ==
++  goal-2-only
  =,  turf-2
  $%  [%call ships=(set ship) ~]
      [%send-chat from=ship text=cord]
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

:: upgrade
++  fully-upgrade-rock
  |=  rock=vock
  ^-  ^rock
  |-
  ?:  ?=(rock-v -.rock)
    rock
  $(rock (upgrade-rock rock))
++  upgrade-rock
  |*  rock=vock
  ?-  -.rock
    %0  (rock-0-to-1 rock)
    %1  (rock-1-to-2 rock)
    %2  rock
  ==
++  rock-v-to-v
  |*  to=$-(* *)
  |*  rock=vock
  :-  ?-(-.rock %0 %1, %1 %2, %2 %2)
  :-  stir-ids.rock
  ?~  turf.rock  ~
  :-  ~
  (to u.turf.rock)
++  rock-0-to-1  (rock-v-to-v turf-0-to-1)
++  rock-1-to-2  (rock-v-to-v turf-1-to-2)
:: to 1
++  turf-0-to-1
  |=  turf=turf:turf-0
  ^-  turf:turf-1
  =/  =deed:turf-1
    :-  *invites:turf-1
    deed.turf
  [ephemera.turf deed plot.turf]
:: to 2
++  turf-1-to-2
  |=  turf=turf:turf-1
  ^-  turf:turf-2
  =/  =players:turf-2
    (~(run by players.ephemera.turf) player-1-to-2)
  turf(players.ephemera players)
++  player-1-to-2
  |=  =player:turf-1
  ^-  player:turf-2
  [~ player]
--
