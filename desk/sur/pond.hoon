/-  *turf
/+  *turf
=<
|%
++  name  %pond
+$  rock  (unit turf)
+$  wave
  $@  ?(%del-turf %inc-counter)
  $%  set-turf
      chat-wave
  ==
++  wash
  |=  [=rock =wave]
  ^-  ^rock
  ?@  wave
    ?-  wave
      %del-turf  ~
        %inc-counter
      ?~  rock  rock
      rock(item-counter.plot.u +(item-counter.plot.u.rock))
    ==
  ?-  -.wave
    %set-turf  `turf.wave
      %chat
    ?~  rock  rock
    rock(chats.ephemera.u [chat.wave chats.ephemera.u.rock])
  ==
--
|%
+$  set-turf  [%set-turf =turf]
+$  chat-wave  [%chat =chat]
--