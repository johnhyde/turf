/-  *turf-4
/-  pold=pond-3
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
:: ++  wash  wash-grit
--
|%
+$  rock  $+  pond-rock  [%4 =stir-ids turf=(unit turf)]
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
      [%set-name name=@t]
      [%set-back back=background]
      [%size-turf off-size]
      [%add-form form-spec]
      [%del-form =form-id]
      [%add-shade add-shade-spec]
      [%del-shade =shade-id]
      [%move-shade =shade-id pos=svec2]
      [%tele-shade =shade-id pos=svec2]
      [%cycle-shade =shade-id amt=@ud]
      [%set-shade-var =shade-id variation=@ud]
      [%set-shade-effect =shade-id =trigger effect=(unit possible-effect)]
      [%reset-shade-effects =shade-id]
      [%set-shade-collidable =shade-id collidable=(unit ?)]
      [%set-shade-form-id =shade-id =form-id]
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
  $%  [what=%unavailable ~]
      [what=%future ~]
      [what=%rock =rock]
      [what=%wave foam =grits]

  ==
::  let's us create a shade and/or portal
::  and link them in one transaction
+$  create-bridge-goal
  $:  %create-bridge
      shade=?(shade-id add-shade-spec) 
      =trigger
      portal=?(portal-id turf-id)
      :: link=(unit ?(%lunk %dink))
  ==
+$  goal
  $%  cur-grit
      [%atomic depth=$~(20 @) goals=(list goal)]
      [%call ships=(set ship) ~]
      [%send-chat from=ship text=cord]
      [%click =shade-id]
      [%interact =shade-id]
      [%apply-effect =effect =shade-id]
      ::
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
  =/  players  (~(run by players.ephemera.turf) uplr)
  =/  port-reqs
    %-  ~(run by port-reqs.deed.turf)
    |=  [pid=portal-id vtr=avatar:pold]
    pid^(uvtr vtr)
  =/  plot  (uplt plot.turf)
  %=  turf
    players.ephemera  players
    port-reqs.deed  port-reqs
    plot  plot
  ==
++  uplr
  |=  plr=player:pold
  ^-  player
  plr(avatar (uvtr avatar.plr))
++  uplt
  |=  plt=plot:pold
  ^-  plot
  :-  color+0xa6.e4e8
  :^  size.plt  offset.plt  tile-size.plt
  =/  [=spaces cav=cave count=@ud]
    =/  acc  [spaces=*spaces cav=cave.plt count=stuff-counter.plt]
    %-  ~(rep by spaces.plt)
    |=  [[pos=svec2 spc=space:pold] _acc]
    ^-  _acc
    ?~  tile.spc
      :-  (~(put by spaces) pos spc)
      [cav count]
    :+  (~(put by spaces) pos spc(tile `count))
      (~(put by cav) count [pos u.tile.spc])
    +(count)
  =/  sky  (~(run by skye.plt) ufrm)
  [spaces sky cav count]
::
++  ugrt
  |=  g=vrit
  ^-  grit
  ?+  g                  $(g (ugrt:pold g))
    [cur-grit-v *]       g
    [cur-grit-v:pold *]  (grit-to-next g)
  ==
++  grit-to-next
  |=  [g=grit:pold]
  ^-  grit
  =/  grit  +.g
  :-  *cur-grit-v
  ?+  -.grit  grit
    %set-turf
      grit(turf (turf-to-next turf.grit))
    %add-form
      grit(form (ufrm form.grit))
    %add-husk  [%add-shade +.grit]
    %cycle-husk
      ?^  husk-id.grit  noop+~
      [%cycle-shade +.grit]
    %set-husk-var
      ?^  husk-id.grit  noop+~
      [%set-shade-var +.grit]
    %set-husk-effect
      ?^  husk-id.grit  noop+~
      [%set-shade-effect +.grit]
    %set-husk-collidable
      ?^  husk-id.grit  noop+~
      [%set-shade-collidable +.grit]
    %set-avatar
      grit(avatar (uvtr avatar.grit))
    %add-port-req
      grit(avatar (uvtr avatar.grit))
    %add-player
      grit(avatar.player (uvtr avatar.player.grit))
  ==
--
