/-  *turf, pond
/+  *turf, *sss, plow, default-agent, dbug, verb, agentio
/%  stir-mark  %stir-pond
/%  stirred-mark  %stirred-pond
=/  res-pond  (response:poke pond *)
=/  sub-pond-init  (mk-subs pond pond-path)
=/  pub-pond-init  (mk-pubs pond pond-path)  ::NOTE $? can be used!
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  %0
      reset=_5
      =avatar
      skye=$~(default-closet:gen skye)
      dppath=$~(/pond path)
      sub-pond=_sub-pond-init
      pub-pond=_pub-pond-init
      :: =ephemera
  ==
+$  current-state  state-0
::
+$  card  card:agent:gall
--
%-  agent:dbug
=|  current-state
=*  state  -
:: =.  sub-pond  sub-pond-init
:: =.  pub-pond  pub-pond-init
::
%+  verb  &
^-  agent:gall
=<
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %.n) bowl)
::
    da-pond  =/  da  (da pond pond-path)
            (da sub-pond bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
    du-pond  =/  du  (du pond pond-path)
            (du pub-pond bowl -:!>(*result:du))
    hc    ~(. +> bowl)
::
++  on-init
  ^-  (quip card _this)
  =^  cards  state
    ?:  default-turf-exists:hc  `state
    init-turf:hc
  cards^this
::
++  on-save  
  !>(state)
::
++  on-load
  |=  old-state=vase
  |^  ^-  (quip card _this)
  :: `this
  :: =|  cards=(list card)
  =/  old-reset  !<(@ud (slot 6 old-state))
  =+  :-  cards=`(list card)`~
      ?.  =(old-reset reset)  old=state
      old=!<(versioned-state old-state)
  =*  quolp  -
  :: =?  quolp  ?=(%0 -.old)
  ::   (state-0-to-1 cards old)
  :: =/  old  *current-state
  ?>  =(-:*current-state -.old)
  =.  state  old
  =^  more-cards  state
    ?:  default-turf-exists:hc  `state
    init-turf:hc
  :: =.  cards  :*
  ::   cards
  :: ==
  (weld cards more-cards)^this
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
  :: ?>  =(our src):bowl
  :: ~&  >>  "sub-pond was: {<read:da-pond>}"
  :: ~&  >>  "pub-pond was: {<read:du-pond>}"
  ?+    mark  (on-poke:def mark vase)
      %test
    :: ~&  (default-turf:gen our.bowl)
    `this
  ::
  :: Pub Pokes
  ::
      %rock-turf
    =^  cards  state  (give-pond-rock dppath %.n)
    cards^this
  ::
      %init-avatar
    =.  pub-pond  (secret:du-pond [dppath]~)
    =^  cards  state  init-turf:hc
    ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %init-turf
    =.  pub-pond  (secret:du-pond [dppath]~)
    =^  cards  state  init-turf:hc
    ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %set-turf
    =^  cards  state  (give-pond:hc dppath set-turf+(default-turf:gen our.bowl !<([[@ud @ud] [@sd @sd]] vase)))
    ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %inc
    =^  cards  state  (give-pond:hc dppath %inc-counter)
    ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %add-husk
    =^  cards  state  (give-pond:hc dppath add-husk+!<(husk-spec vase))
    ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %chat
    =^  cards  state  (give-pond:hc dppath chat+[our.bowl now.bowl !<(@t vase)])
    ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %del-turf
    =^  cards  state  (give-pond:hc dppath %del-turf)
    ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %wipe-turf
    =.  pub-pond  (wipe:du-pond dppath)
    ~&  >  "pub-pond is: {<read:du-pond>}"
    `this
  ::
      %open-turf
    =.  pub-pond  (allow:du-pond [!<(@p vase)]~ [dppath]~)
    ~&  >  "pub-pond is: {<read:du-pond>}"
    `this
  ::
      %kill-turf
    =.  pub-pond  (kill:du-pond [dppath]~)
    ~&  >  "pub-pond is: {<read:du-pond>}"
    `this
  ::
      %live-turf
    =.  pub-pond  (live:du-pond [dppath]~)
    ~&  >  "pub-pond is: {<read:du-pond>}"
    `this
  ::
  :: Sub Pokes
  ::
      %surf-turf
    =^  cards  sub-pond  
      (surf:da-pond !<(@p (slot 2 vase)) %turf !<(,[%pond path] (slot 3 vase)))
    ~&  >  "sub-pond is: {<read:da-pond>}"
    [cards this]
  ::
      %quit-turf
    =.  sub-pond  
      (quit:da-pond !<(@p (slot 2 vase)) %turf !<(,[%pond path] (slot 3 vase)))
    ~&  >  "sub-pond is: {<read:da-pond>}"
    `this
  ::
      %stir-pond
    =+  !<(stir:pond (fled vase))
    ?>  =(our src):bowl
    ~&  >  "accepting wave from client: {<?^(wave -.wave wave)>}"
    =/  pub  (~(get by read:du-pond) ppath)
    =/  fwave=(unit wave:pond)
      ?~  pub  ~
      (filter-wave:plow rock.u.pub wave)
    =^  cards  state  (give-stir:hc ;;(path ppath) id fwave)
    cards^this
  ::
  :: Boilerplate
  ::
      %sss-on-rock
    =+  msg=!<(from:da-pond (fled vase))
    :: ?-    msg=!<(from:da-pond (fled vase))
    ::     [pond-path *]
    ~?  stale.msg  "turf from {<from.msg>} on {<src.msg>} is stale"
    ~?  ?=(^ rock.msg)  "last turf from {<from.msg>} on {<src.msg>} is of size: {<size.plot.u.rock.msg>}"
    `this
    :: ==
  ::
      %sss-to-pub
    =+  msg=!<(into:du-pond (fled vase))
    :: ?-  msg=!<(into:du-pond (fled vase))
    ::     [pond-path *]
    =^  cards  pub-pond  (apply:du-pond msg)
    [cards this]
    :: ==
  ::
      %sss-pond
    =/  res  !<(into:da-pond (fled vase))
    =^  cards  sub-pond  (apply:da-pond res)
    ~&  >  "sub-pond is: {<read:da-pond>}"
    [cards this]
  ::
  ::  You'll receive an `%sss-surf-fail` poke whenever you tried to subscribe to
  ::  a secret path which you don't have permissions to read (or a path that
  ::  the publisher isn't publishing on, as these are indistinguishable to you).
  ::
  ::  The message will contain `[path ship dude]`.
      %sss-surf-fail
    =/  msg  !<(fail:da-pond (fled vase))
    ~&  >>>  "not allowed to surf on {<msg>}!"
    `this
  ==
++  on-watch
  |=  =path
  ^-  (quip card _this)
  ?+  path  (on-watch:def path)
      [%pond *]
    ?>  =(our src):bowl
    =^  cards  state  (give-pond-rock path %.y)
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
  (on-peek:def path)
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?>  ?=(%poke-ack -.sign)
  ?~  p.sign  `this
  %-  (slog u.p.sign)
  ?+    wire  (on-agent:def wire sign)
      [~ %sss %on-rock @ @ @ pond-path]
    =.  sub-pond  (chit:da-pond |3:wire sign)
    ~&  >  "sub-pond is: {<read:da-pond>}"
    `this
  ::
      [~ %sss %scry-request @ @ @ pond-path]
    =^  cards  sub-pond  (tell:da-pond |3:wire sign)
    ~&  >  "sub-pond is: {<read:da-pond>}"
    [cards this]
  ==
++  on-arvo
  |=  [=wire =sign-arvo]
  ^-  (quip card _this)
  ?+  wire  (on-arvo:def [wire sign-arvo])
    :: [~ %sss %behn @ @ @ %pond *]  [(behn:da-pond |3:wire) this]
    [~ %sss %behn @ @ @ %pond *]  [(behn:da-pond |3:wire) this] 
  ==
++  on-fail  on-fail:def
--
::
:: Helper Core
|_  =bowl:gall
+*  da-pond  =/  da  (da pond pond-path)
            (da sub-pond bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
    du-pond  =/  du  (du pond pond-path)
            (du pub-pond bowl -:!>(*result:du))

++  scrio  ~(scry agentio bowl)
++  default-turf-exists  ?=(^ (~(get by read:du-pond) dppath))
++  init-turf
  (give-pond dppath set-turf+(default-turf:gen our.bowl [15 12] [--0 --0]))
++  give-stir
  |=  [ppath=path id=stir-id:pond wave=(unit wave:pond)]
  ?>  ?=(%pond -.ppath)
  ^-  (quip card _state)
  =/  cards=(list card)
    =/  =stirred:pond  [%wave id wave]
    [%give %fact [`path`ppath]~ %stirred-pond !>(stirred)]~
  ?~  wave  cards^state
  =^  sss-cards  pub-pond  (give:du-pond ppath u.wave)
  [(weld sss-cards cards) state]
++  give-pond
  |=  [ppath=path =wave:pond]
  (give-stir ppath ~ `wave)
++  give-pond-rock
  |=  [ppath=path on-watch=?]
  ?>  ?=(%pond -.ppath)
  ^-  (quip card _state)
  :_  state
  =/  =rock:pond  rock:(~(got by read:du-pond) ppath)
  =/  =stirred:pond  [%rock rock]
  =/  give-paths
    ?:  on-watch  ~
    [`path`ppath]~
  [%give %fact give-paths %stirred-pond !>(stirred)]~
--
