/-  *turf, pond, mist
/+  *turf, sss, vita-client
|%
:: +$  [=bowl:gall =rock:pond top=?]
++  filter-mist-goal
  |=  [[=bowl:gall =rock:mist top=?] [pre-roars=roars:mist closet=skye] =goal:mist]
  =*  roar  roar:mist
  =*  roars  roars:mist
  ^-  [[roars skye] grits:mist goals:mist]
  =-  [[(weld pre-roars roars) closet] grits goals]
  ^-  [=roars =grits:mist =goals:mist]
  :: ~&  "filtering mist goal {<?@(goal goal -.goal)>}, top: {<top>}"
  ?@  goal  `~[goal]~
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
      %port-offered
    :-  ~
    ?.  ?~  via.goal
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
        ?~  via.u.off  ~
        [%port-offer-reject of.u.via.u.off from.u.via.u.off]~
    ~[goal]~
      %export-self
    :-  [%port-offer-accept +.goal]~
    `[%clear-port-offer [%set-ctid `for.goal] ~]
      %port-accepted
    :_  `~
    ?.  =(ship.for.goal src.bowl)  ~
    ?.  =(`for.goal ctid.rock)  ~
    [%turf-join for.goal]~
      %port-rejected
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
  ~&  "filtering pond goal {<?@(goal goal -.goal)>}, top: {<top>}"
  =-  [(weld pre-roars roars) grits goals]
  ^-  [=roars =grits:pond =goals:pond]
  =/  uturf  turf.rock
  ?~  uturf
    ?+    goal  ``~
        [%set-turf *]
      ?.  =(our.bowl src.bowl)
        ``~
      `~[goal]~
    ==
  =*  turf  u.uturf
  ?@  goal
    `~[goal]~
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
      %set-shade-effect
    =/  shade-fx  (get-effects-by-shade-id turf shade-id.goal)
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
        [%add-shade-to-portal u.add-portal-id shade-id.goal]~
      ^-  goals:pond
      ?~  del-portal-id  ~
      =/  count  (~(gut by portal-counts) u.del-portal-id 0)
      ?:  (gth count 1)  ~
      [%del-shade-from-portal u.del-portal-id shade-id.goal]~
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
        [%set-shade-var shade-id.u.lunk.deed.turf 0]~
      =/  shade  (~(gut by cave.plot.turf) shade-id.u.lunk.goal ~)
      ?~  shade  ~  :: todo cancel goal in this case
      ?.  =(/gate (scag 1 form-id.shade))  ~
      ::  This is kinda goofy, but since %.y=0 and %.n=1
      ::  We set the variation to be !approved
      ::  Because variation 0 is for unapproved
      ::  and variation 1 is for an approved lunk
      ?.  =(approved.u.lunk.goal variation.shade)  ~
      [%set-shade-var shade-id.u.lunk.goal `@`!approved.u.lunk.goal]~
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
    =/  goals=goals:pond
      %+  murn
        ^-  (list (unit grit:pond))
        :~  ?@(shade.goal ~ `[%add-husk shade.goal])
            ?@(portal.goal ~ `[%add-portal portal.goal ~])
            `[%set-shade-effect shade-id trigger.goal `port+portal-id]
        ==
      same
    ``goals
    ::
      %add-portal
    ?:  &(top !=(our src):bowl)  ``~
    `~[goal]~
    ::
      %del-portal
    ?:  &(top !=(our src):bowl)  ``~
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
    :-  [%portal-hark %requested is-link.goal stuff-counter.plot.turf for.goal]~
    :-  ~
    ^-  goals:pond
    :-  [%add-portal for.goal `at.goal]
    ?.  is-link.goal  ~
    [%set-dink stuff-counter.plot.turf %.n]~
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
      ``~
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
    :-  ~
    :-  ~
    =/  pos=(unit svec2)
      ?~  from.goal
        ?.  =(our.bowl ship.goal)  ~
        `(get-entry-pos turf)
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
    =.  pos.player  u.pos
    =.  avatar.player  avatar.goal
    %+  murn
      ^-  (list (unit goal:pond))
      :~  `[%add-player ship.goal player]
        ::
          ?~  from.goal  ~
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
    ?.  =(ship.goal src.bowl)  ``~
    ?~  from.goal
      ?.  =(ship.goal our.bowl)  ``~
      ``[%import-player +.goal]~
    ?.  (~(has by portals.deed.turf) u.from.goal)  ``~
    ?:  (~(has ju port-recs.deed.turf) u.from.goal ship.goal)
      ``[%import-player +.goal]~
    `~[goal]~
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
    ``[%add-player ship.goal player(avatar avatar.goal)]~
      %add-player
    :-  [%player-add ship.goal]~
    ~[goal]~
      %del-player
    :-  [%player-del ship.goal]~
    :-  [goal]~
    [%del-port-offer ship.goal]~
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
    `[%move ship to.effect]~
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
::
++  enjs
  =,  enjs:format
  |%
  ++  pond-rock
    |=  =rock:pond
    ^-  json
    %+  frond  %rock
    %-  pairs
    :~  'stirIds'^(stir-ids stir-ids.rock)
      ::
        :-  %core
        ?~  turf.rock  ~
        (turf u.turf.rock)
    ==
  ++  pond-wave
    |=  [id=stir-id:pond =grits:pond]
    ^-  json
    %+  frond  %wave
    %-  pairs
    :_  [id+(fall (bind id |=(i=@t s+i)) ~)]~
    :-  %grits
    a+(turn grits pond-grit)
  ++  pond-grit
    |=  =grit:pond
    ^-  json
    %-  pairs
    :~  :-  %type
        s+?@(grit grit -.grit)
      ::
        :-  %arg
        ?@  grit  ~
        ?-    -.grit
            %set-turf
          (turf turf.grit)
            %size-turf
          (pairs ~[offset+(svec2 offset.grit) size+(vec2 size.grit)])
            %add-form
          (form-spec +.grit)
            %del-form
          (frond 'formId' (path form-id.grit))
            %add-husk
          (add-husk-spec +.grit)
            %del-shade
          (frond 'shadeId' (numb +.grit))
            %move-shade
          (pairs ~['shadeId'^(numb shade-id.grit) pos+(svec2 pos.grit)])
            %cycle-shade
          (pairs ~['shadeId'^(numb shade-id.grit) amount+(numb amt.grit)])
            %set-shade-var
          (pairs ~['shadeId'^(numb shade-id.grit) variation+(numb variation.grit)])
            %set-shade-effect
          %-  pairs
          :~  'shadeId'^(numb shade-id.grit)
              'trigger'^s+trigger.grit
              'effect'^+:(maybe-possible-effect trigger.grit effect.grit)
          ==
          %set-lunk  (maybe-lunk lunk.grit)
            %set-dink
          %-  pairs
          :~  'portalId'^(numb portal-id.grit)
              approved+b+approved.grit
          ==
            %del-dink
          (frond 'portalId' (numb portal-id.grit))
            %add-portal
          %-  pairs
          :~  for+(turf-id for.grit)
              at+?~(at.grit ~ (numb u.at.grit))
          ==
            %del-portal
          %-  pairs
          :~  from+(numb from.grit)
              loud+b+loud.grit
          ==
            %add-shade-to-portal
          %-  pairs
          :~  'from'^(numb from.grit)
              'shadeId'^(numb shade-id.grit)
          ==
            %del-shade-from-portal
          %-  pairs
          :~  'from'^(numb from.grit)
              'shadeId'^(numb shade-id.grit)
          ==
            %del-portal-from-shade
          %-  pairs
          :~  'shadeId'^(numb shade-id.grit)
              'portalId'^(numb portal-id.grit)
          ==
            %portal-confirmed
          %-  pairs
          :~  from+(numb from.grit)
              at+(numb at.grit)
          ==
            %chat
          (chat chat.grit)
            %move
          (move +.grit)
            %face
          (face +.grit)
            %ping-player
          %-  pairs
          :~  ship+(ship-json ship.grit)
              by+(ship-json by.grit)
          ==
            %set-avatar
          (pond-set-avatar +.grit)
            %add-port-offer
          %-  pairs
          :~  ship+(ship-json ship.grit)
              from+(numb from.grit)
          ==
            %del-port-offer
          (ship-json ship.grit)
            %add-port-req
          %-  pairs
          :~  ship+(ship-json ship.grit)
              from+?~(from.grit ~ (numb u.from.grit))
              avatar+(avatar avatar.grit)
          ==
            %del-port-req
          (ship-json ship.grit)
            %add-port-rec
          %-  pairs
          :~  from+(numb from.grit)
              ship+(ship-json ship.grit)
          ==
            %del-port-rec
          %-  pairs
          :~  from+(numb from.grit)
              ship+(ship-json ship.grit)
          ==
            %del-port-recs
          (numb from.grit)
            %add-player
          (add-player +.grit)
            %del-player
          (del-player +.grit)
    ==  ==
  ++  mist-rock
    |=  =rock:mist
    ^-  json
    %+  frond  %rock
    %-  pairs
    :~  'stirIds'^(stir-ids stir-ids.rock)
      ::
        :-  'core'
        %-  pairs
        :~  'currentTurfId'^(maybe-turf-id-path ctid.rock)
            'targetTurfId'^(maybe-turf-id-path ttid.rock)
            'portOffer'^?~(port-offer.rock ~ (port-offer u.port-offer.rock))
            avatar+(avatar avatar.rock)
    ==  ==
  ++  mist-wave
    |=  [id=stir-id:mist =grits:mist]
    ^-  json
    %+  frond  %wave
    %-  pairs
    :_  [id+(fall (bind id |=(i=@t s+i)) ~)]~
    :-  %grits
    a+(turn grits mist-grit)
  ++  mist-grit
    |=  [=grit:mist]
    ^-  json
    %-  pairs
    :~  :-  %type
        s+?@(grit grit -.grit)
      ::
        :-  %arg
        ?@  grit  ~
        ?-  -.grit
            %set-ctid
          (maybe-turf-id-path +.grit)
            %set-avatar
          (avatar +.grit)
            %set-color
          (numb +.grit)
            %add-thing
          (thing +.grit)
            %del-thing
          (numb +.grit)
            %port-offered
          (port-offer +.grit)
            %accept-port-offer
          (turf-id-path +.grit)
            %reject-port-offer
          (turf-id-path +.grit)
    ==  ==
  ++  stir-ids
    |=  [ids=^stir-ids]
    ^-  json
    (pairs (turn ~(tap by ids) stir-id-pair))
  ++  stir-id-pair
    |=  [src=^ship id=@t]
    :-  (scot %p src)
    s+id
  ++  local
    |=  loc=^local
    ^-  json
    %-  pairs
    :~  config+(vita-config config.loc)
        closet+(skye closet.loc)
    ==
  ++  vita-config
    |=  =config:vita-client
    %-  pairs
    :~  enabled+b+enabled.config
        'vitaParent'^(ship-json vita-parent.config)
    ==
  ++  turf
    |=  =^turf
    =,  ephemera.turf
    =,  deed.turf
    =,  plot.turf
    |^  ^-  json
    %-  pairs
    :~  players+(pairs (turn ~(tap by players) player-pair))
        chats+a+(turn chats chat)
        :: todo: add perms (?)
        portals+portals
        'portReqs'^port-reqs
        'portRecs'^port-recs
        'portOffers'^port-offers
        lunk+(maybe-lunk lunk)
        dinks+(^dinks dinks)
        size+(vec2 size)
        offset+(svec2 offset)
        'tileSize'^(vec2 tile-size)
        spaces+spaces
        skye+(^skye skye)
        cave+cave
        'stuffCounter'^(numb stuff-counter)
    ==
    ++  portals
      ^-  json
      %-  pairs
      %+  turn  ~(tap by ^portals)
      |=  [key=portal-id pol=^portal]
      ^-  [@t json]
      :-  (numbt key)
      (portal pol)
    ++  port-reqs
      ^-  json
      %-  pairs
      %+  turn  ~(tap by ^port-reqs)
      |=  [key=^ship =portal-id av=^avatar]
      ^-  [@t json]
      :-  (ship-cord key)
      %-  pairs
      :~  'portalId'^(numb portal-id)
          avatar+(avatar av)
      ==
    ++  port-recs
      ^-  json
      %-  pairs
      %+  turn  ~(tap by ^port-recs)
      |=  [key=portal-id ships=(set ^ship)]
      ^-  [@t json]
      :-  (numbt key)
      :-  %a
      (turn ~(tap in ships) ship-json)
    ++  port-offers
      ^-  json
      %-  pairs
      %+  turn  ~(tap by ^port-offers)
      |=  [key=^ship =portal-id]
      ^-  [@t json]
      :-  (ship-cord key)
      (numb portal-id)
    ++  spaces
      ^-  json
      %-  pairs
      %+  turn  ~(tap by ^spaces)
      |=  [pos=^svec2 spot=^space]
      ^-  [@t json]
      :-  :(welk (snumbt x.pos) ',' (snumbt y.pos))
      (space spot)
    ++  cave
      ^-  json
      %-  pairs
      %+  turn  ~(tap by ^cave)
      |=  [=shade-id =shade]
      ^-  [@ta json]
      :-  (numbt shade-id)
      (pairs (shade-pairs shade))
    --
  ++  skye
    |=  =^skye
    ^-  json
    %-  pairs
    %+  turn  ~(tap by skye)
    |=  [=form-id frm=^form]
    :-  (spat form-id)
    (form frm)
  ++  port-offer
    |=  po=^port-offer
    ^-  json
    %-  pairs
    :~  for+(turf-id-path for.po)
        of+?~(via.po ~ (turf-id-path of.u.via.po))
        from+?~(via.po ~ (numb from.u.via.po))
        at+?~(via.po ~ (numb at.u.via.po))
    ==
  ++  maybe-lunk
    |=  lunk=(unit lunk)
    ^-  json
    ?~  lunk  ~
    %-  pairs
    :~  'shadeId'^(numb shade-id.u.lunk)
        approved+b+approved.u.lunk
    ==
  ++  dinks
    |=  =^dinks
    ^-  json
    %-  pairs
    %+  turn  ~(tap by dinks)
    |=  [=portal-id approved=?]
    ^-  [@t json]
    :-  (numbt portal-id)
    b+approved
  ++  vec2
    |=  =^vec2
    ^-  json
    %-  pairs
    :~  x+(numb x.vec2)
        y+(numb y.vec2)
    ==
  ++  svec2
    |=  =^svec2
    ^-  json
    %-  pairs
    :~  x+(snumb x.svec2)
        y+(snumb y.svec2)
    ==
  ++  numbt
    |=  a=@u
    ^-  @t
    (crip (a-co:co a))
  ++  snumbt
    |=  a=@s
    ^-  @t
    =/  [sign=? abs=@u]
      (old:si a)
    =/  num  (numbt abs)
    ?:  sign  num
    `@t`(cat 3 '-' num)
  ++  snumb
    |=  a=@s
    ^-  json
    n+(snumbt a)
  ++  player-pair
    |=  [who=^ship plr=^player]
    :-  (scot %p who)
    (player plr)
  ++  player
    |=  =^player
    ^-  json
    %-  pairs
    :~  pos+(svec2 pos.player)
        dir+s+dir.player
        avatar+(avatar avatar.player)
    ==
  ++  avatar
    |=  =^avatar
    ^-  json
    %-  pairs
    :~  body+(body body.avatar)
        things+a+(turn things.avatar thing)
    ==
  ++  body
    |=  =^body
    ^-  json
    %-  pairs
    :~  color+(numb color.body)
        thing+(thing thing.body)
    ==
  ++  chat
    |=  =^chat
    ^-  json
    %-  pairs
    :~  from+(ship-json from.chat)
        at+(time at.chat)
        text+s+text.chat
    ==
  ++  portal
    |=  pol=^portal
    ^-  json
    %-  pairs
    :~  'shadeId'^?~(shade-id.pol ~ (numb u.shade-id.pol))
        for+(turf-id for.pol)
        at+?~(at.pol ~ (numb u.at.pol))
    ==
  ++  space
    |=  =^space
    ^-  json
    %-  pairs
    :~  tile+(fall (bind tile.space husk) ~)
        shades+a+(turn shades.space numb)
    ==
  ++  thing
    |=  =^thing
    ^-  json
    %-  pairs
    :-  form+(pairs (form-pairs +.thing))
    (husk-pairs -.thing)
  ++  husk
    |=  =^husk
    ^-  json
    (pairs (husk-pairs husk))
  ++  husk-pairs
    |=  =^husk
    ^-  (list [@t json])
    =,  husk
    :~  'formId'^(path form-id)
        variation+(numb variation)
        offset+(svec2 offset)
        collidable+(fall (bind collidable |=(c=? b+c)) ~)
        effects+(pairs (turn ~(tap by effects) maybe-possible-effect))
    ==
  ++  shade-pairs
    |=  =^shade
    ^-  (list [@t json])
    :-  pos+(svec2 pos.shade)
    (husk-pairs +.shade)
  ++  form
    |=  =^form
    ^-  json
    (pairs (form-pairs form))
  ++  form-pairs
    |=  =^form
    ^-  (list [@t json])
    =,  form
    :~  name+s+name
        type+s+type
        variations+a+(turn variations luuk)
        offset+(svec2 offset)
        collidable+b+collidable
        effects+(pairs (turn ~(tap by effects) effect))
        seeds+(pairs (turn ~(tap by seeds) effect-type))
    ==
  ++  form-spec
    |=  spec=^form-spec
    ^-  json
    %-  pairs
    :~  'formId'^(path form-id.spec)
        form+(form form.spec)
    ==
  ++  add-husk-spec
    |=  =^add-husk-spec
    =,  add-husk-spec
    ^-  json
    %-  pairs
    :~  'isLunk'^b+is-lunk
        pos+(svec2 pos)
        'formId'^(path form-id)
        variation+(numb variation)
    ==
  ++  luuk
    |=  =^luuk
    ^-  json
    ?~  luuk  ~
    %-  pairs
    :~  deep+s+deep.u.luuk
        sprite+(sprite sprite.u.luuk)
    ==
  ++  sprite
    |=  =^sprite
    ^-  json
    ?@  sprite  s+sprite
    %-  pairs
    :~  type+s+type.sprite
        frames+a+(turn frames.sprite (lead %s))
    ==
  ++  maybe-possible-effect
    |=  [=trigger eff=(unit ^possible-effect)]
    ^-  (pair @t json)
    ?~  eff  trigger^~
    (possible-effect trigger u.eff)
  ++  possible-effect
    |=  [=trigger eff=^possible-effect]
    ^-  (pair @t json)
    ?@  eff
      (effect-type trigger eff)
    (effect trigger eff)
  ++  effect
    |=  [=trigger eff=^effect]
    :-  trigger
    ^-  json
    %-  pairs
    :~  type+s+-.eff
        :-  %arg
        ^-  json
        ?-  -.eff
          %port  (numb +.eff)
          %jump  (svec2 +.eff)
          %read  s+note.eff
          %swap  (path +.eff)
    ==  ==
  ++  effect-type
    |=  [=trigger =^effect-type]
    [trigger s+effect-type]
  ++  maybe-turf-id-path
    |=  tid=(unit ^turf-id)
    ^-  json
    ?~  tid  ~
    (turf-id-path u.tid)
  ++  turf-id-path
    |=  tid=^turf-id
    ^-  json
    (path (turf-id-to-path tid))
  ++  turf-id
    |=  id=^turf-id
    ^-  json
    %-  pairs
    :~  ship+(ship-json ship.id)
        path+(path path.id)
    ==
  ++  move
    |=  [shp=^ship pos=^svec2]
    ^-  json
    %-  pairs
    :~  ship+(ship-json shp)
        pos+(svec2 pos)
    ==
  ++  face
    |=  [shp=^ship =dir]
    ^-  json
    %-  pairs
    :~  ship+(ship-json shp)
        dir+s+dir
    ==
  ++  pond-set-avatar
    |=  [shp=^ship av=^avatar]
    ^-  json
    %-  pairs
    :~  ship+(ship-json shp)
        avatar+(avatar av)
    ==
  ++  add-player
    |=  [shp=^ship plr=^player]
    ^-  json
    %-  pairs
    :~  ship+(ship-json shp)
        player+(player plr)
    ==
  ++  del-player
    |=  shp=^ship
    ^-  json
    (pairs [ship+(ship-json shp)]~)
  ++  ship-json
    |=  shp=^ship
    ^-  json
    s+(scot %p shp)
  ++  ship-cord
    |=  shp=^ship
    ^-  @t
    (scot %p shp)
  --
++  dejs
  =,  dejs:format
  =*  soft  dejs-soft:format
  |%
    ++  goal
      |*  [goal=mold pairs=(pole [cord fist])]
      |=  jon=json
      ^-  goal
      ?:  ?=([%s *] jon)
        ;;(goal (so jon))
      ?>  ?=([%o *] jon)
      ((of pairs) jon)
    ++  pond-stir
      |=  jon=json
      ^-  stir:pond
      %.  jon
      %-  ot
      :: :~  path+(cork pa |=(=path (need (path-to-turf-id path))))
      :~  path+pa-turf-id
      :: :~  path+pa
          id+so:soft
          goals+(ar pond-goal)
      ==
    ++  pond-goal
      |=  jon=json
      ^-  goal:pond
      %.  jon
      %+  goal  goal:pond
      :: todo: set-turf?
      :~  size-turf+(ot ~[offset+svec2 size+vec2])
          add-form+form-spec
          del-form+(ot ~['formId'^pa])
          add-husk+add-husk-spec
          del-shade+(ot ~['shadeId'^ni])
          move-shade+(ot ~['shadeId'^ni pos+svec2])
          cycle-shade+(ot ~['shadeId'^ni amount+ni])
          set-shade-var+(ot ~['shadeId'^ni variation+ni])
          set-shade-effect+(ot ~['shadeId'^ni trigger+(cork so trigger) effect+maybe-possible-effect])
          approve-dink+(ot ~['portalId'^ni])
          :-  %create-bridge
          %-  ot
          :~  shade+(maybe-ni add-husk-spec)
              trigger+(cork so trigger)
              portal+(maybe-ni ot-turf-id)
          ==
          ::
          add-portal+(ot ~[for+ot-turf-id at+ni:soft])
          del-portal+(ot ~[from+ni loud+bo])
          send-chat+(ot ~[from+(se %p) text+so])
          move+(ot ~[ship+(se %p) pos+svec2])
          face+(ot ~[ship+(se %p) dir+dir])
          ping-player+(ot ~[ship+(se %p) by+(se %p)])
      ==
    ::
    ++  mist-stir
      |=  jon=json
      ^-  stir:mist
      %.  jon
      %-  ot
      :~  path+|=(=json ;;(mist-path (pa json)))
          id+so:soft
          goals+(ar mist-goal)
      ==
    ++  mist-goal
      |=  jon=json
      ^-  goal:mist
      %.  jon
      %+  goal  goal:mist
      :~  set-color+ni
          add-thing-from-closet+pa
          del-thing+ni
          accept-port-offer+pa-turf-id
          reject-port-offer+pa-turf-id
          export-self+port-offer
      ==
    ::
    ++  form-spec
      |=  jon=json
      ^-  ^form-spec
      %.  jon
      (ot ~['formId'^pa form+form])
    ++  form
      |=  jon=json
      ^-  ^form
      %.  jon
      %-  ot
      :~  name+so
          type+(cork so form-type)
          variations+(ar luuk)
          offset+svec2
          collidable+bo
          effects+|=(json *fx)
          seeds+|=(json *sfx)
      ==
    ++  luuk
      |=  jon=json
      ^-  ^luuk
      ?~  jon  ~
      `((ot ~[deep+(cork so deep) sprite+sprite]) jon)
    ++  sprite
      |=  jon=json
      ^-  ^sprite
      ?:  ?=([%s *] jon)  (so jon)
      *anim
    ++  add-husk-spec
      |=  jon=json
      ^-  ^add-husk-spec
      %.  jon
      (ot ~['isLunk'^bo pos+svec2 'formId'^pa variation+ni])
    ++  maybe-possible-effect
      |=  jon=json
      ^-  (unit possible-effect)
      ?~  jon  ~
      :-  ~
      ?:  ?=([%s *] jon)
        (effect-type jon)
      (effect jon)
    ++  effect-type  (cork so ^effect-type)
    ++  effect
      |=  jon=json
      ^-  ^effect
      ?>  ?=([%o *] jon)
      =/  type  (effect-type (~(got by p.jon) 'type'))
      =/  arg  (~(got by p.jon) 'arg')
      ?-  type
        %port  port+(ni arg)
        %jump  jump+(svec2 arg)
        %read  read+(so arg)
        %swap  swap+(pa arg)
      ==
    ++  port-offer
      |=  jon=json
      ^-  ^port-offer
      :-  ((ot ~[for+pa-turf-id]) jon)
      %.  jon
      %-  ot:soft
      ~[of+pa-turf-id-soft from+ni:soft at+ni:soft]

    ++  dir
      |=  jon=json
      ^-  ^dir
      ;;(^dir (so jon))
    ++  svec2
      |=  jon=json
      ^-  ^svec2
      ((ot ~[x+ns y+ns]) jon)
    ++  vec2
      |=  jon=json
      ^-  ^vec2
      ((ot ~[x+ni y+ni]) jon)
    ++  maybe-ni
      |*  wit=fist
      |=  jon=json
      ^-  ?(@ud _(wit *json))
      ?:  ?=(%n -.jon)
        (ni jon)
      (wit jon)
    ++  ns  :: signed integer!
      |=  jon=json
      ^-  @sd
      ?>  ?=([%n *] jon)
      (need (toi:rd (ne jon)))
    ++  pa-turf-id-soft  (cork pa path-to-turf-id)
    ++  pa-turf-id  (cork pa-turf-id-soft need)
    ++  ot-turf-id
      |=  jon=json
      ^-  ^turf-id
      ((ot ~[ship+(se %p) path+pa]) jon)
    :: ++turf-id used by %join-turf mark
    :: we're trying to support an intentionally blank turf-id
    :: but I think this is the wrong aporach
    ++  turf-id
      |=  jon=json
      ^-  (unit ^turf-id)
      =/  path  (pa jon)
      ?~  path  ~
      `(need (path-to-turf-id path))
    ++  vita-action
      |=  jon=json
      ^-  action:vita-client
      %.  jon
      (of ~[set-enabled+bo])
  --
--
