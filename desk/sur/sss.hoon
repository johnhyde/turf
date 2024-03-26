|%
++  lake
  |$  [rock vock wave vave]
  :: ?>  (levi -:!>(*rock) -:!>(*vock))
  :: ?>  (levi -:!>(*wave) -:!>(*vave))
  $_  ^?
  |%
  ++  name  *term
  +$  rock  ^rock
  +$  vock  ^vock
  +$  wave  ^wave
  +$  vave  ^vave
  ++  urck  |~  vock  *rock
  ++  uwve  |~  vave  *wave
  ++  wash  |~  [rock wave]  *rock
  --
+$  aeon  @ud
+$  dude  dude:agent:gall
++  poke
  |%
  ++  request
    |*  paths=mold
    $:  path=paths
        =dude
    ==
  ++  response
    |*  [=(lake) paths=mold]
    $:  path=paths
        =dude
        $%  [what=%tomb ~]
            [what=%rock =aeon rock=vock:lake]
            [what=%wave =aeon wave=vave:lake]
    ==  ==
  ++  on-rock
    |*  [=(lake) paths=mold]
    $:  path=paths
        src=ship
        from=dude
        stale=?
        fail=?
        =rock:lake
        wave=(unit wave:lake)
    ==
  --
--