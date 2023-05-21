/-  pond
/+  *sss, *plow
|_  res=(response:poke pond *)
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
    --
  ++  grad  %noun
  --