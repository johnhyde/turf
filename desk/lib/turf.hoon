/-  sur=turf
/+  sprites
=<  [sur .]
=,  sur
|%
++  gen
  |%
  ++  default-turf
    |=  [our=ship size=vec2 offset=svec2]
    ^-  turf
    =|  =turf
    %=  turf
        size.plot          size
        library.plot       default-library
        spaces.plot        (fill-space size offset /floor/wood)
        offset.plot        offset
        item-counter.plot  (mul size)
        players.ephemera   (~(put by players.ephemera.turf) our (new-player offset))
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
++  new-player
  |=  pos=svec2
  ^-  player
  :*  pos
      %down
      color='#d23'
      :~  `solid-item`[(new-item %garb 'Scarecrow Body' player.sprites) /body/scarecrow 0 0 *svec2]
      ==
  ==
  --
++  fill-space
  |=  [size=vec2 offset=svec2 id=item-id]
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
  =.  pos  (sum-svec2 pos offset)
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
  [(sum:si x.a x.b) (sum:si y.a y.b)]
::
++  get-space
  |=  [=turf pos=svec2]
  ^-  space
  (~(gut by spaces.plot.turf) pos *space)
++  get-item-type
  |=  [=turf =item-id]
  ^-  (unit item-type)
  =/  item  (~(get by library.plot.turf) item-id)
  ?~  item  ~
  `type.u.item
++  add-hollow-item
  |=  [=turf spec=hollow-item-spec]
  ^-  ^turf
  =,  spec
  =*  item-counter  item-counter.plot.turf
  =/  item-type  (get-item-type turf item-id)
  ?~  item-type  turf
  ?.  ?=(space-item-type u.item-type)  turf
  =/  new-item=hollow-item
    [item-id item-counter variation *svec2]
  =.  spaces.plot.turf
    %+  ~(put by spaces.plot.turf)
      pos
    =/  =space  (get-space turf pos)
    ?:  =(%tile u.item-type)
      space(tile `new-item)
    space(items [new-item items.space])
  =.  item-counter  +(item-counter)
  turf
--
