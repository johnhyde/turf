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
    =.  turf  turf(size.plot size, offset.plot offset)
    =/  mid-pos  (get-entry-pos turf)
    =.  turf
      %=  turf
        skye.plot           default-skye
        spaces.plot         (fill-space size offset /grass)
        players.ephemera    (~(put by players.ephemera.turf) our (new-player mid-pos av))
        lunk.deed      `[0 %.n]
      ==
    =.  turf  (add-husk turf [mid-pos /gate 0])
    turf
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
        :-  /cobble
        (new-tile 'Cobble' cobble)
      ::
        :-  /cobble/red
        (new-tile 'Red Cobble' cobble-red)
      ::
        :: :-  /cobble/animated
        :: =/  cobble  (new-tile 'Red Cobble' cobble-red)
        :: ?~  variations.cobble  cobble
        :: =.  i.variations.cobble
        ::   :*  ~  %flat  %loop
        ::       ~['sprites/cobble.png' 'sprites/cobble-red.png']
        ::   ==
        :: cobble
      ::
        :-  /table/round
        =/  table  (new-form %item 'Round Table' table)
        table(collidable %.y, offset [--0 --4])
      ::
        :-  /stool
        =/  stool  (new-form %item 'Stool' stool)
        stool(offset [--0 --4])
      ::
        :-  /barrel
        =/  barrel  (new-form %item 'Barrel' barrel)
        %=  barrel
          collidable  %.y
          offset      [--0 --6]
        ==
      ::
        :-  /crate
        =/  crate  (new-form %item 'Crate' crate)
        crate(collidable %.y, offset [--0 --2])
      ::
        :-  /sign
        =/  sign  (new-form %item 'Sign' sign)
        %=  sign
          collidable  %.y
          offset  [--0 --6]
          seeds  (malt [%interact %read]~)
        ==
      ::
        :-  /tree
        =/  tree  (new-form-offset %item 'Tree' tree [--16 --42])
        tree(collidable %.y)
      ::
        :-  /wall/stone
        =/  wall-stone  (new-form-variations %wall 'Stone Wall' wall-stone)
        %=  wall-stone
          collidable  %.y
          offset      [--0 --32]
        ==
      ::
        :-  /fence/stone
        =/  wall-stone-small  (new-form-variations %wall 'Smal Stone Wall' wall-stone-small)
        wall-stone-small(collidable %.y, offset [--0 --8])
      ::
        :-  /fence/wood
        =/  fence-wood  (new-form-variations %wall 'Wood Fence' fence-wood)
        fence-wood(collidable %.y, offset [--0 --8])
      ::
        :-  /path/road/paved
       (new-form-variations [%wall %flat] 'Paved Road' paved-road)
      ::
        :-  /path/grassy
        (new-form-variations [%wall %flat] 'Grassy Path' grassy-path)
      ::
        :-  /portal
        =/  portal  (new-form %item 'Portal' portal)
        %=  portal
          seeds  (malt [%step %port]~)
        ==
      ::
        :-  /gate
        =/  gate  (new-form-variations %item 'Gate' gate)
        %=  gate
          seeds   (malt [%step %port]~)
          offset  [--16 --32]
        ==
      ::
        :-  /portal/house
        =/  house  (new-form %item 'House Portal' house)
        %=  house
          seeds  (malt [%step %port]~)
          offset  [--12 --32]
        ==
      ::
        :-  /tunnel
        =/  tunnel  (new-form %item 'Tunnel' tunnel)
        %=  tunnel
          seeds  (malt [%step %jump]~)
        ==
      ::
        :-  /tunnel/big
        =/  tunnel-big  (new-form %item 'Big Tunnel' tunnel-big)
        %=  tunnel-big
          seeds  (malt [%step %jump]~)
        ==
      ::
        :-  /flowers/red
        (new-form %item 'Red Flowers' flowers-red)
      ::
        :-  /shrub
        =/  shrub  (new-form %item 'Shrub' shrub)
        shrub(offset [--0 --6])
    ==
  ++  default-closet
    ^-  skye
    %-  malt
    ^-  (list [form-id form])
    =,  sprites
    :~  (new-garb-pair /eyes/tall 'Tall Eyes' 2 1)
        (new-garb-pair /eyes/almond 'Almond Eyes' 2 1)
        (new-garb-pair /eyes/small 'Small Eyes' 2 1)
        (new-garb-pair /eyes/cute 'Cute Eyes' 2 1)
        (new-garb-pair /eyes/big/blue 'Big Blue Eyes' 2 1)
        (new-garb-pair /eyes/big/brown 'Big Brown Eyes' 2 1)
        (new-garb-pair /eyes/big/green 'Big Green Eyes' 2 1)
        (new-garb-pair /brows 'Plain Eyebrows' 2 1)
        (new-garb-pair /brows/uni 'Unibrow' 2 1)
        (new-garb-pair /brows/bushy 'Bushy Eyebrows' 2 1)
        (new-garb-pair /brows/arch 'Arched Eyebrows' 2 1)
        (new-garb-pair /brows/vulcan 'Vulcan Eyebrows' 2 1)
        (new-garb-pair /mouth 'Basic Mouth' 2 1)
        (new-garb-pair /mouth/small 'Small Mouth' 2 1)
        (new-garb-pair /mouth/small/red 'Small Red Mouth' 2 1)
        (new-garb-pair /mouth/small/open 'Small Open Mouth' 2 1)
        (new-garb-pair /mouth/smirk 'Smirk' 2 1)
        (new-garb-pair /mouth/smile 'Smile' 2 1)
        (new-garb-pair /mouth/smile/big 'Big Smile' 2 1)
        (new-garb-pair /hair/brown 'Brown Hair' 3 1)
        (new-garb-pair /tshirt/white 'White T-Shirt' 3 3)
        (new-garb-pair /skirt/red 'Red Skirt' 3 3)
        (new-garb-pair /pants/blue 'Blue Pants' 3 3)
    ==
  ++  default-player
    =|  =player
    player(avatar default-avatar)
  ++  default-avatar
    =<  .(offset.form.thing.body [--0 --13])
    ^-  avatar
    :-  :-  color=0xd8.a57c
        (new-garb-thing /body 'Basic Body' 3 3)
    :~  (new-garb-thing /brows 'Plain Eyebrows' 2 1)
        (new-garb-thing /eyes/tall 'Tall Eyes' 2 1)
        (new-garb-thing /tshirt/white 'White T-Shirt' 3 3)
        (new-garb-thing /pants/blue 'Blue Pants' 3 3)
    ==
  ++  new-garb-pair
    |=  [=form-id name=@t var-count=@ud frame-count=@ud]
    :-  form-id
    (new-garb name (path-to-cord form-id) var-count frame-count)
  ++  new-garb-thing
    |=  [=form-id name=@t var-count=@ud frame-count=@ud]
    ^-  thing
    :-   [form-id 0 *husk-bits]
    (new-garb name (path-to-cord form-id) var-count frame-count)
  ++  new-garb
    |=  [name=@t file=@t var-count=@ud frame-count=@ud]
    ^-  form
    :*  name
        type=%garb
        variations=(garb.sprites file var-count frame-count)
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
    |=  [t=$@(form-type [form-type deep]) name=@t pngs=(list png)]
    ^-  form
    =/  [=form-type =deep]
      ?^  t  t
      [t %back]
    :*  name
        type=form-type
        variations=(turn pngs |=(=png `[deep png]))
        *form-bits
    ==
  ++  new-player
    |=  [pos=svec2 av=(unit avatar)]
    ^-  player
    :*  ~
        pos
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
++  fill-empty-space
  |=  [=turf id=form-id]
  ?~  form=(~(gut by skye.plot.turf) id ~)  turf
  ?.  =(%tile type.form)  turf
  =*  spaces  spaces.plot.turf
  =+  total=(mul size.plot.turf)
  =|  count=@ud
  =.  spaces.plot.turf
    |-  ^-  _spaces
    ?:  =(total count)
      spaces
    =/  pos=svec2
      :-  (sun:si (mod count x.size.plot.turf))
      (sun:si (div count x.size.plot.turf))
    =.  pos  (sum-svec2 pos offset.plot.turf)
    =/  space  (~(gut by spaces) pos ~)
    =/  tile=husk  [id 0 *husk-bits]
    =.  spaces
      ?~  space  (~(put by spaces) pos [`tile ~])
      ?^  tile.space  spaces
      (~(put by spaces) pos space(tile `tile))
    %=  $
      count  +(count)
      spaces  spaces
    ==
  turf
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
++  div-vec2
  |=  [v=vec2 s=$@(@ud vec2)]
  ^-  vec2
  =/  d=vec2  ?@(s [s s] s)
  :-  ?~  x.d  x.v  (div x.v x.d)
  ?~  y.d  y.v  (div y.v y.d)
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
++  murp
  |*  [a=(map) b=$-((pair) (unit (pair)))]
  %-  malt
  %+  murn  ~(tap by a)
  b
++  is-host
  |=  =ship
  ?=(?(%czar %king) (clan:title ship))
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
  =/  shade  (~(get by cave.plot.turf) shade-id)
  ?~  shade  ~
  (get-thing-by-shade turf u.shade)
++  get-thing-by-shade
  |=  [=turf =shade]
  ^-  (unit thing)
  =/  form  (get-form turf form-id.shade)
  ?~  form  ~
  `[+.shade u.form]
++  jab-by-spaces
  |=  [=turf pos=svec2 fun=$-(space space)]
  ^-  ^turf
  =.  spaces.plot.turf
    %+  ~(put by spaces.plot.turf)
      pos
    (fun (get-space spaces.plot.turf pos))
  turf
++  jab-by-players
  |=  [=turf =ship fun=$-(player player)]
  ^-  ^turf
  =*  players  players.ephemera.turf
  =.  players
    ?.  (~(has by players) ship)  players
    (~(jab by players) ship fun)
  turf
++  jab-by-portals
  |=  [=turf =portal-id fun=$-(portal portal)]
  ^-  ^turf
  =*  portals  portals.deed.turf
  =.  portals
    ?.  (~(has by portals) portal-id)  portals
    (~(jab by portals) portal-id fun)
  turf
++  jab-by-shades
  |=  [=turf id=shade-id fun=$-([=shade =form] shade)]
  ^-  ^turf
  =/  shade  (~(gut by cave.plot.turf) id ~)
  ?~  shade  turf
  =/  form  (get-form turf form-id.shade)
  ?~  form  turf
  =.  cave.plot.turf
    %+  ~(put by cave.plot.turf)  id
    (fun shade u.form)
  turf
::
++  shade-is-lunk
  |=  [=turf =shade-id]
  ^-  ?
  =*  lunk  lunk.deed.turf
  ?~  lunk  %.n
  =(shade-id.u.lunk shade-id)
++  portal-is-lunk
  |=  [=turf p=$@(portal-id portal)]
  ^-  ?
  =/  portal
    ?^  p  p
    (~(gut by portals.deed.turf) p ~)
  ?~  portal  %.n
  ?~  shade-id.portal  %.n
  (shade-is-lunk turf u.shade-id.portal)
++  lunk-is-approved
  |=  =turf
  ^-  ?
  =*  lunk  lunk.deed.turf
  ?~  lunk  %.n
  approved.u.lunk
++  portal-is-dink
  |=  [=turf =portal-id]
  ^-  ?
  (~(has by dinks.deed.turf) portal-id)
++  dink-is-approved
  |=  [=turf =portal-id]
  (~(gut by dinks.deed.turf) portal-id %.n)
++  get-lunk-pos
  |=  =turf
  ^-  (unit svec2)
  =*  lunk  lunk.deed.turf
  ?~  lunk  ~
  =/  shade  (~(gut by cave.plot.turf) shade-id.u.lunk ~)
  ?~  shade  ~
  `pos.shade
++  get-entry-pos
  |=  =turf
  ^-  svec2
  %+  fall  (get-lunk-pos turf)
  %+  sum-svec2  offset.plot.turf
  (sign-vec2 (div-vec2 size.plot.turf 2))
++  is-husk-collidable
  |=  [=turf =husk]
  ^-  ?
  ?^  collidable.husk
    u.collidable.husk
  =/  form  (get-form turf form-id.husk)
  ?~  form  %.n
  collidable.u.form
++  is-thing-collidable
  |=  [=turf =thing]
  ^-  ?
  ?^  collidable.thing
    u.collidable.thing
  collidable.form.thing
::
++  get-shades
  |=  [=turf pos=svec2]
  ^-  (list [shade-id shade])
  =/  space  (get-space spaces.plot.turf pos)
  =/  shades  shades.space
  %+  murn  shades
  |=  id=shade-id
  =/  shade  (~(get by cave.plot.turf) id)
  ?~  shade  ~
  `[id u.shade]
++  get-things
  |=  [=turf pos=svec2]
  ^-  (list [husk-id thing])
  =/  space  (get-space spaces.plot.turf pos)
  =/  husks=(list [husk-id husk])
    (turn (get-shades turf pos) |=([id=shade-id =shade] [id +.shade]))
  =.  husks  ?~(tile.space husks [[pos u.tile.space] husks])
  %+  murn  husks
  |=  [=husk-id =husk]
  =/  form  (get-form turf form-id.husk)
  ?~  form  ~
  `[husk-id husk u.form]
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
++  get-effects-by-shade-id
  |=  [=turf =shade-id]
  ^-  %-  unit
      $:  full-fx=ufx
          husk-fx=ufx
          form-fx=pfx
      ==
  =/  shade  (~(get by cave.plot.turf) shade-id)
  ?~  shade  ~
  `(get-effects-by-shade turf u.shade)
++  get-effects-by-shade
  |=  [=turf =shade]
  ^-  $:  full-fx=ufx
          husk-fx=ufx
          form-fx=pfx
      ==
  =/  form  (get-form turf form-id.shade)
  ?~  form  [effects.shade effects.shade ~]
  =/  form-fx  (~(uni by `pfx`seeds.u.form) `pfx`effects.u.form)
  :-  (~(uni by `ufx`(~(run by form-fx) some)) effects.shade)
  [effects.shade form-fx]
++  count-portal-effects
  |=  =ufx
  ^-  (map portal-id @)
  %+  roll  ~(val by ufx)
  |=  [eff=(unit possible-effect) count=(map portal-id @)]
  ?~  eff  count
  ?@  u.eff  count
  ?.  ?=(%port -.u.eff)  count
  %+  ~(put by count)  portal-id.u.eff
  =/  c  (~(get by count) portal-id.u.eff)
  ?~(c 1 +(u.c))
++  get-maybe-effect-portal
  |=  eff=(unit possible-effect)
  ^-  (unit portal-id)
  ?~  eff  ~
  ?@  u.eff  ~
  ?.  ?=(%port -.u.eff)  ~
  `portal-id.u.eff
++  add-form
  |=  [=turf spec=form-spec]
  ^-  ^turf
  =*  skye  skye.plot.turf
  =.  skye
    (~(put by skye) form-id.spec form.spec)
  turf
++  del-form
  |=  [=turf =form-id]
  ^-  ^turf
  =/  form  (~(gut by skye.plot.turf) form-id ~)
  =.  skye.plot.turf
    (~(del by skye.plot.turf) form-id)
  =/  shades  [keep=*(list [shade-id shade]) del=*(list [shade-id svec2])]
  =.  shades
    %+  roll  ~(tap by cave.plot.turf)
    |=  [[=shade-id =shade] =_shades]
    ?:  =(form-id form-id.shade)
      [keep.shades [[shade-id pos.shade] del.shades]]
    [[[shade-id shade] keep.shades] del.shades]
  =.  cave.plot.turf  (malt keep.shades)
  =.  turf
    %+  roll  del.shades
    |=  [[=shade-id pos=svec2] =_turf]
    (del-shade-from-space turf shade-id pos)
  =?    spaces.plot.turf
      :: if form is null it might have been a tile
      |(?=(~ form) ?=(%tile type.form)) 
    %-  ~(run by spaces.plot.turf)
    |=  =space
    ?~  tile.space  space
    ?.  =(form-id form-id.u.tile.space)
      space
    space(tile ~)
  turf
::
:: resets husk-bits for tile - [offset collidable effects]
:: does not verify form
++  add-tile
  |=  [=turf spec=husk-spec]
  ^-  ^turf
  =,  spec
  =/  new-husk=husk
    [form-id variation *husk-bits]
  %^  jab-by-spaces  turf  pos
  |=  =space  ^-  _space
  space(tile `new-husk)
++  del-tile
  |=  [=turf pos=svec2]
  ^-  ^turf
  %^  jab-by-spaces  turf  pos
  |=  =space  ^-  _space
  space(tile ~)
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
  =.  turf
    %^  jab-by-spaces  turf  pos
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
  (del-shade-from-space turf id pos.shade)
::
++  del-shade-from-space
  |=  [=turf id=shade-id pos=svec2]
  ^-  ^turf
  %^  jab-by-spaces  turf  pos
  |=  =space
  space(shades (skip shades.space |=(sid=@ =(sid id))))
::
++  move-shade
  |=  [=turf id=shade-id pos=svec2]
  ^-  ^turf
  =/  shade  (~(gut by cave.plot.turf) id ~)
  ?~  shade  turf
  =/  old-pos  pos.shade
  =.  cave.plot.turf
    %+  ~(put by cave.plot.turf)  id
    shade(pos pos)
  =.  turf  (del-shade-from-space turf id old-pos)
  %^  jab-by-spaces  turf  pos
  |=  =space  ^-  _space
  space(shades [id shades.space])
::
++  cycle-shade
  |=  [=turf id=shade-id amt=@ud]
  ^-  ^turf
  %^  jab-by-shades  turf  id
  |=  [=shade =form]  ^-  _shade
  shade(variation (mod (add amt variation.shade) (lent variations.form)))
++  cycle-tile
  |=  [=turf pos=svec2 amt=@ud]
  ^-  ^turf
  %^  jab-by-spaces  turf  pos
  |=  =space  ^-  _space
  ?~  tile.space  space
  =*  tile  u.tile.space
  =/  form  (get-form turf form-id.tile)
  ?~  form  space
  =.  variation.tile  (mod (add amt variation.tile) (lent variations.u.form))
  space
++  cycle-husk
  |=  [=turf =husk-id amt=@ud]
  ^-  ^turf
  ?@  husk-id  (cycle-shade turf husk-id amt)
  (cycle-tile turf husk-id amt)
++  set-shade-var
  |=  [=turf id=shade-id variation=@ud]
  ^-  ^turf
  %^  jab-by-shades  turf  id
  |=  [=shade =form]  ^-  _shade
  shade(variation (mod variation (lent variations.form)))
++  set-tile-var
  |=  [=turf pos=svec2 variation=@ud]
  ^-  ^turf
  %^  jab-by-spaces  turf  pos
  |=  =space  ^-  _space
  ?~  tile.space  space
  =/  form  (get-form turf form-id.u.tile.space)
  ?~  form  space
  =.  variation.u.tile.space  (mod variation (lent variations.u.form))
  space
++  set-husk-var
  |=  [=turf =husk-id variation=@ud]
  ^-  ^turf
  ?@  husk-id  (set-shade-var turf husk-id variation)
  (set-tile-var turf husk-id variation)
++  set-shade-effect
  |=  [=turf id=shade-id =trigger effect=(unit possible-effect)]
  ^-  ^turf
  %^  jab-by-shades  turf  id
  |=  [=shade =form]  ^-  _shade
  %=    shade
      effects
    (~(put by effects.shade) trigger effect)
  ==
++  set-tile-effect
  |=  [=turf pos=svec2 =trigger effect=(unit possible-effect)]
  ^-  ^turf
  %^  jab-by-spaces  turf  pos
  |=  =space  ^-  _space
  ?~  tile.space  space
  =.  effects.u.tile.space
    (~(put by effects.u.tile.space) trigger effect)
  space
++  set-husk-effect
  |=  [=turf =husk-id =trigger effect=(unit possible-effect)]
  ^-  ^turf
  ?@  husk-id  (set-shade-effect turf husk-id trigger effect)
  (set-tile-effect turf husk-id trigger effect)
++  set-shade-collidable
  |=  [=turf id=shade-id collidable=(unit ?)]
  ^-  ^turf
  %^  jab-by-shades  turf  id
  |=  [=shade =form]  ^-  _shade
  shade(collidable collidable)
++  set-tile-collidable
  |=  [=turf pos=svec2 collidable=(unit ?)]
  ^-  ^turf
  %^  jab-by-spaces  turf  pos
  |=  =space  ^-  _space
  ?~  tile.space  space
  =.  collidable.u.tile.space  collidable
  space
++  set-husk-collidable
  |=  [=turf =husk-id collidable=(unit ?)]
  ^-  ^turf
  ?@  husk-id  (set-shade-collidable turf husk-id collidable)
  (set-tile-collidable turf husk-id collidable)
++  add-portal
  |=  [=turf for=turf-id at=(unit portal-id)]
  ^-  ^turf
  =/  portals  portals.deed.turf
  %=  turf
    portals.deed  (~(put by portals) stuff-counter.plot.turf [~ for at])
    stuff-counter.plot  +(stuff-counter.plot.turf)
  ==
++  del-portal
  |=  [=turf from=portal-id]
  ^-  ^turf
  %=  turf
    portals.deed  (~(del by portals.deed.turf) from)
  ==
++  burn-bridge
  |=  [=turf from=portal-id]
  ^-  ^turf
  =/  portals  portals.deed.turf
  =/  portal  (~(get by portals) from)
  ?~  portal  turf
  =?  turf  ?=(^ shade-id.u.portal)
    (del-shade turf u.shade-id.u.portal)
  (del-portal turf from)
--
