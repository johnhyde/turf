/-  *turf, pond
/+  *turf, *sss, default-agent, dbug, verb, agentio
=/  sub-pond-init  (mk-subs pond sub-pond-path)
=/  pub-pond-init  (mk-pubs pond pub-pond-path)  ::NOTE $? can be used!
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  %0
      turfs=(map turf-id turf)
      =avatar
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
    hc    ~(. +> bowl)
::
    da-pond  =/  da  (da pond sub-pond-path)
            (da sub-pond bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
    du-pond  =/  du  (du pond pub-pond-path)
            (du pub-pond bowl -:!>(*result:du))
::
++  on-init
  ^-  (quip card _this)
  `this
::
++  on-save  
  !>(state)
::
++  on-load
  |=  old-state=vase
  |^  ^-  (quip card _this)
  :: `this
  =+  :-  cards=`(list card)`~
      old=!<(versioned-state old-state)
  =*  quop  -
  :: =?  quop  ?=(%0 -.old)
  ::   (state-0-to-1 cards old)
  ?>  =(-:*current-state -.old)
  :: =/  old  *current-state
  :: =.  cards  :*
  ::   cards
  :: ==
  =.  state  old
  cards^this
  --
::
::  The SSS library will give your agent pokes with the following marks:
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
  ~&  >>  "sub-pond was: {<read:da-pond>}"
  ~&  >>  "pub-pond was: {<read:du-pond>}"
  ?+    mark  (on-poke:def mark vase)
      %test
    :: ~&  default-turf
    `this
  ::
  :: Pub Pokes
  ::
      %set-turf
    =+  pond-path=/pond/$
    =.  pub-pond  (secret:du-pond [pond-path]~)
    =^  cards  pub-pond  (give:du-pond pond-path set-turf+default-turf)
    ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %del-turf
    =^  cards  pub-pond  (give:du-pond /pond/$ %del-turf)
    ~&  >  "pub-pond is: {<read:du-pond>}"
    cards^this
  ::
      %wipe-turf
    =.  pub-pond  (wipe:du-pond /pond/$)
    ~&  >  "pub-pond is: {<read:du-pond>}"
    `this
  ::
      %open-turf
    =.  pub-pond  (allow:du-pond [!<(@p vase)]~ [/pond/$]~)
    ~&  >  "pub-pond is: {<read:du-pond>}"
    `this
  ::
      %kill-turf
    =.  pub-pond  (kill:du-pond [/pond/$]~)
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
  :: Boilerplate
  ::
      %sss-on-rock
    =+  msg=!<(from:da-pond (fled vase))
    :: ?-    msg=!<(from:da-pond (fled vase))
    ::     [sub-pond-path *]
    ~?  stale.msg  "turf from {<from.msg>} on {<src.msg>} is stale"
    ~?  ?=(^ rock.msg)  "last turf from {<from.msg>} on {<src.msg>} is of size: {<size.plot.u.rock.msg>}"
    `this
    :: ==
  ::
      %sss-to-pub
    =+  msg=!<(into:du-pond (fled vase))
    :: ?-  msg=!<(into:du-pond (fled vase))
    ::     [pub-pond-path *]
    =^  cards  pub-pond  (apply:du-pond msg)
    [cards this]
    :: ==
  ::
      %sss-pond
    =^  cards  sub-pond  (apply:da-pond !<(into:da-pond (fled vase)))
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
  (on-watch:def path)
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
      [~ %sss %on-rock @ @ @ sub-pond-path]
    =.  sub-pond  (chit:da-pond |3:wire sign)
    ~&  >  "sub-pond is: {<read:da-pond>}"
    `this
  ::
      [~ %sss %scry-request @ @ @ sub-pond-path]
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
++  scrio  ~(scry agentio bowl)
--
