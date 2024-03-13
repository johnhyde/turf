/-  spider
/+  *strandio
=,  strand=strand:spider
^-  thread:spider
|=  arg=vase
=/  m  (strand ,vase)
^-  form:m
=+  !<([delay=@dr cutoff=@dr] arg)
;<  ~  bind:m  (sleep delay)
;<  ~  bind:m  (poke-our %turf %kick-nappers !>(cutoff))
(pure:m !>(~))
