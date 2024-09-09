/-  *turf
/-  pold=pond-4
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
+$  rock  $+  pond-rock  [%5 =stir-ids turf=(unit turf)]
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
      [%set-autoconfirm-dinks confirm=?]
      [%size-turf off-size]
      [%add-form form-spec]
      [%del-form =form-id]
      [%add-shade add-shade-spec]
      [%del-shade =shade-id]
      [%move-shade =shade-id pos=svec2 collide=? smooth=?]
      [%cycle-shade =shade-id amt=@ud]
      [%set-shade-var =shade-id variation=@ud]
      [%set-shade-fx =shade-id fx=(unit fx)]
      [%set-shade-effect =shade-id trigger=root-condition effect=(unit effect)]
      [%set-shade-collidable =shade-id collidable=(unit ?)]
      [%set-shade-form-id =shade-id =form-id]
      [%set-default-perm =perm]
      [%set-player-perm =ship =perm]
      [%del-player-perm =ship]
      ::  secret grits
      [%set-gate gate=(unit shade-id)]
      [%set-lunk lunk=(unit portal-id)]
      [%add-dink =portal-id]
      [%del-dink =portal-id]
      ::  end secret grits
      [%add-portal for=turf-id at=(unit portal-id)]
      [%del-portal =portal-id loud=?]
      [%set-portal-outlet =portal-id =outlet]
      [%confirm-portal =portal-id]
      [%revive-portal =portal-id]
      ::
      [%portal-confirmed from=portal-id at=portal-id]
      [%portal-discarded from=portal-id]
      ::
      [%chat =chat]
      [%move =ship pos=svec2 collide=? smooth=?]
      [%face =ship =dir]
      [%ping-player =ship by=ship]
      [%set-avatar =ship =avatar]
      [%add-invite id=invite-id =invite]
      [%del-invite id=invite-id]
      [%add-port-offer =ship from=portal-id]
      [%nil-port-offer =ship]
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
  $%  [what=%future ~]
      [what=%unavailable ~]
      [what=%kicked ~]
      [what=%rock =rock]
      [what=%wave foam =grits]

  ==
::  let's us create a shade and/or portal
::  and link them in one transaction
+$  create-bridge-goal
  $:  %create-bridge
      shade=?(shade-id add-shade-spec) 
      trigger=root-condition
      portal=?(portal-id turf-id)
  ==
+$  goal
  $%  cur-grit
      [%atomic goals=(list goal)]
      [%grit grit=cur-grit]
      [%move-to-entry ~]
      [%call ships=(set ship) ~]
      [%send-chat from=ship text=cord]
      [%click =shade-id]
      [%interact =shade-id]
      [%tell =shade-id msg=@t]
      :: init-id refers to the item that triggered the effect, if any
      [%pull-trigger ctx=fx-ctx]
      [%apply-effect =effect ctx=fx-ctx]
      ::
      create-bridge-goal
      ::  we are receiving updates about a peer's portal
      ::  these are produced from roars of various goals
      [%portal-requested for=turf-id at=portal-id]
      [%portal-retracted for=turf-id at=portal-id]
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
  $%  [%portal-request from=portal-id for=turf-id]
      [%portal-retract from=portal-id for=turf-id]
      [%portal-confirm from=portal-id for=turf-id at=portal-id]
      [%portal-discard for=turf-id at=portal-id]
      [%portal-hark event=portal-event from=portal-id for=turf-id]
      [%port =ship for=turf-id at=portal-id]
      [%port-offer =ship from=portal-id for=turf-id at=portal-id]
      [%port-reject =ship]
      [%player-add =ship]
      [%player-del =ship]
      [%host-call ships=(set ship) ~]
  ==
+$  roars  (list roar)
::
++  required-perm
  |=  act=?((tags cur-grit) (tags goal))
  ^-  perm
  ?-  act
    $?  %portal-confirmed  %portal-discarded
        %add-port-rec  %add-port-req
        %del-player
        %atomic
        %portal-requested  %portal-retracted
        %port-offer-accepted  %port-offer-rejected
    ==
      %n
    ::
    $?  %noop  %wake  %move  %face
        %ping-player
        %create-bridge
        %move-to-entry
        %call  %send-chat
        %click  %interact  %tell
    ==
      %in
    ::
    $?  %size-turf
        %add-form  %del-form
        %add-shade  %del-shade
        %move-shade
        %cycle-shade
        %set-shade-var
        %set-shade-fx
        %set-shade-effect
        %set-shade-collidable
        %set-shade-form-id
    ==
      %add
    ::
    :: %claim
    ::   %take
    ::
    $?  %set-turf  %del-turf
        %set-name  %set-back
        %set-autoconfirm-dinks
        %set-default-perm
        %set-player-perm  %del-player-perm
        %set-avatar
        %add-portal  %del-portal
        %set-portal-outlet
        %confirm-portal  %revive-portal
        %add-invite  %del-invite
    ==
      %admin
    ::
    $?  %grit
        %chat
        %set-gate  %set-lunk
        %add-dink  %del-dink
        %add-port-offer  %nil-port-offer  %del-port-offer
        %del-port-req  %del-port-rec  %del-port-recs
        %add-player  %import-player
        %pull-trigger  %apply-effect
    ==
      %secret
  ==
::
++  wash-grit
  |=  [=rock foam * grit=cur-grit]
  ^-  ^rock
  :: ?:  ?&  ?=(^ src)  ?=(^ id)
  ::         =(`(need id) (~(get by stir-ids.rock) (need src)))
  ::     ==
  ::   rock
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
  ?-  -.grit
    ?(%noop %wake)  turf
    ::
    %set-name  turf(name.deed name.grit)
    %set-back  turf(back.plot back.grit)
    %set-autoconfirm-dinks  turf(autoconfirm-dinks.deed confirm.grit)
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
    %add-shade  (add-shade turf +>.grit)
    %del-shade  (del-shade turf +.grit)
    %move-shade  (move-shade turf shade-id.grit pos.grit)
    %cycle-shade  (cycle-shade turf +.grit)
    %set-shade-var  (set-shade-var turf +.grit)
    %set-shade-fx  (set-shade-fx turf +.grit)
    %set-shade-effect  (set-shade-effect turf +.grit)
    %set-shade-collidable  (set-shade-collidable turf +.grit)
    %set-shade-form-id  (set-shade-form-id turf +.grit)
    %set-default-perm  turf(default.perms.deed perm.grit)
    %set-player-perm
      turf(except.perms.deed (~(put by except.perms.deed.turf) ship.grit perm.grit))
    %del-player-perm
      turf(except.perms.deed (~(del by except.perms.deed.turf) ship.grit))
    ::
    %set-gate  turf(gate.deed gate.grit)
    %set-lunk  turf(lunk.deed lunk.grit)
    %add-dink
      =.  dinks.deed.turf
        (~(put in dinks.deed.turf) portal-id.grit)
      turf
    %del-dink
      =.  dinks.deed.turf
        (~(del in dinks.deed.turf) portal-id.grit)
      turf
    %add-portal  (add-portal turf for.grit at.grit)
    %del-portal  (del-portal turf portal-id.grit)
    %set-portal-outlet
      %^  jab-by-portals  turf  portal-id.grit
      |=  =portal
      portal(outlet outlet.grit)
    %confirm-portal
      %^  jab-by-portals  turf  portal-id.grit
      |=  =portal
      ?~  at.portal  portal
      portal(pending %.n)
    %revive-portal
      %^  jab-by-portals  turf  portal-id.grit
      |=  =portal
      ?^  at.portal  portal
      portal(pending %.y)
    %portal-confirmed
      %^  jab-by-portals  turf  from.grit
      |=  =portal
      portal(at `at.grit, pending %.n)
    %portal-discarded
      %^  jab-by-portals  turf  from.grit
      |=  =portal
      portal(at ~, pending %.n)
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
    %ping-player
      turf
    %set-avatar
      %^  jab-by-players  turf  ship.grit
      |=  =player
      player(avatar avatar.grit)
    %add-port-offer
      =.  port-offers.deed.turf
        (~(put by port-offers.deed.turf) ship.grit `from.grit)
      turf
    %nil-port-offer
      =.  port-offers.deed.turf
        (~(put by port-offers.deed.turf) ship.grit ~)
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
  =/  plot  (uplt plot.turf)
  %=  turf
    players.ephemera  players
    deed  (uded deed.turf cave.plot.turf)
    plot  plot
  ==
++  uplr
  |=  plr=player:pold
  ^-  player
  plr(avatar (uvtr avatar.plr))
++  uded
  |=  [ded=deed:pold cav=cave:pold]
  ^-  deed
  =/  =portals
    %-  malt
    %+  turn  ~(tap by portals.ded)
    |=  [pid=portal-id ptl=portal:pold]
    :-  pid
    :^  shade-id.ptl  for.ptl  at.ptl
    ?~  at.ptl  %.y
    ?^  shade-id.ptl
      %.n  :: if shade is set, portal is stable
    ?:  ?=([~ %.y] (~(get by dinks.ded) pid))
      %.n  :: dink approved, portal is stable
    %.y  :: no dink approved, pending
  =/  =port-reqs
    %-  ~(run by port-reqs.ded)
    |=  [pid=portal-id vtr=avatar:pold]
    pid^(uvtr vtr)
  =/  [gate=(unit shade-id) lunk=(unit portal-id)]
    ?~  lunk.ded  `~
    :-  `shade-id.u.lunk.ded
    ?~  shade=(~(gut by cav) shade-id.u.lunk.ded ~)
      ~
    ?~  eff=(~(get by effects.shade) %step)
      ~
    ?~  u.eff  ~
    ?.  ?=([%port *] u.u.eff)  ~
    `portal-id.u.u.eff
  =/  back
    :*  portals
        port-reqs
        port-recs.ded
        (~(run by port-offers.ded) some)
        %.n
        gate
        lunk
        ~(key by dinks.ded)
    ==
  ded(|3 back)
++  uplt
  |=  plt=plot:pold
  ^-  plot
  %=  plt
    cave  (~(run by cave.plt) ushd)
    skye  (~(run by skye.plt) ufrm)
  ==
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
    %move-shade
      [%move-shade shade-id.grit pos.grit %.y %.y]
    %tele-shade
      [%move-shade shade-id.grit pos.grit %.n %.n]
    %set-shade-effect
      =/  eff=(unit effect)
        ?~  effect.grit  ~
        ?@  u.effect.grit  ~
        `(ueff u.effect.grit)
      :^  %set-shade-effect  shade-id.grit
        (old-trigger-to-root-condition trigger.grit)
      eff
    %reset-shade-effects
      [%set-shade-fx shade-id.grit ~]
    %set-lunk
      [%set-gate ?~(lunk.grit ~ `shade-id.u.lunk.grit)]
    %set-dink
      [%add-dink portal-id.grit]
    %add-shade-to-portal
      [%set-portal-outlet from.grit `shade-id.grit]
    %del-shade-from-portal
      :: lossy conversion, bc maybe this shade wasn't the outlet
      [%set-portal-outlet from.grit ~]
    %del-portal-from-shade  noop+~  :: even lossier
    %move
      [%move ship.grit pos.grit %.y %.y]
    %tele
      [%move ship.grit pos.grit %.n %.n]
    %set-avatar
      grit(avatar (uvtr avatar.grit))
    %add-port-req
      grit(avatar (uvtr avatar.grit))
    %add-player
      grit(avatar.player (uvtr avatar.player.grit))
  ==
--
