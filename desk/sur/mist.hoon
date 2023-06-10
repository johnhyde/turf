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
  rock
  :: ?@  wave
  ::   ?-  wave
  ::     %del-turf  ~
  ::       %inc-counter
  ::     rock(stuff-counter.plot.u +(stuff-counter.plot.turf))
  ::   ==
  :: ?-  -.wave
  ::   %set-turf  `turf.wave
  ::   %add-husk  `(add-husk turf +.wave)
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
  :: ==
--
|%
:: +$  rock  $~(default-avatar:gen avatar)
+$  rock  @ud
+$  wave  ~
  :: ?(%del-av %inc-counter)
  :: $@  ?(%del-av %inc-counter)
  :: $%  set-turf-wave
  ::     add-husk-wave
  ::     del-shade-wave
  ::     chat-wave
  ::     move-wave
  :: ==
:: +$  set-turf-wave  [%set-turf =turf]
:: +$  add-husk-wave  [%add-husk husk-spec]
:: +$  del-shade-wave  [%del-shade =shade-id]
:: +$  chat-wave  [%chat =chat]
:: +$  move-wave  [%move =ship pos=svec2]
:: ::
:: +$  stir-id  (unit @t)
:: +$  stir  [ppath=mist-path id=stir-id =wave]
:: +$  stirred
::     $%  [what=%rock =rock]
::         [what=%wave id=stir-id wave=(unit wave)]
::     ==
--