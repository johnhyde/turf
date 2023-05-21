/-  *turf
/+  *turf
=<
|%
++  name  %pond
+$  rock  (unit turf)
+$  wave
  $@  %del-turf
  $%  set-turf
  ==
:: +$  set-turf  [%set-turf =turf]
++  wash
  |=  [=rock =wave]
  ^-  ^rock
  ?@  wave
    ~  :: %del-turf
  :: ?-  -:wave
  `turf.wave  :: %set-turf
--
|%
+$  set-turf  [%set-turf =turf]
--