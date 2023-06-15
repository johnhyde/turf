/-  *turf
/+  *turf
=<
|%
++  name  %pond
+$  rock  ^rock
+$  wave  ^wave
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
  =*  players  players.ephemera.turf
  ?-  -.wave
    %set-turf  `turf.wave
    %size-turf  `turf(offset.plot offset.wave, size.plot size.wave)
    %add-husk  `(add-husk turf +.wave)
    %del-shade  `(del-shade turf +.wave)
    %cycle-shade  `(cycle-shade turf +.wave)
    %set-shade-var  `(set-shade-var turf +.wave)
      %chat
    rock(chats.ephemera.u [chat.wave chats.ephemera.turf])
      %move
    =.  players
      %^  jab-by-players  players  ship.wave
      |=  =player
      player(pos pos.wave)
    rock
      %face
    =.  players
      %^  jab-by-players  players  ship.wave
      |=  =player
      player(dir dir.wave)
    rock
      %set-avatar
    =.  players
      %^  jab-by-players  players  ship.wave
      |=  =player
      player(avatar avatar.wave)
    rock
  ==
--
|%
+$  rock  (unit turf)
+$  wave
  $+  pond-wave
  $@  ?(%del-turf %inc-counter)
  $%  set-turf-wave
      size-turf-wave
      add-husk-wave
      del-shade-wave
      cycle-shade-wave
      set-shade-var-wave
      chat-wave
      move-wave
      face-wave
      set-avatar-wave
  ==
+$  set-turf-wave  [%set-turf =turf]
+$  size-turf-wave  [%size-turf offset=svec2 size=vec2]
+$  add-husk-wave  [%add-husk husk-spec]
+$  del-shade-wave  [%del-shade =shade-id]
+$  cycle-shade-wave  [%cycle-shade =shade-id amt=@ud]
+$  set-shade-var-wave  [%set-shade-var =shade-id variation=@ud]
+$  chat-wave  [%chat =chat]
+$  move-wave  [%move =ship pos=svec2]
+$  face-wave  [%face =ship =dir]
+$  set-avatar-wave  [%set-avatar =ship =avatar]
::
+$  stir-id  (unit @t)
+$  stir  [ppath=pond-path id=stir-id =wave]
+$  stirred
    $%  [what=%rock =rock]
        [what=%wave id=stir-id wave=(unit wave)]
    ==
--