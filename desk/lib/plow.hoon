/-  *turf, pond
/+  *turf, sss
|%
++  filter-wave
  |=  [=rock:pond =wave:pond]
  ^-  (unit wave:pond)
  ?~  rock  `wave
  =*  turf  u.rock
  ?@  wave
    `wave
  ?+  -.wave  `wave
      %move
    =*  players  players.ephemera.turf
    =/  player  (~(get by players) ship.wave)
    ?~  player  ~
    =/  pos  (clamp-pos pos.wave offset.plot.turf size.plot.turf)
    =/  player-colliding  (get-collidable turf pos.u.player)
    =/  will-be-colliding  (get-collidable turf pos)
    ?:  &(will-be-colliding !player-colliding)
      ~
    `wave(pos pos)
  ==
::
++  enjs
  =,  enjs:format
  |%
  ++  pond-rock
    |=  =rock:pond
    ^-  json
    %+  frond  %rock
    ?~  rock  ~
    (turf u.rock)
  ++  pond-wave
    |=  [id=stir-id:pond uwave=(unit wave:pond)]
    ^-  json
    %-  pairs
    :_  :-  id+(fall (bind id |=(i=@t s+i)) ~)  ~
    :-  %wave
    ?~  uwave  ~
    =*  wave  u.uwave
    %-  pairs
    :~  :-  %type
        s+?@(wave wave -.wave)
      ::
        :-  %arg
        ?-  -.wave
            %set-turf
          (turf turf.wave)
            %add-husk
          (husk-spec +.wave)
            %del-shade
          (frond 'shadeId' (numb +.wave))
            %cycle-shade
          (pairs ~['shadeId'^(numb shade-id.wave) amount+(numb amt.wave)])
            %set-shade-var
          (pairs ~['shadeId'^(numb shade-id.wave) variation+(numb variation.wave)])
            %chat
          (chat chat.wave)
            %move
          (move +.wave)
    ==  ==
  ++  turf
    |=  =^turf
    =,  ephemera.turf
    =,  plot.turf
    |^  ^-  json
    %-  pairs
    :~  players+(pairs (turn ~(tap by players) player))
        chats+a+(turn chats chat)
        size+(vec2 size)
        offset+(svec2 offset)
        'tileSize'^(vec2 tile-size)
        spaces+spaces
        skye+skye
        cave+cave
        'stuffCounter'^(numb stuff-counter)
    ==
    ++  spaces
      ^-  json
      :-  %a
      =+  grid=(spaces-to-grid ^spaces offset size)
      %+  turn  grid
      |=  =col
      ^-  json
      a+(turn col space)
    ++  skye
      ^-  json
      %-  pairs
      %+  turn  ~(tap by ^skye)
      |=  [=form-id =form]
      :-  (spat form-id)
      (pairs (form-pairs form))
    ++  cave
      ^-  json
      %-  pairs
      %+  turn  ~(tap by ^cave)
      |=  [=shade-id =shade]
      ^-  [@ta json]
      =/  id  (numb shade-id)
      ?>  ?=([%n @ta] id)
      :-  ^-  @ta  +:id
      (pairs (shade-pairs shade))
    --
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
  ++  snumb
    |=  a=@s
    ^-  json
    =/  [sign=? abs=@u]
      (old:si a)
    =/  num  (numb abs)
    ?>  ?=(%n -.num)
    ?:  sign  num
    :-  %n
    `@t`(cat 3 '-' +.num)
  ++  player
    |=  [who=^ship =^player]
    :-  (scot %p who)
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
    :~  from+s+(scot %p from.chat)
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
    %-  pairs
    :~  back+(fall (bind back.look sprite) ~)
        fore+(fall (bind fore.look sprite) ~)
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
    :~  ship+s+(scot %p ship.id)
        path+(path path.id)
    ==
  ++  move
    |=  [shp=^ship pos=^svec2]
    ^-  json
    %-  pairs
    :~  ship+s+(scot %p shp)
        pos+(svec2 pos)
    ==
  --
++  dejs
  =,  dejs:format
  =*  soft  dejs-soft:format
  |%
    :: todo: support rocks as well as waves
    ++  stir-pond
      |=  jon=json
      ^-  stir:pond
      %-  %-  ot
          ~[path+(cork pa |=(=path ;;(pond-path path))) id+so:soft wave+pond-wave]
      jon
    ++  pond-wave
      |=  jon=json
      ^-  wave:pond
      ?:  ?=([%s *] jon)
        ;;(wave:pond (so jon))
      ?>  ?=([%o *] jon)
      %-  %-  of
          :~  move+(ot ~[ship+(se %p) pos+svec2])
              add-husk+(ot ~[pos+svec2 'formId'^pa variation+ni])
              del-shade+shade-id
              cycle-shade+(ot ~['shadeId'^ni amount+ni])
              set-shade-var+(ot ~['shadeId'^ni variation+ni])
              :: todo: set-turf, chat
          ==
      jon
    ::
    ++  shade-id  (ot ~['shadeId'^ni])
    ++  svec2
      |=  jon=json
      ^-  ^svec2
      ((ot ~[x+ns y+ns]) jon)
    ++  ns  :: signed integer!
      |=  jon=json
      ^-  @sd
      ?>  ?=([%n *] jon)
      (need (toi:rd (ne jon)))
  --
--
