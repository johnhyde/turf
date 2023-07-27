/-  *turf, pond, mist
/+  *turf, *sss, *plow, default-agent, dbug, verb, agentio
/%  mist-stir-mark  %mist-stir
/%  mist-stirred-mark  %mist-stirred
/%  pond-stir-mark  %pond-stir
/%  pond-stirred-mark  %pond-stirred
/$  c1  %json  %mist-stir
/$  c2  %json  %pond-stir
/$  c3  %mist-stirred  %json
/$  c4  %pond-stirred  %json
:: =/  res-pond  (response:poke pond *)
=/  sub-pond-init  (mk-subs pond pond-path)
=/  pub-pond-init  (mk-pubs pond pond-path)
=/  sub-mist-init  (mk-subs mist mist-path)
=/  pub-mist-init  (mk-pubs mist mist-path)
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  %0
      reset=_7
      =avatar
      closet=$~(default-closet:gen skye)
      dtid=turf-id
      :: ctid=(unit turf-id)
      sub-pond=$~(sub-pond-init _sub-pond-init)
      pub-pond=$~(pub-pond-init _pub-pond-init)
      sub-mist=$~(sub-mist-init _sub-mist-init)
      pub-mist=$~(pub-mist-init _pub-mist-init)

      dppath=$~([%pond ~] pond-path)
      dmpath=$~([%mist ~] mist-path)
      :: =ephemera
  ==
+$  current-state  state-0
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
    :: hc    ~(. hc.+> bowl)
    hc    ~(. +> bowl)
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
  :: =?  quolp  ?=(%0 -.old)
  ::   (state-0-to-1 cards-0 old)
  :: =/  old  *current-state
  ?>  =(-:*current-state -.old)
  =.  state  old
  =^  cards-1  state  (init-defaults:hc)
  :: ~&  ~(wyt by +.pub-pond)
  :: =^  cards-2  state  (del-player:hc ~hiddev-midlev-mindyr)
  :: =^  cards-2  state  (add-player:hc ~hiddev-midlev-mindyr)
  :: =^  cards-2  state  (del-player:hc ~mordev-naltuc-ravteb)
  :: =^  cards-2  state  (add-player:hc ~mordev-naltuc-ravteb)
  :: =^  cards-2  state  (del-player:hc ~zod)
  :: =^  cards-2  state  (add-player:hc ~zod)
  =/  cards-2  `(list card)`~
  :: ~&  ~(wyt by +.pub-pond)
  :: todo: use ;<???
  =.  cards-0  :*
    cards-0
  ==
  :(weld cards-0 cards-1 cards-2)^this
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
    =^  cards  state  (give-pond-rock:hc dtid %.n)
    cards^this
  ::
      %init-avatar
    =.  pub-pond  (secret:du-pond [dppath]~)
    =^  cards  state  init-default-mist:hc
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %init-turf
    =.  pub-pond  (secret:du-pond [dppath]~)
    =^  cards  state  init-turf:hc
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %set-turf
    =+  !<([size=vec2 offset=svec2] vase)
    =^  cards  state  (give-pond:hc dtid set-turf+(default-turf:gen our.bowl size offset ~))
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %inc
    =^  cards  state  (give-pond:hc dtid %inc-counter)
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %add-husk
    =^  cards  state  (give-pond:hc dtid add-husk+!<(husk-spec vase))
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %chat
    =^  cards  state  (give-pond:hc dtid chat+[our.bowl now.bowl !<(@t vase)])
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %del-turf
    =^  cards  state  (give-pond:hc dtid %del-turf)
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %wipe-turf
    =.  pub-pond  (wipe:du-pond dppath)
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    `this
  ::
      %open-turf
    =.  pub-pond  (allow:du-pond [!<(@p vase)]~ [dppath]~)
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    `this
  ::
      %kill-turf
    =.  pub-pond  (kill:du-pond [dppath]~)
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    `this
  ::
      %live-turf
    =.  pub-pond  (live:du-pond [dppath]~)
    :: ~&  >  "pub-pond is: {<read:du-pond>}"
    `this
  ::
  :: Sub Pokes
  ::
      %surf-turf
    =^  cards  sub-pond  
      (surf:da-pond !<(@p (slot 2 vase)) %turf pond+!<(pond-path (slot 3 vase)))
    :: ~&  >  "sub-pond is: {<read:da-pond>}"
    [cards this]
  ::
      %quit-turf
    =.  sub-pond  
      (quit:da-pond !<(@p (slot 2 vase)) %turf pond+!<(path (slot 3 vase)))
    :: ~&  >  "sub-pond is: {<read:da-pond>}"
    `this
  ::
      %mist-stir
    =+  !<(stir:mist (fled vase))
    ?>  =(our src):bowl
    :: ~&  >  "accepting mist wave from client: {<?^(wave -.wave wave)>}"
    :: ~&  >  "accepting mist wave from client: {<-.wave wave>}"
    =/  pub  (~(get by read:du-mist) mpath)
    =/  fwave=(unit wave:mist)
      ?~  pub  ~
      (filter-mist-goal rock.u.pub wave closet)
    =^  cards  state  (stir-mist:hc mpath id fwave)
    cards^this
  ::
      %pond-stir
    =/  stir  !<(stir:pond vase)
    =/  target  ship.turf-id.stir
    ?:  =(our.bowl target)
      =^  cards  state  (stir-pond:hc `src.bowl stir)
      cards^this
    ?>  =(our src):bowl
    :_  this
    [%pass [%pond-stir (drop id.stir)] %agent [target %turf] %poke [%pond-stir vase]]~
  ::
      %join-turf
    ?>  =(our src):bowl
    =/  tid  !<((unit turf-id) vase)
    =/  ctid  (ctid:hc)
    ?:  =(tid ctid)  `this
    =/  cards-1=(list card)
      ?~  ctid  ~
      =/  exit-stir
        :*  u.ctid
            ~
            %del-player
            our.bowl
        ==
      [%pass /exit-turf %agent [ship.u.ctid %turf] %poke [%pond-stir !>(exit-stir)]]~
    =^  cards-2  state
      (give-mist:hc dmpath set-ctid+tid)
    =/  cards-3=(list card)
      ?~  tid  ~
      =/  join-stir
        :*  u.tid
            ~
            %join-player
            our.bowl
            avatar:(need (default-mist:hc))
        ==
      [%pass /join-turf %agent [ship.u.tid %turf] %poke [%pond-stir !>(join-stir)]]~
    :(weld cards-1 cards-2 cards-3)^this
  ::
  :: Boilerplate
  ::
      %sss-on-rock
    :: =+  msg=!<(from:da-pond (fled vase))
    ?-    msg=!<($%(from:da-pond from:da-mist) (fled vase))
        [pond-path *]
      ~?  stale.msg  "turf from {<from.msg>} on {<src.msg>} is stale"
      ~?  ?=(^ turf.rock.msg)  "last turf from {<from.msg>} on {<src.msg>} is of size: {<size.plot.u.turf.rock.msg>}"
      :: rock:(~(got by read:da-pond) [ship.id %turf ppath])
      :: =^  cards  state  (give-pond-rock:hc [src.msg +.path.msg] %.n)
      =/  this-turf-id=turf-id  [src.msg ;;(path +.path.msg)]
      =/  this-turf-path=path  (turf-id-to-path this-turf-id)
      =/  =stirred:pond
        ?~  wave.msg
          [%rock rock.msg]
        [%wave id.u.wave.msg `grit.u.wave.msg]
      =/  give-paths=(list path)  [this-turf-path]~
      =?  give-paths  =((ctid:hc) `this-turf-id)
        :: ???
        [/pond give-paths]
      :_  this
      [%give %fact give-paths %pond-stirred !>(stirred)]~
        ::
        [mist-path *]
      :: ?:  =(our src):bowl  `this
      ~&  "got an avatar from {<src.msg>}"
      =/  tid  ctid.rock.msg
      ~&  'tid'^tid
      =/  tid-relevant
        ?~  tid  %.n
        =/  we-are-host  =(our.bowl ship.u.tid)
        ~&  'we are host'^we-are-host
        :: =/  turf-exists  ?=(^ (~(get by read:du-pond) (turf-id-to-ppath u.tid)))
        =/  turf-exists  (turf-exists:hc u.tid)
        ~&  'turf exists'^turf-exists
        &(we-are-host turf-exists)
      ?:  tid-relevant
        ~&  "updating avatar of {<src.msg>} in {<(need tid)>}"
        =^  cards  state  (give-pond (need tid) set-avatar+[src.msg avatar.rock.msg])
        :: =^  cards  state  (give-pond (need tid) %noop)
        :: ~&  "got an avatar from {<src.msg>}: {<rock.msg>}"
        cards^this
      :: TODO: find a way to kick players who leave without kicking them as soon as they join
      :: ~&  "quitting avatar of {<src.msg>} in {<(need tid)>}"
      :: =.  sub-mist  (quit:da-mist src.msg from.msg path.msg)
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
    :: ~&  >  "sub-pond is: {<read:da-pond>}"
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
    ~&  >>>  "not allowed to surf on {<msg>}!"
    `this
  ==
++  on-watch
  |=  =path
  ^-  (quip card _this)
  ?+  path  (on-watch:def path)
      [%pond *]
    =/  id=turf-id
      %+  fall
        (path-to-turf-id path)
      (fall (ctid:hc) dtid)
    ?>  =(our src):bowl
    :: =/  [cards-1=(list card) new-sub-pond=_sub-pond]
    =/  sub-key  (turf-id-to-sub-key id)
    ~&  ['sub key' sub-key]
    :: =/  turf-surfed  !=(~ (~(get by read:da-pond) sub-key))
    =/  surfed-turf  (~(get by read:da-pond) sub-key)
    ~&  ['surfed turf is null' ?=(~ surfed-turf)]
    =/  turf-surfed  !=(~ surfed-turf)
    ~&  ['turf surfed' turf-surfed]
    ?:  |(=(our.bowl ship.id) turf-surfed)
      =^  cards  state  (give-pond-rock:hc id %.y)
      cards^this
    =^  cards  sub-pond  (surf:da-pond sub-key)
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
    :: ~&  >  "sub-pond is: {<read:da-pond>}"
    `this
  ::
      [~ %sss %on-rock @ @ @ mist-path]
    =.  sub-mist  (chit:da-mist |3:wire sign)
    :: ~&  >  "sub-mist is: {<read:da-mist>}"
    `this
  ::
      [~ %sss %scry-request @ @ @ pond-path]
    =^  cards  sub-pond  (tell:da-pond |3:wire sign)
    :: ~&  >  "sub-pond is: {<read:da-pond>}"
    [cards this]
  ::
      [~ %sss %scry-request @ @ @ mist-path]
    =^  cards  sub-mist  (tell:da-mist |3:wire sign)
    :: ~&  >  "sub-mist is: {<read:da-mist>}"
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
:: =/  hc
:: ^=  hc
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
++  default-mist
  |.
  ((lift |=([* =rock:mist] rock)) (~(get by read:du-mist) dmpath))
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
  (give-pond dtid set-turf+(default-turf:gen our.bowl [15 12] [--0 --0] ~))
++  init-defaults
  |.
  ^-  (quip card _state)
  ~&  "trying to init defaults. pub-pond wyt: {<~(wyt by +.pub-pond)>}"
  =.  dtid  [our.bowl ~]
  =^  cards  state
    ~&  dppath
    ~&  (default-turf-exists)
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
++  stir-mist
  |=  [mpath=mist-path id=stir-id:mist wave=(unit wave:mist)]
  ^-  (quip card _state)
  =/  cards=(list card)
    =/  =stirred:mist  [%wave id wave]
    [%give %fact [;;(path mpath)]~ %mist-stirred !>(stirred)]~
  ?~  wave  cards^state
  =^  sss-cards  pub-mist  (give:du-mist mpath u.wave)
  =^  pond-cards=(list card)  state  (sync-avatar)
  [:(weld sss-cards cards pond-cards) state]
  :: [(weld sss-cards cards) state]
++  give-mist
  |=  [mpath=mist-path =wave:mist]
  (stir-mist mpath ~ `wave)
++  stir-pond
  |=  [src=(unit ship) =turf-id =stir-id:pond =goal:pond]
  ^-  (quip card _state)
  :: ~&  "start to stir pond. stir: {<goal>} pub-pond wyt: {<~(wyt by +.pub-pond)>}"
  =/  ppath  (turf-id-to-ppath turf-id)
  =/  pub  (~(get by read:du-pond) ppath)
  =/  grit=(unit grit:pond)
    (filter-pond-goal ?~(pub *rock:pond rock.u.pub) goal bowl)
  =/  cards=(list card)
    =/  =stirred:pond  [%wave stir-id grit]
    [%give %fact [(turf-id-to-path turf-id)]~ %pond-stirred !>(stirred)]~
  =^  sss-cards-1  pub-pond
    (give:du-pond ppath [stir-id src (fall grit %noop)])
  =^  sss-cards-2  sub-mist
    ^-  (quip card _sub-mist)
    ?~  grit  `sub-mist
    ?+    u.grit  `sub-mist
        [%add-player *]
      (surf:da-mist ship.u.grit %turf dmpath)
        [%del-player *]
      `(quit:da-mist ship.u.grit %turf dmpath)
    ==
  :: ~&  "end of stir pond. stir: {<goal>} pub-pond wyt: {<~(wyt by +.pub-pond)>}"
  [:(weld sss-cards-1 sss-cards-2 cards) state]
++  give-pond
  |=  [=turf-id =goal:pond]
  ^-  (quip card _state)
  ~&  "trying to give pond. pub-pond wyt: {<~(wyt by +.pub-pond)>}"
  (stir-pond ~ turf-id ~ goal)
++  give-pond-rock
  |=  [id=turf-id on-watch=?]
  ^-  (quip card _state)
  :_  state
  :: ~&  id
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
++  sync-avatar
  |.
  ^-  (quip card _state)
  =/  mi  (default-mist)
  ?~  mi  `state 
  ?~  ctid.u.mi  `state
  ?.  &(=(our.bowl ship.u.ctid.u.mi) (turf-exists u.ctid.u.mi))
    `state
  (give-pond u.ctid.u.mi set-avatar+[our.bowl avatar.u.mi])
++  add-player
  |=  =ship
  ^-  (quip card _state)
  ~&  "trying to add player. pub-pond wyt: {<~(wyt by +.pub-pond)>}"
  (give-pond dtid join-player+[ship default-avatar:gen])
++  del-player
  |=  =ship
  ^-  (quip card _state)
  (give-pond dtid del-player+ship)
--
:: . :: [hc everything-else]
