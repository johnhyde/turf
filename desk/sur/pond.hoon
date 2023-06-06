/-  *turf
/+  *turf
=<
|%
++  name  %pond
+$  rock  (unit turf)
+$  wave
  $@  ?(%del-turf %inc-counter)
  $%  set-turf-wave
      add-husk-wave
      del-shade-wave
      chat-wave
      move-wave
  ==
++  wash
  |=  [=rock =wave]
  ^-  ^rock
  ?~  rock
    ?@  wave  ~  :: %del-turf or %inc-counter
    ?+  -.wave  ~
      %set-turf  `turf.wave
    ==
  =*  turf  u.rock
  ?@  wave
    ?-  wave
      %del-turf  ~
        %inc-counter
      rock(stuff-counter.plot.u +(stuff-counter.plot.turf))
    ==
  ?-  -.wave
    %set-turf  `turf.wave
    %add-husk  `(add-husk turf +.wave)
    %del-shade  `(del-shade turf +.wave)
      %chat
    rock(chats.ephemera.u [chat.wave chats.ephemera.turf])
      %move
    =*  players  players.ephemera.turf
    ?.  (~(has by players) ship.wave)  rock
    =/  pos  (clamp-pos pos.wave offset.plot.turf size.plot.turf)
    =.  players
      %+  ~(jab by players)
        ship.wave
      |=  =player
      player(pos pos)
    rock
  ==
--
|%
+$  set-turf-wave  [%set-turf =turf]
+$  add-husk-wave  [%add-husk husk-spec]
+$  del-shade-wave  [%del-shade =shade-id]
+$  chat-wave  [%chat =chat]
+$  move-wave  [%move =ship pos=svec2]
--