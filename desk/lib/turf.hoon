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
        size.plot           size
        skye.plot           default-skye
        spaces.plot         (fill-space size offset /floor/wood)
        offset.plot         offset
        players.ephemera    (~(put by players.ephemera.turf) our (new-player offset))
      ==
    =/  mid-size  ((merge-svec2 fra:si) (sign-vec2 size) [--2 --2])
    =/  tree-pos  (sum-svec2 offset mid-size)
    (add-husk turf [tree-pos /tree 0])
  ++  default-skye
    ^-  skye
    %-  malt
    ^-  (list [form-id form])
    =,  sprites
    :~  :-  /floor/wood
        (new-tile 'Wood Floor' floor)
      ::
        :-  /grass
        (new-tile 'Grass' grass)
      ::
        :-  /table/round
        =/  table  (new-form %item 'Round Table' table)
        table(collidable %.y)
      ::
        :-  /stool
        (new-form %item 'Stool' stool)
      ::
        :-  /tree
        =/  tree  (new-form-offset %item 'Tree' tree [--16 --42])
        tree(collidable %.y)
    ==
  ++  new-tile
    |=  [name=@t =png]
    ^-  form
    :*  name
        type=%tile
        variations=[`png ~]~
        *form-bits
    ==
  ++  new-form
    |=  [=form-type name=@t =png]
    (new-form-offset form-type name png *svec2)
  ++  new-form-offset
    |=  [=form-type name=@t =png offset=svec2]
    ^-  form
    :*  name
        type=form-type
        variations=[`png ~]~
        offset
        +:*form-bits
    ==
++  new-player
  |=  pos=svec2
  ^-  player
  :*  pos
      %down
      color='#d23'
      :~  ^-  thing
          :-   [/body/scarecrow 0 *husk-bits]
          (new-form %garb 'Scarecrow Body' player.sprites)
      ==
  ==
  --
++  fill-space
  |=  [size=vec2 offset=svec2 id=form-id]
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
    ^-  husk
    [id 0 *husk-bits]
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
  |=  [=spaces pos=svec2]
  ^-  space
  (~(gut by spaces) pos *space)
++  get-form-type
  |=  [=turf =form-id]
  ^-  (unit form-type)
  =/  form  (~(get by skye.plot.turf) form-id)
  ?~  form  ~
  `type.u.form
++  jab-by-spaces
  |=  [=spaces pos=svec2 fun=$-(space space)]
  ^-  ^spaces
  %+  ~(put by spaces)
    pos
  (fun (get-space spaces pos))
::
:: resets husk-bits for tile - [offset collidable effects]
:: does not verify form
++  add-tile
  |=  [=turf spec=husk-spec]
  ^-  ^turf
  =,  spec
  =/  new-husk=husk
    [form-id variation *husk-bits]
  =.  spaces.plot.turf
    %^  jab-by-spaces  spaces.plot.turf  pos
    |=  =space  ^-  _space
    space(tile `new-husk)
  turf
::
:: does not verify form
++  add-shade
  |=  [=turf spec=husk-spec]
  ^-  ^turf
  =,  spec
  =*  stuff-counter  stuff-counter.plot.turf
  =/  new-husk=husk
    [form-id variation *husk-bits]
  =.  cave.plot.turf
    %+  ~(put by cave.plot.turf)
      stuff-counter
    [pos new-husk]
  =.  spaces.plot.turf
    %^  jab-by-spaces  spaces.plot.turf  pos
    |=  =space  ^-  _space
    space(shades [stuff-counter shades.space])
  =.  stuff-counter  +(stuff-counter)
  turf
++  add-husk  :: verifies form
  |=  [=turf spec=husk-spec]
  ^-  ^turf
  =,  spec
  =/  form-type  (get-form-type turf form-id)
  ?~  form-type  turf
  ?.  ?=(space-form-type u.form-type)  turf
  ?:  =(%tile u.form-type)
    (add-tile turf spec)
  (add-shade turf spec)
::
++  del-shade
  |=  [=turf id=shade-id]
  ^-  ^turf
  =/  shade  (~(gut by cave.plot.turf) id ~)
  ?~  shade  turf
  =.  cave.plot.turf  (~(del by cave.plot.turf) id)
  =.  spaces.plot.turf
    %^  jab-by-spaces  spaces.plot.turf  pos.shade
    |=  =space
    space(shades (skip shades.space |=(sid=@ =(sid id))))
  turf
--
