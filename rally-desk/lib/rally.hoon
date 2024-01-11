/-  *rally
|%
++  make-action
  |=  [=dest =stirs]
  ^-  action
  [%0 dest stirs]
++  make-waves-update
  |=  =waves
  ^-  update
  [%0 %waves waves]
++  make-quit-update
  |=  host=(unit ship)
  ^-  update
  [%0 %quit host]
++  make-uuid
  |=  [now=@da eny=@uvJ]
  ^-  uuid
  (scot %uv (shaw now 64 eny))
::
++  stir-to-waves
  |=  [kru=crew =stir actor=ship]
  ^-  [roars waves]
  =-  [(weld (turn waves (lead %wave)) roars) waves]
  ^-  [=roars =waves]
  ?-    -.stir
    ::
      %add-client
    ?:  (~(has by peers.kru) actor)
      `[%add-peer-client actor uuid.stir]~
    ?:  (~(has by noobs.kru) actor)
      `[%add-noob-client actor uuid.stir]~
    =/  list-access
      .=  ?=(%white kind.list.access.kru)
      (~(has in ships.list.access.kru) actor)
    :: todo: check the filter/thread
    ?.  list-access  [[%eject actor]~ ~]
    ?:  confirm.kru
      `[%add-noob actor `uuids`[uuid.stir ~ ~]]~
    :-  [%admit actor]~
    [%add-peer actor `uuids`[uuid.stir ~ ~]]~
    ::
      %del-client
    ?:  (~(has by peers.kru) actor)
      ?:  =((~(got by peers.kru) actor) [uuid.stir ~ ~])
        :-  [%eject actor]~
        [%del-peer actor]~
      `[%del-peer-client actor uuid.stir]~
    ?:  (~(has by noobs.kru) actor)
      ?:  =((~(got by noobs.kru) actor) [uuid.stir ~ ~])
        :-  [%eject actor]~
        [%del-noob actor]~
      `[%del-noob-client actor uuid.stir]~
    `~
    ::
      %leave
    :-  [%eject actor]~  :: todo: remove bc redundant?
    :~  [%del-peer actor]
        [%del-noob actor]
    ==
    ::
    ::
      %accept-noob
    =/  app  (~(get by noobs.kru) ship.stir)
    ?~  app  `~
    :-  [%admit ship.stir]~
    :~  [%del-noob ship.stir]
        [%add-peer ship.stir u.app]
    ==
      %ban
    :-  [%eject ship.stir]~
    :~  [%revoke-access ship.stir]
        [%del-peer ship.stir]
        [%del-noob ship.stir]
    ==
      %waves
    :-  %+  roll  waves.stir
        |=  [=wave =roars]
        (weld roars (hear-roar kru wave))
    waves.stir
      %wave
    :-  (hear-roar kru wave.stir)
    [wave.stir ~]
  ==
::
++  update-crew-loud
  |=  [kru=crew =waves]
  ^-  (quip roar crew)
  =|  roars=(list roar)
  |-  ^-  (quip roar crew)
  ?~  waves  roars^kru
  :: =/  new-roars=(list roars)  ~
  =/  new-roars  (hear-roar kru i.waves)
  $(waves t.waves, roars (weld roars new-roars), kru (wash-crew kru i.waves))
++  update-crew
  |=  [kru=crew =waves]
  ^-  crew
  ?~  waves  kru
  $(waves t.waves, kru (wash-crew kru i.waves))
++  wash-crew
  |=  [kru=crew wav=wave]
  ^-  crew
  ~&  ['got wave!' wav]
  ?-    -.wav
      %set-crew
    crew.wav
      %add-peer
    =/  uuids  (~(gut by peers.kru) ship.wav ~)
    =.  uuids  (~(uni in uuids) uuids.wav)
    kru(peers (~(put by peers.kru) ship.wav uuids))
      %del-peer
    kru(peers (~(del by peers.kru) ship.wav))
      %add-peer-client
    kru(peers (~(put ju peers.kru) ship.wav uuid.wav))
      %del-peer-client
    kru(peers (~(del ju peers.kru) ship.wav uuid.wav))
      %add-noob
    =/  uuids  (~(gut by noobs.kru) ship.wav ~)
    =.  uuids  (~(uni in uuids) uuids.wav)
    kru(noobs (~(put by noobs.kru) ship.wav uuids))
      %del-noob
    kru(noobs (~(del by noobs.kru) ship.wav))
      %add-noob-client
    kru(noobs (~(put ju noobs.kru) ship.wav uuid.wav))
      %del-noob-client
    kru(noobs (~(del ju noobs.kru) ship.wav uuid.wav))
    ::
      %set-visibility
    kru(visibility visibility.wav)
      %set-access-list
    kru(list.access list.wav)
      %set-access-filter
    kru(filter.access filter.wav)
    ::
    ::   %grant-access
    :: =*  lix  list.access.kru
    :: =.  ships.lix
    ::   ?:  ?=(%black kind.lix)
    ::     (~(dif in ships.lix) ships.wav)
    ::   (~(uni in ships.lix) ships.wav)
    :: kru
    ::   %revoke-access
    :: =*  lix  list.access.kru
    :: =.  ships.lix
    ::   ?:  ?=(%black kind.lix)
    ::     (~(uni in ships.lix) ships.wav)
    ::   (~(dif in ships.lix) ships.wav)
    :: kru
      %grant-access
    =*  lix  list.access.kru
    =.  ships.lix
      ?:  ?=(%black kind.lix)
        (~(del in ships.lix) ship.wav)
      (~(put in ships.lix) ship.wav)
    kru
      %revoke-access
    =*  lix  list.access.kru
    =.  ships.lix
      ?:  ?=(%black kind.lix)
        (~(put in ships.lix) ship.wav)
      (~(del in ships.lix) ship.wav)
    kru
      %add-admin
    kru(admins (~(uni in admins.kru) ships.wav))
      %del-admin
    kru(admins (~(dif in admins.kru) ships.wav))
      %set-persistent
    kru(persistent +.wav)
      %set-confirm
    kru(confirm +.wav)
  ==
++  hear-roar
  |=  [kru=crew wav=wave]
  ^-  (list roar)
  ?+    -.wav  ~
      %add-peer
    [%admit ship.wav]~
      ?(%del-peer %del-noob)
    [%eject ship.wav]~
  ==
--
