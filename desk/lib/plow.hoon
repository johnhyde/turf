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
+$  poly  (list mono-grit:pond)
+$  upoly  (list (unit mono-grit:pond))
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
++  filter-pond-goal
  |=  [=rock:pond =goal:pond =bowl:gall]
  ^-  (quip roar (unit grit:pond))
  =/  goals
    ?:  ?=([%batch *] goal)
      +.goal
    [goal ~]
  :: ?:  ?=([%batch *] goal)
  =/  [=roars =poly new-rock=rock:pond]
    %+  roll  goals
    |=  [sub-goal=mono-goal:pond [=roars =poly rock=$~(rock rock:pond)]]
    ^-  [^roars ^poly rock:pond]
    =/  [sub-roars=^roars sub-poly=^poly]
      (filter-pond-mono-goal rock sub-goal bowl)
    :: ~&  ["sub-roars and sub-poly" sub-roars sub-poly]
    :: ~&  ["roars and poly" roars poly]
    :-  (weld roars sub-roars)
    :-  (weld poly sub-poly)
    |-  ^-  rock:pond
    ?~  sub-poly  rock
    %=  $
      rock  (wash:pond rock [~ ~ i.sub-poly])
      sub-poly  t.sub-poly
    ==
  :-  roars
  ?~  poly  ~
  :-  ~
  ?:  &(=(1 (lent poly)) !?=([%batch *] goal))
    i.poly
  [%batch `(list mono-grit:pond)`poly]
  :: (filter-pond-mono-goal rock goal bowl)
++  filter-pond-mono-goal
  |=  [=rock:pond goal=mono-goal:pond =bowl:gall]
  ^-  [roars poly]
  :: :-  ~
  :: ~&  "we are filtering goal {<-.goal>}"
  =/  uturf  turf.rock
  ?~  uturf
    ?+    goal  `~
        [%set-turf *]
      ?.  =(our.bowl src.bowl)
        `~
      `[goal]~
    ==
  :: ~&  "turf is not null"
  =*  turf  u.uturf
  ?@  goal
    `[goal]~
  :: ~&  "goal is not atom"
  ?+    -.goal  `[goal]~
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
    :: =.  goal  goal(pos pos)
    =/  leave=[roars poly]  (pull-trigger turf ship.goal %leave pos.u.player)
    =/  step=[roars poly]  (pull-trigger turf ship.goal %step pos)
    :-  (weld -.leave -.step)
    :-  goal(pos pos)
    (weld +.leave +.step)
      %send-chat
    ?.  =(src.bowl from.goal)  `~
    `[%chat from.goal now.bowl text.goal]~
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
      %set-shade-effect
    =/  thing  (get-thing-by-shade-id turf shade-id.goal)
    ?~  thing  `~
    =/  original-effect  (get-effect u.thing trigger.goal)
    =/  =roars
      ?~  original-effect  ~
      ?:  =(original-effect effect.goal)
        ~
      ~
      :: ?.  ?=(%port -.original-effect)
      ::   ~
      
    :_  [goal]~
    ~
      %del-shade
    `[goal]~
      %create-portal
    ?.  =(our src):bowl  `~
    ::  todo: don't send a portal request here because there's no shade yet
    :-  [%portal-request stuff-counter.plot.turf for.goal]~
    [goal]~
      %discard-portal
    ?.  =(our src):bowl  `~
    =/  portal  (~(get by portals.deed.turf) from.goal)
    ?~  portal  `~
    :-  ?~  at.u.portal
          [%portal-retract from.goal for.u.portal]~
        [%portal-discard for.u.portal u.at.u.portal]~
    [goal]~
      %portal-requested
    ?.  =(src.bowl ship.for.goal)  `~
    `[goal]~
      %portal-discarded
    =/  portal  (~(get by portals.deed.turf) from.goal)
    ?~  portal  `~
    ?.  =(src.bowl ship.for.u.portal)  `~
    `[goal]~
  ==
++  pull-trigger
  |=  [=turf =ship =trigger pos=svec2]
  ^-  [=roars =poly]
  =/  things  (get-things turf pos)
  =/  effects=(list effect)
    %+  murn  things
    |=  =thing
    (get-effect thing trigger)
  %+  roll  effects
  |=  [=effect =roars =poly]
  =/  res  (apply-effect turf ship effect)
  :-  (weld roars roars.res)
  (weld poly poly.res)
++  apply-effect
  |=  [=turf =ship =effect]
  ^-  [=roars =poly]
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
    |=  [id=stir-id:pond ugrit=(unit grit:pond)]
    ^-  json
    %+  frond  %wave
    %-  pairs
    :_  [id+(fall (bind id |=(i=@t s+i)) ~)]~
    :-  %grit
    ?~  ugrit  ~
    (pond-grit u.ugrit)
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
            %batch
          a+(turn +.grit pond-grit)
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
            %create-portal
          (turf-id for.grit)
            %discard-portal
          (frond 'from' (numb from.grit))
            %portal-requested
          %-  pairs
          :~  for+(turf-id for.grit)
              at+(numb at.grit)
          ==
            %portal-retracted
          %-  pairs
          :~  for+(turf-id for.grit)
              at+(numb at.grit)
          ==
            %portal-discarded
          (frond 'from' (numb from.grit))
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
        :: s+?@(wave wave -.wave)
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
    ++  grid  :: not used anymore
      ^-  json
      :-  %a
      =+  grid=(spaces-to-grid ^spaces offset size)
      %+  turn  grid
      |=  =col
      ^-  json
      a+(turn col space)
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
          goal+pond-goal
      ==
    ++  pond-goal
      |=  jon=json
      ^-  goal:pond
      ?:  ?=([%o [%batch *] *] jon)
        :-  %batch
        ((ar pond-mono-goal) q.n.p.jon)
      (pond-mono-goal jon)
    ++  pond-mono-goal
      |=  jon=json
      ^-  mono-goal:pond
      %.  jon
      %+  wave  mono-goal:pond
      :~  move+(ot ~[ship+(se %p) pos+svec2])
          face+(ot ~[ship+(se %p) dir+dir])
          send-chat+(ot ~[from+(se %p) text+so])
          size-turf+(ot ~[offset+svec2 size+vec2])
          add-husk+(ot ~[pos+svec2 'formId'^pa variation+ni])
          del-shade+(ot ~['shadeId'^ni])
          cycle-shade+(ot ~['shadeId'^ni amount+ni])
          set-shade-var+(ot ~['shadeId'^ni variation+ni])
          set-shade-effect+(ot ~['shadeId'^ni trigger+(cork so trigger) effect+maybe-possible-effect])
          :: todo: set-turf
          create-portal+ot-turf-id
          discard-portal+(ot ~[from+ni])
      ==
    ::
    ++  mist-stir
      |=  jon=json
      ^-  stir:mist
      %.  jon
      %-  ot
      :~  path+|=(=json ;;(mist-path (pa json)))
          id+so:soft
          goal+mist-wave
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
