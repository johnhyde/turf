/-  *turf, pond, mist
/+  *turf, *sss, plow, default-agent, dbug, verb, agentio
/%  mist-stir-mark  %mist-stir
/%  mist-stirred-mark  %mist-stirred
/%  pond-stir-mark  %pond-stir
/%  pond-stirred-mark  %pond-stirred
:: =/  res-pond  (response:poke pond *)
=/  sub-pond-init  (mk-subs pond pond-path)
=/  pub-pond-init  (mk-pubs pond pond-path)
=/  sub-mist-init  (mk-subs mist mist-path)
=/  pub-mist-init  (mk-pubs mist mist-path)
=/  dppath=pond-path  [%pond ~]
=/  dmpath=mist-path  [%mist ~]
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  %0
      reset=_2
      =avatar
      closet=$~(default-closet:gen skye)
      sub-pond=_sub-pond-init
      pub-pond=_pub-pond-init
      sub-mist=_sub-mist-init
      pub-mist=_pub-mist-init
      :: =ephemera
  ==
+$  current-state  state-0
::
+$  card  card:agent:gall
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
::
    da-pond  =/  da  (da pond pond-path)
            (da sub-pond bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
    du-pond  =/  du  (du pond pond-path)
            (du pub-pond bowl -:!>(*result:du))
::
    da-mist  =/  da  (da mist mist-path)
            (da sub-mist bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
    du-mist  =/  du  (du mist mist-path)
            (du pub-mist bowl -:!>(*result:du))
::
    hc    ~(. +> bowl)
::
++  on-init
  ^-  (quip card _this)
  =^  cards  state  init-defaults:hc
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
      ?.  =(old-reset reset)  ~&('reseting state' old=state)
      old=!<(versioned-state old-state)
  =*  quolp  -
  :: =?  quolp  ?=(%0 -.old)
  ::   (state-0-to-1 cards old)
  :: =/  old  *current-state
  ?>  =(-:*current-state -.old)
  =.  state  old
  =^  more-cards  state  init-defaults:hc
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
    ~&  -:!>(*$%(from:da-mist from:da-pond))
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
    =^  cards  state  init-default-avatar:hc
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
    =+  !<([size=vec2 offset=svec2] vase)
    =^  cards  state  (give-pond:hc dppath set-turf+(default-turf:gen our.bowl size offset ~))
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
      (surf:da-pond !<(@p (slot 2 vase)) %turf !<(pond-path (slot 3 vase)))
    ~&  >  "sub-pond is: {<read:da-pond>}"
    [cards this]
  ::
      %quit-turf
    =.  sub-pond  
      (quit:da-pond !<(@p (slot 2 vase)) %turf !<(pond-path (slot 3 vase)))
    ~&  >  "sub-pond is: {<read:da-pond>}"
    `this
  ::
      %mist-stir
    =+  !<(stir:mist (fled vase))
    ?>  =(our src):bowl
    :: ~&  >  "accepting mist wave from client: {<?^(wave -.wave wave)>}"
    ~&  >  "accepting mist wave from client: {<-.wave wave>}"
    =/  pub  (~(get by read:du-mist) ppath)
    =/  fwave=(unit wave:mist)
      ?~  pub  ~
      (filter-mist-wave:plow rock.u.pub wave closet)
    =^  cards  state  (stir-mist:hc ppath id fwave)
    cards^this
  ::
      %pond-stir
    =+  !<(stir:pond (fled vase))
    ?>  =(our src):bowl
    ~&  >  "accepting pond wave from client: {<?^(wave -.wave wave)>}"
    =/  pub  (~(get by read:du-pond) ppath)
    =/  fwave=(unit wave:pond)
      ?~  pub  ~
      (filter-pond-wave:plow rock.u.pub wave)
    =^  cards  state  (stir-pond:hc ppath id fwave)
    cards^this
  ::
  :: Boilerplate
  ::
      %sss-on-rock
    :: =+  msg=!<(from:da-pond (fled vase))
    ?-    msg=!<($%(from:da-pond from:da-mist) (fled vase))
        [pond-path *]
      ~?  stale.msg  "turf from {<from.msg>} on {<src.msg>} is stale"
      ~?  ?=(^ rock.msg)  "last turf from {<from.msg>} on {<src.msg>} is of size: {<size.plot.u.rock.msg>}"
      `this
        [mist-path *]
      ~&  "got an avatar from {<src.msg>}: {<rock.msg>}"
      `this
    ==
  ::
      %sss-to-pub
    :: =+  msg=!<(into:du-pond (fled vase))
    ?-  msg=!<($%(into:du-pond into:du-mist) (fled vase))
        [pond-path *]
      =^  cards  pub-pond  (apply:du-pond msg)
      [cards this]
        [mist-path *]
      =^  cards  pub-mist  (apply:du-mist msg)
      [cards this]
    ==
  ::
      %sss-pond
    =/  res  !<(into:da-pond (fled vase))
    =^  cards  sub-pond  (apply:da-pond res)
    ~&  >  "sub-pond is: {<read:da-pond>}"
    [cards this]
  ::
      %sss-mist
    =/  res  !<(into:da-mist (fled vase))
    =^  cards  sub-mist  (apply:da-mist res)
    ~&  >  "sub-mist is: {<read:da-mist>}"
    [cards this]
  ::
  ::  You'll receive an `%sss-surf-fail` poke whenever you tried to subscribe to
  ::  a secret path which you don't have permissions to read (or a path that
  ::  the publisher isn't publishing on, as these are indistinguishable to you).
  ::
  ::  The message will contain `[path ship dude]`.
      %sss-surf-fail
    =/  msg  !<($%(fail:da-pond fail:da-mist) (fled vase))
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
  :: (on-peek:def path)
  ?+     path  (on-peek:def path)
  :: ?-     path
      [%x %closet ~]
    ``skye+!>(closet)
      :: *  ``noun+!<(~)
  ==
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
      [~ %sss %on-rock @ @ @ mist-path]
    =.  sub-mist  (chit:da-mist |3:wire sign)
    ~&  >  "sub-mist is: {<read:da-mist>}"
    `this
  ::
      [~ %sss %scry-request @ @ @ pond-path]
    =^  cards  sub-pond  (tell:da-pond |3:wire sign)
    ~&  >  "sub-pond is: {<read:da-pond>}"
    [cards this]
  ::
      [~ %sss %scry-request @ @ @ mist-path]
    =^  cards  sub-mist  (tell:da-mist |3:wire sign)
    ~&  >  "sub-mist is: {<read:da-mist>}"
    [cards this]
  ==
++  on-arvo
  |=  [=wire =sign-arvo]
  ^-  (quip card _this)
  ?+  wire  (on-arvo:def [wire sign-arvo])
    [~ %sss %behn @ @ @ pond-path]  [(behn:da-pond |3:wire) this] 
    [~ %sss %behn @ @ @ mist-path]  [(behn:da-mist |3:wire) this] 
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
::
    da-mist  =/  da  (da mist mist-path)
            (da sub-mist bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
    du-mist  =/  du  (du mist mist-path)
            (du pub-mist bowl -:!>(*result:du))

++  scrio  ~(scry agentio bowl)
++  default-avatar  ((lift |=([* =rock:mist] rock)) (~(get by read:du-mist) dmpath))
++  default-avatar-exists
  ?=(^ default-avatar)
++  init-default-avatar
  (give-mist dmpath set-avatar+default-avatar:gen)
++  default-turf  ((lift |=([* =rock:pond] rock)) (~(get by read:du-pond) dppath))
++  default-turf-exists
  ?=(^ default-turf)
++  init-turf
  (give-pond dppath set-turf+(default-turf:gen our.bowl [15 12] [--0 --0] default-avatar))
++  init-defaults
  ^-  (quip card _state)
  =^  cards  state
    ?:  default-turf-exists  `state
    init-turf
  =^  more-cards  state
    ?:  default-avatar-exists  `state
    init-default-avatar
  (weld cards more-cards)^state
::
++  stir-mist
  |=  [ppath=mist-path id=stir-id:mist wave=(unit wave:mist)]
  ^-  (quip card _state)
  =/  cards=(list card)
    =/  =stirred:mist  [%wave id wave]
    [%give %fact [;;(path ppath)]~ %mist-stirred !>(stirred)]~
  ?~  wave  cards^state
  =^  sss-cards  pub-mist  (give:du-mist ppath u.wave)
  =^  pond-cards  state  update-player
  [:(weld sss-cards cards pond-cards) state]
++  give-mist
  |=  [ppath=mist-path =wave:mist]
  (stir-mist ppath ~ `wave)
++  stir-pond
  |=  [ppath=pond-path id=stir-id:pond wave=(unit wave:pond)]
  ^-  (quip card _state)
  =/  cards=(list card)
    =/  =stirred:pond  [%wave id wave]
    [%give %fact [;;(path ppath)]~ %pond-stirred !>(stirred)]~
  ?~  wave  cards^state
  =^  sss-cards  pub-pond  (give:du-pond ppath u.wave)
  [(weld sss-cards cards) state]
++  give-pond
  |=  [ppath=pond-path =wave:pond]
  (stir-pond ppath ~ `wave)
++  give-pond-rock
  |=  [ppath=pond-path on-watch=?]
  ^-  (quip card _state)
  :_  state
  =/  =rock:pond  rock:(~(got by read:du-pond) ppath)
  =/  =stirred:pond  [%rock rock]
  =/  give-paths
    ?:  on-watch  ~
    [;;(path ppath)]~
  [%give %fact give-paths %pond-stirred !>(stirred)]~
++  update-player
  ^-  (quip card _state)
  =/  av  default-avatar
  ?~  av  `state
  (stir-pond dppath ~ `set-avatar+[our.bowl u.av])
--
