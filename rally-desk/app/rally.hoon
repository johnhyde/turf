/-  *rally
/+  *rally, dbug, default-agent, agentio, verb
/$  cja  %json  %action
/$  cjd  %json  %delete
/$  cje  %json  %enter
:: /$  cjl  %json  %leave
/$  cuj  %update  %json
/$  cduj  %dests-update  %json
/$  ccuj  %client-update  %json
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  %0
      =reset
      crews=(map c-id crew)
      crows=(map dest crow)
      dests=(jug [ship @t] c-id)
      :: clients=(map uuid path)
  ==
+$  current-state  state-0
+$  reset  _5
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
      %action
    =/  act  !<(action vase)
    ?:  =(ship.dest.act our.bowl)
      ~&  'it me, the action poke'
      =^  cards  state  (apply-action:hc c-id.dest.act stirs.act src.bowl)
      cards^this
    ?>  =(src our):bowl
    :_  this
    [(action-card:hc act)]~
      %delete
    ?>  =(src our):bowl
    =+  !<([=c-id host=(unit ship)] vase)
    ?.  (~(has by crews) c-id)  `this
    =/  cards  (quit-cards:hc c-id host)
    :: ~&  ['quit cards:' cards]
    :: make sure to delete crew AFTER getting the list of peeps to eject
    =.  crews  (~(del by crews) c-id)
    cards^this
      %shell
    =/  [=c-id =echo]  !<(shell vase)
    :: ?:  =(src our):bowl  `this  :: ignore any shells we send to ourselves (ourshellves)
    =/  =dest  [src.bowl c-id]
    ?-    -.echo
        %admit
      =/  kro  (~(gut by crows) dest ~)
      =/  new-kro=crow
        ?+  kro  kro
          ~          %incoming
          %outgoing  %waiting
        ==
      =.  crows  (~(put by crows) dest new-kro)
      :_  this
      %+  weld
        ^-  (list card)
        ?:  ?=(%incoming new-kro)  ~
        [(watch-update-card:hc dest)]~
      ^-  (list card)
      ?.  ?=(%incoming new-kro)  ~  :: this allows multiple calls in a row without rejecting the first
      =/  in-path  (incoming-path:hc c-id)
      [%give %fact [in-path]~ %dests-update !>((make-dest-update dest))]~
      ::
        %eject
      ~&  ['getting ejected from' dest]
      =/  kro  (~(gut by crows) dest ~)
      =.  crows  (~(del by crows) dest)
      =/  path  (crow-update-path:hc dest)
      :_  this
      :-  [%give %kick [path]~ ~]
      ?.  ?=(%incoming kro)  ~
      =/  in-path  (incoming-path:hc c-id)
      =/  up=dests-update  [%0 %fade dest]
      [%give %fact [in-path]~ %dests-update !>(up)]~
    ==
    ::
    ::
      %enter
    ?>  =(src our):bowl
    =+  !<([=dest =uuid] vase)
    =/  =stir  [%add-client uuid]
    =/  cards  (send-action-stir:hc dest stir)
    =/  kro  (~(gut by crows) dest ~)
    =.  crows
      %+  ~(put by crows)  dest
      ?+  kro  kro
        ~          %outgoing
        %incoming  %waiting
      ==
    =?  cards  ?=(%incoming kro)
      [(watch-update-card:hc dest) cards]
    cards^this
      %leave  :: only need to use %leave over %action if host is unresponsive
    ?>  =(src our):bowl
    =+  !<([=dest] vase)
    =/  =stir  [%leave ~]
    ?.  (~(has by crows) dest)  `this
    =/  cards=(list card)
      :: unsubscribe
      :-  [%pass (crew-update-path:hc dest) %agent [ship.dest dap.bowl] %leave ~]
      :: and kick subs
      :-  [%give %kick ~[(crow-update-path:hc dest)] ~]
      (send-action-stir:hc dest stir)
    =.  crows  (~(del by crows) dest)
    cards^this
    ::
      %sub
    =/  =dest  !<(dest vase)
    =/  path  (crew-update-path:hc dest)
    :_  this
    [%pass path %agent [ship.dest dap.bowl] %watch path]~
      %unsub
    =/  =dest  !<(dest vase)
    =/  path  (crew-update-path:hc dest)
    :_  this
    [%pass path %agent [ship.dest dap.bowl] %leave ~]~
      %give
    =/  =c-id  !<(c-id vase)
    =/  =update  (make-waves-update [%set-crew *crew]~)
    :_  this
    :_  ~
    :*  %give  %fact
      ~[(crew-update-path:hc our.bowl c-id)]
      %update  !>(update)
    ==
  ==
++  on-watch
  |=  =path
  ^-  (quip card _this)
  ~&  >  "got on-watch on {<path>}"
  :: ?+  path  (on-watch:def path)
  ?+  path  `this
      [%incoming v=@ dap=@t ~]
    ?>  =(src our):bowl
    =/  dests=(list dest)
      %+  murn
        ~(tap by crows)
      |=  [=dest kro=crow]
      ?.  ?=(%incoming kro)  ~
      :: in effect, this verifies the dap matches
      ?.  =((incoming-path:hc c-id.dest) path)  ~
      `dest
    =/  up=dests-update  [%0 %cries (silt dests)]
    :_  this
    [%give %fact ~ %dests-update !>(up)]~
      [%crews v=@ host=@ dap=@t ~]
    =/  host  (slav %p &3.path)
    =/  loc  [host &4.path]
    ?:  =(host our.bowl)
      =/  dests=(list dest)
        %+  murn
          ~(tap by crews)
        |=  [=c-id kru=crew]
        =/  =dest  [host c-id]
        ?.  ?=(%public visibility.kru)  ~
        :: in effect, this verifies the dap matches
        ?.  =((crews-path:hc dest) path)  ~
        `dest
      =/  up=dests-update  [%0 %cries (silt dests)]
      :_  this
      [%give %fact ~ %dests-update !>(up)]~
    ?>  =(src our):bowl
    =/  up=dests-update
      :-  %0  :-  %cries
      %-  ~(run in (~(get ju dests) loc))
      |=  =c-id  [host c-id]
    :_  this
    :-  [%pass path %agent [host dap.bowl] %watch path]
    [%give %fact ~ %dests-update !>(up)]~
      [?(%crew %crow) v=@ host=@ id=*]
    ~&  "matched update sub handler"
    =/  =dest  [(slav %p &3.path) |3.path]
    ?:  ?=(%crew i.path)
      ?>  =(ship.dest our.bowl)
      =/  crew  (~(gut by crews) c-id.dest ~)
      ?~  crew
        ?.  =(src our):bowl  !!
        `this
      =/  init-card  (init-card:hc crew)
      ?:  =(src our):bowl
        ~[init-card]^this
      ?.  (~(has by peers.crew) src.bowl)
        !!
      ~[init-card]^this
    ?>  =(src our):bowl
    =/  uuid  (make-uuid [now eny]:bowl)
    =/  cup=client-update  [%0 [%you-are uuid]]
    =/  up-card=card  [%give %fact ~ %client-update !>(cup)]
    =/  kro  (~(gut by crows) dest ~)
    ?@  kro
      ~[up-card]^this
    [up-card (init-card:hc u.kro) ~]^this
  ==
++  on-leave
  |=  left=path
  ^-  (quip card _this)
  ?+    left  `this
      [%crews v=@ host=@ dap=@t *]
    =/  host  (slav %p &3.left)
    =/  loc  [host &4.left]
    ?:  %-  ~(any by sup.bowl)
        |=([* =path] =(left path))
      `this
    =.  dests  (~(del by dests) loc)
    :_  this
    ?:  =(host our.bowl)  ~
    [%pass left %agent [host dap.bowl] %leave ~]~
  :: todo: automatically remove from whatever
  ==
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
      [%crews v=@ host=@ dap=@t *]
    =/  host  (slav %p &3.wire)
    =/  loc  [host &4.wire]
    ?+    -.sign  (on-agent:def wire sign)
        %fact
      ?.  ?=(%dests-update -.cage.sign)  `this
      =/  up=dests-update  !<(dests-update +.cage.sign)
      =.  dests
        ?-  +<.up
          %cries  (~(put by dests) loc (~(run in dests.up) tail))
          %cry    (~(put ju dests) loc c-id.dest.up)
          %fade   (~(del ju dests) loc c-id.dest.up)
        ==
      :_  this
      [%give %fact [wire]~ cage.sign]~
    ==
    ::
      [%crew v=@ host=@ id=*]
    =/  =dest  [(slav %p &3.wire) |3.wire]
    ~&  ["got crew update" -.sign wire]
    ?+    -.sign  (on-agent:def wire sign)
        %fact
      ?.  ?=(%update -.cage.sign)  `this
      =/  =update  !<(update +.cage.sign)
      =^  cards  state  (apply-update:hc dest update)
      ~&  ['new kro after' (~(get by crows) dest)]
      cards^this
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
++  apply-action
  |=  [=c-id =stirs actor=ship]
  ^-  (quip card _state)
  =/  kru  (~(gut by crews) c-id ~)
  =/  new  ?=(^ kru)
  =/  kru
    ?^  kru  kru
    ?>  =(our.bowl actor)
    *crew
  ~&  ['we have our kru' kru]
  =|  cards=(list card)
  |-  ^-  (quip card _state)
  ?~  stirs  cards^state
  =^  roars  kru  (stir-top kru i.stirs actor)
  ~&  ['new kru after' -.i.stirs kru]
  =/  new-cards  (roars-to-cards c-id roars)
  =.  crews  (~(put by crews) c-id kru)
  $(cards (weld cards new-cards), state state, stirs t.stirs)  :: do we need to "state state"?
++  stir-top
  |=  [kru=crew =stir actor=ship]
  ^-  (quip roar crew)
  ?:  &(?=(admin-stir-tags -.stir) !(~(has in admins.kru) actor) !=(our.bowl actor))
    ~|  "{<actor>} is not an admin may not apply stir: {<-.stir>}"
    !!
  (stir-crew kru stir actor)
++  stir-crew
  |=  [kru=crew =stir actor=ship]
  ^-  (quip roar crew)
  =/  [=roars =waves]  (stir-to-waves kru stir actor)
  =.  kru  (update-crew kru waves)
  roars^kru
++  apply-update
  |=  [=dest up=update]
  ^-  (quip card _state)
  =/  kro  (~(gut by crows) dest ~)
  ?:  ?=(%quit +<.up)
    =?  state  ?=(^ host.up)
      =.  crows
        :: todo: what if the new host prefers to use a different c-id???
        :: should we say the new c-id is (scot %p ship.dest)^c-id.dest???
        :: could get out of hand but probably solves issues...
        (~(put by crows) [u.host.up c-id.dest] %outgoing)  :: this leaves us open to %admit from new host
      ?.  =(our.bowl u.host.up)  state
      =?  crews  ?=(^ kro)
        :: todo: need to emit a %dests-update %cry with this
        (~(put by crews) c-id.dest u.kro)
      state
    =.  crows  (~(del by crows) dest)
    =/  path  (crew-update-path dest)
    :_  state
    :-  (crow-update-quit-card dest host.up)
    [%pass path %agent [ship.dest dap.bowl] %leave ~]~
  =/  kru=crew  ?@(kro *crew u.kro)
  =.  crows
    %+  ~(put by crows)  dest
    (update-crew kru waves.up)
  :_  state
  [(crow-update-card dest waves.up)]~
::
++  roars-to-cards
  |=  [=c-id =roars]
  ^-  (list card)
  =/  =dest  [our.bowl c-id]
  %+  roll  roars
  |=  [=roar cards=(list card)]
  %+  weld  cards
  ^-  (list card)
  ?-    -.roar
      %admit
    [(shell-card ship.roar c-id [%admit ~])]~
      %eject
    :~  (shell-card ship.roar c-id [%eject ~])
        [%give %kick ~[(crew-update-path dest)] `ship.roar]
    ==
      ?(%cry %fade)
    =/  up=dests-update  :: for silly type reasons:
      ?:  ?=(%cry -.roar)  [%0 -.roar dest]  [%0 -.roar dest]
    [%give %fact [(crews-path dest)]~ %dests-update !>(up)]~
      %wave
    [(crew-update-card dest [wave.roar]~)]~
  ==
::
++  quit-cards
  |=  [=c-id host=(unit ship)]
  ^-  (list card)
  =/  =dest  [our.bowl c-id]
  =/  =update  (make-quit-update host)
  =/  =path  (crew-update-path dest)
  =/  peeps=(list ship)
    =/  kru  (~(gut by crews) c-id ~)
    ?~  kru  ~
    %+  weld
      ~(tap in ~(key by peers.kru))
    ~(tap in ~(key by noobs.kru))
  :*  :*  %give  %fact
          ~[path]
          %update  !>(update)
      ==
      ::
      :*  %give  %fact
          ~[(crews-path dest)]
          %dests-update
          !>(`dests-update`[%0 %fade dest])
      ==
      ::
      [%give %kick ~[path] ~]
      ::
      %+  turn  peeps
      |=  peep=ship
      (shell-card peep [c-id [%eject ~]])
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
++  crew-update-card
  |=  [=dest =waves]
  ^-  card
  =/  =update  (make-waves-update waves)
  :*  %give  %fact
      ~[(crew-update-path dest)]
      %update  !>(update)
  ==
++  crow-update-card
  |=  [=dest =waves]
  ^-  card
  =/  =update  (make-waves-update waves)
  :*  %give  %fact
      ~[(crow-update-path dest)]
      %update  !>(update)
  ==
++  crow-update-quit-card
  |=  [=dest host=(unit ship)]
  ^-  card
  =/  =update  (make-quit-update host)
  :*  %give  %fact
      ~[(crow-update-path dest)]
      %update  !>(update)
  ==
++  init-card
  |=  =crew
  ^-  card
  =/  =update  (make-waves-update [%set-crew crew]~)
  [%give %fact ~ %update !>(update)]
++  watch-update-card
  |=  =dest
  ^-  card
  =/  path  (crew-update-path dest)
  [%pass path %agent [ship.dest dap.bowl] %watch path]
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
++  crews-path
  |=  =dest
  ^-  path
  [%crews '0' (scot %p ship.dest) (scag 1 c-id.dest)]
++  crew-update-path
  |=  =dest
  ^-  path
  [%crew '0' (scot %p ship.dest) c-id.dest]
++  crow-update-path
  |=  =dest
  ^-  path
  [%crow '0' (scot %p ship.dest) c-id.dest]
++  incoming-path
  |=  =c-id
  ^-  path
  [%incoming '0' (scag 1 c-id)]
--  --
