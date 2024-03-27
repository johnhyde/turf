/-  *turf
/-  pold=pond-old
/+  *turf
=<
|%
++  name  %pond
+$  rock  ^rock
+$  vock  ^vock
+$  grit  ^grit
+$  vrit  ^vrit
+$  goal  ^goal
+$  foam  ^foam  :: from sur/turf
+$  voam  foam-all
++  urck  ^urck
++  ugrt  ^ugrt
++  ufam  foam
++  wash  wash-grit
--
|%
+$  rock  $+  pond-rock  [%3 =stir-ids turf=(unit turf)]
+$  rock-v  _-:*rock
+$  vock
  :: $%  [%future ~]
      :: vock:pold
  $%  vock:pold
      rock
  ==

+$  grit  $+  pond-grit  [cur-grit-v cur-grit]
+$  vrit  $%(vrit:pold grit)
+$  cur-grit-v  rock-v
+$  cur-grit
  $%  [%noop ~]
      [%wake ~]
      [%set-turf =turf]
      [%del-turf ~]
      [%size-turf off-size]
      [%add-form form-spec]
      [%del-form =form-id]
      [%add-husk add-husk-spec]
      [%del-shade =shade-id]
      [%move-shade =shade-id pos=svec2]
      [%cycle-husk =husk-id amt=@ud]
      [%set-husk-var =husk-id variation=@ud]
      [%set-husk-effect =husk-id =trigger effect=(unit possible-effect)]
      [%set-husk-collidable =husk-id collidable=(unit ?)]
      [%set-lunk lunk=(unit lunk)]
      [%set-dink =portal-id approved=?]
      [%del-dink =portal-id]
      [%add-portal for=turf-id at=(unit portal-id)]
      [%del-portal from=portal-id loud=?]
      ::  secret grits
      [%add-shade-to-portal from=portal-id =shade-id]
      [%del-shade-from-portal from=portal-id =shade-id]
      [%del-portal-from-shade =shade-id =portal-id]
      ::
      [%portal-confirmed from=portal-id at=portal-id]
      ::
      [%chat =chat]
      [%move =ship pos=svec2]
      [%tele =ship pos=svec2]
      [%face =ship =dir]
      [%ping-player =ship by=ship]
      [%set-avatar =ship =avatar]
      [%add-invite id=invite-id =invite]
      [%del-invite id=invite-id]
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
+$  grits  (list grit)
+$  cur-grits  (list cur-grit)
::
+$  stir
  $+  pond-stir
  $:  =turf-id
      id=stir-id
      =goals
  ==
::
+$  stirred
  $%  [what=%rock =rock]
      [what=%wave foam =grits]
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
+$  goal
  $%  cur-grit
      [%call ships=(set ship) ~]
      [%send-chat from=ship text=cord]
      [%join-player =ship =avatar]
      [%approve-dink =portal-id]
      create-bridge-goal
      ::  we are receiving updates about a peer's portal
      ::  these are produced from roars of various goals
      [%portal-requested for=turf-id at=portal-id is-link=?]
      [%portal-retracted for=turf-id at=portal-id]
      [%portal-discarded from=portal-id]
      ::
      [%port-offer-accepted =ship from=portal-id]
      [%port-offer-rejected =ship from=portal-id]
      [%import-player =ship from=$@(?(~ invite-id) [~ u=portal-id]) =avatar]
  ==
+$  goals  (list goal)
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
  |=  [=rock foam * grit=cur-grit]
  ^-  ^rock
  =?  stir-ids.rock  &(?=(^ src) ?=(^ id))
    (~(put by stir-ids.rock) (need src) (need id))
  :+  -.rock  stir-ids.rock
  ?:  ?=([%set-turf *] grit)  `turf.grit
  :: only %set-turf can change a null turf
  ?:  ?=([%del-turf *] grit)  ~
  ?~  turf.rock  ~
  :-  ~
  =*  turf  u.turf.rock
  =*  players  players.ephemera.turf
  =?  players  &(?=(^ wen) ?=(^ src))
    ?.  (~(has by players) u.src)  players
    %+  ~(jab by players)  u.src
    |=  =player
    player(wake wen)
  ?-    -.grit
    ?(%noop %wake)  turf
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
    %cycle-husk  (cycle-husk turf +.grit)
    %set-husk-var  (set-husk-var turf +.grit)
    %set-husk-effect  (set-husk-effect turf +.grit)
    %set-husk-collidable  (set-husk-collidable turf +.grit)
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
::
:: upgrades
++  urck
  |=  rock=vock
  ^-  ^rock
  ?+  -.rock     $(rock (urck:pold rock))
    rock-v       rock
    :: %future      *^rock
    rock-v:pold  (rock-to-next rock)
  ==
++  rock-to-next
  |=  =rock:pold
  :+  *rock-v  stir-ids.rock
  ?~  turf.rock  ~
  :-  ~
  (turf-to-next u.turf.rock)
++  turf-to-next
  |=  =turf:pold
  ^-  ^turf
  turf(deed 'Main Turf'^deed.turf)
::
++  ugrt
  |=  g=vrit
  ^-  grit
  ?+  g                        $(g (ugrt:pold g))
    [cur-grit-v *]             g
    [cur-grit-v:pold *]  (grit-to-next g)
  ==
++  grit-to-next
  |=  [g=grit:pold]
  ^-  grit
  =/  grit  +.g
  :-  *cur-grit-v
  ?+    -.grit  grit
      %set-turf
    grit(turf (turf-to-next turf.grit))
      %upgrade
    noop+~
      %cycle-shade
    [%cycle-husk +.grit]
      %set-shade-var
    [%set-husk-var +.grit]
      %set-shade-effect
    [%set-husk-effect +.grit]
  ==
--
