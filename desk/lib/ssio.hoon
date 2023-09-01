/-  *sss, *ssio
/+  *sss
|%
+$  card  $+(card card:agent:gall)
++  mk-mar
  |*  =(pool)
  (^mk-mar (mk-lake pool))
++  mk-lake
  |*  =(pool)
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
  +$  ctx  [=bowl:gall =rock:pool top=?]
  +$  goals  (list goal:pool)
  +$  grits  (list grit:pool)
  ++  filter
    |*  acc=mold 
    |*  [path=paths:du =foam:pool =goals fil=$-([ctx acc goal:pool] [acc grits goals])]
    ^-  [[(list card) acc grits] pubs:du]
    =/  read  (~(gut by read:du) path ~)
    =/  rock  ?~(read *rock:pool rock.read)
    =|  top=@ud
    =|  len=@ud
    =^  [=acc =grits]  rock
      =|  [=acc =grits]
      |-  ^-  [[^acc ^grits] rock:pool]
      =/  =ctx  [bowl:du rock =(top 0)]
      ?~  goals  [[acc grits] rock]
      ?:  (gth len 20)  [[acc grits] rock]
      =/  [new-acc=^acc sub-grits=^grits sub-goals=^goals]
        (fil ctx acc i.goals)
      =.  top  ?~(top 0 (sub top 1))
      %=  $
        rock  (wash:lake:du rock [foam sub-grits])
        acc  new-acc
        grits  (weld grits sub-grits)
        goals  (weld sub-goals t.goals)
        top  (add top (lent sub-goals))
        len  +(len)
      ==
    =/  [cards=(list card) pub=pubs:du]
      (give:du path [foam grits])
    [[cards acc grits] pub]
  --
--
