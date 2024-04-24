/-  *turf-2
=<
|%
++  name  %mist
+$  rock  ^rock
+$  goal  ^goal
+$  foam  ^foam  :: from lib/turf
+$  foam-all  ^foam-all
+$  grit  ^grit
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
      [%set-thing index=@ud =thing]
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
      [%update-things-from-closet ~]
      [%port-accepted for=turf-id]
      [%port-rejected for=turf-id]
      [%kicked for=turf-id]
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
--
