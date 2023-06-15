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
  ?-  -.wave
    %set-avatar  avatar.wave
    %set-color  rock(color.body color.wave)
    %add-thing  rock(things [thing.wave things.rock])
    %del-thing  rock(things (oust [index.wave 1] things.rock))
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
+$  rock  avatar
+$  wave
  :: ?(%del-av %inc-counter)
  :: $@  ?(%del-av %inc-counter)
  $%  set-avatar-wave
      set-color-wave
      add-thing-wave
      del-thing-wave
      :: del-shade-wave
      :: chat-wave
      :: move-wave
  ==
+$  set-avatar-wave  [%set-avatar =avatar]
+$  set-color-wave  [%set-color color=@ux]
+$  add-thing-wave  [%add-thing =thing]
+$  del-thing-wave  [%del-thing index=@ud]
:: +$  chat-wave  [%chat =chat]
:: +$  move-wave  [%move =ship pos=svec2]
:: ::
+$  stir-id  (unit @t)
+$  stir
  $:  ppath=mist-path
      id=stir-id
      wave=stir-wave
  ==
+$  stir-wave
  $%  =wave
      [%add-thing-from-closet =form-id]
  ==
+$  stirred
    $%  [what=%rock =rock]
        [what=%wave id=stir-id wave=(unit wave)]
    ==
--