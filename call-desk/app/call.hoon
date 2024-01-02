/-  *call
/+  *call, dbug, default-agent, agentio
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  %0
      =reset
      our-calls=(map c-id call)
      ext-calls=(map dest ext-call)
  ==
+$  current-state  state-0
+$  reset  _0
::
+$  card  $+(card card:agent:gall)
--
%-  agent:dbug
=|  current-state
=*  state  -
:: %+  verb  &
^-  agent:gall
=<
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %.n) bowl)
    hc    ~(. ^hc bowl)
::
++  on-init
  ^-  (quip card _this)
  :: =^  cards  state  (init-defaults:hc)
  :: cards^this
  `this
::
++  on-save
  !>(state)
::
++  on-load
  |=  old-state=vase
  |^  ^-  (quip card _this)
  :: `this
  :: =|  cards-0=(list card)
  =/  old-reset  !<(@ud (slot 6 old-state))
  =+  :-  cards-0=`(list card)`~
      ?.  =(old-reset reset)  ~&('reseting %call state' old=state)
      old=!<(versioned-state old-state)
  :: =*  quolp  -
  :: =?  quolp  ?=(%0 -.old)
  ::   (state-0-to-1 cards-0 old)
  :: =/  old  *current-state
  ?>  ?=(_-:*current-state -.old)
  =.  state  old
  `this
  --
::
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?+    mark  (on-poke:def mark vase)
      %action
    =/  act  !<(action vase)
    ?:  =(ship.dest.act our.bowl)
      =^  cards  state  (apply-action:hc c-id.dest.act stirs.act)
      cards^this
    ?>  =(src our):bowl
    :_  this
    [%pass [%action c-id.dest.act ~] %agent [ship.dest.act dap.bowl] %poke [mark vase]]~
  ==
++  on-watch
  |=  =path
  ^-  (quip card _this)
  :: ~&  >  "got on-watch on {<path>}"
  ?+  path  (on-watch:def path)
  :: ?+  path  `this
      [%call @ @ *]
    `this
  ==
++  on-leave
  |=  left=path
  ^-  (quip card _this)
  :: todo: automatically remove from whatever
  `this
::
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  ?+     path  (on-peek:def path)
      [%x %test ~]
    ~
  ==
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  :: ?>  ?=(%poke-ack -.sign)
  :: ?~  p.sign  `this
  :: %-  %-  slog
  ::     ^-  tang
  ::     :-  leaf+"poke-ack from {<src.bowl>} on wire {<wire>}"
  ::     ?~  p.sign  ~
  ::     u.p.sign
  ?+    wire  (on-agent:def wire sign)
      [~ %test ~]
    `this
  ==
++  on-arvo  on-arvo:def
++  on-fail  on-fail:def
--
::
:: Helper Core
|%
++  hc
|_  =bowl:gall
++  scrio  ~(scry agentio bowl)
++  apply-action
  |=  [=c-id stirs=stirs]
  ^-  (quip card state)
  =/  kol  (~(gut by our-calls) c-id)
  ?~  kol  `state
  =|  cards=(list card)
  |-  ^-  (quip card state)
  ?~  stirs  `state
  =^  roars  kol  (stir-our-top kol i.stirs)
  =/  new-cards  (roars-to-cards c-id roars)
  =.  our-calls  (~(put by our-calls) c-id kol)
  $(cards (weld cards new-cards), state state, stirs t.stirs)  :: do we need to "state state"?
++  stir-call-top
  |=  [kol=call =stir]
  ^-  (quip roar call)
  ?:  &(?=(admin-stir stir) !(~(has in admins.kol) src.bowl))
    `kol
  (stir-call kol stir)
++  stir-call
  |=  [kol=call =stir]
  ^-  (quip roar call)
  =/  =waves  (stir-to-waves kol stir)
  =^  roars  kol  (update-call kol waves)
  roars^kol
++  stir-to-waves
  |=  [kol=call =stir]
  ^-  waves
  ?+    -.stir  ~
      %apply
    =/  list-access
      ?!  .=
        ?=(%black kind.list.access.kol)
      (~(has in ships.list.access.kol) src.bowl)
    :: todo: check the filter/thread
    ?.  list-access  ~
    ?:  confirm.kol
      [%add-applicant src.bowl uuids.stir]~
    [%add-peer src.bowl uuids.stir]~
    ::
      %add-client
    ?:  (~(has in peers.kol) src.bowl)
      [%add-peer-client src.bowl uuid.stir]~
    ?:  (~(has in applicants.kol) src.bowl)
      [%add-applicant-client src.bowl uuid.stir]~
    ~
    ::
      %del-client
    ?:  (~(has in peers.kol) src.bowl)
      [%del-peer-client src.bowl uuid.stir]~
    ?:  (~(has in applicants.kol) src.bowl)
      [%del-applicant-client src.bowl uuid.stir]~
    ~
    ::
      %leave
    :~  [%del-peer src.bowl]
        [%del-applicant src.bowl]
    ==
    ::
    ::
      %accept-applicant
    =/  app  (~(get by applicants.kol) ship.str)
    ?~  app  ~
    :~  [%del-applicant ship.str]
        [%add-peer ship.str u.app]
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
++  roars-to-cards
  |=  [=c-id =roars]
  ^-  (list card)
  %+  turn  roars
  |=  =roar
  ^-  card
  ?-    -.roar
      %admit
    (call-echo-card ship.roar c-id [%admit ~])
      %eject
    :: todo: kick subscriber here (rewrite with roll, not turn)
    (call-echo-card ship.roar c-id [%eject ~])
  ==
++  update-call
  |=  [kol=call =waves]
  ^-  (quip roar call)
  =|  roars=(list roar)
  |-  ^-  (quip roar call)
  ?~  waves  roars^kol
  :: =/  new-roars=(list roars)  ~
  =/  new-roars  (hear-roar kol i.waves)
  $(waves t.waves, roars (weld roars new-roars), kol (wash-call kol i.waves))
::
++  call-echo-card
  |=  [=ship pok=call-poke]
  ^-  card
  :*  %pass
      `wire`[%call-poke -.echo.pok (scot %p ship) c-id.pok]
      %agent
      [ship dap.bowl]
      [%poke %call-poke !>(pok)]
  ==
--  --
