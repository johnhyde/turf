/-  *turf, pond
/+  *turf
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
    ?@  wave
      %+  frond  wave  b+%.y
    %+  frond  -.wave
    (turf turf.wave)
  ++  turf
    |=  =^turf
    =,  plot.turf
    |^  ^-  json
    %-  pairs
    :~  size+(vec2 size)
        offset+(svec2 offset)
        tile-size+(vec2 tile-size)
        spaces+spaces
        library+library
        item-counter+(numb item-counter)
    ==
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
    ++  spaces
      ^-  json
      :-  %a
      =+  grid=(spaces-to-grid ^spaces size offset)
      %+  turn  grid
      |=  =col
      ^-  json
      a+(turn col space)
    ++  space
      |=  =^space
      ^-  json
      %-  pairs
      :~  tile+(fall ((lift item-instance) tile.space) ~)
          items+a+(turn items.space item-instance)
      ==
    ++  item-instance
      |=  inst=^item-instance
      ^-  json
      %-  pairs
      =,  inst
      :~  id+(numb id)
          item-id+(path item-id)
          variation+(numb variation)
          offset+(svec2 offset)
      ==
    ++  library
      ^-  json
      %-  pairs
      %+  turn  ~(tap by ^library)
      |=  [=item-id =item]
      :-  (spat item-id)
      %-  pairs
      =,  item
      :~  name+s+name
          type+s+type
          collidable+b+collidable
          variations+a+(turn variations look)
          effects+(pairs (turn ~(tap by effects) effect))
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
      :~  ship+(ship ship.id)
          path+(path path.id)
      ==
    --
  --
--
