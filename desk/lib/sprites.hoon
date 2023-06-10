|%
++  garb
  |=  name=@t
  ^-  @t
  :((cury cat 3) 'sprites/garb/' name '.png')
++  floor  'sprites/floor.png'
++  floor-stone  'sprites/floor-stone.png'
++  grass  'sprites/grass.png'
++  wall-stone  'sprites/walls/wall-stone.png'
++  wall-stones
  %+  turn  (gulf 0 15)
  |=  a=@
  =/  b=@t  (scot %ud a)
  ;:  (cury cat 3)
      'sprites/walls/wall-stone-'
      ?.  (lth a 10)  b
      (cat 3 '0' b)
      '.png'
  ==
++  table  'sprites/table.png'
++  stool  'sprites/stool.png'
++  tree  'sprites/tree.png'
--
