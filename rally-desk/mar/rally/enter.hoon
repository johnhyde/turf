/-  r=rally
/+  dejs
|_  ent=[=dest:r =uuid:r]
  ++  grow
    |%
    ++  noun  ent
    :: ++  json
    ::   ^-  ^json
    ::   (enter:enjs ent)
    --
  ++  grab
    |%
    ++  noun  ,[=dest:r =uuid:r]
    ++  json  enter:dejs
    --
  ++  grad  %noun
  --