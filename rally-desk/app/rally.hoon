/-  *rally
/+  *rally, dbug, default-agent, agentio, verb
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  %0
      =reset
      our-crews=(map c-id crew)
      ext-crews=(map dest (unit crew))
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
      ?.  =(old-reset reset)  ~&('reseting %rally state' old=state)
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
      %delete
    ?>  =(src our):bowl
    =+  !<([=c-id host=(unit ship)] vase)
    ?.  (~(has by our-crews) c-id)  `this
    =.  our-crews  (~(del by our-crews) c-id)
    :_  this
    [(quit-card:hc [our.bowl c-id] host)]~
      %action
    =/  act  !<(action vase)
    ?:  =(ship.dest.act our.bowl)
      =^  cards  state  (apply-action:hc c-id.dest.act stirs.act src.bowl)
      cards^this
    ?>  =(src our):bowl
    :_  this
    [(action-card:hc act)]~
      %shell
    =/  [=c-id =echo]  !<(shell vase)
    =/  =dest  [src.bowl c-id]
    =/  path  (update-path:hc dest)
    ?-    -.echo
        %admit
      ?>  (~(has by ext-crews) dest)
      :_  this
      [%pass path %agent [ship.dest dap.bowl] %watch path]~
        ?(%eject %quit)  :: todo: on quit, eject and apply to new host
      =.  ext-crews  (~(del by ext-crews) dest)
      :_  this
      [%give %kick [path]~ ~]~
    ==
      %enter
    ?>  =(src our):bowl
    =+  !<([=dest =uuid] vase)
    `this
      %leave
    ?>  =(src our):bowl
    =+  !<(=dest vase)
    `this
      ::
      %sub
    =/  =dest  !<(dest vase)
    =/  path  (update-path:hc dest)
    :_  this
    [%pass path %agent [ship.dest dap.bowl] %watch path]~
      %give
    =/  =c-id  !<(c-id vase)
    =/  =update  (make-waves-update [%set-crew *crew]~)
    :_  this
    :_  ~
    :*  %give  %fact
      ~[(update-path:hc our.bowl c-id)]
      %update  !>(update)
    ==
  ==
++  on-watch
  |=  =path
  ^-  (quip card _this)
  ~&  >  "got on-watch on {<path>}"
  :: ?+  path  (on-watch:def path)
  ?+  path  `this
      [%update v=@ host=@ id=*]
    =/  =dest  [(slav %p &4.path) |4.path]
    =/  uuid  (make-uuid [now eny]:bowl)
    =/  cup=client-update  [%0 [%you-are uuid]]
    =/  up-card=card  [%give %fact ~ %client-update !>(cup)]
    ?:  =(ship.dest our.bowl)
      =/  crew  (~(gut by our-crews) c-id.dest ~)
      ?~  crew  !!
      =/  init-card  (init-card:hc crew)
      =/  is-peer  (~(has by peers.crew) src.bowl)
      =/  is-applicant  (~(has by applicants.crew) src.bowl)
      ?.  =(src our):bowl
        ?.  is-peer  !!
        ~[init-card]^this
      =/  =stir
        ?:  |(is-peer is-applicant)
          [%add-client uuid]
        [%apply [uuid ~ ~]]
      =^  cards  state  (apply-action:hc c-id.dest [stir]~ src.bowl)
      [up-card init-card cards]^this
    ?>  =(src our):bowl
    ?.  (~(has by ext-crews) dest)
      =.  ext-crews  (~(put by ext-crews) dest ~)
      :_  this
      :-  up-card
      (send-action-apply:hc dest uuid)
    =/  cards=(list card)
      :-  up-card
      (send-action-stir:hc dest [%add-client uuid])
    =/  ucrew  (~(got by ext-crews) dest)
    ?~  ucrew
      cards^this
    :_  this
    [(init-card:hc u.ucrew) cards]
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
      [%update v=@ host=@ id=*]
    =/  =dest  [(slav %p &4.wire) |4.wire]
    ~&  ["got crew update" -.sign wire]
    ?+    -.sign  `this
        %fact
      ?>  ?=(%update -.cage.sign)
      =/  =update  !<(update +.cage.sign)
      =^  cards  state  (apply-update:hc dest update)
      `this
    ==
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
  [(action-card (make-action dest [stir]~))]~
++  send-action-apply
  |=  [=dest id=uuid]
  ^-  (list card)
  =/  =stir
    [%apply (silt `(list uuid)`[id]~)]
  (send-action-stir dest stir)
++  apply-action
  |=  [=c-id =stirs actor=ship]
  ^-  (quip card _state)
  =/  kru  (~(gut by our-crews) c-id ~)
  =/  kru
    ?^  kru  kru
    ?>  =(our.bowl actor)
    *crew
  =|  cards=(list card)
  |-  ^-  (quip card _state)
  ?~  stirs  cards^state
  =^  roars  kru  (stir-top kru i.stirs actor)
  =/  new-cards  (roars-to-cards c-id roars)
  =.  our-crews  (~(put by our-crews) c-id kru)
  $(cards (weld cards new-cards), state state, stirs t.stirs)  :: do we need to "state state"?
++  stir-top
  |=  [kru=crew =stir actor=ship]
  ^-  (quip roar crew)
  ?:  &(?=(admin-stir-tags -.stir) !(~(has in admins.kru) actor))
    `kru
  (stir-crew kru stir actor)
++  stir-crew
  |=  [kru=crew =stir actor=ship]
  ^-  (quip roar crew)
  =/  =waves  (stir-to-waves kru stir actor)
  =^  roars  kru  (update-crew-loud kru waves)
  roars^kru
++  apply-update
  |=  [=dest up=update]
  ^-  (quip card _state)
  =/  ukru  (~(gut by ext-crews) dest ~)
  ?:  ?=(%quit +<.up)
    =?  state  ?=(^ host.up)
      ?:  =(our.bowl u.host.up)
        =?  our-crews  ?=(^ ukru)
          (~(put by our-crews) c-id.dest u.ukru)
        state
      =.  ext-crews
        :: todo: what if the new host prefers to use a different c-id???
        :: should we say the new c-id is (scot %p ship.dest)^c-id.dest???
        :: could get out of hand but probably solves issues...
        (~(put by ext-crews) [u.host.up c-id.dest] ~)  :: this leaves us open to %admit from new host
      state
    =.  ext-crews  (~(del by ext-crews) dest)
    =/  path  (update-path dest)
    :_  state
    [%pass path %agent [ship.dest dap.bowl] %leave ~]~
  =/  kru=crew  ?~(ukru *crew u.ukru)
  =.  ext-crews
    %+  ~(put by ext-crews)  dest
    :-  ~
    (update-crew kru waves.up)
  :_  state
  [(update-card dest waves.up)]~
::
++  roars-to-cards
  |=  [=c-id =roars]
  ^-  (list card)
  %+  roll  roars
  |=  [=roar cards=(list card)]
  %+  weld  cards
  ^-  (list card)
  ?-    -.roar
      %admit
    [(shell-card ship.roar c-id [%admit ~])]~
      %eject
    :~  (shell-card ship.roar c-id [%eject ~])
        [%give %kick ~[(update-path our.bowl c-id)] `ship.roar]
    ==
      %wave
    [(update-card [our.bowl c-id] [wave.roar]~)]~
  ==
::
++  quit-card
  |=  [=dest host=(unit ship)]
  ^-  card
  =/  =update  (make-quit-update host)
  :*  %give  %fact
      ~[(update-path dest)]
      %update  !>(update)
  ==
++  shell-card
  |=  [=ship =shell]
  ^-  card
  :*  %pass
      `wire`[%shell '0' -.echo.shell c-id.shell]
      %agent  [ship dap.bowl]
      [%poke %shell !>(shell)]
  ==
++  action-card
  |=  act=action
  ^-  card
  =/  wire  (action-wire:hc dest.act)
  [%pass wire %agent [ship.dest.act dap.bowl] %poke [%action !>(act)]]
++  update-card
  |=  [=dest =waves]
  ^-  card
  =/  =update  (make-waves-update waves)
  :*  %give  %fact
      ~[(update-path dest)]
      %update  !>(update)
  ==
++  init-card
  |=  =crew
  ^-  card
  =/  =update  (make-waves-update [%set-crew crew]~)
  [%give %fact ~ %update !>(update)]
:: ++  client-update-card
::   |=  [=c-id =uuid]
::   ^-  card
::   =/  =update  [%0 [%you-are uuid]]
::   :*  %give  %fact
::       ~[(update-path our.bowl c-id)]
::       %client-update  !>(update)
::   ==
++  action-wire
  |=  =dest
  ^-  path
  [%action '0' (scot %p ship.dest) c-id.dest]
++  update-path
  |=  =dest
  ^-  path
  [%update '0' (scot %p ship.dest) c-id.dest]
--  --