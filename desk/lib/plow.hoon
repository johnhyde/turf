/-  *turf, pond, mist
/+  *turf, sss
|%
:: roars are turf-scoped effects emitted by filters
:: which update state and produce cards
+$  roar
  $%  [%portal-request from=portal-id for=turf-id]
      [%portal-retract from=portal-id for=turf-id]
      [%portal-confirm from=portal-id for=turf-id at=portal-id]
      [%portal-discard for=turf-id at=portal-id]
      [%port =ship for=turf-id at=portal-id]
      [%player-add =ship]
      [%player-del =ship]
  ==
+$  roars  (list roar)
+$  ctx  [=bowl:gall =rock:pond top=?]
++  filter-mist-goal
  |=  [=rock:mist wave=stir-wave:mist closet=skye]
  ^-  (unit wave:mist)
  ?+    -.wave  `wave
      %add-thing-from-closet
    =/  form  (~(get by closet) form-id.wave)
    ?~  form  ~
    :-  ~
    :-  %add-thing
    ^-  thing
    :-  [form-id.wave 0 *husk-bits]
    u.form
  ==
++  filter-pond-goals
  |=  [=ctx =goals:pond]
  ^-  [roars grits:pond]
  =<  [roars ?~(grits [%noop]~ grits)]
  %+  roll  goals
    |=  [sub-goal=goal:pond [[=roars =grits:pond] rock=$~(rock.ctx rock:pond)]]
    ^-  [[^roars grits:pond] rock:pond]
    =/  [sub-roars=^roars sub-grits=grits:pond]
      (filter-pond-goal ctx(rock rock) sub-goal)
    :: ~&  ["sub-roars and sub-grits" sub-roars sub-grits]
    :: ~&  ["roars and grits" roars grits]
    :-  :-  (weld roars sub-roars)
            (weld grits sub-grits)
    (wash-grits rock sub-grits)
++  mix-pond-grals
  |=  [=ctx =roars =grits:pond =goals:pond]
  ^-  [^roars grits:pond]
  ?~  goals  roars^grits
  =.  rock.ctx  (wash-grits rock.ctx grits)
  =+  rgs=(filter-pond-goals ctx goals)
  [(weld roars -.rgs) (weld grits +.rgs)]
++  wash-grits
  |=  [=rock:pond =grits:pond]
  ?~  grits  rock
  %=  $
    rock  (wash:pond rock *foam:pond i.grits)
    grits  t.grits
  ==
++  filter-pond-goal
  |=  [=ctx =goal:pond]
  ^-  [roars grits:pond]
  =*  bowl  bowl.ctx
  =*  rock  rock.ctx
  :: :-  ~
  ~&  "filtering goal {<-.goal>}"
  =/  uturf  turf.rock
  ?~  uturf
    ?+    goal  `~
        [%set-turf *]
      ?.  =(our.bowl src.bowl)
        `~
      `[goal]~
    ==
  =*  turf  u.uturf
  ?@  goal
    `[goal]~
  ?+    -.goal  `[goal]~
      %del-shade
    =/  shade-fx  (get-effects-by-shade-id turf shade-id.goal)
    ?~  shade-fx  `~
    =/  portal-counts  (count-portal-effects full-fx.u.shade-fx)
    =/  =goals:pond
      %+  turn  ~(tap in ~(key by portal-counts))
      |=  =portal-id
      [%del-shade-from-portal portal-id shade-id.goal]
    (mix-pond-grals ctx(top |) ~ [goal]~ goals)
      %set-shade-effect
    =/  shade-fx  (get-effects-by-shade-id turf shade-id.goal)
    ?~  shade-fx  `~
    =,  u.shade-fx
    =/  =goals:pond
      =/  og-effect  (~(get by full-fx) trigger.goal) 
      =/  del-portal-id=(unit portal-id)
        ?~  og-effect  ~
        (get-maybe-effect-portal u.og-effect)
      =/  add-portal-id  (get-maybe-effect-portal effect.goal)
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
    (mix-pond-grals ctx(top |) ~ [goal]~ goals)
    ::
      %create-bridge
    :: $:  %create-bridge
    ::     shade=?(shade-id husk-spec) 
    ::     =trigger
    ::     portal=?(portal-id turf-id)
    :: ==
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
    (filter-pond-goals ctx(top |) goals)
    ::
      %add-portal
    ?.  =(our src):bowl  `~
    `[goal]~
    ::
      %del-portal
    ?:  &(top.ctx !=(our src):bowl)  `~
    =/  portal  (~(get by portals.deed.turf) from.goal)
    ?~  portal  `~
    =/  roars
      ?.  loud.goal  ~
      ?~  at.u.portal
        [%portal-retract from.goal for.u.portal]~
      [%portal-discard for.u.portal u.at.u.portal]~
    =/  grits  [goal]~
    =/  goals
      ?~  shade-id.u.portal  ~
      [%del-portal-from-shade u.shade-id.u.portal from.goal]~
    (mix-pond-grals ctx(top |) roars grits goals)
    ::
      %add-shade-to-portal
    =/  portal  (~(gut by portals.deed.turf) from.goal ~)
    ?~  portal  `~
    =/  roars
      ?^  shade-id.portal  ~
      ?~  at.portal
        [%portal-request from.goal for.portal]~
      [%portal-confirm from.goal for.portal u.at.portal]~
    =/  goals
      ?~  shade-id.portal  ~
      ?:  =(shade-id.portal `shade-id.goal)
        ~
      [%del-portal-from-shade u.shade-id.portal from.goal]~
    (mix-pond-grals ctx(top |) roars [goal]~ goals)
    ::
      %del-shade-from-portal
    =/  portal  (~(get by portals.deed.turf) from.goal)
    ?~  portal  `~
    ?.  =(shade-id.u.portal `shade-id.goal)
      `~
    (mix-pond-grals ctx(top |) ~ [goal]~ [%del-portal from.goal loud=%.y]~)
    ::
      %del-portal-from-shade  
    =/  shade  (~(gut by cave.plot.turf) shade-id.goal ~)
    ?~  shade  `~
    ?.  =(/portal (scag 3 form-id.shade))
      `[goal]~
    =/  shade-fx  (get-effects-by-shade turf shade)
    =/  portal-counts  (count-portal-effects full-fx.shade-fx)
    =/  =goals:pond
      ?.  (~(has by portal-counts) portal-id.goal)
        ~
      ?.  =(~(wyt by portal-counts) 1)
        ~
      [%del-shade shade-id.goal]~
    (mix-pond-grals ctx(top |) ~ [goal]~ goals)
    ::
      %portal-requested
    ?.  =(src.bowl ship.for.goal)  `~
    `[%add-portal for.goal `at.goal]~
    ::
      %portal-retracted
    ?.  =(src.bowl ship.for.goal)  `~
    =/  portals  ~(tap by portals.deed.turf)
    =/  portal-id
      |-  ^-  (unit portal-id)
      ?~  portals  ~
      =/  portal  q.i.portals
      ?:  &(=(for.goal for.portal) =(`at.goal at.portal))
        `p.i.portals
      $(portals t.portals)
    :: ~&  "we got this portal id based on our search: {<portal-id>}"
    ?~  portal-id  `~
    (filter-pond-goal ctx(top |) [%del-portal u.portal-id loud=%.n])
      %portal-confirmed
    =/  portal  (~(get by portals.deed.turf) from.goal)
    ?~  portal  `~
    ?.  =(src.bowl ship.for.u.portal)  `~
    `[goal]~
      %portal-discarded
    =/  portal  (~(get by portals.deed.turf) from.goal)
    ?~  portal  `~
    ?.  =(src.bowl ship.for.u.portal)  `~
    (filter-pond-goal ctx(top |) [%del-portal from.goal loud=%.n])
      %send-chat
    ?.  =(src.bowl from.goal)  `~
    `[%chat from.goal now.bowl text.goal]~
      %move
    =*  players  players.ephemera.turf
    =/  player  (~(get by players) ship.goal)
    ?~  player  `~
    =/  pos  (clamp-pos pos.goal offset.plot.turf size.plot.turf)
    =/  player-colliding  (get-collidable turf pos.u.player)
    =/  will-be-colliding  (get-collidable turf pos)
    ?:  &(will-be-colliding !player-colliding)
      :: todo: get bump effects
      `~
    ?:  =(pos pos.u.player)  `~
    =/  leave=[roars grits:pond]  (pull-trigger turf ship.goal %leave pos.u.player)
    =/  step=[roars grits:pond]  (pull-trigger turf ship.goal %step pos)
    :-  (weld -.leave -.step)
    :-  goal(pos pos)
    (weld +.leave +.step)
      %join-player
    =|  =player
    :-  [%player-add ship.goal]~
    [%add-player ship.goal player(avatar avatar.goal)]~
      %add-player
    :-  [%player-add ship.goal]~
    [goal]~
      %del-player
    :-  [%player-del ship.goal]~
    [goal]~
  ==
++  pull-trigger
  |=  [=turf =ship =trigger pos=svec2]
  ^-  [=roars =grits:pond]
  =/  things  (get-things turf pos)
  =/  effects=(list effect)
    %+  murn  things
    |=  =thing
    (get-effect thing trigger)
  %+  roll  effects
  |=  [=effect =roars =grits:pond]
  =/  res  (apply-effect turf ship effect)
  :-  (weld roars roars.res)
  (weld grits grits.res)
++  apply-effect
  |=  [=turf =ship =effect]
  ^-  [=roars =grits:pond]
  ?+    -.effect  `~
      %port
    =/  portal  (~(get by portals.deed.turf) portal-id.effect)
    :-
      ?~  portal  ~
      ?~  at.u.portal  ~
      [%port ship for.u.portal u.at.u.portal]~
    :: [%del-player ship]~
    ~
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
    :~  :-  'stirIds'
        (pairs (turn ~(tap by stir-ids.rock) stir-id-pair))
      ::
        :-  %turf
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
            %add-husk
          (husk-spec +.grit)
            %del-shade
          (frond 'shadeId' (numb +.grit))
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
            %set-avatar
          (pond-set-avatar +.grit)
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
    :~  :-  'turfId'
        ?~  ctid.rock  ~
        (path (turf-id-to-path u.ctid.rock))
      ::
        avatar+(avatar avatar.rock)
    ==
  ++  mist-wave
    |=  [id=stir-id:mist uwave=(unit wave:mist)]
    ^-  json
    %-  pairs
    :_  :-  id+(fall (bind id |=(i=@t s+i)) ~)  ~
    :-  %wave
    ?~  uwave  ~
    =*  wave  u.uwave
    %-  pairs
    :~  :-  %type
        s+-.wave
      ::
        :-  %arg
        ?+  -.wave  ~
            %set-avatar
          (avatar +.wave)
            %set-color
          (numb +.wave)
    ==  ==
  ++  stir-id-pair
    |=  [src=^ship id=@t]
    :-  (scot %p src)
    s+id
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
    |=  [=form-id =form]
    :-  (spat form-id)
    (pairs (form-pairs form))
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
  ++  form-pairs
    |=  =form
    ^-  (list [@t json])
    =,  form
    :~  name+s+name
        type+s+type
        variations+a+(turn variations look)
        offset+(svec2 offset)
        collidable+b+collidable
        effects+(pairs (turn ~(tap by effects) effect))
        seeds+(pairs (turn ~(tap by seeds) effect-type))
    ==
  ++  husk-spec
    |=  =^husk-spec
    =,  husk-spec
    ^-  json
    %-  pairs
    :~  pos+(svec2 pos)
        'formId'^(path form-id)
        variation+(numb variation)
    ==
  ++  look
    |=  =^look
    ^-  json
    ?~  look  ~
    %-  pairs
    :~  deep+s+deep.u.look
        sprite+(sprite sprite.u.look)
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
  --
++  dejs
  =,  dejs:format
  =*  soft  dejs-soft:format
  |%
    ++  wave
      |*  [wave=mold pairs=(pole [cord fist])]
      |=  jon=json
      ^-  wave
      ?:  ?=([%s *] jon)
        ;;(wave (so jon))
      ?>  ?=([%o *] jon)
      ((of pairs) jon)
    :: todo: support rocks as well as waves
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
      %+  wave  goal:pond
      :: todo: set-turf?
      :~  size-turf+(ot ~[offset+svec2 size+vec2])
          add-husk+husk-spec
          del-shade+(ot ~['shadeId'^ni])
          cycle-shade+(ot ~['shadeId'^ni amount+ni])
          set-shade-var+(ot ~['shadeId'^ni variation+ni])
          set-shade-effect+(ot ~['shadeId'^ni trigger+(cork so trigger) effect+maybe-possible-effect])
          :-  %create-bridge
          %-  ot
          :~  shade+(maybe-ni husk-spec)
              trigger+(cork so trigger)
              portal+(maybe-ni ot-turf-id)
          ==
          ::
          add-portal+(ot ~[for+ot-turf-id at+ni:soft])
          del-portal+(ot ~[from+ni loud+bo])
          send-chat+(ot ~[from+(se %p) text+so])
          move+(ot ~[ship+(se %p) pos+svec2])
          face+(ot ~[ship+(se %p) dir+dir])
      ==
    ++  maybe-ni
      |*  wit=fist
      |=  jon=json
      ^-  ?(@ud _(wit *json))
      ?:  ?=(%n -.jon)
        (ni jon)
      (wit jon)
    ::
    ++  mist-stir
      |=  jon=json
      ^-  stir:mist
      %.  jon
      %-  ot
      :~  path+|=(=json ;;(mist-path (pa json)))
          id+so:soft
          goals+(at ~[mist-wave])
      ==
    ++  mist-wave
      |=  jon=json
      ^-  stir-wave:mist
      %.  jon
      %+  wave  stir-wave:mist
      :~  set-color+ni
          add-thing-from-closet+pa
          del-thing+ni
      ==
    ::
    ++  husk-spec
      |=  jon=json
      ^-  ^husk-spec
      %.  jon
      (ot ~[pos+svec2 'formId'^pa variation+ni])
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
    ++  ns  :: signed integer!
      |=  jon=json
      ^-  @sd
      ?>  ?=([%n *] jon)
      (need (toi:rd (ne jon)))
    ++  pa-turf-id  :(cork pa path-to-turf-id need)
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
  --
--
