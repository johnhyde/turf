/-  *rally
|%
++  make-action
  |=  [=dest =stirs]
  ^-  action
  [%0 dest stirs]
++  make-update
  |=  =waves
  ^-  update
  [%0 waves]
++  make-uuid
  |=  [now=@da eny=@uvJ]
  ^-  uuid
  (scot %uv (shaw now 64 eny))
::
++  stir-to-waves
  |=  [kru=crew =stir actor=ship]
  ^-  waves
  ?-    -.stir
      %apply
    =/  list-access
      ?!  .=
        ?=(%black kind.list.access.kru)
      (~(has in ships.list.access.kru) actor)
    :: todo: check the filter/thread
    ?.  list-access  ~
    ?:  confirm.kru
      [%add-applicant actor uuids.stir]~
    [%add-peer actor uuids.stir]~
    ::
      %add-client
    ?:  (~(has by peers.kru) actor)
      [%add-peer-client actor uuid.stir]~
    ?:  (~(has by applicants.kru) actor)
      [%add-applicant-client actor uuid.stir]~
    ~
    ::
      %del-client
    ?:  (~(has by peers.kru) actor)
      [%del-peer-client actor uuid.stir]~
    ?:  (~(has by applicants.kru) actor)
      [%del-applicant-client actor uuid.stir]~
    ~
    ::
      %leave
    :~  [%del-peer actor]
        [%del-applicant actor]
    ==
    ::
    ::
      %accept-applicant
    =/  app  (~(get by applicants.kru) ship.stir)
    ?~  app  ~
    :~  [%del-applicant ship.stir]
        [%add-peer ship.stir u.app]
    ==
      %ban
    :~  [%revoke-access ship.stir]
        [%del-peer ship.stir]
        [%del-applicant ship.stir]
    ==
      %waves
    waves.stir
      %wave
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
      %add-applicant
    =/  uuids  (~(gut by applicants.kru) ship.wav ~)
    =.  uuids  (~(uni in uuids) uuids.wav)
    kru(applicants (~(put by applicants.kru) ship.wav uuids))
      %del-applicant
    kru(applicants (~(del by applicants.kru) ship.wav))
      %add-applicant-client
    kru(applicants (~(put ju applicants.kru) ship.wav uuid.wav))
      %del-applicant-client
    kru(applicants (~(del ju applicants.kru) ship.wav uuid.wav))
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
  :-  [%wave wav]
  ?+    -.wav  ~
      %add-peer
    [%admit ship.wav]~
      ?(%del-peer %del-applicant)
    [%eject ship.wav]~
  ==
--
