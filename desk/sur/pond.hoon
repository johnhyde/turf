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
  ==
++  wash
  |=  [=rock =wave]
  ^-  ^rock
  ?~  rock
    ?@  wave  ~  :: %del-turf or %inc-counter
    ?+  -.wave  ~
      %set-turf  `turf.wave
    ==
  ?@  wave
    ?-  wave
      %del-turf  ~
        %inc-counter
      rock(item-counter.plot.u +(item-counter.plot.u.rock))
    ==
  ?-  -.wave
    %set-turf  `turf.wave
    %add-item  `(add-hollow-item u.rock +.wave)
      %chat
    rock(chats.ephemera.u [chat.wave chats.ephemera.u.rock])
  ==
--
|%
+$  set-turf-wave  [%set-turf =turf]
+$  add-item-wave  [%add-item hollow-item-spec]
+$  chat-wave  [%chat =chat]
--