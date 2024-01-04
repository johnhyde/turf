/-  *call
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
:: ++  update-call
::   |=  [kol=call up=update]
::   ^-  call
::   ?~  waves.up  call
::   $(kol (wash-call kol i.waves.up), waves.up t.waves.up)
++  wash-call
  |=  [kol=call wav=wave]
  ^-  call
  ?-    -.wav
      %set-call
    call.wav
      %add-peer
    =/  uuids  (~(gut by peers.kol) ship.wav ~)
    =.  uuids  (~(uni in uuids) uuids.wav)
    kol(peers (~(put by peers.kol) ship.wav uuids))
      %del-peer
    kol(peers (~(del by peers.kol) ship.wav))
      %add-peer-client
    kol(peers (~(put ju peers.kol) ship.wav uuid.wav))
      %del-peer-client
    kol(peers (~(del ju peers.kol) ship.wav uuid.wav))
      %add-applicant
    =/  uuids  (~(gut by applicants.kol) ship.wav ~)
    =.  uuids  (~(uni in uuids) uuids.wav)
    kol(applicants (~(put by applicants.kol) ship.wav uuids))
      %del-applicant
    kol(applicants (~(del by applicants.kol) ship.wav))
      %add-applicant-client
    kol(applicants (~(put ju applicants.kol) ship.wav uuid.wav))
      %del-applicant-client
    kol(applicants (~(del ju applicants.kol) ship.wav uuid.wav))
    ::
      %set-visibility
    kol(visibility visibility.wav)
      %set-access-list
    kol(list.access list.wav)
      %set-access-filter
    kol(filter.access filter.wav)
    ::
    ::   %grant-access
    :: =*  lix  list.access.kol
    :: =.  ships.lix
    ::   ?:  ?=(%black kind.lix)
    ::     (~(dif in ships.lix) ships.wav)
    ::   (~(uni in ships.lix) ships.wav)
    :: kol
    ::   %revoke-access
    :: =*  lix  list.access.kol
    :: =.  ships.lix
    ::   ?:  ?=(%black kind.lix)
    ::     (~(uni in ships.lix) ships.wav)
    ::   (~(dif in ships.lix) ships.wav)
    :: kol
      %grant-access
    =*  lix  list.access.kol
    =.  ships.lix
      ?:  ?=(%black kind.lix)
        (~(del in ships.lix) ship.wav)
      (~(put in ships.lix) ship.wav)
    kol
      %revoke-access
    =*  lix  list.access.kol
    =.  ships.lix
      ?:  ?=(%black kind.lix)
        (~(put in ships.lix) ship.wav)
      (~(del in ships.lix) ship.wav)
    kol
      %add-admin
    kol(admins (~(uni in admins.kol) ships.wav))
      %del-admin
    kol(admins (~(dif in admins.kol) ships.wav))
      %set-persistent
    kol(persistent +.wav)
      %set-confirm
    kol(confirm +.wav)
  ==
++  hear-roar
  |=  [kol=call wav=wave]
  ^-  (list roar)
  :-  [%wave wav]
  ?+    -.wav  ~
      %add-peer
    [%admit ship.wav]~
      ?(%del-peer %del-applicant)
    [%eject ship.wav]~
  ==
--
