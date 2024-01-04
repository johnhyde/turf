/-  *call
/+  *call, dbug, default-agent, agentio, verb
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  %0
      =reset
      our-calls=(map c-id call)
      ext-calls=(map dest (unit call))
      :: clients=(map uuid path)
  ==
+$  current-state  state-0
+$  reset  _1
::
+$  card  $+(card card:agent:gall)
--
%-  agent:dbug
=|  current-state
=*  state  -
%+  verb  &
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
      =^  cards  state  (apply-action:hc c-id.dest.act stirs.act src.bowl)
      cards^this
    ?>  =(src our):bowl
    :_  this
    [(call-action-card:hc act)]~
      %sub
    =/  =dest  !<(dest vase)
    =/  path  (call-update-path:hc dest)
    :_  this
    [%pass path %agent [ship.dest dap.bowl] %watch path]~
      %give
    =/  =c-id  !<(c-id vase)
    =/  =update  [%0 [%set-call *call]~]
    :_  this
    :_  ~
    :*  %give  %fact
      ~[(call-update-path:hc our.bowl c-id)]
      %call-update  !>(update)
    ==
  ==
++  on-watch
  |=  =path
  ^-  (quip card _this)
  ~&  >  "got on-watch on {<path>}"
  :: ?+  path  (on-watch:def path)
  ?+  path  `this
      [%call %update v=@ host=@ id=*]
    =/  =dest  [(slav %p &4.path) |4.path]
    ?:  =(ship.dest our.bowl)
      =/  call  (~(gut by our-calls) c-id.dest ~)
      ?~  call  !!
      =/  init-card  (call-init-card:hc dest call)
      =/  is-peer  (~(has by peers.call) src.bowl)
      =/  is-applicant  (~(has by applicant.call) src.bowl)
      ?.  =(src our):bowl
        ?.  is-peer  !!
        ~[init-card]^this
      =/  =stir
        ?:  |(is-peer is-applicant)
          [%add-client uuid]
      (apply-action:hc c-id stirs src.bowl)
      :: create client ?
      :: give call rock
      `this
    ?>  =(src our):bowl
    =/  uuid  (make-uuid [now eny]:bowl)
    =/  cup=client-update  [%0 [%you-are uuid]]
    =/  up-card=card  [%give %fact ~ %client-update !>(cup)]
    ?.  (~(has by ext-calls) dest)
      =.  ext-calls  (~(put by ext-calls) dest ~)
      :_  this
      :-  up-card
      (send-action-apply:hc dest uuid)
    =/  cards=(list card)
      :-  up-card
      (send-action-stir:hc dest [%add-client uuid])
    =/  ucall  (~(got by ext-calls) dest)
    ?~  ucall
      cards^this
    :_  this
    (snoc cards (call-init-card:hc dest u.ucall))
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
      [%call %update v=@ host=@ id=*]
    ~&  ["got call update" -.sign wire]
    `this
    :: 
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
++  send-action-stir
  |=  [=dest =stir] 
  ^-  (list card)
  [(call-action-card (make-action dest [stir]~))]~
++  send-action-apply
  |=  [=dest id=uuid]
  ^-  (list card)
  =/  =stir
    [%apply (silt `(list uuid)`[id]~)]
  (send-action-stir dest stir)
++  apply-action
  |=  [=c-id stirs=stirs actor=ship]
  ^-  (quip card _state)
  =/  kol  (~(gut by our-calls) c-id ~)
  ?~  kol  `*current-state
  =|  cards=(list card)
  |-  ^-  (quip card _state)
  ?~  stirs  cards^state
  =^  roars  kol  (stir-call-top kol i.stirs actor)
  =/  new-cards  (roars-to-cards c-id roars)
  =.  our-calls  (~(put by our-calls) c-id kol)
  $(cards (weld cards new-cards), state state, stirs t.stirs)  :: do we need to "state state"?
++  stir-call-top
  |=  [kol=call =stir actor=ship]
  ^-  (quip roar call)
  ?:  &(?=(admin-stir-tags -.stir) !(~(has in admins.kol) actor))
    `kol
  (stir-call kol stir actor)
++  stir-call
  |=  [kol=call =stir actor=ship]
  ^-  (quip roar call)
  =/  =waves  (stir-to-waves kol stir actor)
  =^  roars  kol  (update-call kol waves)
  roars^kol
++  stir-to-waves
  |=  [kol=call =stir actor=ship]
  ^-  waves
  ?-    -.stir
      %apply
    =/  list-access
      ?!  .=
        ?=(%black kind.list.access.kol)
      (~(has in ships.list.access.kol) actor)
    :: todo: check the filter/thread
    ?.  list-access  ~
    ?:  confirm.kol
      [%add-applicant actor uuids.stir]~
    [%add-peer actor uuids.stir]~
    ::
      %add-client
    ?:  (~(has by peers.kol) actor)
      [%add-peer-client actor uuid.stir]~
    ?:  (~(has by applicants.kol) actor)
      [%add-applicant-client actor uuid.stir]~
    ~
    ::
      %del-client
    ?:  (~(has by peers.kol) actor)
      [%del-peer-client actor uuid.stir]~
    ?:  (~(has by applicants.kol) actor)
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
    =/  app  (~(get by applicants.kol) ship.stir)
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
++  roars-to-cards
  |=  [=c-id =roars]
  ^-  (list card)
  %+  roll  roars
  |=  [=roar cards=(list card)]
  %+  weld  cards
  ^-  (list card)
  ?-    -.roar
      %admit
    [(call-echo-card ship.roar c-id [%admit ~])]~
      %eject
    :: todo: kick subscriber here (rewrite with roll, not turn)
    :~  (call-echo-card ship.roar c-id [%eject ~])
        [%give %kick ~[(call-update-path our.bowl c-id)] `ship.roar]
    ==
      %wave
    [(call-update-card [our.bowl c-id] wave.roar)]~
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
      `wire`[%echo -.echo.pok (scot %p ship) c-id.pok]
      %agent  [ship dap.bowl]
      [%poke %echo !>(pok)]
  ==
++  call-action-card
  |=  act=action
  ^-  card
  =/  wire  (call-action-wire:hc dest.act)
  [%pass wire %agent [ship.dest.act dap.bowl] %poke [%action !>(act)]]
++  call-update-card
  |=  [=dest wav=wave]
  ^-  card
  =/  =update  [%0 [wav]~]
  :*  %give  %fact
      ~[(call-update-path dest)]
      %update  !>(update)
  ==
++  call-init-card
  |=  [=dest =call]
  ^-  card
  =/  =update  [%0 [%set-call call]~]
  :*  %give  %fact
      ~[(call-update-path ship.dest c-id.dest)]
      %update  !>(update)
  ==
:: ++  call-client-update-card
::   |=  [=c-id =uuid]
::   ^-  card
::   =/  =update  [%0 [%you-are uuid]]
::   :*  %give  %fact
::       ~[(call-update-path our.bowl c-id)]
::       %client-update  !>(update)
::   ==
++  call-action-wire
  |=  =dest
  ^-  path
  [%call %action '0' (scot %p ship.dest) c-id.dest]
++  call-update-path
  |=  =dest
  ^-  path
  [%call %update '0' (scot %p ship.dest) c-id.dest]
--  --
