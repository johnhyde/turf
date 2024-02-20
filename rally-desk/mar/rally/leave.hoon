/-  r=rally
/+  dejs
|_  d=dest:r
  ++  grow
    |%
    ++  noun  d
    :: ++  json
    ::   ^-  ^json
    ::   (dest:enjs d)
    --
  ++  grab
    |%
    ++  noun  dest:r
    ++  json  leave:dejs
    --
  ++  grad  %noun
  --