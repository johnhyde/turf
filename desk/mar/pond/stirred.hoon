/-  pond, turf
/+  *sss, *plow
|_  strd=stirred:pond
  ++  grow
    |%
    ++  noun  strd
    ++  json
      ^-  ^json
      ?:  ?=(%rock what.strd)
        (pond-rock:enjs rock.strd)
      (pond-wave:enjs id.strd grit.strd)
    --
  ++  grab
    |%
    ++  noun  stirred:pond
    --
  ++  grad  %noun
  --