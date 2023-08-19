/-  *sss, *ssio
/+  *sss
::  dbug: agent wrapper for generic debugging tools
::
::    usage: %-(agent:dbug your-agent)
::
|%
+$  card  $+(card card:agent:gall)
++  mk-mar
  |*  =(pool)
  (^mk-mar (mk-lake pool))
++  mk-lake
  |*  =(pool)
  :: =-  ^-  (lake rock:- wave:-)  -
  |%
  ++  name  name:pool
  +$  rock  rock:pool
  +$  wave  [=foam:pool grits=(list grit:pool)]
  ++  wash
    |=  [=rock =wave]
    ^-  ^rock
    ?~  grits.wave  rock
    %=  $
      rock  (wash:pool rock foam.wave i.grits.wave)
      grits.wave  t.grits.wave
    ==
  --
++  mk-lake-1
  |.
  :: =-  ^-  (lake rock:- wave:-)  -
  |%
  ++  name  %hm
  +$  rock  ~
  +$  wave  ~
  ++  wash
    |=  [=rock =wave]
    ^-  ^rock
    ~
  --
++  de
  |*  =(pool)
  |*  du=_((du (mk-lake pool) *mold))
  |%
  +$  ctx  [=bowl:gall =rock:lake:du top=?]
  +$  goals  (list goal:pool)
  +$  grits  (list grit:pool)
  ++  filter
    |*  [path=paths:du =foam:pool =goals fun=$-([ctx goals] [* grits])]
    ^-  [[(list card) _(fun)] pubs:du]
    =/  read  (~(gut by read:du) path ~)
    =/  rock  ?~(read *rock:lake:du rock.read)
    =/  rgs  (fun [bowl:du rock top=%.y] goals)
    =/  [cards=(list card) pub=pubs:du]
      (give:du path [foam +.rgs])
    [[cards rgs] pub]
  --
--
