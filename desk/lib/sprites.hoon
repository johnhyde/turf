/-  *turf
|%
++  welk  (cury cat 3)
++  pad-2
  |=  a=@ud
  ^-  @t
  =/  b=@t  (scot %ud a)
  ?.  (lth a 10)  b
  (welk '0' b)
++  garb
  |=  [name=@t var-count=@ud frame-count=@ud]
  ^-  (list luuk)
  ?:  =(0 var-count)  ~
  %+  turn  (gulf 0 (dec var-count))
  |=  i=@ud
  ^-  luuk
  :-  ~
  :-  %fore
  =/  base  :(welk 'sprites/garb/' name '-' (scot %ud i))
  ?:  (lte frame-count 1)
    (welk base '.png')
  ^-  sprite
  =/  frames=(list png)
    %+  turn  (gulf 0 (dec frame-count))
    |=  j=@ud
    :(welk base '-' (scot %ud j) '.png')
  :-  %loop
  ?.  =(3 frame-count)
    frames
  ?>  ?=([png png png ~] frames)
  `(list png)`[&1 &2 &1 &3 ~]:frames
++  floor  'sprites/floor.png'
++  floor-stone  'sprites/floor-stone.png'
++  grass  'sprites/grass.png'
++  cobble  'sprites/cobble.png'
++  cobble-red  'sprites/cobble-red.png'
++  gen-walls
  |=  prefix=@t
  %+  turn  (gulf 0 15)
  |=  a=@
  ;:  welk
      prefix
      (pad-2 a)
      '.png'
  ==
++  wall-stone  (gen-walls 'sprites/walls/wall-stone/wall-stone-')
++  wall-stone-small  (gen-walls 'sprites/walls/wall-stone-small/wall-stone-small-')
++  fence-wood  (gen-walls 'sprites/walls/fence-wood/fence-wood-')
++  table  'sprites/table.png'
++  stool  'sprites/stool.png'
++  barrel  'sprites/barrel.png'
++  crate  'sprites/crate.png'
++  sign  'sprites/sign.png'
++  tree  'sprites/tree.png'
++  portal  'sprites/portal.png'
++  tunnel  'sprites/tunnel.png'
++  tunnel-big  'sprites/tunnel-big.png'
++  flowers-red  'sprites/flowers-red.png'
++  shrub  'sprites/shrub.png'
--
