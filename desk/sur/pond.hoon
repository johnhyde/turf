/-  *turf
/+  *turf
=<
|%
++  name  %pond
+$  rock  (unit turf)
+$  wave
  $@  ?(%del-turf %inc-counter)
  $%  set-turf-wave
      add-item-wave
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
      rock(item-counter.plot.u +(item-counter.plot.turf))
    ==
  ?-  -.wave
    %set-turf  `turf.wave
    %add-item  `(add-hollow-item turf +.wave)
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
+$  add-item-wave  [%add-item hollow-item-spec]
+$  chat-wave  [%chat =chat]
+$  move-wave  [%move =ship pos=svec2]
--