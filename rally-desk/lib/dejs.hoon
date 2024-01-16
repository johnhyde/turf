/-  r=rally
=,  dejs:format
|%
++  enter
  |=  jon=json
  ^-  [=dest:r =uuid:r]
  %.  jon
  (ot ~[dest+dest uuid+so])
++  dest
  |=  jon=json
  ^-  dest:r
  %.  jon
  (ot ~[ship+(se %p) 'crewId'^pa])
--
