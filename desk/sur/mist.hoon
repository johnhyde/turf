/-  *turf
/+  *turf
=<
|%
++  name  %mist
+$  rock  ^rock
+$  wave  ^wave
++  wash
  |=  [=rock =wave]
  ^-  ^rock
  :: avatar.wave
  :: ?@  wave
  ::   ?-  wave
  ::     %del-turf  ~
  ::       %inc-counter
  ::     rock(stuff-counter.plot.u +(stuff-counter.plot.turf))
  ::   ==
  =*  avatar  avatar.rock
  ?-  -.wave
    %set-ctid  rock(ctid turf-id.wave)
    %set-avatar  rock(avatar avatar.wave)
    %set-color  rock(color.body.avatar color.wave)
    %add-thing  rock(things.avatar (snoc things.avatar thing.wave))
    %del-thing  rock(things.avatar (oust [index.wave 1] things.avatar))
  ::   %del-shade  `(del-shade turf +.wave)
  ::     %chat
  ::   rock(chats.ephemera.u [chat.wave chats.ephemera.turf])
  ::     %move
  ::   =*  players  players.ephemera.turf
  ::   ?.  (~(has by players) ship.wave)  rock
  ::   =.  players
  ::     %+  ~(jab by players)
  ::       ship.wave
  ::     |=  =player
  ::     player(pos pos.wave)
  ::   rock
  ==
--
|%
:: +$  rock  $~(default-avatar:gen avatar)
+$  rock
  $:  ctid=(unit turf-id)
      =avatar
  ==
+$  wave
  :: ?(%del-av %inc-counter)
  :: $@  ?(%del-av %inc-counter)
  $%  set-ctid-wave
      set-avatar-wave
      set-color-wave
      add-thing-wave
      del-thing-wave
      :: del-shade-wave
      :: chat-wave
      :: move-wave
  ==
+$  set-ctid-wave  [%set-ctid turf-id=(unit turf-id)]
+$  set-avatar-wave  [%set-avatar =avatar]
+$  set-color-wave  [%set-color color=@ux]
+$  add-thing-wave  [%add-thing =thing]
+$  del-thing-wave  [%del-thing index=@ud]
:: +$  chat-wave  [%chat =chat]
:: +$  move-wave  [%move =ship pos=svec2]
:: ::
+$  stir-id  (unit @t)
+$  stir
  $:  mpath=mist-path
      id=stir-id
      wave=stir-wave
  ==
+$  stir-wave
  $%  wave
      [%add-thing-from-closet =form-id]
  ==
+$  stirred
    $%  [what=%rock =rock]
        [what=%wave id=stir-id wave=(unit wave)]
    ==
--