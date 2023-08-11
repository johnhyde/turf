/-  sur=turf
/+  sprites
=<  [sur .]
=,  sur
|%
++  gen
  |%
  ++  default-turf
    |=  [our=ship size=vec2 offset=svec2 av=(unit avatar)]
    ^-  turf
    =|  =turf
    =.  turf
      %=  turf
        size.plot           size
        skye.plot           default-skye
        spaces.plot         (fill-space size offset /grass)
        offset.plot         offset
        players.ephemera    (~(put by players.ephemera.turf) our (new-player offset av))
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
        :-  /floor/stone
        (new-tile 'Stone Floor' floor-stone)
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
      ::
        :-  /wall/stone
        =/  wall-stone  (new-form-variations %wall 'wall-stone' wall-stones)
        %=  wall-stone
          collidable  %.y
          offset      [--0 --32]
        ==
      ::
        :-  /portal
        =/  portal  (new-form %item 'Portal' portal)
        %=  portal
          seeds  (malt [%step %port]~)
        ==
      ::
        :-  /tunnel
        =/  tunnel  (new-form %item 'Tunnel' tunnel)
        %=  tunnel
          seeds  (malt [%step %jump]~)
        ==
    ==
  ++  default-closet
    ^-  skye
    %-  malt
    ^-  (list [form-id form])
    =,  sprites
    :~  (new-garb-pair /eyes/tall 'Tall Eyes' 2)
        (new-garb-pair /eyes/almond 'Almond Eyes' 2)
        (new-garb-pair /eyes/small 'Small Eyes' 2)
        (new-garb-pair /eyes/cute 'Cute Eyes' 2)
        (new-garb-pair /eyes/big/blue 'Big Blue Eyes' 2)
        (new-garb-pair /eyes/big/brown 'Big Brown Eyes' 2)
        (new-garb-pair /eyes/big/green 'Big Green Eyes' 2)
        (new-garb-pair /brows 'Plain Eyebrows' 2)
        (new-garb-pair /brows/uni 'Unibrow' 2)
        (new-garb-pair /brows/bushy 'Bushy Eyebrows' 2)
        (new-garb-pair /brows/arch 'Arched Eyebrows' 2)
        (new-garb-pair /brows/vulcan 'Vulcan Eyebrows' 2)
        (new-garb-pair /mouth 'Basic Mouth' 2)
        (new-garb-pair /mouth/small 'Small Mouth' 2)
        (new-garb-pair /mouth/small/red 'Small Red Mouth' 2)
        (new-garb-pair /mouth/small/open 'Small Open Mouth' 2)
        (new-garb-pair /mouth/smirk 'Smirk' 2)
        (new-garb-pair /mouth/smile 'Smile' 2)
        (new-garb-pair /mouth/smile/big 'Big Smile' 2)
        (new-garb-pair /hair/brown 'Brown Hair' 3)
        (new-garb-pair /tshirt/white 'White T-Shirt' 3)
        (new-garb-pair /skirt/red 'Red Skirt' 3)
        (new-garb-pair /pants/blue 'Blue Pants' 3)
    ==
  ++  default-player
    =|  =player
    player(avatar default-avatar)
  ++  default-avatar
    =<  .(offset.form.thing.body [--0 --13])
    ^-  avatar
    :-  :-  color=0xd8.a57c
        (new-garb-thing /body 'Basic Body' 3)
    :~  (new-garb-thing /brows 'Plain Eyebrows' 2)
        (new-garb-thing /eyes/tall 'Tall Eyes' 2)
        (new-garb-thing /tshirt/white 'White T-Shirt' 3)
        (new-garb-thing /pants/blue 'Blue Pants' 3)
    ==
  ++  new-garb-pair
    |=  [=form-id name=@t count=@ud]
    :-  form-id
    (new-garb name (path-to-cord form-id) count)
  ++  new-garb-thing
    |=  [=form-id name=@t count=@ud]
    ^-  thing
    :-   [form-id 0 *husk-bits]
    (new-garb name (path-to-cord form-id) count)
  ++  new-garb
    |=  [name=@t file=@t count=@ud]
    ^-  form
    :*  name
        type=%garb
        variations=(garb.sprites file count)
        *form-bits
    ==
  ++  new-tile
    |=  [name=@t =png]
    (new-form %tile name png)
  ++  new-thing
    |=  [=form-id =form-type name=@t =png]
    ^-  thing
    :-   [form-id 0 *husk-bits]
    (new-form form-type name png)
  ++  new-form
    |=  [=form-type name=@t =png]
    (new-form-offset form-type name png *svec2)
  ++  new-form-offset
    |=  [=form-type name=@t =png offset=svec2]
    ^-  form
    :*  name
        type=form-type
        variations=~[`back+png]
        offset
        +:*form-bits
    ==
  ++  new-form-variations
    |=  [=form-type name=@t pngs=(list png)]
    ^-  form
    :*  name
        type=form-type
        variations=(turn pngs |=(=png `back+png))
        *form-bits
    ==
  ++  new-player
    |=  [pos=svec2 av=(unit avatar)]
    ^-  player
    :*  pos
        %down
        ?~(av default-avatar u.av)
    ==
  --
::
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
++  spaces-to-grid  :: not used anymore
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
++  path-to-cord
  |=  =path
  (crip (zing (join "-" (turn path trip))))
++  welk  (cury cat 3)
::
++  get-space
  |=  [=spaces pos=svec2]
  ^-  space
  (~(gut by spaces) pos *space)
++  get-form
  |=  [=turf =form-id]
  ^-  (unit form)
  (~(get by skye.plot.turf) form-id)
++  get-form-type
  |=  [=turf =form-id]
  ^-  (unit form-type)
  =/  form  (get-form turf form-id)
  ?~  form  ~
  `type.u.form
++  get-thing-by-shade-id
  |=  [=turf =shade-id]
  ^-  (unit thing)
  =/  shade  (~(get by cave.plot.turf) id)
  ?~  shade  ~
  =/  form  (get-form turf form-id.u.shade)
  ?~  form  ~
  `[+.u.shade u.form]
++  jab-by-spaces
  |=  [=spaces pos=svec2 fun=$-(space space)]
  ^-  ^spaces
  %+  ~(put by spaces)
    pos
  (fun (get-space spaces pos))
++  jab-by-players
  |=  [=players =ship fun=$-(player player)]
  ^-  ^players
  ?.  (~(has by players) ship)  players
  (~(jab by players) ship fun)
::
++  is-husk-collidable
  |=  [=turf =husk]
  ^-  ?
  ?^  collidable.husk
    u.collidable.husk
  =/  form  (get-form turf form-id.husk)
  ?~  form  %.n
  collidable.u.form
::
++  get-shades
  |=  [=turf pos=svec2]
  ^-  (list shade)
  =/  space  (get-space spaces.plot.turf pos)
  =/  shades  shades.space
  %+  murn  shades
  |=  id=shade-id
  (~(get by cave.plot.turf) id)
++  get-things
  |=  [=turf pos=svec2]
  ^-  (list thing)
  %+  murn  (get-shades turf pos)
  |=  =shade
  =/  form  (get-form turf form-id.shade)
  ?~  form  ~
  `[+.shade u.form]
  
::
++  get-collidable
  |=  [=turf pos=svec2]
  ^-  ?
  =/  space  (get-space spaces.plot.turf pos)
  ?:  &(?=(^ tile.space) (is-husk-collidable turf u.tile.space))
    %.y
  =/  shades  shades.space
  |-  ^-  ?
  ?~  shades  %.n
  =/  shade  (~(get by cave.plot.turf) i.shades)
  ?:  &(?=(^ shade) (is-husk-collidable turf +.u.shade))
    %.y
  $(shades t.shades)
++  get-effect
  |=  [=thing =trigger]
  ^-  (unit effect)
  =/  form-eff  (~(get by effects.form.thing) trigger)
  =/  mpeff  (~(get by effects.thing) trigger)
  ?~  mpeff  form-eff
  ?~  u.mpeff  form-eff
  ?@  u.u.mpeff  form-eff
  `u.u.mpeff
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
::
++  cycle-shade
  |=  [=turf id=shade-id amt=@ud]
  ^-  ^turf
  =/  shade  (~(gut by cave.plot.turf) id ~)
  ?~  shade  turf
  =/  form  (get-form turf form-id.shade)
  ?~  form  turf
  =.  cave.plot.turf
    %+  ~(put by cave.plot.turf)  id
    shade(variation (mod (add amt variation.shade) (lent variations.u.form)))
  turf
++  set-shade-var
  |=  [=turf id=shade-id variation=@ud]
  ^-  ^turf
  =/  shade  (~(gut by cave.plot.turf) id ~)
  ?~  shade  turf
  =/  form  (get-form turf form-id.shade)
  ?~  form  turf
  =.  cave.plot.turf
    %+  ~(put by cave.plot.turf)  id
    shade(variation (mod variation (lent variations.u.form)))
  turf
++  set-shade-effect
  |=  [=turf id=shade-id =trigger effect=(unit possible-effect)]
  ^-  ^turf
  =/  shade  (~(gut by cave.plot.turf) id ~)
  ?~  shade  turf
  :: =/  form  (get-form turf form-id.shade)
  :: ?~  form  turf
  =.  cave.plot.turf
    %+  ~(put by cave.plot.turf)  id
    %=    shade
        effects
      (~(put by effects.shade) trigger effect)
    ==
  turf
--
