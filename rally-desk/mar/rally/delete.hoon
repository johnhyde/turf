/-  r=rally
/+  dejs
|_  del=[=c-id:r host=(unit ship)]
  ++  grow
    |%
    ++  noun  del
    :: ++  json
    ::   ^-  ^json
    ::   (delete:enjs del)
    --
  ++  grab
    |%
    ++  noun  ,[=c-id:r host=(unit ship)]
    ++  json  delete:dejs
    --
  ++  grad  %noun
  --