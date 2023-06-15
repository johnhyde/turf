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
++  wall-stone  'sprites/walls/wall-stone.png'
++  wall-stones
  %+  turn  (gulf 0 15)
  |=  a=@
  ;:  welk
      'sprites/walls/wall-stone-'
      (pad-2 a)
      '.png'
  ==
++  table  'sprites/table.png'
++  stool  'sprites/stool.png'
++  tree  'sprites/tree.png'
--
