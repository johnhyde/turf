/-  *rally
/+  *rally, dbug, default-agent, agentio, verb
/$  cja  %json  %rally-action
/$  cjd  %json  %rally-delete
/$  cje  %json  %rally-enter
:: /$  cjl  %json  %leave
/$  cuj  %rally-update  %json
/$  cduj  %rally-dests-update  %json
/$  ccuj  %rally-client-update  %json
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  %0
      =reset
      crews=(map c-id crew)
      crows=(map dest crow)
      feet=(map dest foot)
      dests=(jug [ship @t] c-id)
      :: clients=(map uuid path)
  ==
+$  current-state  state-0
+$  reset  _7
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
      ?.  =(old-reset reset)  ~&(['reseting state' dap.bowl] old=state)
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
      %rally-action
    =/  act  !<(action vase)
    ?:  =(ship.dest.act our.bowl)
      ~&  'it me, the action poke'
      =^  cards  state  (apply-action:hc c-id.dest.act stirs.act src.bowl)
      cards^this
    ?>  =(src our):bowl
    :_  this
    [(action-card:hc act)]~
      %rally-delete
    ?>  =(src our):bowl :: todo: let admins delete? hmm
    =+  !<([=c-id host=(unit ship)] vase)
    ?.  (~(has by crews) c-id)  `this
    =/  cards  (quit-cards:hc c-id host)
    :: ~&  ['quit cards:' cards]
    :: make sure to delete crew AFTER getting the list of peeps to eject
    =.  crews  (~(del by crews) c-id)
    cards^this
      %rally-shell
    =/  [=c-id =echo]  !<(shell vase)
    :: ?:  =(src our):bowl  `this  :: ignore any shells we send to ourselves (ourshellves)
    =/  =dest  [src.bowl c-id]
    ?-    -.echo
        %admit
      =/  fut  (~(gut by feet) dest ~)
      =/  new-fut=foot
        ?+  fut  fut
          ~          %incoming
          %outgoing  %active
        ==
      =^  feet-cards  state  (move-foot:hc dest new-fut)
      =^  cards  state
        ?.  ?=(%active new-fut)  `state
        (watch-crew:hc dest)
      :_  this
      (weld feet-cards cards)
      ::
        %eject
      ~&  ['getting ejected from' dest]
      =^  cards  state  (move-foot:hc dest ~)
      cards^this
    ==
    ::
    ::
      %rally-enter
    ?>  =(src our):bowl
    =+  !<([=dest =uuid] vase)
    =/  =stir  [%add-client uuid]
    =/  cards  (send-action-stir:hc dest stir)
    =/  fut  (~(gut by feet) dest ~)
    =/  new-fut=foot
      ?+  fut  fut
        ~          %outgoing
        %incoming  %active
      ==
    =^  feet-cards  state  (move-foot:hc dest new-fut)
    =^  watch-cards  state
      ?.  ?=(%active new-fut)  `state
      (watch-crew:hc dest)
    :(weld cards feet-cards watch-cards)^this
      %rally-leave  :: only need to use %leave over %rally-action if host is unresponsive
    ?>  =(src our):bowl
    =+  !<([=dest] vase)
    ?.  (~(has by feet) dest)  `this
    =/  =stir  [%leave ~]
    =/  cards  (send-action-stir:hc dest stir)
    =^  feet-cards  state  (move-foot:hc dest ~)
    (weld cards feet-cards)^this
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
      %rally-update  !>(update)
    ==
  ==
++  on-watch
  |=  =path
  ^-  (quip card _this)
  ~&  >  "got on-watch on {<path>}"
  :: ?+  path  (on-watch:def path)
  ?+  path  `this
      [v=@ %feet foot dap=@t ~]
    ?>  =(src our):bowl
    =/  fut=foot  &3.path
    =/  dests=(list dest)
      %+  murn
        ~(tap by feet)
      |=  [=dest =foot]
      ?.  =(fut foot)  ~
      :: in effect, this verifies the dap matches
      ?.  =(path (feet-path:hc fut c-id.dest))  ~
      `dest
    =/  up=dests-update  [%0 %cries (silt dests)]
    :_  this
    [%give %fact ~ %rally-dests-update !>(up)]~
      [v=@ %crews host=@ dap=@t ~]
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
      [%give %fact ~ %rally-dests-update !>(up)]~
    ?>  =(src our):bowl
    =/  up=dests-update
      :-  %0  :-  %cries
      %-  ~(run in (~(get ju dests) loc))
      |=  =c-id  [host c-id]
    :_  this
    :-  [%pass path %agent [host dap.bowl] %watch path]
    [%give %fact ~ %rally-dests-update !>(up)]~
      [v=@ ?(%crew %crow) host=@ id=*]
    ~&  "matched update sub handler"
    =/  =dest  [(slav %p &3.path) |3.path]
    ?-    &2.path
        %crew
      ?>  =(ship.dest our.bowl)
      =/  crew  (~(gut by crews) c-id.dest ~)
      ?~  crew
        ?.  =(src our):bowl  !!
        `this
      =/  init-card  (init-card:hc crew)
      ?:  =(src our):bowl
        ~[init-card]^this
      ?.  ?|  (~(has by peers.crew) src.bowl)
              ?=(%public visibility.crew)
          ==
        !!
      ~[init-card]^this
        %crow
      ?>  =(src our):bowl
      =/  uuid  (make-uuid [now eny]:bowl)
      =/  cup=client-update  [%0 [%you-are uuid]]
      =/  up-card=card  [%give %fact ~ %rally-client-update !>(cup)]
      =/  uukro  (~(get by crows) dest)
      ?~  uukro
        =^  cards  state  (watch-crew:hc dest)
        [up-card cards]^this
      ?~  u.uukro
        ~[up-card]^this
      [up-card (init-card:hc u.u.uukro) ~]^this
    ==
  ==
++  on-leave
  |=  left=path
  ^-  (quip card _this)
  ?+    left  `this
      [v=@ %crews host=@ dap=@t *]
    =/  host  (slav %p &3.left)
    =/  loc  [host &4.left]
    ?:  %-  ~(any by sup.bowl)
        |=([* =path] =(left path))
      `this
    =.  dests  (~(del by dests) loc)
    :_  this
    ?:  =(host our.bowl)  ~
    [%pass left %agent [host dap.bowl] %leave ~]~
      [v=@ %crow host=@ id=*]
    =/  host  (slav %p &3.left)
    =/  dest  [host |3.left]
    ?:  ?|  %-  ~(any by sup.bowl)
            |=([* =path] =(left path))
            ::
            =(%active (~(gut by feet) dest ~))
        ==
      `this
    =.  crows  (~(del by crows) dest)
    :_  this
    [%pass (crew-update-path:hc dest) %agent [host dap.bowl] %leave ~]~
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
      [v=@ %crews host=@ dap=@t *]
    =/  host  (slav %p &3.wire)
    =/  loc  [host &4.wire]
    ?+    -.sign  (on-agent:def wire sign)
        %fact
      ?.  ?=(%rally-dests-update -.cage.sign)  `this
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
      [v=@ %crew host=@ id=*]
    =/  =dest  [(slav %p &3.wire) |3.wire]
    ~&  ["got crew update" -.sign wire]
    ?+    -.sign  (on-agent:def wire sign)
        %fact
      ?.  ?=(%rally-update -.cage.sign)  `this
      =/  =update  !<(update +.cage.sign)
      =^  cards  state  (apply-update:hc dest update)
      ~&  ['new kro after' (~(get by crows) dest)]
      cards^this
        %kick
      =^  cards  state  (get-kicked:hc dest)
      cards^this
        %watch-ack
      ?~  p.sign  (on-agent:def wire sign)
      =^  cards  state  (get-kicked:hc dest)
      cards^this
    ==
    ::
      [~ %test ~]
    `this
  ==
++  on-arvo
  |=  [=wire sign=sign-arvo]
  ^-  (quip card _this)
  ?+    wire  (on-arvo:def wire sign)
      [%filter ship=@ *]
    =/  noob=ship  (slav %p &2.wire)
    =/  =c-id  |2.wire
    =/  =dest  [our.bowl c-id]
    ?>  ?=([%khan %arow *] sign)
    ?:  ?=(%.n -.p.sign)
      :: del-noob
      ~&  ['filter thread failed noob' noob c-id]
      %-  (slog leaf+<p.p.sign> ~)
      =/  cards  (send-action-stir:hc dest [%wave %del-noob noob])
      cards^this
    :: pass-noob
    ~&  ['filter thread passed noob' noob c-id]
    =/  cards  (send-action-stir:hc dest [%pass-noob noob])
    cards^this
  ==
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
  =^  cards-1  kru  (apply-stirs c-id kru stirs actor)
  =^  cards-2  crews
    ?:  |(?=(^ peers.kru) persistent.kru)
      `(~(put by crews) c-id kru)
    ~&  ['deleting crew because everyone has left' c-id]
    :-  (quit-cards c-id ~)
    (~(del by crews) c-id)
  (weld cards-1 cards-2)^state
++  apply-stirs
  |=  [=c-id kru=crew =stirs actor=ship]
  =|  cards=(list card)
  |-  ^-  (quip card crew)
  ?~  stirs  cards^kru
  =^  roars  kru  (stir-crew kru i.stirs actor)
  ~&  ['new kru after' -.i.stirs kru]
  =/  new-cards  (roars-to-cards c-id kru roars)
  $(cards (weld cards new-cards), kru kru, stirs t.stirs)  :: do we need to "kru kru"?
++  stir-crew
  |=  [kru=crew =stir actor=ship]
  ^-  (quip roar crew)
  ?:  &(?=(admin-stir-tags -.stir) !(~(has in admins.kru) actor) !=(our.bowl actor))
    ~|  "{<actor>} is not an admin may not apply stir: {<-.stir>}"
    !!
  =/  [=roars =waves]  (stir-to-waves kru stir actor)
  =.  kru  (update-crew kru waves)
  roars^kru
++  apply-update
  |=  [=dest up=update]
  ^-  (quip card _state)
  =/  kro  (~(gut by crows) dest ~)
  ?:  ?=(%waves +<.up)
    =/  kru=crew  ?@(kro *crew u.kro)
    =.  crows
      %+  ~(put by crows)  dest
      `(update-crew kru waves.up)
    :_  state
    [(crow-update-card dest waves.up)]~
  :: %quit
  =^  cards  state
    ?.  ?=(^ host.up)  `state
    :: todo: what if the new host prefers to use a different c-id???
    :: should we say the new c-id is (scot %p ship.dest)^c-id.dest???
    :: could get out of hand but probably solves issues...
    :: anyway, this leaves us open to %admit from new host
    =^  cards  state  (move-foot [u.host.up c-id.dest] %outgoing)
    ?.  =(our.bowl u.host.up)  cards^state
    ?~  kro  cards^state
      :: todo: need to emit a %rally-dests-update %cry with this
    =.  crews  (~(put by crews) c-id.dest u.kro)
    :_  state
    :-  (crews-update-card %cry [our.bowl c-id.dest])
    cards
  =^  feet-cards  state  (move-foot dest ~)
  :_  state
  :-  (crow-update-quit-card dest host.up)
  (weld cards feet-cards)
::
++  roars-to-cards
  |=  [=c-id kru=crew =roars]
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
    :-  (shell-card ship.roar c-id [%eject ~])
    ?.  kick.roar  ~
    [%give %kick ~[(crew-update-path dest)] `ship.roar]~
      ::
      %filter
    =/  ufil  filter.access.kru
    ?~  ufil  ~
    =/  =wire  [%filter (scot %p ship.roar) c-id]
    [%pass wire %arvo %k %fard desk.u.ufil ted.u.ufil %noun !>([ship.roar c-id])]~
      ::
      ?(%cry %fade)
    =/  up=dests-update-core  :: for silly type reasons:
      ?:  ?=(%cry -.roar)  [-.roar dest]  [-.roar dest]
    :-  (crews-update-card up)
    ?.  ?=(%fade -.roar)  ~
    =/  update-path  (crew-update-path dest)
    ^-  (list card)
    %+  murn  ~(val by sup.bowl)
    |=  [=ship =path]
    ^-  (unit card)
    ?.  =(update-path path)  ~
    ?:  (~(has by peers.kru) ship)  ~
    `[%give %kick ~[update-path] `ship]
      ::
      %wave
    [(crew-update-card dest [wave.roar]~)]~
  ==
::
++  get-kicked
  |=  =dest
  ^-  (quip card _state)
  =.  crows  (~(del by crows) dest)
  :_  state
  [%give %kick ~[(crow-update-path dest)] ~]~
++  watch-crew
  |=  =dest
  ^-  (quip card _state)
  =?  crows  !(~(has by crows) dest)
    (~(put by crows) dest ~)
  ~[(watch-update-card dest)]^state
++  move-foot
  |=  [=dest new-fut=$@(~ foot)]
  ^-  (quip card _state)
  =/  fut  (~(gut by feet) dest ~)
  =/  c1=(list card)
    ?~  fut  ~
    ?:  =(fut new-fut)  ~
    [(feet-update-card fut %fade dest)]~
  =^  c2  state
    ^-  (quip card _state)
    ?~  new-fut
      ?~  fut  `state
      =.  feet  (~(del by feet) dest)
      `state
    =.  feet  (~(put by feet) dest new-fut)
    [(feet-update-card new-fut %cry dest)]~^state
  (weld c1 c2)^state
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
          %rally-update  !>(update)
      ==
      ::
      (crews-update-card %fade dest)
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
      [%poke %rally-shell !>(shell)]
  ==
++  action-card
  |=  act=action
  ^-  card
  =/  wire  (action-wire dest.act)
  [%pass wire %agent [ship.dest.act dap.bowl] %poke [%rally-action !>(act)]]
++  feet-update-card
  |=  [=foot up=dests-update-core]
  ^-  card
  =/  =c-id
    ?-  +.up
      ~      /
      [@ *]  +>.up
      [^ *]  +<+.up
    ==
  =/  path  (feet-path foot c-id)
  [%give %fact [path]~ %rally-dests-update !>(`dests-update`[%0 up])]
++  crews-update-card
  |=  up=dests-update-core
  ^-  card
  =/  dest=$@(~ dest)
    ?-  +.up
      ~      ~
      [@ *]  +.up
      [^ *]  +<.up
    ==
  =/  paths  ?~(dest ~ [(crews-path dest)]~)
  [%give %fact paths %rally-dests-update !>(`dests-update`[%0 up])]
++  crew-update-card
  |=  [=dest =waves]
  ^-  card
  =/  =update  (make-waves-update waves)
  :*  %give  %fact
      ~[(crew-update-path dest)]
      %rally-update  !>(update)
  ==
++  crow-update-card
  |=  [=dest =waves]
  ^-  card
  =/  =update  (make-waves-update waves)
  :*  %give  %fact
      ~[(crow-update-path dest)]
      %rally-update  !>(update)
  ==
++  crow-update-quit-card
  |=  [=dest host=(unit ship)]
  ^-  card
  =/  =update  (make-quit-update host)
  :*  %give  %fact
      ~[(crow-update-path dest)]
      %rally-update  !>(update)
  ==
++  init-card
  |=  =crew
  ^-  card
  =/  =update  (make-waves-update [%set-crew crew]~)
  [%give %fact ~ %rally-update !>(update)]
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
::       %rally-client-update  !>(update)
::   ==
++  action-wire
  |=  =dest
  ^-  path
  ['0' %action (scot %p ship.dest) c-id.dest]
++  crews-path
  |=  =dest
  ^-  path
  ['0' %crews (scot %p ship.dest) (scag 1 c-id.dest)]
++  crew-update-path
  |=  =dest
  ^-  path
  ['0' %crew (scot %p ship.dest) c-id.dest]
++  crow-update-path
  |=  =dest
  ^-  path
  ['0' %crow (scot %p ship.dest) c-id.dest]
++  feet-path
  |=  [=foot =c-id]
  ^-  path
  ['0' %feet foot (scag 1 c-id)]
--  --
