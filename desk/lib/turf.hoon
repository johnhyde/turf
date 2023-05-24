/-  sur=turf
/+  sprites
=<  [sur .]
=,  sur
|%
++  default-turf
  |=  our=ship
  ^-  turf
  =|  =turf
  %=  turf
      library.plot  default-library
      spaces.plot   (fill-space size.plot.turf /floor/wood)
      item-counter.plot  (mul size.plot.turf)
      players.ephemera  (~(put by players.ephemera.turf) our new-player)
  ==
++  default-library
  ^-  library
  %-  malt
  ^-  (list [item-id item])
  =,  sprites
  :~  :-  /floor/wood
      (new-tile 'Wood Floor' floor)
    ::
      :-  /grass
      (new-tile 'Grass' grass)
    ::
      :-  /grass/long
      (new-tile 'Long Grass' long-grass)
  ==
++  new-tile
  |=  [name=@t =png]
  ^-  item
  :*  name
      %tile
      %.n
      [`png ~]~
      ~
  ==
++  new-item
  |=  [=item-type name=@t =png]
  ^-  item
  :*  name
      item-type
      %.n
      [`png ~]~
      ~
  ==
++  fill-space
  |=  [size=vec2 id=item-id]
  ^-  spaces
  %-  malt
  =|  spaces=(list [svec2 space])
  =+  total=(mul size)
  =|  count=@ud
  |-  ^-  _spaces
  ?:  =(total count)
    spaces
  =/  pos=svec2
    :-  (sun:si (mod count x.size))
    (sun:si (div count x.size))
  =/  =space
    :_  ~
    :-  ~
    ^-  hollow-item
    [id count 0 *svec2]
  %=  $
    count  +(count)
    spaces  [[pos space] spaces]
  ==
++  spaces-to-grid
  |=  [=spaces size=vec2 offset=svec2]
  =/  ssize  (vec2-to-svec2 size)
  ^-  grid
  =/  ending=svec2  (sum-svec2 offset ssize)
  :: =|  cols=grid
  |-  ^-  grid
  ?:  =(x.offset x.ending)  ~
  :-  |-  ^-  col
      ?:  =(y.offset y.ending)  ~
      :-  (~(gut by spaces) offset [~ ~])
      $(y.offset (sum:si y.offset --1))
  $(x.offset (sum:si x.offset --1))
++  vec2-to-svec2
  |=  =vec2
  ^-  svec2
  [(sun:si x.vec2) (sun:si y.vec2)]
++  sum-svec2
  |=  [a=svec2 b=svec2]
  ^-  svec2
  [(sum:si x.a x.b) (sum:si x.a x.b)]
++  new-player
  ^-  player
  :*  pos=*svec2
      %down
      color='#d23'
      :~  `solid-item`[(new-item %garb 'Scarecrow Body' player.sprites) /body/scarecrow 0 0 *svec2]
      ==
  ==
::
++  set-tile
  |=  [=turf pos=svec2 =item-id variation=@ud]
  =.  spaces.turf
    %+  ~(put by spaces.turf)
      pos
    =<  %=  .
            tileitem-id  
        ==
    %+  ~(gut by spaces.turf)
      pos
    *space
  turf
--
