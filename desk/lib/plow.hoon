/-  *turf, pond
/+  *turf, sss
|%
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
    |=  =wave:pond
    ^-  json
    %+  frond  %wave
    %-  pairs
    :~  :-  %type
        s+?@(wave wave -.wave)
      ::
        :-  %arg
        ?-  -.wave
            %set-turf
          (turf turf.wave)
            %add-item
          (hollow-item-spec +.wave)
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
        library+library
        'itemCounter'^(numb item-counter)
    ==
    ++  spaces
      ^-  json
      :-  %a
      =+  grid=(spaces-to-grid ^spaces size offset)
      %+  turn  grid
      |=  =col
      ^-  json
      a+(turn col space)
    ++  library
      ^-  json
      %-  pairs
      %+  turn  ~(tap by ^library)
      |=  [=item-id =item]
      :-  (spat item-id)
      (pairs (item-pairs item))
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
    :~  color+s+color.avatar
        items+a+(turn items.avatar solid-item)
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
    :~  tile+(fall ((lift hollow-item) tile.space) ~)
        items+a+(turn items.space hollow-item)
    ==
  ++  solid-item
    |=  item=^solid-item
    ^-  json
    %-  pairs
    (weld (item-pairs -.item) (hollow-item-pairs +.item))
  ++  hollow-item
    |=  item=^hollow-item
    ^-  json
    (pairs (hollow-item-pairs item))
  ++  hollow-item-pairs
    |=  item=^hollow-item
    ^-  (list [@t json])
    =,  item
    :~  id+(numb id)
        'itemId'^(path item-id)
        variation+(numb variation)
        offset+(svec2 offset)
    ==
  ++  item-pairs
    |=  =item
    ^-  (list [@t json])
    =,  item
    :~  name+s+name
        type+s+type
        collidable+b+collidable
        variations+a+(turn variations look)
        effects+(pairs (turn ~(tap by effects) effect))
    ==
  ++  hollow-item-spec
    |=  item-spec=^hollow-item-spec
    =,  item-spec
    ^-  json
    %-  pairs
    :~  pos+(svec2 pos)
        'itemId'^(path item-id)
        variation+(numb variation)
    ==
  ++  look
    |=  =^look
    ^-  json
    %-  pairs
    :~  back+(fall ((lift sprite) back.look) ~)
        fore+(fall ((lift sprite) fore.look) ~)
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
  |%
    :: todo: support rocks as well as waves
    ++  pond-res
      |=  jon=json
      ^-  (response:poke:sss pond pond-path)
      %-  %-  ot
          ~[path+pa dude+so aeon+ni type+_%scry what+_%wave wave+pond-wave]
      jon
    ++  pond-wave
      |=  jon=json
      ^-  wave:pond
      ?:  ?=([%s *] jon)
        ;;(wave:pond (so jon))
      ?>  ?=([%o *] jon)
      %-  %-  of
          :~  move+(ot ~[ship+(se %p) pos+svec2])
              :: todo: set-turf, add-item, chat
          ==
      jon
    ::
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
