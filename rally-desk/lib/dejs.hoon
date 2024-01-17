/-  r=rally
=,  dejs:format
=*  soft  dejs-soft:format
|%
++  action
  |=  jon=json
  ^-  action:r
  %.  jon
  (ot ~[version+(cork ni version) dest+dest stirs+stirs])
++  delete
  |=  jon=json
  ^-  [=c-id:r host=(unit ship)]
  %.  jon
  (ot ~['crewId'^pa host+host])
++  enter
  |=  jon=json
  ^-  [=dest:r =uuid:r]
  %.  jon
  (ot ~[dest+dest uuid+so])
++  leave
  |=  jon=json
  ^-  =dest:r
  %.  jon
  (ot ~[dest+dest])
::
++  version
  |=  v=@ud
  ?>  =(0 v)
  %0
++  dest
  |=  jon=json
  ^-  dest:r
  %.  jon
  (ot ~[ship+shp 'crewId'^pa])
++  shp  (se %p)
++  stirs  (ar stir)
++  stir
  |=  jon=json
  ^-  stir:r
  %.  jon
  %-  of
  :~  add-client+(ot ~[uuid+so])
      del-client+(ot ~[uuid+so])
      leave+_~
      waves+waves
      wave+wave
  ==
++  waves  (ar wave)
++  wave
  |=  jon=json
  ^-  wave:r
  %.  jon
  %-  of
  :: :~  set-crew+
  :~  add-peer+(ot ~[ship+shp uuids+uuids])
      del-peer+(ot ~[ship+shp])
      add-peer-client+(ot ~[ship+shp uuid+so])
      del-peer-client+(ot ~[ship+shp uuid+so])
      add-noob+(ot ~[ship+shp uuids+uuids])
      del-noob+(ot ~[ship+shp])
      add-noob-client+(ot ~[ship+shp uuid+so])
      del-noob-client+(ot ~[ship+shp uuid+so])
      ::
      set-access-list+(ot ~[list+access-list])
      set-access-filter+(ot ~[filter+access-filter])
      grant-access+(ot ~[ship+shp])
      revoke-access+(ot ~[ship+shp])
      add-admin+(ot ~[ships+ships])
      del-admin+(ot ~[ships+ships])
      set-visibility+(ot ~[visibility+(cork so visibility:r)])
      set-persistent+(ot ~[persistent+bo])
      set-confirm+(ot ~[confirm+bo])
  ==
++  access-list
  %-  ot
  :~  kind+(cork so ?(%black %white))
      ships+ships
  ==
++  access-filter
  %-  ot:soft
  :~  dap+so:soft  :: todo: validate as @tas?
      ted+so:soft
  ==
++  uuids  (cork (ar so) silt)
++  ships  (cork (ar shp) silt)
++  host
  |=  jon=json
  ^-  (unit ship)
  ?~  jon  ~
  `((se %p) jon)
--
