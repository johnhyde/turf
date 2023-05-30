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
    =.  turf
      %=  turf
        size.plot          size
        library.plot       default-library
        spaces.plot  (fill-space size offset /floor/wood)
        offset.plot        offset
        item-counter.plot  (mul size)
        players.ephemera   (~(put by players.ephemera.turf) our (new-player offset))
      ==
    =/  mid-size  ((merge-svec2 fra:si) (sign-vec2 size) [--2 --2])
    =/  tree-pos  (sum-svec2 offset mid-size)
    (add-hollow-item turf [tree-pos /tree 0])
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
      ::
        :-  /table/round
        =/  table  (new-item %item 'Round Table' table)
        table(collidable %.y)
      ::
        :-  /stool
        (new-item %item 'Stool' stool)
      ::
        :-  /tree
        =/  tree  (new-item %item 'Tree' tree)
        tree(collidable %.y)
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
  |=  [=spaces os=off-size]
  ^-  grid
  =+  (os-to-tl-br os)  :: add tl and br to subject
  :: =|  cols=grid
  |-  ^-  grid
  ?:  =(x.tl x.br)  ~
  :-  |-  ^-  col
      ?:  =(y.tl y.br)  ~
      :-  (~(gut by spaces) tl [~ ~])
      $(y.tl (sum:si y.tl --1))
  $(x.tl (sum:si x.tl --1))
::
++  clamp-pos
  |=  [pos=svec2 os=off-size]
  ^-  svec2
  =+  (os-to-tl-br os)  :: add tl and br to subject
  (max-svec2 tl (min-svec2 pos (sum-svec2 br [-1 -1])))
::
++  os-to-tl-br
  |=  os=off-size
  ^-  tl-br
  =/  ssize  (sign-vec2 size.os)
  =/  bot-right  (sum-svec2 offset.os ssize)
  [offset.os bot-right]
++  sign-vec2
  |=  =vec2
  ^-  svec2
  [(sun:si x.vec2) (sun:si y.vec2)]
++  merge-svec2
  |=  fun=$-([@sd @sd] @sd)
  |=  [a=svec2 b=svec2]
  ^-  svec2
  [(fun x.a x.b) (fun y.a y.b)]
++  sum-svec2  (merge-svec2 sum:si)
++  min-svec2  (merge-svec2 min-si)
++  max-svec2  (merge-svec2 max-si)
++  min-si
  |=  [a=@s b=@s]
  ?:  (lth-si a b)
    a
  b
++  max-si
  |=  [a=@s b=@s]
  ?:  (lth-si a b)
    b
  a
++  lth-si
  |=  [a=@s b=@s]
  =(-1 (cmp:si a b))
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
