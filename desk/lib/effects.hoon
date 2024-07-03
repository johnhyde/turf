/-  *turf, pond
/+  *turf
|%
+$  ap-ctx  [=turf =ship fx-ctx]
+$  con-ctx  [=comp ctx]
++  get-effects
  |=  ctx=con-ctx
  ^-  (list effect)
  =/  fax  (get-fx comp.ctx)
  %+  murn  fax
  |=  [root=root-condition =effect]
  ?.  (~(match-root-condition ma ctx) root)
    ~
  `effect
++  match-int-rel
  |=  [rel=int-rel int=@ud]
  ^-  ?
  ?-  -.rel
    %eq  =(num.rel int)
  ==
++  ma
  =|  ctx=con-ctx
  |@
  ++  match-root-condition
    |=  rut=root-condition
    ^-  ?
    ?-  -.rut
      %or
        (lien roots.rut match-root-condition)
      %and
        ?&  (match-root-condition root.rut) 
            (levy cons.rut match-condition)
        ==
      %trigger
        (match-trigger-condition trigger.rut)
    ==
  ++  match-condition
    |=  con=condition
    ^-  ?
    ?-  -.con
      %and  (levy cons.con match-condition)
      %or  (lien cons.con match-condition)
      %not  !(match-condition con.con)
      %eq  =((match-condition a.con) (match-condition b.con))
      %initiator
        ?~  init-id.ctx
          ?=(%player type.con)
        ?=(%item type.con)
      %initiator-eq
        ?:  ?=(%initiator target.con)  %.y
        =/  abs  (~(absolutize-target ap |1.ctx) target.con)
        ?-  -.abs
          %item  =(`+.abs init-id.ctx)
          %player  &(=(~ init-id.ctx) =(+.abs ship.ctx))
        ==
      %user-eq  =(ship.ctx ship.con)
      %trigger  (match-trigger-condition trigger.con)
      %item-exists  ?=(^ (~(resolve-item-target ap |1.ctx) item.con))
      %variation
        =/  shade  (~(resolve-item-target ap |1.ctx) item.con)
        ?~  shade  %.n
        (match-int-rel con.con variation.u.shade)
      %move-collide
        ?.  ?=(%move -.trigger.ctx)  %.n
        =(collide.con collide.trigger.ctx)
      %move-smooth
        ?.  ?=(%move -.trigger.ctx)  %.n
        =(smooth.con smooth.trigger.ctx)
      %loc-eq
        =/  resolve  ~(resolve-fx-loc ap |1.ctx)
        =((resolve a.con) (resolve b.con))
    ==
  ++  match-trigger-condition
    |=  ton=trigger-condition
    ^-  ?
    ?+  -.ton  =(ton trigger.ctx)
      %move
        ?.  ?=(%move -.trigger.ctx)  %.n
        .=  pos.comp.ctx
        ?-  -.con.ton
          %onto  end.trigger.ctx
          %off  start.trigger.ctx
        ==
      %message
        ?.  ?=(%message -.trigger.ctx)  %.n
        =(msg.con.ton msg.trigger.ctx)
    ==
  --
++  ap
  =|  ctx=ap-ctx
  |@  
  ++  apply-effect
    |=  =effect
    ^-  [=roars:pond =goals:pond]
    =,  ctx
    ?+  -.effect  `~
      %list
        ?-  serial.effect
          ?(%serial %atomic)
            :-  ~
            =/  goals
              %+  turn  effects.effect
              |=  =^effect
              apply-effect+[effect trigger shade-id init-id]
            ?:  =(%.y serial.effect)
              goals
            [%atomic goals]~
          %simult
            %+  roll  effects.effect
            |=  [=^effect =roars:pond =goals:pond]
            =/  res  (apply-effect effect)
            (weld roars roars.res)^(weld goals goals.res)
        ==
      %port
        :-  ~
        =/  portal  (~(gut by portals.deed.turf) portal-id.effect ~)
        ?~  portal  ~
        ?~  at.portal  ~
        [%add-port-offer ship portal-id.effect]~
      %read
        =/  effects
          =|  count=@ud
          =|  effects=(list [root-condition (unit ^effect)])
          |-  ^-  _effects
          ?~  actions.effect
            effects
          %=  $
            actions.effect  t.actions.effect
            count  +(count)
            effects
              :_  effects
              :-  [%and [%message %eq (welk 'note: ' (numbt count)] [%user-eq ship]~]
              :+  %list  %serial
              ~[[%message %this 'clear-note'] effect.i.actions.effect]
          ==
        :-  ~
        :~  [%set-shade-effect shade-id [%and [%message %eq 'clear-note'] [%user-eq ship]~] `[%clear-actions (turn effects head)]]
        ==
      %clear-actions
        :-  ~
        %+  turn  actions.effect
        |=  rut=root-condition
        [%set-shade-effect shade-id rut ~]
      %swap
        `[%set-shade-form-id shade-id with.effect]~
      %vary
        `[%set-shade-var shade-id var.effect]~
      %move
        =/  pos  (resolve-fx-loc to.effect)
        ?~  pos  `~
        =/  target  (absolutize-target target.effect)
        =/  deets  [u.pos collide.effect smooth.effect]
        ?-  -.target
          %player
            `[%move ship.target deets]~
          %item
            `[%move-shade shade-id.target deets]~
        ==
      %message
        =/  tar  (resolve-item-target target.effect)
        ?~  tar  `~
        `[%pull-trigger [%message msg.effect] u.tar `shade-id]
      ::
    ==
  ++  resolve-fx-loc
    |=  [loc=fx-loc]
    ^-  (unit svec2)
    ?-  -.loc
      %target  (resolve-target-pos target.loc)
      %offset
        ?~  start=(resolve-fx-loc loc.loc)
          ~
        :-  ~
        %+  sum-svec2  u.start
        (resolve-fx-offset offset.loc)
      %initiator-start
        ?:  ?=(%move -.trigger.ctx)
          `start.trigger.ctx
        (resolve-fx-loc %target %initiator)
      %absolute  `pos.loc
    ==
  ++  resolve-target-pos
    |=  [=target]
    ^-  (unit svec2)
    =/  utar  (resolve-target target)  
    %+  bind  utar
    |=  tar=(each player shade)
    [?:(?=(%.y -) pos.p pos.p)]:tar
  ++  resolve-target
    |=  [=target]
    =,  ctx
    ^-  (unit (each player shade))
    =.  target  (absolutize-target target)  
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
  ++  resolve-item-target
    |=  [tar=item-target]
    =,  ctx
    ^-  (unit shade)
    ?~  abs=(absolutize-item-target tar)
      ~
    (~(get by cave.plot.turf) u.abs)
  ++  resolve-fx-offset
    |=  [offset=fx-offset]
    ^-  svec2
    ?-  -.offset
      %relative
        =/  from  (resolve-fx-loc from.offset)
        ?~  from  *svec2
        =/  to  (resolve-fx-loc to.offset)
        ?~  to  *svec2
        (dif-svec2 u.to u.from)
      %direction
        =/  dir  (resolve-fx-dir-8 dir.offset)
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
        =/  rot  (resolve-fx-dir rotation.offset)
        =/  os  (resolve-fx-offset offset.offset)
        ?~  rot  os
        :: for purposes of rotation, down is 0, right is π/2, up is π, left is 3π/2
        ?-  u.rot
          %down  os
          %right  (pro-svec2 [y.os x.os] [--1 -1])
          %up  (pro-svec2 os [-1 -1])
          %left  (pro-svec2 [y.os x.os] [-1 --1])
        ==
      ?(%flip-x %flip-y)
        =/  os  (resolve-fx-offset +.offset)
        ?:  ?=(%flip-x -.offset)
          os(x (pro:si -1 x.os))
        os(y (pro:si -1 y.os))
      %combine
        %+  sum-svec2
          (resolve-fx-offset a.offset)
        (resolve-fx-offset b.offset)
      %absolute  offset.offset
    ==
  ++  resolve-fx-dir
    |=  [dir=fx-dir]
    ^-  (unit ^dir)
    ?-  -.dir
      %face
        ?~  target=(resolve-target target.dir)
          ~
        ?:  ?=(%.n -.u.target)  ~
        `dir.p.u.target
      %relative
        =/  offset  (resolve-fx-offset [%relative [from to]:dir])
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
        (both `round.dir (resolve-fx-dir-8 dir.dir))
      %rotate
        ?~  a=(resolve-fx-dir a.dir)  ~
        ?~  b=(resolve-fx-dir b.dir)  ~
        `(rotate-dir u.a u.b)
      %flip-x
        ?~  dr=(resolve-fx-dir dir.dir)  ~
        :-  ~
        ?+  u.dr  u.dr
          %left  %right
          %right  %left
        ==
      %flip-y
        ?~  dr=(resolve-fx-dir dir.dir)  ~
        :-  ~
        ?+  u.dr  u.dr
          %down  %up
          %up  %down
        ==
      %absolute  `dir.dir
    ==
  ++  resolve-fx-dir-8
    |=  [dir=fx-dir-8]
    ^-  (unit dir-8)
    ?+  -.dir  (resolve-fx-dir dir)
      %relative-8
        :: trig???
        =/  offset  (resolve-fx-offset [%relative [from to]:dir])
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
      ::   ?~  dir-8=(resolve-fx-dir-8 dir.dir)  ~
      ::   `(round-dir-8 round.dir u.dir-8)
      %rotate-8
        ?~  a=(resolve-fx-dir-8 a.dir)  ~
        ?~  b=(resolve-fx-dir-8 b.dir)  ~
        `(rotate-dir-8 u.a u.b)
      %flip-x-8
        ?~  dir-8=(resolve-fx-dir-8 dir.dir)  ~
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
        ?~  dir-8=(resolve-fx-dir-8 dir.dir)  ~
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
    |=  [=target]
    =,  ctx
    ^-  absolute-target
    ?+  target  target
      %this  [%item shade-id]
      %user  [%player ship]
      %initiator
        ?~  init-id
          [%player ship]
        [%item u.init-id]
    ==
  ++  absolutize-item-target
    |=  [tar=item-target]
    =,  ctx
    ^-  absolute-item-target
    ?-  tar
      %this  `shade-id
      %initiator  init-id
      [%item *]  `shade-id.tar
    ==
  --
--
