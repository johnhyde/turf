/-  spider
/+  *strandio
=,  strand=strand:spider
^-  thread:spider
|=  arg=vase
=/  m  (strand ,vase)
^-  form:m
;<  ~  bind:m  (sleep !<(@dr arg))
;<  ~  bind:m  (poke-our %turf %logout !>(~))
(pure:m !>(~))
