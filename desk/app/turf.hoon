/-  *turf
/+  *turf, default-agent, dbug, agentio
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  %0
      ~
  ==
+$  current-state  state-0
::
+$  card  card:agent:gall
--
%-  agent:dbug
=|  current-state
=*  state  -
^-  agent:gall
=<
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %.n) bowl)
    hc    ~(. +> bowl)
::
++  on-init
  ^-  (quip card _this)
  ~&  "%turf: on-init"
  `this
::
++  on-save  
  ~&  "%turf: on-save"
  !>(state)
::
++  on-load
  |=  old-state=vase
  ~&  "%turf: on-load"
  |^  ^-  (quip card _this)
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
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?>  =(our src):bowl
  ?+    mark  (on-poke:def mark vase)
      %test
    ~&  'turf tested'
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
  ?>  =(our src):bowl
  (on-agent:def wire sign)
++  on-arvo
  |=  [=wire =sign-arvo]
  ^-  (quip card _this)
  (on-arvo:def [wire sign-arvo])
++  on-fail  on-fail:def
--
::
:: Helper Core
|_  =bowl:gall
++  scrio  ~(scry agentio bowl)
--
