/-  r=rally
=,  enjs:format
|%
++  update
  |=  up=update:r
  ^-  json
  %-  pairs
  :~  version+(numb -.up)
      kind+[%s +<.up]
      ?-    +<.up
          %waves
        waves+(waves waves.up)
          %quit
        :-  %host
        ?~  host.up  ~
        (ship-json u.host.up)
  ==  ==
++  client-update
  |=  cup=client-update:r
  ^-  json
  %-  pairs
  :~  version+(numb -.cup)
      kind+[%s +<.cup]
      uuid+s+uuid.cup
  ==
++  dests-update
  |=  in=dests-update:r
  ^-  json
  %-  pairs
  :~  version+(numb -.in)
      kind+[%s +<.in]
      ?-    +<.in
          %cries
        dests+(dests dests.in)
          ?(%cry %fade)
        dest+(dest dest.in)
  ==  ==
::
++  waves
  |=  wavs=waves:r
  ^-  json
  :-  %a
  (turn wavs wave)
++  wave
  |=  wav=wave:r
  ^-  json
  %-  pairs
  :*  kind+[%s -.wav]
      ?-    -.wav
          %set-crew
        ~[crew+(crew crew.wav)]
          ?(%add-peer %add-noob)
        ~[ship+(ship-json ship.wav) uuids+(uuids uuids.wav)]
          ?(%del-peer %del-noob %grant-access %revoke-access)
        ~[ship+(ship-json ship.wav)]
          ?(%add-peer-client %del-peer-client %add-noob-client %del-noob-client)
        ~[ship+(ship-json ship.wav) uuid+s+uuid.wav]
          %set-access-list
        ~[list+(access-list list.wav)]
          %set-access-filter
        ~[filter+(access-filter filter.wav)]
          ?(%add-admin %del-admin)
        ~[ships+(ships ships.wav)]
          %set-visibility
        ~[visibility+s+visibility.wav]
          %set-persistent
        ~[persistent+b+persistent.wav]
          %set-confirm
        ~[confirm+b+confirm.wav]

  ==  ==
::
++  crew
  |=  kru=crew:r
  ^-  json
  %-  pairs
  :~  version+(numb -.kru)
      peers+(clients peers.kru)
      noobs+(clients noobs.kru)
      admins+(ships admins.kru)
      access+(access access.kru)
      visibility+s+visibility.kru
      persistent+b+persistent.kru
      confirm+b+confirm.kru
  ==
::
++  clients
  |=  lents=clients:r
  ^-  json
  %-  pairs
  %+  turn  ~(tap by lents)
  |=  [boat=^ship ids=uuids:r]
  ^-  [@t json]
  :-  (ship-cord boat)
  (uuids ids)
++  uuids
  |=  ids=uuids:r
  ^-  json
  :-  %a
  %+  turn  ~(tap in ids)
  |=  id=uuid:r
  ^-  json
  s+id
++  ships
  |=  xips=ships:r
  ^-  json
  :-  %a
  (turn ~(tap in xips) ship-json)
++  access
  |=  axs=access:r
  ^-  json
  %-  pairs
  :~  list+(access-list list.axs)
      filter+(access-filter filter.axs)
  ==
++  access-list
  |=  alist=access-list:r
  ^-  json
  %-  pairs
  :~  kind+s+kind.alist
      ships+(ships ships.alist)
  ==
++  access-filter
  |=  fil=access-filter:r
  ^-  json
  ?~  fil  ~
  %-  pairs
  :~  dap+s+dap.u.fil
      ted+s+ted.u.fil
  ==
++  dests
  |=  ds=(set dest:r)
  ^-  json
  a+(turn ~(tap in ds) dest)
++  dest
  |=  d=dest:r
  ^-  json
  %-  pairs
  :~  ship+(ship-json ship.d)
      'crewId'^(c-id c-id.d)
  ==
++  c-id
  |=  id=c-id:r
  ^-  json
  (path id)
++  ship-json
  |=  shp=^ship
  ^-  json
  s+(scot %p shp)
++  ship-cord
  |=  shp=^ship
  ^-  @t
  (scot %p shp)
--