/-  *turf, pond, mist
/+  *turf, vita-client
|%
:: +$  [=bowl:gall =rock:pond top=?]
++  filter-mist-goal
  |=  [[=bowl:gall =rock:mist top=?] [pre-roars=roars:mist closet=skye] =goal:mist]
  =*  roar  roar:mist
  =*  roars  roars:mist
  ^-  [[roars skye] grits:mist goals:mist]
  =-  [[(weld pre-roars roars) closet] (turn grits (lead *cur-grit-v:mist)) goals]
  ^-  [=roars grits=cur-grits:mist =goals:mist]
  :: ~&  "filtering mist goal {<?@(goal goal -.goal)>}, top: {<top>}"
  ?+    -.goal  `~[goal]~
      %set-ctid
    ?:  =(ctid.rock turf-id.goal)  ``~
    :-  ?~  ctid.rock  ~
        [%turf-exit u.ctid.rock]~
    ~[goal]~
      %add-thing-from-closet
    =/  form  (~(get by closet) form-id.goal)
    ?~  form  ``~
    :-  roars=~
    :-  grits=~
    :_  ~
    :-  %add-thing
    ^-  thing
    :-  [form-id.goal 0 *husk-bits]
    u.form
      %update-things-from-closet
    :: look through things, update forms that are out of date and delete things that have no reference form in the closet anymore
    :-  ~
    :_  ~
    =/  things  things.avatar.rock
    =|  i=@ud
    =|  grits=cur-grits:mist
    |-
    ^-  cur-grits:mist
    ?~  things  grits
    =*  ting  i.things
    %=  $
      i       +(i)
      things  t.things
        grits
      ?:  !(~(has by closet) form-id.ting)
        [[%del-thing i] grits]
      =/  new-form  (~(got by closet) form-id.ting)
      ?:  =(new-form form.ting)
        grits
      :_  grits
      :+  %set-thing  i
      ting(form new-form)
    ==
      %port-offered
    :-  ~
    ?.  ?@  via.goal
          =(src.bowl ship.for.goal)
        =(src.bowl ship.of.u.via.goal)
      `~
    ?.  =(`for.goal ttid.rock)
      ~[goal]~
    `[%export-self +.goal]~
      %accept-port-offer
    :-  ~
    ?~  port-offer.rock  ~[goal]~
    ?.  =(for.goal for.u.port-offer.rock)
      ~[goal]~
    `[%export-self u.port-offer.rock]~
      %reject-port-offer
    :-  ?~  off=port-offer.rock  ~
        ?@  via.u.off  ~
        [%port-offer-reject of.u.via.u.off from.u.via.u.off]~
    ~[goal]~
      %export-self
    :-  [%port-offer-accept +.goal]~
    `[[%clear-port-offer ~] [%set-ctid `for.goal] ~]
      %port-accepted
    :_  `~
    ?.  =(ship.for.goal src.bowl)  ~
    ?.  =(`for.goal ctid.rock)  ~
    [%turf-join for.goal]~
      ?(%port-rejected %kicked)
    :-  ~
    :-  ~
    ?.  =(ship.for.goal src.bowl)  ~
    ?.  =(`for.goal ctid.rock)  ~
    [%set-ctid ~]~
  ==
++  filter-pond-goal
  |=  [[=bowl:gall =rock:pond top=?] pre-roars=roars:pond =goal:pond]
  =*  roar  roar:pond
  =*  roars  roars:pond
  ^-  [roars grits:pond goals:pond]
  :: :-  ~
  =-  [(weld pre-roars roars) (turn grits (lead *cur-grit-v:pond)) goals]
  ^-  [=roars grits=cur-grits:pond =goals:pond]
  :: ~&  "filtering pond goal {<?@(goal goal -.goal)>}, top: {<top>}"
  :: ~&  "filtering pond goal {<-.goal>}, top: {<top>}"
  =/  uturf  turf.rock
  ?~  uturf
    ?+    goal  ``~
        [%set-turf *]
      ?.  =(our.bowl src.bowl)
        ``~
      `~[goal]~
    ==
  =*  turf  u.uturf
  ?+    -.goal  `~[goal]~
      %add-husk
    :-  ~
    :-  [goal]~
    ?.  is-lunk.goal  ~
    [%set-lunk `[stuff-counter.plot.turf %.n]]~
      %del-shade
    =/  shade-fx  (get-effects-by-shade-id turf shade-id.goal)
    ?~  shade-fx  ``~
    =/  portal-counts  (count-portal-effects full-fx.u.shade-fx)
    =/  =goals:pond
      %+  turn  ~(tap in ~(key by portal-counts))
      |=  =portal-id
      [%del-shade-from-portal portal-id shade-id.goal]
    =.  goals
      ?~  lunk.deed.turf  goals
      ?.  =(shade-id.goal shade-id.u.lunk.deed.turf)
        goals
      [[%set-lunk ~] goals]
    [~ [goal]~ goals]
      %move-shade
    =/  pos  (clamp-pos pos.goal offset.plot.turf size.plot.turf)
    `~[goal(pos pos)]~
      %set-husk-effect
    ?^  husk-id.goal  `~[goal]~  :: todo: properly support tile portals
    =/  shade-fx  (get-effects-by-shade-id turf husk-id.goal)
    ?~  shade-fx  ``~
    =,  u.shade-fx
    =/  og-effect  (~(get by full-fx) trigger.goal) 
    =/  del-portal-id=(unit portal-id)
      ?~  og-effect  ~
      (get-maybe-effect-portal u.og-effect)
    =/  add-portal-id  (get-maybe-effect-portal effect.goal)
    ?:  ?&  !=(del-portal-id add-portal-id)
            ?=(^ add-portal-id)
            (portal-is-dink turf u.add-portal-id)
            !(dink-is-approved turf u.add-portal-id)
        ==
      :: don't add shades to unapproved dinks
      ``~
    =/  =goals:pond
      ?:  =(del-portal-id add-portal-id)
        ~
      =/  portal-counts  (count-portal-effects full-fx)
      %+  weld
        ^-  goals:pond
        ?~  add-portal-id  ~
        ?:  (~(has by portal-counts) u.add-portal-id)
          ~
        [%add-shade-to-portal u.add-portal-id husk-id.goal]~
      ^-  goals:pond
      ?~  del-portal-id  ~
      =/  count  (~(gut by portal-counts) u.del-portal-id 0)
      ?:  (gth count 1)  ~
      [%del-shade-from-portal u.del-portal-id husk-id.goal]~
    [~ [goal]~ goals]
    ::
    ::   %add-lunk
    :: ?:  &(top !=(our src):bowl)  ``~
    :: :-  ~
    :: :-  ~
    :: :~  [%add-husk +.goal]
    ::     [%set-lunk `[stuff-counter.plot.turf %.n]]
    :: ==
      %set-lunk
    ?:  =(+.goal lunk.deed.turf)
      ``~
    =/  =goals:pond
      ?~  lunk.goal
        ?~  lunk.deed.turf  ~  :: vain
        =/  shade  (~(gut by cave.plot.turf) shade-id.u.lunk.deed.turf ~)
        ?~  shade  ~
        ?.  =(1 variation.shade)  ~
        :: active lunk is being 
        [%set-husk-var shade-id.u.lunk.deed.turf 0]~
      =/  shade  (~(gut by cave.plot.turf) shade-id.u.lunk.goal ~)
      ?~  shade  ~  :: todo cancel goal in this case
      ?.  =(/gate (scag 1 form-id.shade))  ~
      ::  This is kinda goofy, but since %.y=0 and %.n=1
      ::  We set the variation to be !approved
      ::  Because variation 0 is for unapproved
      ::  and variation 1 is for an approved lunk
      ?.  =(approved.u.lunk.goal variation.shade)  ~
      [%set-husk-var shade-id.u.lunk.goal `@`!approved.u.lunk.goal]~
    [~ [goal]~ goals]
      %approve-dink
    ?.  (portal-is-dink turf portal-id.goal)  ``~
    =/  portal  (~(gut by portals.deed.turf) portal-id.goal ~)
    ?:  ?|(?=(~ portal) ?=(~ at.portal))
      ``[%del-dink portal-id.goal]~
    :-  [%portal-confirm from=portal-id.goal for.portal u.at.portal]~
    `[%set-dink portal-id.goal %.y]~
    ::
      %create-bridge
    :: $:  %create-bridge
    ::     shade=?(shade-id add-add-husk-spec) 
    ::     =trigger
    ::     portal=?(portal-id turf-id)
    :: ==
    =/  is-approved-dink
      ?^  portal.goal  %.n
      ?.  (dink-is-approved turf portal.goal)  %.n
      =/  portal  (~(gut by portals.deed.turf) portal.goal ~)
      ?~  portal  %.n
      =(src.bowl ship.for.portal)
    ?:  &(top !=(our src):bowl !is-approved-dink)  ``~
    =/  shade-id
      ?@  shade.goal  shade.goal
      stuff-counter.plot.turf
    =/  portal-id
      ?@  portal.goal  portal.goal
      ?^  shade.goal  +(shade-id)
      stuff-counter.plot.turf
    =/  is-lunk
      ?^  shade.goal  is-lunk.shade.goal
      (shade-is-lunk turf shade.goal)
    =/  dest=(unit ship)
      ?^  portal.goal  `ship.portal.goal
      =/  portal  (~(gut by portals.deed.turf) portal.goal ~)
      ?~  portal  ~
      `ship.for.portal
    ?~  dest  ``~
    ?.  |(is-lunk is-approved-dink =((is-host our.bowl) (is-host u.dest)))  ``~
    =/  =goals:pond
      %+  murn
        ^-  (list (unit cur-grit:pond))
        :~  ?@(shade.goal ~ `[%add-husk shade.goal])
            ?@(portal.goal ~ `[%add-portal portal.goal ~])
            `[%set-husk-effect shade-id trigger.goal `port+portal-id]
        ==
      same
    ``goals
    ::
      %add-portal
    ?:  &(top !=(our src):bowl)  ``~
    `~[goal]~
    ::
      %del-portal
    =/  is-dink
      ?.  (portal-is-dink turf from.goal)  %.n
      =/  portal  (~(gut by portals.deed.turf) from.goal ~)
      ?~  portal  %.n
      =(src.bowl ship.for.portal)
    ?:  &(top !=(our src):bowl !is-dink)  ``~
    =/  portal  (~(get by portals.deed.turf) from.goal)
    ?~  portal  ``~
    =/  roars
      ?.  loud.goal  ~
      ?~  at.u.portal
        [%portal-retract from.goal for.u.portal]~
      [%portal-discard for.u.portal u.at.u.portal]~
    =/  grits  [goal]~
    =/  =goals:pond  [%del-port-recs from.goal]~
    =?  goals  ?=(^ shade-id.u.portal)
      :_  goals
      [%del-portal-from-shade u.shade-id.u.portal from.goal]
    =?  goals  (~(has by dinks.deed.turf) from.goal)
      :_  goals
      [%del-dink from.goal]
    [roars grits goals]
    ::
      %add-shade-to-portal
    =/  portal  (~(gut by portals.deed.turf) from.goal ~)
    ?~  portal  ``~
    =/  is-link  (shade-is-lunk turf shade-id.goal)
    =/  roars
      ?^  shade-id.portal  ~
      ?~  at.portal
        [%portal-request from.goal for.portal is-link]~
      ?:  is-link  ~  :: we've already confirmed it when we approved the dink
      [%portal-confirm from.goal for.portal u.at.portal]~
    =/  =goals:pond
      ?~  shade-id.portal  ~
      ?:  =(shade-id.portal `shade-id.goal)
        ~
      [%del-portal-from-shade u.shade-id.portal from.goal]~
    =?  goals  is-link
      :_  goals
      [%set-lunk `[shade-id.goal %.n]]
    [roars [goal]~ goals]
    ::
      %del-shade-from-portal
    =/  portal  (~(get by portals.deed.turf) from.goal)
    ?~  portal  ``~
    ?.  =(shade-id.u.portal `shade-id.goal)
      ``~
    =/  =goals:pond  [%del-portal from.goal loud=%.y]~
    =?  goals  (shade-is-lunk turf shade-id.goal)
      :_  goals
      [%set-lunk `[shade-id.goal %.n]]
    [~ [goal]~ goals]
    ::
      %del-portal-from-shade
    =/  shade  (~(gut by cave.plot.turf) shade-id.goal ~)
    ?~  shade  ``~
    =/  =goals:pond
      ?.  =(/portal (scag 1 form-id.shade))  ~
      =/  shade-fx  (get-effects-by-shade turf shade)
      =/  portal-counts  (count-portal-effects full-fx.shade-fx)
      ?.  (~(has by portal-counts) portal-id.goal)
        ~
      ?.  =(~(wyt by portal-counts) 1)
        ~
      [%del-shade shade-id.goal]~
    =?  goals  (shade-is-lunk turf shade-id.goal)
      :_  goals
      [%set-lunk `[shade-id.goal %.n]]
    [~ [goal]~ goals]
    ::
      %portal-requested
    ?.  =(src.bowl ship.for.goal)  ``~
    ?.  |(is-link.goal =((is-host our.bowl) (is-host src.bowl)))
      :_  `~
      [%portal-discard for.goal at.goal]~
    =/  dink-id  stuff-counter.plot.turf
    :-  [%portal-hark %requested is-link.goal dink-id for.goal]~
    :-  ~
    ^-  goals:pond
    :-  [%add-portal for.goal `at.goal]
    ?.  is-link.goal  ~
    :-  [%set-dink dink-id %.n]
    ?.  =(our.bowl ~pandux)  ~
    [%approve-dink dink-id]~
    ::
      %portal-retracted
    ?.  =(src.bowl ship.for.goal)  ``~
    =/  portals  ~(tap by portals.deed.turf)
    =/  portal-id
      |-  ^-  (unit portal-id)
      ?~  portals  ~
      =/  portal  q.i.portals
      ?:  &(=(for.goal for.portal) =(`at.goal at.portal))
        `p.i.portals
      $(portals t.portals)
    :: ~&  "we got this portal id based on our search: {<portal-id>}"
    ?~  portal-id  ``~
    =/  is-link  (portal-is-dink turf u.portal-id)
    :-  [%portal-hark %retracted is-link u.portal-id for.goal]~
    `[%del-portal u.portal-id loud=%.n]~
    ::
      %portal-confirmed
    =/  portal  (~(get by portals.deed.turf) from.goal)
    ?~  portal  ``~
    ?.  =(src.bowl ship.for.u.portal)  ``~
    =/  lunk-id=(unit shade-id)
      ?~  shade-id.u.portal  ~
      ?.  (shade-is-lunk turf u.shade-id.u.portal)
        ~
      `u.shade-id.u.portal
    :-  [%portal-hark %confirmed ?=(^ lunk-id) from.goal for.u.portal]~
    :-  [goal]~
    ?~  lunk-id  ~
    [%set-lunk `[u.lunk-id %.y]]~
    ::
      %portal-discarded
    =/  portal  (~(gut by portals.deed.turf) from.goal ~)
    ?~  portal  ``~
    ?.  =(src.bowl ship.for.portal)  ``~
    =/  is-link
      ?|  (portal-is-dink turf from.goal)
          (portal-is-lunk turf portal)
      ==
    :-  [%portal-hark ?~(at.portal %rejected %discarded) is-link from.goal for.portal]~
    `[%del-portal from.goal loud=%.n]~
    ::
      %send-chat
    ?.  =(src.bowl from.goal)  ``~
    ``[%chat from.goal now.bowl text.goal]~
      %move
    ?.  =(src.bowl ship.goal)  ``~
    =*  players  players.ephemera.turf
    =/  player  (~(get by players) ship.goal)
    ?~  player  ``~
    =/  pos  (clamp-pos pos.goal offset.plot.turf size.plot.turf)
    =/  player-colliding  (get-collidable turf pos.u.player)
    =/  will-be-colliding  (get-collidable turf pos)
    ?:  &(will-be-colliding !player-colliding)
      :: todo: get bump effects
      =/  bump=[=roars =goals:pond]  (pull-trigger turf ship.goal %bump pos.u.player)
      [roars.bump ~ goals.bump]
    ::  todo merge with identical code in %tele
    ?:  =(pos pos.u.player)  ``~
    =/  leave=[roars goals:pond]  (pull-trigger turf ship.goal %leave pos.u.player)
    =/  step=[roars goals:pond]  (pull-trigger turf ship.goal %step pos)
    :-  (weld -.leave -.step)
    :-  [goal(pos pos)]~
    (weld +.leave +.step)
      %tele
    ?:  &(top !=(our src):bowl)  ``~
    =*  players  players.ephemera.turf
    =/  player  (~(get by players) ship.goal)
    ?~  player  ``~
    =/  pos  (clamp-pos pos.goal offset.plot.turf size.plot.turf)
    ::  todo merge with identical code in %move
    ?:  =(pos pos.u.player)  ``~
    =/  leave=[roars goals:pond]  (pull-trigger turf ship.goal %leave pos.u.player)
    =/  step=[roars goals:pond]  (pull-trigger turf ship.goal %step pos)
    :-  (weld -.leave -.step)
    :-  [goal(pos pos)]~
    (weld +.leave +.step)
      %ping-player
    ?.  =(src.bowl by.goal)  ``~
    `~[goal]~
    ::
      %port-offer-accepted
    ?.  =(src.bowl ship.goal)  ``~
    =/  offer  (~(get by port-offers.deed.turf) ship.goal)
    ?~  offer  ``~
    =/  portal  (~(gut by portals.deed.turf) u.offer ~)
    ?:  |(?=(~ portal) ?=(~ at.portal))
      ``[%del-port-offer ship.goal]~
    :: ?~  at.portal  ``~
    :-  [%port ship.goal for.portal u.at.portal]~
    `[%del-player ship.goal]~
      %port-offer-rejected
    ?.  =(src.bowl ship.goal)  ``~
    =/  offer  (~(get by port-offers.deed.turf) ship.goal)
    ?~  offer  ``~
    ?.  =(u.offer from.goal)  ``~
    ``[%del-port-offer ship.goal]~
    ::
      %import-player
    ?:  &(top !=(our src):bowl)  ``~
    :-  ~
    :-  ~
    =/  pos=(unit svec2)
      ?@  from.goal  `(get-entry-pos turf)
      =/  portal  (~(gut by portals.deed.turf) u.from.goal ~)
      ?~  portal  ~
      ?~  shade-id.portal
        ?.  (dink-is-approved turf u.from.goal)  ~
        `(get-entry-pos turf)
        :: lunk if dink
      =/  shade  (~(gut by cave.plot.turf) u.shade-id.portal ~)
      ?~  shade  ~
      `pos.shade
    ?~  pos  ~
    =|  =player
    =.  wake.player  `now.bowl
    =.  pos.player  u.pos
    =.  avatar.player  avatar.goal
    %+  murn
      ^-  (list (unit goal:pond))
      :~  `[%add-player ship.goal player]
        ::
          ?@  from.goal  ~
          ?.  (~(has ju port-recs.deed.turf) u.from.goal ship.goal)
            ~
          `[%del-port-rec u.from.goal ship.goal]
        ::
          ?.  (~(has by port-reqs.deed.turf) ship.goal)
            ~
          `[%del-port-req ship.goal]
      ==
    same
      %add-port-offer
    =/  portal  (~(gut by portals.deed.turf) from.goal ~)
    ?~  portal  ``~
    ?~  at.portal  ``~
    =/  is-lunk=?
      ?~  shade-id.portal  %.n
      (shade-is-lunk turf u.shade-id.portal)
    ?:  &(is-lunk !(lunk-is-approved turf))  ``~
    :-  [%port-offer ship.goal from.goal for.portal u.at.portal]~
    ~[goal]~
      %add-port-req
    =/  rgg
      ?.  =(ship.goal src.bowl)  ``~
      ?@  from.goal
        ?:  =(ship.goal our.bowl)
          ``[%import-player +.goal]~
        =/  invite  (~(gut by invites.deed.turf) `@t`from.goal ~)
        ?~  invite  ``~
        ?:  (gth now.bowl till.invite)  ``~
        ``[%import-player +.goal]~
      ?.  (~(has by portals.deed.turf) u.from.goal)  ``~
      ?:  (~(has ju port-recs.deed.turf) u.from.goal ship.goal)
        ``[%import-player +.goal]~
      `~[goal]~
    ?.  =(rgg ``~)  rgg
    :_  `~
    [%port-reject ship.goal]~
      %add-port-rec
    =/  portal  (~(gut by portals.deed.turf) from.goal ~)
    ?~  portal  ``~
    ?.  =(ship.for.portal src.bowl)  ``~
    =/  req  (~(gut by port-reqs.deed.turf) ship.goal ~)
    ?~  req  `~[goal]~
    ?.  =(portal-id.req from.goal)
      `~[goal]~
    ``[%import-player ship.goal `from.goal avatar.req]~
      %join-player
    =|  =player
    =.  wake.player  `now.bowl
    ``[%add-player ship.goal player(avatar avatar.goal)]~
      %add-player
    :-  [%player-add ship.goal]~
    ~[goal]~
      %del-player
    ?.  |(=(our src):bowl =(ship.goal src.bowl))  ``~
    :-  [%player-del ship.goal]~
    :-  [goal]~
    [%del-port-offer ship.goal]~
      %call
    :_  `~
    [%host-call (~(put in ships.goal) src.bowl) ~]~
  ==
++  pull-trigger
  |=  [=turf =ship =trigger pos=svec2]
  ^-  [=roars:pond =goals:pond]
  =/  things  (get-things turf pos)
  =/  effects=(list [husk-id effect])
    %+  murn  things
    |=  [=husk-id =thing]
    =/  effect  (get-effect thing trigger)
    ?~  effect  ~
    ?:  &(?=(%bump trigger) !(is-thing-collidable turf thing))
      ~
    `[husk-id u.effect]
  %+  roll  effects
  |=  [[=husk-id =effect] =roars:pond =goals:pond]
  =/  res  (apply-effect turf ship effect husk-id)
  :-  (weld roars roars.res)
  (weld goals goals.res)
++  apply-effect
  |=  [=turf =ship =effect =husk-id]
  ^-  [=roars:pond =goals:pond]
  ?+    -.effect  `~
      %port
    :-  ~
    =/  portal  (~(gut by portals.deed.turf) portal-id.effect ~)
    ?~  portal  ~
    ?~  at.portal  ~
    [%add-port-offer ship portal-id.effect]~
      %jump
    `[%tele ship to.effect]~
  ==
++  path-to-turf-id
  |=  =path
  ^-  (unit turf-id)
  ?.  ?=([%pond @ *] path)  ~
  :-  ~
  :-  `@p`(slav %p &2.path)
  |2.path
++  turf-id-to-sub-key
  |=  id=turf-id
  ^-  [=ship =dude:gall ppath=pond-path]
  [ship.id %turf [%pond path.id]]
++  turf-id-to-ppath
  |=  id=turf-id
  ^-  pond-path
  ppath:(turf-id-to-sub-key id)
++  turf-id-to-path
  |=  id=turf-id
  ^-  path
  [%pond (scot %p ship.id) path.id]
++  ship-ppath-to-path
  |=  [=ship ppath=pond-path]
  (turf-id-to-path ship ;;(path +.ppath))
++  ship-ppath-to-turf-id
  |=  [=ship ppath=pond-path]
  ^-  turf-id
  [ship ;;(path +.ppath)]
--
