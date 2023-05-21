/-  *turf
/+  *turf
=<
|%
++  name  %pond
+$  rock  (unit turf)
+$  wave
  $@  ?(%del-turf %inc-counter)
  $%  set-turf
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
  :: ?-  -:wave
  `turf.wave  :: %set-turf
--
|%
+$  set-turf  [%set-turf =turf]
--