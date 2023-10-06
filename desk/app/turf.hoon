/-  *turf, pond, mist, hark
/+  *turf, *sss, *ssio, *plow, default-agent, dbug, verb, agentio, vita-client
/%  mist-stir-mark  %mist-stir
/%  mist-stirred-mark  %mist-stirred
/%  pond-stir-mark  %pond-stir
/%  pond-stirred-mark  %pond-stirred
/$  c1  %json  %mist-stir
/$  c2  %json  %pond-stir
/$  c3  %mist-stirred  %json
/$  c4  %pond-stirred  %json
=/  pond-lake      (mk-lake pond)
=/  mist-lake      (mk-lake mist)
=/  res-pond       (response:poke pond-lake *)
=/  sub-pond-init  (mk-subs pond-lake pond-path)
=/  pub-pond-init  (mk-pubs pond-lake pond-path)
=/  sub-mist-init  (mk-subs mist-lake mist-path)
=/  pub-mist-init  (mk-pubs mist-lake mist-path)
|%
+$  versioned-state
  $%  state-0
      state-1
  ==
+$  state-0
  $:  %0
      =reset
      closet=$~(default-closet:gen skye)
      dtid=turf-id
      lakes
  ==
+$  state-1
  $:  %1
      =reset
      skye-reset=_8
      closet=$~(default-closet:gen skye)
      lakes
  ==
+$  current-state  state-1
+$  reset  _63
+$  lakes
  $:  sub-pond=$~(sub-pond-init _sub-pond-init)
      pub-pond=$~(pub-pond-init _pub-pond-init)
      sub-mist=$~(sub-mist-init _sub-mist-init)
      pub-mist=$~(pub-mist-init _pub-mist-init)

      dppath=$~([%pond ~] pond-path)
      dmpath=$~([%mist ~] mist-path)
  ==
::
+$  card  $+(card card:agent:gall)
--
%-  agent:dbug
=/  vita-config=config:vita-client
  [| ~pandux]
  :: [| ~nec]
%-  (agent:vita-client vita-config)
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
    da-pond  =/  da  (da pond-lake pond-path)
            (da sub-pond bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
    du-pond  =/  du  (du pond-lake pond-path)
            (du pub-pond bowl -:!>(*result:du))
    de-pond  ((de pond) du-pond)
::
    da-mist  =/  da  (da mist-lake mist-path)
            (da sub-mist bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
    du-mist  =/  du  (du mist-lake mist-path)
            (du pub-mist bowl -:!>(*result:du))
    de-mist  ((de mist) du-mist)
::
++  on-init
  ^-  (quip card _this)
  =^  cards  state  (init-defaults:hc)
  cards^this
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
      ?.  =(old-reset reset)  ~&('reseting %turf state' old=state)
      old=!<(versioned-state old-state)
  =*  quolp  -
  =?  quolp  ?=(%0 -.old)
    (state-0-to-1 cards-0 old)
  :: =/  old  *current-state
  ?>  ?=(_-:*current-state -.old)
  =.  state  old
  =^  cards-1  state  (init-defaults:hc)
  :: ~&  ~(wyt by +.pub-pond)
  =^  cards-2  state
    =/  cur-skye-reset  skye-reset:*current-state
    :: ~&  ["skye reset default and current" cur-skye-reset skye-reset]
    ?:  =(cur-skye-reset skye-reset)
      `state
    =.  skye-reset  cur-skye-reset
    (update-skye:hc default-skye:gen)
  :: =/  cards-2  `(list card)`~
  :: ~&  ~(wyt by +.pub-pond)
  :: todo: use ;<???
  =.  cards-0  
    :*
        cards-0
    ==
  =/  cfg  config:hc
  =/  vita-cards
    ?:  =(vita-parent.cfg vita-parent.vita-config)  ~
    [(set-config:vita-client bowl enabled.cfg vita-parent.vita-config)]~
  :(weld cards-0 cards-1 cards-2 vita-cards)^this
  ++  state-0-to-1
    |=  [cards=(list card) =state-0]
    ^-  (quip card state-1)
    :-  ~
    =|  s=state-1
    s(skye-reset +(skye-reset.s), |4 |4.state-0)
  --
::
::  The SSS skye will give your agent pokes with the following marks:
::
::  - %sss-on-rock
::    Received whenever a state you're subscribed to has updated.
::  - %sss-to-pub
::    Information to be handled by a du-core (i.e. a publication).
::  - %sss-<lake> (e.g. %sss-pond or %sss-pool)
::    Information to be handled by a da-core (i.e. a subscription).
::  - %sss-surf-fail
::    Received whenever you try to subscribe without being allowed.
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  :: =-  ~&  "poke {<mark>:+} made cards: {<-<>}"
  ::     -
  :: ~&  >>  "sub-pond was: {<read:da-pond>}"
  :: ~&  >>  "pub-pond was: {<read:du-pond>}"
  ?+    mark  (on-poke:def mark vase)
      %test-da
    :: ~&  >>  "sub-pond was: {<read:da-pond>}"
    ~&  >>  "sub-pond was: {<sub-pond>}"
    :: ~&  -:!>(*$%(from:da-mist from:da-pond))
    :: ~&  (default-turf:gen our.bowl)
    `this
      %test-du
    :: ~&  >>  "pub-pond was: {<read:du-pond>}"
    ~&  >>  "pub-pond was: {<pub-pond>}"
    :: ~&  -:!>(*$%(from:da-mist from:da-pond))
    :: ~&  (default-turf:gen our.bowl)
    `this
  ::
  :: Pub Pokes
  ::
      %rock-turf
    =^  cards  state  (give-pond-rock:hc dtid:hc %.n)
    cards^this
  ::
      %init-avatar
    =^  sss-cards  pub-pond  (secret:du-pond [dppath]~)
    =^  cards  state  init-default-mist:hc
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    (weld sss-cards cards)^this
  ::
      %init-turf
    =^  sss-cards  pub-pond  (secret:du-pond [dppath]~)
    =^  cards  state  init-turf:hc
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    (weld sss-cards cards)^this
  ::
      %set-turf
    =+  !<([size=vec2 offset=svec2] vase)
    =^  cards  state  (give-pond-goal:hc dtid:hc set-turf+(default-turf:gen our.bowl size offset ~))
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %inc
    =^  cards  state  (give-pond-goal:hc dtid:hc %inc-counter)
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %add-husk
    =^  cards  state  (give-pond-goal:hc dtid:hc add-husk+!<(add-husk-spec vase))
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %chat
    =^  cards  state  (give-pond-goal:hc dtid:hc chat+[our.bowl now.bowl !<(@t vase)])
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %del-turf
    =^  cards  state  (give-pond-goal:hc dtid:hc %del-turf)
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %wipe-turf
    =.  pub-pond  (wipe:du-pond dppath)
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    `this
  ::
      %open-turf
    =^  cards  pub-pond  (allow:du-pond [!<(@p vase)]~ [dppath]~)
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %kill-turf
    =^  cards  pub-pond  (kill:du-pond [dppath]~)
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
  :: Sub Pokes
  ::
      %surf-turf
    =^  cards  sub-pond  
      (surf:da-pond !<(@p (slot 2 vase)) %turf pond+!<(path (slot 3 vase)))
    :: ~&  >  "sub-pond is: {<read:da-pond>}"
    [cards this]
  ::
      %quit-turf
    =.  sub-pond  
      (quit:da-pond !<(@p (slot 2 vase)) %turf pond+!<(path (slot 3 vase)))
    :: ~&  >  "sub-pond is: {<read:da-pond>}"
    `this
  ::
    ::   %mist-stir
    :: =+  !<(stir:mist (fled vase))
    :: ?>  =(our src):bowl
    :: :: ~&  >  "accepting mist wave from client: {<?^(wave -.wave wave)>}"
    :: :: ~&  >  "accepting mist wave from client: {<-.wave wave>}"
    :: =/  pub  (~(get by read:du-mist) mpath)
    :: =/  fwave=(unit wave:mist)
    ::   ?~  pub  ~
    ::   (filter-mist-goal rock.u.pub wave closet)
    :: =^  cards  state  (stir-mist:hc mpath id fwave)
    :: cards^this
  ::
      %mist-stir
    =/  stir  !<(stir:mist (fled vase))
    :: =/  target  ship.turf-id.stir
    :: ?:  =(our.bowl target)
    =^  cards  state  (stir-mist:hc `src.bowl stir)
    cards^this
    :: :_  this
    :: [%pass [%mist-stir (drop id.stir)] %agent [target %turf] %poke [%mist-stir vase]]~
  ::
      %pond-stir
    =/  stir  !<(stir:pond vase)
    =/  target  ship.turf-id.stir
    =/  vita-card  (active:vita-client bowl)
    ?:  =(our.bowl target)
      =^  cards  state  (stir-pond:hc `src.bowl stir)
      =?  cards  =(our src):bowl  [vita-card cards]
      cards^this
    ?>  =(our src):bowl
    :_  this
    :-  vita-card
    [%pass [%pond-stir (drop id.stir)] %agent [target %turf] %poke [%pond-stir vase]]~
  ::
      %pond-goal
  ?>  =(our src):bowl
  =/  goal  !<(goal:pond vase)
  =/  stir  [dtid:hc ~ [goal]~]
  =^  cards  state  (stir-pond:hc `src.bowl stir)
  cards^this
  ::

      %join-turf  !!
    :: ?>  =(our src):bowl
    :: =/  tid  !<((unit turf-id) vase)
    :: =/  ctid  (ctid:hc)
    :: ?:  =(tid ctid)  `this
    :: =/  cards-1=(list card)
    ::   ?~  ctid  ~
    ::   =/  exit-stir
    ::     :*  u.ctid
    ::         ~
    ::         [%del-player our.bowl]~
    ::     ==
    ::   [%pass /exit-turf %agent [ship.u.ctid %turf] %poke [%pond-stir !>(exit-stir)]]~
    :: =^  cards-2  state
    ::   (give-mist:hc dmpath set-ctid+tid)
    :: =/  cards-3=(list card)
    ::   ?~  tid  ~
    ::   =/  join-stir
    ::     :*  u.tid
    ::         ~
    ::         [%join-player our.bowl avatar:(need (default-mist:hc))]~
    ::     ==
    ::   [%pass /join-turf %agent [ship.u.tid %turf] %poke [%pond-stir !>(join-stir)]]~
    :: :(weld cards-1 cards-2 cards-3)^this
  ::
  :: Boilerplate
  ::
      %sss-on-rock
    =+  msg=!<($%(from:da-pond from:da-mist) (fled vase))
    :: ~&  "got sss-on-rock: {<msg>}"
    :: ?-    msg=!<($%(from:da-pond from:da-mist) (fled vase))
    ?-    msg
        [pond-path *]
      ~?  stale.msg  "turf from {<from.msg>} on {<src.msg>} is stale"
      :: ~?  ?=(^ turf.rock.msg)  "last turf from {<from.msg>} on {<src.msg>} is of size: {<size.plot.u.turf.rock.msg>}"
      =/  this-turf-id=turf-id  [src.msg ;;(path +.path.msg)]
      =/  this-turf-path=path  (turf-id-to-path this-turf-id)
      =/  =stirred:pond
        ?~  wave.msg
          [%rock rock.msg]
        [%wave id.foam.u.wave.msg grits.u.wave.msg]
      =/  give-paths=(list path)  [this-turf-path]~
      =?  give-paths  =((ctid:hc) `this-turf-id)
        :: ???
        [/pond give-paths]
      :_  this
      [%give %fact give-paths %pond-stirred !>(stirred)]~
        ::
        [mist-path *]
      :: ?:  =(our src):bowl  `this
      =/  tid  ctid.rock.msg
      :: ~&  "got an avatar from {<src.msg>} on {<tid>}"
      :: ~&  'tid'^tid
      =/  tid-relevant
        ?~  tid  %.n
        =/  we-are-host  =(our.bowl ship.u.tid)
        :: ~&  'we are host'^we-are-host
        =/  turf-exists  (turf-exists:hc u.tid)
        :: ~&  'turf exists'^turf-exists
        &(we-are-host turf-exists)
      ?:  tid-relevant
        :: ~&  "updating avatar of {<src.msg>} in {<(need tid)>}"
        =^  cards  state  (give-pond-goal:hc (need tid) set-avatar+[src.msg avatar.rock.msg])
        cards^this
      :: TODO: find a way to kick players who leave without kicking them as soon as they join
      :: ~&  "quitting avatar of {<src.msg>} in {<(need tid)>}"
      :: =.  sub-mist  (quit:da-mist src.msg from.msg path.msg)
      `this
    ==
  ::
      %sss-fake-on-rock
    :_  this
    :: ~&  "got a sss-fake-on-rock from {<src.bowl>}: {<+:vase>}"
    ?-  msg=!<($%(from:da-pond from:da-mist) (fled vase))
      [pond-path *]  (handle-fake-on-rock:da-pond msg)
      [mist-path *]  (handle-fake-on-rock:da-mist msg)
    ==
  ::
      %sss-to-pub
    =+  msg=!<($%(into:du-pond into:du-mist) (fled vase))
    :: ~&  "got a sss-to-pub from {<src.bowl>}: {<msg>}"
    ?-  msg
        [pond-path *]
      =^  cards  pub-pond  (apply:du-pond msg)
      [cards this]
        [mist-path *]
      =^  cards  pub-mist  (apply:du-mist msg)
      [cards this]
    ==
  ::
      %sss-pond
    :: ~&  >  "sub-pond is: {<sub-pond>}"
    :: ~&  >  "got sss-pond from {<src.bowl>}"
    =/  res  !<(into:da-pond (fled vase))
    =^  cards  sub-pond  (apply:da-pond res)
    :: ~&  >  "got sss-pond from {<src.bowl>}: {<res>}"
    [cards this]
  ::
      %sss-mist
    =/  res  !<(into:da-mist (fled vase))
    =^  cards  sub-mist  (apply:da-mist res)
    :: ~&  >  "sub-mist is: {<read:da-mist>}"
    [cards this]
  ::
  ::  You'll receive an `%sss-surf-fail` poke whenever you tried to subscribe to
  ::  a secret path which you don't have permissions to read (or a path that
  ::  the publisher isn't publishing on, as these are indistinguishable to you).
  ::
  ::  The message will contain `[path ship dude]`.
      %sss-surf-fail
    =/  msg  !<($%(fail:da-pond fail:da-mist) (fled vase))
    :: ~&  >>>  "not allowed to surf on {<msg>}!"
    `this
  ==
++  on-watch
  |=  =path
  ^-  (quip card _this)
  :: ~&  >  "got on-watch on {<path>}"
  ?+  path  (on-watch:def path)
  :: ?+  path  `this
      [%pond *]
    =/  id=turf-id
      %+  fall
        (path-to-turf-id path)
      (fall (ctid:hc) dtid:hc)
    ?>  =(our src):bowl
    =/  sub-key  (turf-id-to-sub-key id)
    :: ~&  ['sub key' sub-key]
    =^  cards-1  sub-pond
      ?:  =(our.bowl ship.id)  `sub-pond
      (surf:da-pond sub-key)
    =^  cards-2  state
      ?^  cards-1  `state
      ::  no sub cards, we are already subbed and not stale
      ::  tell frontend what we have
      (give-pond-rock:hc id %.y)
    (weld cards-1 cards-2)^this
      [%mist *]
    ?>  =(our src):bowl
    =^  cards  state
      (give-mist-rock:hc path %.y)
    cards^this
  ==
++  on-leave
  |=  =path
  ^-  (quip card _this)
  `this
::
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  ?+     path  (on-peek:def path)
      [%x %local ~]
    ``local+!>(local:hc)
      :: [%x %dbug %state]
      :: *  ``noun+!<(~)
  ==
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?>  ?=(%poke-ack -.sign)
  :: ?~  p.sign  `this
  :: %-  %-  slog
  ::     ^-  tang
  ::     :-  leaf+"poke-ack from {<src.bowl>} on wire {<wire>}"
  ::     ?~  p.sign  ~
  ::     u.p.sign
  ?+    wire  (on-agent:def wire sign)
      [~ %sss %on-rock @ @ @ pond-path]
    =.  sub-pond  (chit:da-pond |3:wire sign)
    :: ~&  >  "got pond on-rock on {<|3:wire>}"
    :: ~&  >  "sub-pond is: {<read:da-pond>}"
    `this
  ::
      [~ %sss %on-rock @ @ @ mist-path]
    =.  sub-mist  (chit:da-mist |3:wire sign)
    :: ~&  >  "got mist on-rock on {<|3:wire>}"
    :: ~&  >  "sub-mist is: {<read:da-mist>}"
    `this
  ::
      [~ %sss %scry-request @ @ @ pond-path]
    =^  cards  sub-pond  (tell:da-pond |3:wire sign)
    :: ~&  >  "got pond scry-request on {<|3:wire>}"
    :: ~&  >  "sub-pond is: {<read:da-pond>}"
    [cards this]
  ::
      [~ %sss %scry-request @ @ @ mist-path]
    =^  cards  sub-mist  (tell:da-mist |3:wire sign)
    :: ~&  >  "got mist scry-request on {<|3:wire>}"
    :: ~&  >  "sub-mist is: {<read:da-mist>}"
    [cards this]
  ::
      [~ %sss %scry-response @ @ @ pond-path]
    =^  cards  pub-pond  (tell:du-pond |3:wire sign)
    :: ~&  >  "got pond scry-response on {<|3:wire>}"
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    [cards this]
  ::
      [~ %sss %scry-response @ @ @ mist-path]
    =^  cards  pub-mist  (tell:du-mist |3:wire sign)
    :: ~&  >  "got mist scry-response on {<|3:wire>}"
    :: ~&  >  "pub-mist is: {<read:du-mist>}"
    [cards this]
  ==
++  on-arvo  on-arvo:def
++  on-fail  on-fail:def
--
::
:: Helper Core
:: =/  hc
:: ^=  hc
|%
++  hc
|_  =bowl:gall
+*  da-pond  =/  da  (da pond-lake pond-path)
            (da sub-pond bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
    du-pond  =/  du  (du pond-lake pond-path)
            (du pub-pond bowl -:!>(*result:du))
    de-pond  ((de pond) du-pond)
::
    da-mist  =/  da  (da mist-lake mist-path)
            (da sub-mist bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
    du-mist  =/  du  (du mist-lake mist-path)
            (du pub-mist bowl -:!>(*result:du))
    de-mist  ((de mist) du-mist)

++  scrio  ~(scry agentio bowl)
++  default-mist
  |.
  ((lift |=([* =rock:mist] rock)) (~(get by read:du-mist) dmpath))
++  dtid  [our.bowl /]
++  ctid
  |.
  ^-  (unit turf-id)
  ?~  dfm=(default-mist)  ~
  ctid.u.dfm
++  default-mist-exists
  |.
  ?=(^ (default-mist))
++  init-default-mist
  =^  cards-1  state
    (give-mist dmpath set-avatar+default-avatar:gen)
  =^  cards-2  state
    (give-mist dmpath set-ctid+`dtid)
  (weld cards-1 cards-2)^state
++  default-turf
  |.
  ((lift |=([* =rock:pond] rock)) (~(get by read:du-pond) dppath))
++  default-turf-exists
  |.
  ?=(^ (default-turf))
++  init-turf
  (give-pond-goal dtid set-turf+(default-turf:gen our.bowl [15 13] [--0 --0] ~))
++  init-defaults
  |.
  ^-  (quip card _state)
  :: ~&  "trying to init defaults. pub-pond wyt: {<~(wyt by +.pub-pond)>}"
  =^  cards  state
    :: ~&  dppath
    :: ~&  (default-turf-exists)
    ?:  (default-turf-exists)  `state
    init-turf
  =^  more-cards  state
    ?:  (default-mist-exists)  `state
    init-default-mist
  (weld cards more-cards)^state
::
++  turf-exists
  |=  id=turf-id
  ^-  ?
  ?=  ^
  (~(get by read:du-pond) (turf-id-to-ppath id))
::
++  config
  ^-  config:vita-client
  =/  secret-config  (~(got by sup.bowl) [/vita]~)
  :-  =(/yes +.secret-config)
  -.secret-config
++  local
  ^-  ^local
  [config closet]
++  pond-stir-card
  |=  [=wire =turf-id =goal:pond]
  ^-  card
  =/  stir=stir:pond
    :*  turf-id
        ~
        [goal]~
    ==
  :*  %pass
      wire
      %agent
      [ship.turf-id %turf]
      [%poke %pond-stir !>([stir])]
  ==
++  mist-stir-card
  |=  [=wire who=ship =goal:mist]
  ^-  card
  =/  stir=stir:mist
    :*  dmpath
        ~
        [goal]~
    ==
  :*  %pass
      wire
      %agent
      [who %turf]
      [%poke %mist-stir !>([stir])]
  ==
::
++  stir-mist
  |=  [src=(unit ship) =stir:mist]
  ^-  (quip card _state)
  =/  old-tid  (ctid)
  :: ~&  "start to stir mist. stir: {<goal>} pub-mist wyt: {<~(wyt by +.pub-mist)>}"
  =^  [ssio-cards=(list card) [=roars:mist *] =grits:mist]  pub-mist
    %-  (filter:de-mist ,[roars:mist $~(closet skye)])
    :*  mpath.stir
        `foam`[id.stir src]
        goals.stir
        filter-mist-goal
    ==
  =/  cards=(list card)
    =/  =stirred:mist  [%wave id.stir grits]
    [%give %fact [;;(path mpath.stir)]~ %mist-stirred !>(stirred)]~
  =^  roar-cards=(list card)  state
    %+  roll  roars
    |=  [=roar:mist [cards=(list card) sub-state=_state]]
    =.  state  sub-state
    =^  new-cards  state
      ?-    -.roar
          %port-offer-accept
        :_  state
        :-  %^    pond-stir-card
                /port-request
              for.roar
            [%add-port-req our.bowl from=?~(via.roar ~ `at.u.via.roar) avatar:(need (default-mist:hc))]
        :: if we have been invited somewhere
        :: or invited ourselves home,
        :: delete ourselves from current turf
        ?~  via.roar
          ?~  old-tid  ~
          ?:  =(old-tid (ctid))  ~
          :_  ~
          %^    pond-stir-card
              (weld /pond-stir (drop id.stir))
            u.old-tid
          [%del-player our.bowl]
        :: otherwise accept the port offer
        :: which will allow us to travel
        :_  ~
        %^    pond-stir-card
            /port-offer-accept
          of.u.via.roar
        [%port-offer-accepted our.bowl from.u.via.roar]
          %port-offer-reject
        :_  state
        :_  ~
        %^    pond-stir-card
            /port-offer-reject
          of.roar
        [%port-offer-rejected our.bowl from.roar]
          %turf-join
        =^  cards  sub-pond
          ?:  =(our.bowl ship.turf-id.roar)  `sub-pond
          (surf:da-pond (turf-id-to-sub-key turf-id.roar))
        cards^state
          %turf-exit
        =.  sub-pond
          (quit:da-pond (turf-id-to-sub-key turf-id.roar))
        `state
      ==
    (weld cards new-cards)^state
  =^  pond-cards=(list card)  state  (sync-avatar)
  [:(weld ssio-cards cards roar-cards pond-cards) state]
:: ++  stir-mist
::   |=  [mpath=mist-path id=stir-id:mist wave=(unit wave:mist)]
::   ^-  (quip card _state)
::   =/  cards=(list card)
::     =/  =stirred:mist  [%wave id wave]
::     [%give %fact [;;(path mpath)]~ %mist-stirred !>(stirred)]~
::   ?~  wave  cards^state
::   =^  sss-cards  pub-mist  (give:du-mist mpath u.wave)
::   =^  pond-cards=(list card)  state  (sync-avatar)
::   [:(weld sss-cards cards pond-cards) state]
++  give-mist
  |=  [mpath=mist-path =goal:mist]
  (stir-mist ~ mpath ~ [goal]~)
++  stir-pond
  |=  [src=(unit ship) =stir:pond]
  ^-  (quip card _state)
  :: ~&  "start to stir pond. stir: {<goal>} pub-pond wyt: {<~(wyt by +.pub-pond)>}"
  =/  ppath  (turf-id-to-ppath turf-id.stir)
  =^  [ssio-cards=(list card) =roars:pond =grits:pond]  pub-pond
    %-  (filter:de-pond roars:pond)
    :*  ppath
        `foam`[id.stir src]
        goals.stir
        filter-pond-goal
    ==
  =/  cards=(list card)
    =/  =stirred:pond  [%wave id.stir grits]
    [%give %fact [(turf-id-to-path turf-id.stir)]~ %pond-stirred !>(stirred)]~
  =^  roar-cards=(list card)  state
    %+  roll  roars
    |=  [=roar:pond [cards=(list card) sub-state=_state]]
    =.  state  sub-state
    =^  new-cards=(list card)  state
      ?-    -.roar
          %portal-request
        :_  state
        :_  ~
        %^    pond-stir-card
            [%portal-request (scot %ud from.roar) path.turf-id.stir]
          for.roar
        [%portal-requested for=turf-id.stir at=from.roar is-link.roar]
          %portal-retract
        :_  state
        :_  ~
        %^    pond-stir-card
            /portal-retract
          for.roar
        [%portal-retracted for=turf-id.stir at=from.roar]
          %portal-confirm
        :_  state
        :_  ~
        %^    pond-stir-card
            [%portal-confirm (scot %ud from.roar) path.turf-id.stir]
          for.roar
        [%portal-confirmed from=at.roar at=from.roar]
          %portal-discard
        :_  state
        :_  ~
        %^    pond-stir-card
            /portal-discard
          for.roar
        [%portal-discarded from=at.roar]
        ::
          %portal-hark
        :_  state
        =/  turf-path  (turf-id-to-path turf-id.stir)
        =/  =id:hark  (end 7 (shas %turf-portal eny.bowl))
        :: ~&  ["using id" id]
        =/  wer=path  :(weld turf-path /portal [(crip (a-co:co from.roar))]~)
        =/  =rope:hark  [~ ~ %turf wer]
        =/  msg=content:hark
          ?:  is-link.roar
            ?-  event.roar
              %requested  ' would like to live in your town'
              %retracted  ' no longer wants to live in your town'
              %confirmed  ' has accepted you into their town'
              %rejected   ' has rejected you from their town'
                %discarded
              ?:  (gth our.bowl ship.for.roar)
                ' has removed you from their town'
              ' has left your town'
            ==
          ?-  event.roar
            %requested  ' would like to make a portal to your turf'
            %retracted  ' no longer wants to make a portal to your turf'
            %confirmed  ' has accepted your portal to their turf'
            %rejected   ' has rejected your portal to their turf'
            %discarded  ' has removed the portal between your turf and theirs'
          ==
        =/  con=(list content:hark)  ~[[%ship ship.for.roar] msg]
        :: clicking the notification takes you to
        :: /apps/turf/?grid-note=%2Fpond%2F~nec%2Fportal%2F12
        =/  =action:hark  [%add-yarn & & id rope now.bowl con wer ~]
        [%pass /hark %agent [our.bowl %hark] %poke [%hark-action !>(action)]]~
        ::
          %port
        :_  state
        :_  ~
        %^    pond-stir-card
            /port-vouch
          for.roar
        [%add-port-rec from=at.roar ship.roar]
          %port-offer
        :_  state
        :_  ~
        %^    mist-stir-card
            /port-offer
          ship.roar
        [%port-offered for.roar `[turf-id.stir from.roar at.roar]]
          %player-add
        =^  cards  sub-mist  (surf:da-mist ship.roar %turf dmpath)
        =/  mist-card=card
          %^    mist-stir-card
              /port-accept
            ship.roar
          [%port-accepted turf-id.stir]
        [mist-card cards]^state
          %player-del
        =.  sub-mist  (quit:da-mist ship.roar %turf dmpath)
        `state
      ==
    (weld cards new-cards)^state
  :: ~&  "end of stir pond. stir: {<goal>} pub-pond wyt: {<~(wyt by +.pub-pond)>}"
  [:(weld ssio-cards cards roar-cards) state] :: cards before roar-cards in case we poke ourselves
++  give-pond
  |=  [=turf-id =goals:pond]
  ^-  (quip card _state)
  :: ~&  "trying to give pond. pub-pond wyt: {<~(wyt by +.pub-pond)>}"
  (stir-pond ~ turf-id ~ goals)
++  give-pond-goal
  |=  [=turf-id =goal:pond]
  (give-pond turf-id [goal]~)
++  give-pond-rock
  |=  [id=turf-id on-watch=?]
  ^-  (quip card _state)
  :_  state
  :: ~&  ["trying to give pond rock to client" id]
  =/  sub-key  (turf-id-to-sub-key id)
  :: ?>  =(our.bowl ship.id)
  =/  =rock:pond
    ?:  =(our.bowl ship.id)
      rock:(~(got by read:du-pond) ppath.sub-key)
    rock:(~(got by read:da-pond) sub-key)
    :: ~&  ppath
  =/  =stirred:pond  [%rock rock]
  =/  give-paths
    ?:  on-watch  ~
    [path.id]~
  [%give %fact give-paths %pond-stirred !>(stirred)]~
++  give-mist-rock
  |=  [mpath=mist-path on-watch=?]
  ^-  (quip card _state)
  :_  state
  :: ~&  ["trying to give mist rock to client" mpath]
  =/  =rock:mist
    rock:(~(got by read:du-mist) mpath)
  =/  =stirred:mist  [%rock rock]
  =/  give-paths
    ?:  on-watch  ~
    [;;(path mpath)]~
  [%give %fact give-paths %mist-stirred !>(stirred)]~
++  sync-avatar
  |.
  ^-  (quip card _state)
  =/  mi  (default-mist)
  ?~  mi  `state 
  ?~  ctid.u.mi  `state
  ?.  &(=(our.bowl ship.u.ctid.u.mi) (turf-exists u.ctid.u.mi))
    `state
  (give-pond-goal u.ctid.u.mi set-avatar+[our.bowl avatar.u.mi])
++  add-player
  |=  =ship
  ^-  (quip card _state)
  :: ~&  "trying to add player. pub-pond wyt: {<~(wyt by +.pub-pond)>}"
  (give-pond-goal dtid join-player+[ship default-avatar:gen])
++  del-player
  |=  =ship
  ^-  (quip card _state)
  (give-pond-goal dtid del-player+ship)
++  update-skye
  |=  =skye
  ^-  (quip card _state)
  =/  rock  (default-turf)
  ?~  rock  `state
  ?~  turf.u.rock  `state
  =*  turf  u.turf.u.rock
  %+  give-pond-goal   dtid
  :-  %set-turf
  %=  turf
    skye.plot  (~(uni by skye.plot.turf) default-skye:gen)
  ==
--  --
