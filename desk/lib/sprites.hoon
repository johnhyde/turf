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
  |=  [name=@t count=@ud]
  ^-  (list look)
  %+  turn  (gulf 0 (dec count))
  |=  i=@ud
  =/  =png  :(welk 'sprites/garb/' name '-' (scot %ud i) '.png')
  `fore+png
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
++  wall-stone  (gen-walls 'sprites/walls/wall-stone-')
++  fence-wood  (gen-walls 'sprites/walls/fence-wood-')
++  table  'sprites/table.png'
++  stool  'sprites/stool.png'
++  barrel  'sprites/barrel.png'
++  tree  'sprites/tree.png'
++  portal  'sprites/portal.png'
++  tunnel  'sprites/tunnel.png'
++  tunnel-big  'sprites/tunnel-big.png'
++  flowers-red  'sprites/flowers-red.png'
++  shrub  'sprites/shrub.png'
--
