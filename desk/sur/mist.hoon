/-  *turf, mild=mist-1
/+  *turf
=<
|%
++  name  %mist
+$  rock  ^rock
+$  vock  ^vock
+$  grit  ^grit
+$  vrit  ^vrit
+$  goal  ^goal
+$  foam  ^foam  :: from sur/turf
+$  voam  foam-all
++  urck  ^urck
++  ugrt  ^ugrt
++  ufam  foam
++  wash  wash-grit
--
|%
:: +$  rock  $~(default-avatar:gen avatar)
+$  rock  $+  mist-rock  [%2 =stir-ids core]
+$  rock-v  _-:*rock
+$  core
  $:  ctid=(unit turf-id)  :: current turf-id
      ttid=(unit turf-id)  :: target turf-id
      port-offer=(unit port-offer)
      =avatar
  ==
+$  vock  $^(vock:mild pvock)
+$  pvock  :: proper vock (head-tagged)
  $%  pvock:mild
      rock
  ==
+$  grit  $+  mist-grit  [cur-grit-v cur-grit]
+$  vrit
  $@   vrit:mild
  $%(vrit:mild grit)
+$  cur-grit-v  rock-v
+$  cur-grit
  $%  [%set-ctid turf-id=(unit turf-id)]
      [%set-avatar =avatar]
      [%set-nick nick=(unit @t)]
      [%set-color color=@ux]
      [%add-thing =thing]
      [%del-thing index=@ud]
      [%set-thing index=@ud =thing]
      [%port-offered port-offer]
      [%accept-port-offer for=turf-id]
      [%reject-port-offer for=turf-id]
      [%clear-port-offer ~]
  ==
+$  grits  (list grit)
+$  cur-grits  (list cur-grit)
::
+$  stir
  $:  mpath=mist-path
      id=stir-id
      =goals
  ==
::
+$  stirred
    $%  [what=%rock =rock]
        [what=%wave id=stir-id =grits]
    ==
::
+$  goal
  $+  mist-goal
  $%  cur-grit
      [%add-thing-from-closet =form-id]
      [%update-things-from-closet ~]
      [%port-accepted for=turf-id]
      [%port-rejected for=turf-id]
      [%kicked for=turf-id]
      [%export-self port-offer]
  ==
+$  goals  (list goal)
:: 
+$  roar
  $%  [%port-offer-accept port-offer]
      [%port-offer-reject of=turf-id from=portal-id]
      [%turf-join =turf-id]
      [%turf-exit =turf-id]
  ==
+$  roars  (list roar)
::
++  wash-grit
  |=  [=rock foam * grit=cur-grit]
  ^-  ^rock
  =?  stir-ids.rock  &(?=(^ src) ?=(^ id))
    (~(put by stir-ids.rock) (need src) (need id))
  :+  -.rock  stir-ids.rock
  ^-  core
  =*  core  +>.rock
  =*  avatar  avatar.rock
  ?-  -.grit
    %set-ctid  core(ctid turf-id.grit)
    %set-avatar  core(avatar avatar.grit)
    %set-nick  core(nick.avatar nick.grit)
    %set-color  core(color.body.avatar color.grit)
    %add-thing  core(things.avatar (snoc things.avatar thing.grit))
    %del-thing  core(things.avatar (oust [index.grit 1] things.avatar))
    %set-thing  core(things.avatar (snap things.avatar index.grit thing.grit))
    %port-offered  core(port-offer `+.grit, ttid ~)
    %accept-port-offer  core(ttid `for.grit, port-offer ~)
      %reject-port-offer
    =.  port-offer.core
      ?~  port-offer.core  ~
      ?:  =(for.grit for.u.port-offer.core)  ~
      port-offer.core
    =?  ttid.core  =(`for.grit ttid.core)
      ~
    core
    %clear-port-offer  core(ttid ~, port-offer ~)
  ==
::
:: upgrades
++  urck
  |=  rock=vock
  ^-  ^rock
  ?+  -.rock     $(rock (urck:mild rock))
    rock-v       rock
    rock-v:mild  (rock-to-next rock)
  ==
++  rock-to-next
  |=  =rock:mild
  ^-  ^rock
  :-  *rock-v
  +.rock(avatar (uvtr avatar.rock))
::
++  ugrt
  |=  g=vrit
  ^-  grit
  ?+  g                  $(g (ugrt:mild g))
    [cur-grit-v *]       g
    [cur-grit-v:mild *]  (grit-to-next g)
  ==
++  grit-to-next
  |=  [g=grit:mild]
  ^-  grit
  =/  grit  +.g
  :-  *cur-grit-v
  ?+  -.grit  grit
    %set-avatar
      grit(avatar (uvtr avatar.grit))
    %add-thing
      grit(thing (utng thing.grit))
    %set-thing
      grit(thing (utng thing.grit))
  ==
--
