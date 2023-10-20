/-  *turf
/+  *turf
=<
|%
++  name  %mist
+$  rock  ^rock
+$  goal  ^goal
+$  foam  ^foam  :: from lib/turf
+$  grit  ^grit
++  wash  wash-grit
--
|%
:: +$  rock  $~(default-avatar:gen avatar)
+$  rock
  $+  mist-rock
  $:  =stir-ids
      core
  ==
+$  core
  $:  ctid=(unit turf-id)  :: current turf-id
      ttid=(unit turf-id)  :: target turf-id
      port-offer=(unit port-offer)
      =avatar
  ==
+$  grits  (list grit)
+$  grit
  $+  mist-grit
  $@  %clear-port-offer
  $%  [%set-ctid turf-id=(unit turf-id)]
      [%set-avatar =avatar]
      [%set-color color=@ux]
      [%add-thing =thing]
      [%del-thing index=@ud]
      [%port-offered port-offer]
      [%accept-port-offer for=turf-id]
      [%reject-port-offer for=turf-id]
  ==
::
+$  goals  (list goal)
+$  goal
  $+  mist-goal
  $%  grit
      [%add-thing-from-closet =form-id]
      [%port-accepted for=turf-id]
      [%port-rejected for=turf-id]
      [%export-self port-offer]
  ==
:: ::
+$  stir
  $:  mpath=mist-path
      id=stir-id
      =goals
  ==
+$  stirred
    $%  [what=%rock =rock]
        [what=%wave id=stir-id =grits]
    ==
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
  |=  [=rock [id=stir-id src=(unit ship)] =grit]
  ^-  ^rock
  =?  stir-ids.rock  &(?=(^ src) ?=(^ id))
    (~(put by stir-ids.rock) (need src) (need id))
  :-  stir-ids.rock
  ^-  core
  =*  core  +.rock
  =*  avatar  avatar.rock
  ?@  grit
    :: %clear-port-offer
    core(ttid ~, port-offer ~)
  ?-  -.grit
    %set-ctid  core(ctid turf-id.grit)
    %set-avatar  core(avatar avatar.grit)
    %set-color  core(color.body.avatar color.grit)
    %add-thing  core(things.avatar (snoc things.avatar thing.grit))
    %del-thing  core(things.avatar (oust [index.grit 1] things.avatar))
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
  ==
--