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
  $:  =stir-ids
      core
  ==
+$  core
  $:  ctid=(unit turf-id)
      =avatar
  ==
+$  goals  (list goal)
+$  goal
  $+  mist-goal
  $%  grit
      [%add-thing-from-closet =form-id]
  ==
+$  grits  (list grit)
+$  grit
  $+  mist-grit
  :: ?(%del-av %inc-counter)
  :: $@  ?(%del-av %inc-counter)
  $%  set-ctid-grit
      set-avatar-grit
      set-color-grit
      add-thing-grit
      del-thing-grit
  ==
+$  set-ctid-grit  [%set-ctid turf-id=(unit turf-id)]
+$  set-avatar-grit  [%set-avatar =avatar]
+$  set-color-grit  [%set-color color=@ux]
+$  add-thing-grit  [%add-thing =thing]
+$  del-thing-grit  [%del-thing index=@ud]
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

++  wash-grit
  |=  [=rock [id=stir-id src=(unit ship)] =grit]
  ^-  ^rock
  =?  stir-ids.rock  &(?=(^ src) ?=(^ id))
    (~(put by stir-ids.rock) (need src) (need id))
  :-  stir-ids.rock
  ^-  core
  =*  core  +.rock
  =*  avatar  avatar.rock
  ?-  -.grit
    %set-ctid  core(ctid turf-id.grit)
    %set-avatar  core(avatar avatar.grit)
    %set-color  core(color.body.avatar color.grit)
    %add-thing  core(things.avatar (snoc things.avatar thing.grit))
    %del-thing  core(things.avatar (oust [index.grit 1] things.avatar))
  ==
--