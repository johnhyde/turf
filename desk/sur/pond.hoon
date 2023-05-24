/-  *turf
/+  *turf
=<
|%
++  name  %pond
+$  rock  (unit turf)
+$  wave
  $@  ?(%del-turf %inc-counter)
  $%  set-turf
      set-tile
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
    %set-tile  (set-tile rock +.wave)
      %chat
    rock(chats.ephemera.u [chat.wave chats.ephemera.u.rock])
  ==
--
|%
+$  set-turf  [%set-turf =turf]
+$  set-tile  [%set-tile pos=svec2 =item-id variation=@ud]
+$  chat-wave  [%chat =chat]
--