/-  *turf, pond, mist
/+  *turf, *effects, vita-client
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
  ?+  -.goal  `~[goal]~
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
  =+  (filter-pond-goal-inner [bowl rock top] goal)
  :+  (weld pre-roars roars)
    (turn grits (lead *cur-grit-v:pond))
  goals
++  filter-pond-goal-inner
  |=  [[=bowl:gall =rock:pond top=?] =goal:pond]
  =*  roar  roar:pond
  =*  roars  roars:pond
  =/  ret  ,[=roars grits=cur-grits:pond =goals:pond]
  ^-  ret
  :: ~&  "filtering pond goal {<?@(goal goal -.goal)>}, top: {<top>}"
  :: ~&  "filtering pond goal {<-.goal>}, top: {<top>}"
  =/  uturf  turf.rock
  ?~  uturf
    ?+  goal  ``~
      [%set-turf *]
        ?.  =(our.bowl src.bowl)
          ``~
        `~[goal]~
    ==
  =*  turf  u.uturf
  ?+  -.goal  `~[goal]~
    %atomic
    :: todo: fix this so that it actually does things in order
    :: and can handle serial OR simultaneous
    :: instead of badly handling simultaneous
      =;  res
        ?~  res  ``~
        :+  roars.u.res
          grits.u.res
        :: ?~  depth.goal
        :: goals.u.res
        :: [%atomic (dec depth.goal) goals.u.res]~
        ?~  goals.u.res  ~
        [%atomic goals.u.res]~
      %+  roll  goals.goal
      |=  [sub-goal=goal:pond res=$~(`*ret (unit ret))]
      ?~  res  ~
      =+  (filter-pond-goal-inner [bowl rock top] sub-goal)
      ?:  =(``~ [roars grits goals])
        :: throw out everything if anything fails
        ~
      :-  ~
      :+  (weld roars.u.res roars)
        (weld grits.u.res grits)
      (weld goals.u.res goals)
    %add-shade
      :-  ~
      =/  form-type  (get-form-type turf form-id.goal)
      ?~  form-type  `~
      ?.  ?=(space-form-type u.form-type)  `~
      =/  pos  (clamp-pos pos.goal offset.plot.turf size.plot.turf)
      :-  [goal(pos pos)]~
      =/  gate-goals=goals:pond
        ?.  is-gate.goal  ~
        [%set-gate `stuff-counter.plot.turf]~
      =/  tile-goals=goals:pond
        ?.  ?=(%tile u.form-type)  ~
        =/  space  (get-space spaces.plot.turf pos)
        ?~  tile.space  ~
        [%del-shade u.tile.space]~
      (weld gate-goals tile-goals)
    %del-shade
      :-  ~
      :-  [goal]~
      ?.  =(`shade-id.goal gate.deed.turf)
        ~
      [%set-gate ~]~
    %move-shade
      =/  shade  (~(gut by cave.plot.turf) shade-id.goal ~)
      ?~  shade  ``~
      =/  form-type  (get-form-type turf form-id.shade)
      ?~  form-type  ``~
      ?.  ?=(space-form-type u.form-type)  ``~
      =/  pos  (clamp-pos pos.goal offset.plot.turf size.plot.turf)
      ?:  =(pos pos.shade)  ``~
      ?:  &(collide.goal (get-collidable turf pos))
        =/  bump-goals=goals:pond
          (pull-trigger-at-pos turf src.bowl bump+~ pos `shade-id.goal)
        ``bump-goals
      =/  grits=cur-grits:pond  [goal(pos pos)]~
      =/  =goals:pond
        ?.  ?=(%tile u.form-type)  ~
        =/  space  (get-space spaces.plot.turf pos)
        ?~  tile.space  ~
        [%del-shade u.tile.space]~
      =/  =trigger
        [%move pos.shade pos collide.goal smooth.goal]
      =/  leave-goals
        (pull-trigger-at-pos turf src.bowl trigger pos.shade `shade-id.goal)
      =/  step-goals
        (pull-trigger-at-pos turf src.bowl trigger pos `shade-id.goal)
      :+  ~  grits
      :(weld goals leave-goals step-goals)
    %set-gate
      ?:  &(top !=(our src):bowl)  ``~
      `~[goal]~
    %set-lunk
      ?:  &(top !=(our src):bowl)  ``~
      ?:  =(lunk.goal lunk.deed.turf)  ``~
      :+  ~  [goal]~
      %-  murn  :_  same
      ^-  (list (unit cur-grit:pond))
      :~  ?~  gate.deed.turf  ~
          `[%set-shade-var u.gate.deed.turf ?~(lunk.goal 0 1)]
          ::
          ?~  gate.deed.turf  ~
          ?^  lunk.goal  ~
          `[%set-shade-effect u.gate.deed.turf trigger+move+onto+~ ~]
          ::
          ?~  lunk.deed.turf  ~
          ?~  +.goal  ~  :: don't del in this case to avoid infinite loop
          `[%del-portal u.lunk.deed.turf loud=%.y]
      ==
    %add-dink
      ?:  &(top !=(our src):bowl)  ``~
      `~[goal]~
    %del-dink
      ?:  &(top !=(our src):bowl)  ``~
      `~[goal]~
    ::
    %create-bridge
      :: $:  %create-bridge
      ::     shade=?(shade-id add-shade-spec) 
      ::     trigger=root-condition
      ::     portal=?(portal-id turf-id)
      :: ==
      =/  is-approved-dink
        ?^  portal.goal  %.n
        ?.  (portal-is-dink turf portal.goal)  %.n
        =/  portal  (~(gut by portals.deed.turf) portal.goal ~)
        ?~  portal  %.n
        ?~  at.portal  %.n
        ?:  pending.portal  %.n
        =(src.bowl ship.for.portal)
      ?:  &(top !=(our src):bowl !is-approved-dink)  ``~
      =/  shade-id
        ?@  shade.goal  shade.goal
        stuff-counter.plot.turf
      =/  portal-id
        ?@  portal.goal  portal.goal
        ?^  shade.goal  +(shade-id)
        stuff-counter.plot.turf
      =/  portal-valid
        ?^  portal.goal  %.y
        =/  portal  (~(gut by portals.deed.turf) portal.goal ~)
        ?=(^ portal)
      =/  shade-valid
        ?^  shade.goal  %.y
        =/  shade  (~(gut by cave.plot.turf) shade.goal ~)
        ?=(^ shade)
      =/  shade-is-gate
        ?@  shade.goal  =(gate.deed.turf `shade.goal)
        is-gate.shade.goal
      ?.  &(portal-valid shade-valid)  ``~
      =/  =goals:pond
        %-  murn  :_  same
        ^-  (list (unit cur-grit:pond))
        :~  ?@(shade.goal ~ `[%add-shade shade.goal])
            ?@(portal.goal ~ `[%add-portal portal.goal ~])
            `[%set-shade-effect shade-id trigger.goal `port+portal-id]
            `[%set-portal-outlet portal-id `shade-id]
            ?.(shade-is-gate ~ `[%set-shade-var shade-id 1])
        ==
      ``goals
    ::
    %add-portal
      ?:  &(top !=(our src):bowl)  ``~
      =/  is-link  !=((is-host our.bowl) (is-host ship.for.goal))
      =/  is-dink  &(is-link (gth ship.for.goal our.bowl))
      =/  portal-id  stuff-counter.plot.turf
      :-  ?^  at.goal  ~
          [%portal-request portal-id for.goal]~
      :-  [goal]~
      ?.  is-link  ~
      ?:  is-dink
        :-  [%add-dink portal-id]
        ?.  |(autoconfirm-dinks.deed.turf =(our.bowl ~pandux))
          ~
        [%confirm-portal portal-id]~
      [%set-lunk `portal-id]~
    ::
    %del-portal
      ?:  &(top !=(our src):bowl)  ``~
      =/  portal  (~(gut by portals.deed.turf) portal-id.goal ~)
      ?~  portal  ``~
      :-  ?.  loud.goal  ~
          ?~  at.portal
            [%portal-retract portal-id.goal for.portal]~
          [%portal-discard for.portal u.at.portal]~
      :-  [goal]~
      ^-  goals:pond
      :-  [%del-port-recs portal-id.goal]
      =/  is-link  !=((is-host our.bowl) (is-host ship.for.portal))
      =/  is-dink  &(is-link (gth ship.for.portal our.bowl))
      ?.  is-link  ~
      ?:  is-dink
        [%del-dink portal-id.goal]~
      ?.  (portal-is-lunk turf portal-id.goal)
        ~
      [%set-lunk ~]~
    %set-portal-outlet
      ?:  &(top !=(our src):bowl)  ``~
      =/  portal  (~(gut by portals.deed.turf) portal-id.goal ~)
      ?~  portal  ``~
      :+  ~  [goal]~
      ?~  at.portal  ~
      ?.  pending.portal  ~
      [%confirm-portal portal-id.goal]~
    %confirm-portal
      ?:  &(top !=(our src):bowl)  ``~
      =/  portal  (~(gut by portals.deed.turf) portal-id.goal ~)
      ?~  portal  ``~
      ?~  at.portal  ``~
      :-  [%portal-confirm from=portal-id.goal for.portal u.at.portal]~
      ~[goal]~
    %revive-portal
      ?:  &(top !=(our src):bowl)  ``~
      =/  portal  (~(gut by portals.deed.turf) portal-id.goal ~)
      ?~  portal  ``~
      ?^  at.portal  ``~
      :-  [%portal-request portal-id.goal for.portal]~
      ~[goal]~
    ::
    %portal-requested
      ?.  =(src.bowl ship.for.goal)  ``~
      =/  is-link  !=((is-host our.bowl) (is-host src.bowl))
      =/  is-dink  &(is-link (gth src.bowl our.bowl))
      ?:  &(is-link !is-dink)
        :: allow dinks but not lunks
        :: todo allow lunk requests but don't override current lunk
        :_  `~
        [%portal-discard for.goal at.goal]~
      :-  [%portal-hark %requested stuff-counter.plot.turf for.goal]~
      :-  ~
      [%add-portal for.goal `at.goal]~
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
      :-  [%portal-hark %retracted u.portal-id for.goal]~
      `[%del-portal u.portal-id loud=%.n]~
    ::
    %portal-confirmed
      =/  portal  (~(gut by portals.deed.turf) from.goal ~)
      ?~  portal  ``~
      ?.  =(src.bowl ship.for.portal)  ``~
      :: portal must be an outgoing request
      ?^  at.portal  ``~  :: don't let them confirm a portal they requested!
      :-  [%portal-hark %confirmed from.goal for.portal]~
      ~[goal]~
    ::
    %portal-discarded
      =/  portal  (~(gut by portals.deed.turf) from.goal ~)
      ?~  portal  ``~
      ?.  =(src.bowl ship.for.portal)  ``~
      =/  is-link  !=((is-host our.bowl) (is-host src.bowl))
      =/  is-dink  &(is-link (gth src.bowl our.bowl))
      :-  [%portal-hark ?~(at.portal %rejected %discarded) from.goal for.portal]~
      ?:  is-dink
        `[%del-portal from.goal loud=%.n]~
      ~[goal]~
      ::
    %send-chat
      ?.  =(src.bowl from.goal)  ``~
      ``[%chat from.goal now.bowl text.goal]~
    %move
      ?:  &(top !=(src.bowl ship.goal))  ``~
      ?:  &(top !=(src our):bowl |(!collide.goal !smooth.goal))  ``~
      =*  players  players.ephemera.turf
      =/  player  (~(get by players) ship.goal)
      ?~  player  ``~
      =/  pos  (clamp-pos pos.goal offset.plot.turf size.plot.turf)
      ?:  =(pos pos.u.player)  ``~
      ?:  &(collide.goal (get-collidable turf pos))
        =/  bump-goals  (pull-trigger-at-pos turf ship.goal bump+~ pos ~)
        ``bump-goals
      =/  =trigger  [%move pos.u.player pos collide.goal smooth.goal]
      =/  leave-goals  (pull-trigger-at-pos turf ship.goal trigger pos.u.player ~)
      =/  step-goals  (pull-trigger-at-pos turf ship.goal trigger pos ~)
      :-  ~
      :-  [goal(pos pos)]~
      (weld leave-goals step-goals)
    %ping-player
      ?.  =(src.bowl by.goal)  ``~
      `~[goal]~
    ::
    %port-offer-accepted
      ?.  =(src.bowl ship.goal)  ``~
      =/  offer  (~(get by port-offers.deed.turf) ship.goal)
      ?~  offer  ``~
      ?~  u.offer  ``~
      =/  portal  (~(gut by portals.deed.turf) u.u.offer ~)
      ?:  |(?=(~ portal) ?=(~ at.portal))
        ``[%del-port-offer ship.goal]~
      :: ?~  at.portal  ``~
      :-  [%port ship.goal for.portal u.at.portal]~
      :-  ~
      :~  [%nil-port-offer ship.goal]
          [%del-player ship.goal]
      ==
    %port-offer-rejected
      ?.  =(src.bowl ship.goal)  ``~
      =/  offer  (~(get by port-offers.deed.turf) ship.goal)
      ?~  offer  ``~
      ?~  u.offer  ``~
      ?.  =(u.u.offer from.goal)  ``~
      ``[%del-port-offer ship.goal]~
    ::
    %import-player
      ?:  &(top !=(our src):bowl)  ``~
      :-  ~
      :-  ~
      =/  pos=(unit svec2)
        ?@  from.goal  `(get-entry-pos turf)
        (get-portal-outlet-pos turf u.from.goal)
      ?~  pos  ~
      =|  =player
      =.  wake.player  `now.bowl
      =.  pos.player  u.pos
      =.  avatar.player  avatar.goal
      %-  murn  :_  same
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
    %add-port-offer
      =/  portal  (~(gut by portals.deed.turf) from.goal ~)
      ?~  portal  ``~
      ?~  at.portal  ``~
      :-  [%port-offer ship.goal from.goal for.portal u.at.portal]~
      ~[goal]~
    %add-port-req
      =/  rgg
        ?.  =(ship.goal src.bowl)  ``~
        ?@  from.goal
          ?:  =(ship.goal our.bowl)
            ``[%import-player +.goal]~
          ?:  ?=([~ ~] (~(get by port-offers.deed.turf) ship.goal))
            :: allow people to retrace their steps if a port goes bad
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
    %add-player
      :-  [%player-add ship.goal]~
      ~[goal]~
    %del-player
      ?.  |(=(our src):bowl =(ship.goal src.bowl))  ``~
      :-  [%player-del ship.goal]~
      :-  [goal]~
      ?:  ?=([~ ~] (~(get by port-offers.deed.turf) ship.goal))
        ~
      [%del-port-offer ship.goal]~
    %call
      :_  `~
      [%host-call (~(put in ships.goal) src.bowl) ~]~
    ?(%click %interact)
      =/  trigger  ?:(?=(%click -.goal) -.goal^~ -.goal^~)
      :: ~&  (~(get by players.ephemera.turf) ~nec)
      :: ~&  (~(get by cave.plot.turf) shade-id.goal)
      ``(pull-trigger-on-shade turf src.bowl trigger shade-id.goal ~)
    %tell
      =/  trigger  [%tell msg.goal]
      ``(pull-trigger-on-shade turf src.bowl trigger shade-id.goal ~)
    %pull-trigger
      ?:  top  ``~
      ``(pull-trigger-on-shade turf src.bowl ctx.goal)
    %apply-effect
      ?:  top  ``~
      =+  (apply-effect [turf src.bowl ctx.goal] effect.goal)
      [roars ~ goals]
  ==
++  pull-trigger-at-pos
  |=  [=turf =ship =trigger pos=svec2 init-id=(unit shade-id)]
  ^-  goals:pond
  =/  comps  (get-comps turf pos)
  (pull-trigger-on-comps turf ship trigger comps init-id)
++  pull-trigger-on-shade
  |=  [=turf =ship ctx=fx-ctx]
  ^-  goals:pond
  ?~  comp=(get-comp-by-shade-id turf shade-id.ctx)
    ~
  (pull-trigger-on-comps turf ship trigger.ctx [u.comp]~ init-id.ctx)
++  pull-trigger-on-comps
  |=  [=turf =ship =trigger comps=(list comp) init-id=(unit shade-id)]
  ^-  goals:pond
  %-  zing  %+  turn  comps
  |=  =comp
  ^-  goals:pond
  %+  turn  (get-effects comp turf ship trigger shade-id.comp init-id)
  |=  =effect
  ^-  goal:pond
  [%apply-effect effect trigger shade-id.comp init-id]
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
