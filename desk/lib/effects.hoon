/-  *turf, pond
/+  *turf
|%
+$  ctx  [=turf =ship =shade-id]
++  apply-effect
  |=  [=turf =ship =effect =shade-id]
  ^-  [=roars:pond =goals:pond]
  ?+  -.effect  `~
    %list
      ?:  serial.effect
        :-  ~
        %+  turn  effects.effect
        |=  =^effect
        apply-effect+[effect shade-id]
      %+  roll  effects.effect
      |=  [=^effect =roars:pond =goals:pond]
      =/  res  (apply-effect turf ship effect shade-id)
      (weld roars roars.res)^(weld goals goals.res)
    %port
      :-  ~
      =/  portal  (~(gut by portals.deed.turf) portal-id.effect ~)
      ?~  portal  ~
      ?~  at.portal  ~
      [%add-port-offer ship portal-id.effect]~
    %jump
      `[%tele ship to.effect]~
    %swap
      `[%set-shade-form-id shade-id with.effect]~
    %vary
      `[%set-shade-var shade-id var.effect]~
    %move
      =/  ctx  [turf ship shade-id]
      =/  pos  (resolve-fx-loc ctx to.effect)
      ?~  pos  `~
      =/  target  (absolutize-target ctx target.effect)
      ?-  -.target
        %player
          `[%tele ship.target u.pos]~
        %item
          `[%move-shade shade-id.target u.pos]~
      ==
    ::
  ==
++  resolve-fx-loc
  |=  [=ctx loc=fx-loc]
  ^-  (unit svec2)
  ?-  -.loc
    %target  (resolve-target-pos ctx target.loc)
    %offset
      ?~  start=(resolve-fx-loc ctx loc.loc)
        ~
      :-  ~
      %+  sum-svec2  u.start
      (resolve-fx-offset ctx offset.loc)
    %absolute  `pos.loc
  ==
++  resolve-target-pos
  |=  [=ctx =target]
  ^-  (unit svec2)
  =/  utar  (resolve-target ctx target)  
  %+  bind  utar
  |=  tar=(each player shade)
  [?:(?=(%.y -) pos.p pos.p)]:tar
++  resolve-target
  |=  [=ctx =target]
  =,  ctx
  ^-  (unit (each player shade))
  =.  target  (absolutize-target ctx target)  
  ?-  -.target
    %player
      ?~  plr=(~(gut by players.ephemera.turf) ship.target ~)
        ~
      `[%.y plr]
    %item
      ?~  shade=(~(gut by cave.plot.turf) shade-id.target ~)
        ~
      `[%.n shade]
  ==
++  resolve-fx-offset
  |=  [=ctx offset=fx-offset]
  ^-  svec2
  ?-  -.offset
    %relative
      =/  from  (resolve-fx-loc ctx from.offset)
      ?~  from  *svec2
      =/  to  (resolve-fx-loc ctx to.offset)
      ?~  to  *svec2
      (dif-svec2 u.to u.from)
    %direction
      =/  dir  (resolve-fx-dir-8 ctx dir.offset)
      ?~  dir  *svec2
      %+  pro-svec2  (sign-vec2 [. .]:distance.offset)
      ?-  u.dir
        %down   [--0 --1]
        %dr     [--1 --1]
        %right  [--1 --0]
        %ur     [--1 -1]
        %up     [--0 -1]
        %ul     [-1 -1]
        %left   [-1 --0]
        %dl     [-1 --1]
      ==
    %rotate
      =/  rot  (resolve-fx-dir ctx rotation.offset)
      =/  os  (resolve-fx-offset ctx offset.offset)
      ?~  rot  os
      :: for purposes of rotation, down is 0, right is π/2, up is π, left is 3π/2
      ?-  u.rot
        %down  os
        %right  (pro-svec2 [y.os x.os] [--1 -1])
        %up  (pro-svec2 os [-1 -1])
        %left  (pro-svec2 [y.os x.os] [-1 --1])
      ==
    ?(%flip-x %flip-y)
      =/  os  (resolve-fx-offset ctx +.offset)
      ?:  ?=(%flip-x -.offset)
        os(x (pro:si -1 x.os))
      os(y (pro:si -1 y.os))
    %combine
      %+  sum-svec2
        (resolve-fx-offset ctx a.offset)
      (resolve-fx-offset ctx b.offset)
    %absolute  offset.offset
  ==
++  resolve-fx-dir
  |=  [=ctx dir=fx-dir]
  ^-  (unit ^dir)
  ?-  -.dir
    %face
      ?~  target=(resolve-target ctx target.dir)
        ~
      ?:  ?=(%.n -.u.target)  ~
      `dir.p.u.target
    %relative
      =/  offset  (resolve-fx-offset ctx [%relative [from to]:dir])
      ?:  =(*svec2 offset)  ~
      :-  ~
      =/  syns  [x=(syn:si x.offset) y=(syn:si y.offset)]
      =/  abs  (abs-svec2 offset)
      ?:  (lth x.abs y.abs)
        ?:(y.syns %down %up)
      ?:  (lth y.abs x.abs)
        ?:(x.syns %right %left)
      ?:  =(%ud round.dir)
        ?:(y.syns %down %up)
      ?:(x.syns %right %left)
    %round
      %-  (lift round-dir-8)
      (both `round.dir (resolve-fx-dir-8 ctx dir.dir))
    %rotate
      ?~  a=(resolve-fx-dir ctx a.dir)  ~
      ?~  b=(resolve-fx-dir ctx b.dir)  ~
      `(rotate-dir u.a u.b)
    %flip-x
      ?~  dr=(resolve-fx-dir ctx dir.dir)  ~
      :-  ~
      ?+  u.dr  u.dr
        %left  %right
        %right  %left
      ==
    %flip-y
      ?~  dr=(resolve-fx-dir ctx dir.dir)  ~
      :-  ~
      ?+  u.dr  u.dr
        %down  %up
        %up  %down
      ==
    %absolute  `dir.dir
  ==
++  resolve-fx-dir-8
  |=  [=ctx dir=fx-dir-8]
  ^-  (unit dir-8)
  ?+  -.dir  (resolve-fx-dir ctx dir)
    %relative-8
      :: trig???
      =/  offset  (resolve-fx-offset ctx [%relative [from to]:dir])
      ?:  =(*svec2 offset)  ~
      :-  ~
      =/  syns  [x=(syn:si x.offset) y=(syn:si y.offset)]
      ?:  =(--0 x.offset)
        ?:(y.syns %down %up)
      ?:  =(--0 y.offset)
        ?:(x.syns %right %left)
      =+  (abs-svec2 offset)
      =/  angled
        =+  `vec2`?:((lth x y) [x y] [y x])
        %+  lte:rh  .~~0.4143  :: tan(π/8)
        (div:rh (sun:rh x) (sun:rh y))
      ?:  angled
        ?:  x.syns
          ?:(y.syns %dr %ur)
        ?:(y.syns %dl %ul)
      ?:  (lth x y)
        ?:(y.syns %down %up)
      ?:(x.syns %right %left)
    :: %round
    ::   ?~  dir-8=(resolve-fx-dir-8 ctx dir.dir)  ~
    ::   `(round-dir-8 round.dir u.dir-8)
    %rotate-8
      ?~  a=(resolve-fx-dir-8 ctx a.dir)  ~
      ?~  b=(resolve-fx-dir-8 ctx b.dir)  ~
      `(rotate-dir-8 u.a u.b)
    %flip-x-8
      ?~  dir-8=(resolve-fx-dir-8 ctx dir.dir)  ~
      :-  ~
      ?+  u.dir-8  u.dir-8
        %dr  %dl
        %dl  %dr
        %right  %left
        %left  %right
        %ur  %ul
        %ul  %ur
      ==
    %flip-y-8
      ?~  dir-8=(resolve-fx-dir-8 ctx dir.dir)  ~
      :-  ~
      ?+  u.dir-8  u.dir-8
        %down  %up
        %up  %down
        %dr  %ur
        %ur  %dr
        %ul  %dl
        %dl  %ul
      ==
    %absolute-8  `dir.dir
  ==
++  absolutize-target
  |=  [=ctx =target]
  =,  ctx
  ^-  absolute-target
  ?+  target  target
    %this  [%item shade-id]
    %user  [%player ship]
  ==
--
