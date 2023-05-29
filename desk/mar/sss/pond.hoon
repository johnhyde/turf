/-  pond, turf
/+  *sss, *plow
|_  res=(response:poke pond pond-path:turf)
  ++  grow
    |%
    ++  noun  res
    ++  json
      ^-  ^json
      ?.  ?=(%scry type.res)  ~
      ?:  ?=(%rock what.res)
        (pond-rock:enjs rock.res)
      (pond-wave:enjs wave.res)
    --
  ++  grab
    |%
    ++  noun  (response:poke pond *)
    ++  json  pond-res:dejs
    --
  ++  grad  %noun
  --