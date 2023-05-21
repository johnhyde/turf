/-  sur=turf
/+  sprites
=<  [sur .]
=,  sur
|%
++  default-turf
  ^-  turf
  =|  =turf
  %=  turf
      library.plot  default-library
      spaces.plot   (fill-space size.plot.turf /floor/wood)
      item-counter.plot  (mul size.plot.turf)
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
++  fill-space
  |=  [size=vec2 id=item-id]
  ^-  spaces
  %-  malt
  =|  spaces=(list [vec2 space])
  =+  total=(mul size)
  =|  count=@ud
  |-  ^-  _spaces
  ?:  =(total count)
    spaces
  =/  pos=vec2
    :-  (mod count x.size)
    (div count x.size)
  =/  =space
    :_  ~
    :-  ~
    ^-  item-instance
    [count id 0 *vec2]
  %=  $
    count  +(count)
    spaces  [[pos space] spaces]
  ==
--
