/-  *turf, pond, mist
/+  *turf, sss
|%
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
  ^-  (unit grit:pond)
  ?:  ?=([%batch *] goal)
    =/  [upoly=(list (unit mono-grit:pond)) *]
      %^  spin  +.goal  rock
      |=  [sub-goal=mono-goal:pond rock=rock:pond]
      ^-  [(unit mono-grit:pond) rock:pond]
      =/  grit  (filter-pond-mono-goal rock sub-goal bowl)
      ?~  grit  `rock
      :-  grit
      (wash:pond rock [~ ~ u.grit])
    ?~  poly=(murn upoly same)  ~
    `[%batch `(list mono-grit:pond)`poly]
  (filter-pond-mono-goal rock goal bowl)
++  filter-pond-mono-goal
  |=  [=rock:pond goal=mono-goal:pond =bowl:gall]
  ^-  (unit mono-grit:pond)
  =/  uturf  turf.rock
  ?~  uturf
    ?+    goal  ~
        [%set-turf *]
      ?.  =(our.bowl src.bowl)
        ~
      `goal
    ==
  =*  turf  u.uturf
  ?@  goal
    `goal
  ?+    -.goal  `goal
      %move
    =*  players  players.ephemera.turf
    =/  player  (~(get by players) ship.goal)
    ?~  player  ~
    =/  pos  (clamp-pos pos.goal offset.plot.turf size.plot.turf)
    =/  player-colliding  (get-collidable turf pos.u.player)
    =/  will-be-colliding  (get-collidable turf pos)
    ?:  &(will-be-colliding !player-colliding)
      ~
    ?:  =(pos pos.u.player)  ~
    `goal(pos pos)
      %send-chat
    ?.  =(src.bowl from.goal)  ~
    :-  ~
    [%chat from.goal now.bowl text.goal]
      %join-player
    =|  =player
    :-  ~
    [%add-player ship.goal player(avatar avatar.goal)]
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
    (avatar rock)
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
    =,  plot.turf
    |^  ^-  json
    %-  pairs
    :~  players+(pairs (turn ~(tap by players) player-pair))
        chats+a+(turn chats chat)
        size+(vec2 size)
        offset+(svec2 offset)
        'tileSize'^(vec2 tile-size)
        spaces+spaces
        skye+(^skye skye)
        cave+cave
        'stuffCounter'^(numb stuff-counter)
    ==
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
        effects+(pairs (turn ~(tap by effects) effect))
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
  ++  effect
    |=  [=trigger =^effect]
    :-  trigger
    ^-  json
    %-  pairs
    :~  type+s+-.effect
        :-  %arg
        ^-  json
        ?-  -.effect
          %port  (turf-id +.effect)
          %jump  (svec2 +.effect)
          %read  s+note.effect
          %swap  (path +.effect)
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
      :~  path+(cork pa |=(=path (need (path-to-turf-id path))))
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
          :: todo: set-turf, chat
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
  --
--
