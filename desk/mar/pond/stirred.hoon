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
      %+  pond-wave:enjs
        [*cur-foam-v:turf id.strd src.strd wen.strd]
      grits.strd
    --
  ++  grab
    |%
    ++  noun  stirred:pond
    --
  ++  grad  %noun
  --