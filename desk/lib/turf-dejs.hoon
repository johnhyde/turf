/-  *turf, pond, mist
/+  *turf, *plow, vita-client
=,  dejs:format
=*  soft  dejs-soft:format
|%
++  goal
  |*  [goal=mold pairs=(pole [cord fist])]
  |=  jon=json
  ^-  goal
  ?:  ?=([%s *] jon)
    ;;(goal (so jon))
  ?>  ?=([%o *] jon)
  ((of pairs) jon)
++  pond-stir
  |=  jon=json
  ^-  stir:pond
  %.  jon
  %-  ot
  :: :~  path+(cork pa |=(=path (need (path-to-turf-id path))))
  :~  path+pa-turf-id
  :: :~  path+pa
      id+so:soft
      goals+(ar pond-goal)
  ==
++  pond-goal
  |=  jon=json
  ^-  goal:pond
  %.  jon
  %+  goal  goal:pond
  :: todo: set-turf?
  :~  noop+_~
      wake+_~
      set-name+(ot ~[name+so])
      set-back+background
      set-autoconfirm-dinks+(ot ~[confirm+bo])
      size-turf+(ot ~[offset+svec2 size+vec2])
      add-form+form-spec
      del-form+(ot ~['formId'^pa])
      add-shade+add-shade-spec
      del-shade+(ot ~['shadeId'^ni])
      move-shade+(ot ~['shadeId'^ni pos+svec2 collide+bo smooth+bo])
      cycle-shade+(ot ~['shadeId'^ni amount+ni])
      set-shade-var+(ot ~['shadeId'^ni variation+ni])
      set-shade-fx+(ot ~['shadeId'^ni fx+(mayb fx)])
      set-shade-effect+(ot ~['shadeId'^ni trigger+root-condition effect+(mayb effect)])
      set-shade-collidable+(ot ~['shadeId'^ni collidable+bo:soft])
      ::
      set-default-perm+(ot ~[perm+(cork so perm)])
      set-player-perm+(ot ~[ship+shp perm+(cork so perm)])
      del-player-perm+(ot ~[ship+shp])
      ::
      :-  %create-bridge
      %-  ot
      :~  shade+(maybe-ni add-shade-spec)
          trigger+root-condition
          portal+(maybe-ni ot-turf-id)
      ==
      ::
      add-portal+(ot ~[for+ot-turf-id at+ni:soft])
      del-portal+(ot ~['portalId'^ni loud+bo])
      set-portal-outlet+(ot ~['portalId'^ni outlet+ni:soft])
      confirm-portal+(ot ~['portalId'^ni])
      revive-portal+(ot ~['portalId'^ni])
      move-to-entry+_~
      send-chat+(ot ~[from+shp text+so])
      move+(ot ~[ship+shp pos+svec2 collide+bo smooth+bo])
      face+(ot ~[ship+shp dir+dir])
      ping-player+(ot ~[ship+shp by+shp])
      del-player+(ot ~[ship+shp])
      add-invite+(ot ~[id+so name+so till+di])
      del-invite+(ot ~[id+so])
      call+(cork (ot ~[ships+(cork (ar shp) silt)]) (late ~))
      click+(ot ~['shadeId'^ni])
      interact+(ot ~['shadeId'^ni])
      tell+(ot ~['shadeId'^ni msg+so])
  ==
::
++  mist-stir
  |=  jon=json
  ^-  stir:mist
  %.  jon
  %-  ot
  :~  path+|=(=json ;;(mist-path (pa json)))
      id+so:soft
      goals+(ar mist-goal)
  ==
++  mist-goal
  |=  jon=json
  ^-  goal:mist
  %.  jon
  %+  goal  goal:mist
  :~  set-ctid+pa-turf-id-soft
      set-nick+so:soft
      set-color+ni
      add-thing-from-closet+pa
      del-thing+ni
      accept-port-offer+pa-turf-id
      reject-port-offer+pa-turf-id
      export-self+port-offer
  ==
++  skye-stir
  |=  jon=json
  ^-  ^skye-stir
  :-  %0
  %.  jon
  %-  of
  :~  set+skye
      add-form+form-spec
      del-form+(ot ~['formId'^pa])
  ==
::
++  background
  |=  jon=json
  ^-  ^background
  %.  jon
  %-  of
  :~  color+ni
      sprite+sprite
  ==
++  skye
  |=  jon=json
  ^-  ^skye
  %.  jon
  (op stap form)
++  form-spec
  |=  jon=json
  ^-  ^form-spec
  %.  jon
  (ot ~['formId'^pa form+form])
++  form
  |=  jon=json
  ^-  ^form
  %.  jon
  %-  ot
  :~  name+so
      type+(cork so form-type)
      variations+(ar luuk)
      collidable+bo
      fx+fx
  ==
++  luuk
  |=  jon=json
  ^-  ^luuk
  ?~  jon  ~
  :-  ~
  %.  jon  %-  ot
  :~  deep+(cork so deep)
      offset+svec2
      tint+ni:soft
      sprite+sprite
  ==
++  sprite
  |=  jon=json
  ^-  ^sprite
  ?:  ?=([%s *] jon)  (so jon)
  %.  jon  %-  ot
  :~  type+(cork so anim-type)
      timing+(ar ni)
      frames+(ar so)
  ==
++  add-shade-spec
  |=  jon=json
  ^-  ^add-shade-spec
  %.  jon
  (ot ~['isGate'^bo pos+svec2 'formId'^pa variation+ni])
++  fx  (ar reflex)
++  reflex
  |=  jon=json
  ^-  ^reflex
  %.  jon
  (ot ~[root+root-condition effect+effect])
++  root-condition
  |=  jon=json
  ^-  ^root-condition
  %.  jon
  %+  ol  (cork so (tags ^root-condition))
  :~  or+(ar root-condition)
      and+(ot ~[root+root-condition cons+(ar condition)])
      trigger+trigger-condition
  ==
++  condition
  |=  jon=json
  ^-  ^condition
  %.  jon
  %+  ol  (cork so (tags ^condition))
  :~  and+(ar condition)
      or+(ar condition)
      not+condition
      eq+(ot ~[a+condition b+condition])
      initiator+(cork so ?(%item %player))
      initiator-eq+fx-target
      user-eq+shp
      trigger+trigger-condition
      item-exists+fx-item-target
      variation+(ot ~[item+fx-item-target con+int-rel])
      move-collide+bo
      move-smooth+bo
      loc-eq+(ot ~[a+fx-loc b+fx-loc])
  ==
++  trigger-condition
  |=  jon=json
  ^-  ^trigger-condition
  %.  jon
  %+  ol  (cork so (tags ^trigger-condition))
  :~  move+move-condition
      bump+ul
      interact+ul
      click+ul
      tell+msg-condition
  ==
++  move-condition
  |=  jon=json
  ^-  ^move-condition
  %.  jon
  %+  ol  (cork so (tags ^move-condition))
  :~  onto+ul
      off+ul
  ==
++  msg-condition
  |=  jon=json
  ^-  ^msg-condition
  %.  jon
  %+  ol  (cork so (tags ^msg-condition))
  :~  eq+so
  ==
++  int-rel
  |=  jon=json
  ^-  ^int-rel
  %.  jon
  %+  ol  (cork so (tags ^int-rel))
  :~  eq+ni
  ==
++  effect
  |=  jon=json
  ^-  ^effect
  %.  jon
  %+  ol  (cork so effect-type)
  :~  list+(ot ~[serial+fx-serial effects+(ar effect)])
      noop+ul
      port+ni
      read+(ot ~[text+so actions+(ar (ot ~[name+so effect+effect]))])
      wipe+(ar root-condition)
      swap+pa
      seem+ni
      vary+ni
      move+(ot ~[target+fx-target to+fx-loc collide+bo smooth+bo])
      tell+(ot ~[target+fx-item-target msg+so])
  ==
++  port-offer
  |=  jon=json
  ^-  ^port-offer
  ((ot ~[for+pa-turf-id via+via]) jon)
++  via
  |=  jon=json
  ^-  ^via
  ?:  ?=([%s *] jon)
    (so jon)
  %.  jon
  %-  ot:soft
  ~[of+pa-turf-id-soft from+ni:soft at+ni:soft]
  :: |=  jon=json
  :: ^-  [=target loc=^fx-loc]
  :: [%this *^fx-loc]
++  fx-serial  (cork so ^fx-serial)
++  fx-target
  |=  jon=json
  ?:  ?=([%s *] jon)
    (target +.jon)
  %.  jon
  %+  ol
    (cork so (tags target))
  :~  top-shade-at-loc+fx-loc
      item+ni
      player+shp
  ==
++  fx-item-target
  |=  jon=json
  ?:  ?=([%s *] jon)
    (item-target +.jon)
  %.  jon
  %+  ol  (cork so (tags item-target))
  :~  top-shade-at-loc+fx-loc
      item+ni
  ==
++  fx-loc
  |=  jon=json
  ^-  ^fx-loc
  %.  jon
  %+  ol  (cork so (tags ^fx-loc))
  :~  target+fx-target
      offset+(ot ~[offset+fx-offset loc+fx-loc])
      mover-pos+(cork so ?(%start %end))
      absolute+svec2
  ==
++  fx-offset
  |=  jon=json
  ^-  ^fx-offset
  %.  jon
  %+  ol  (cork so (tags ^fx-offset))
  :~  relative+fx-from-to
      direction+(ot ~[dir+fx-dir-8 distance+ni])
      rotate+(ot ~[rotation+fx-dir offset+fx-offset])
      flip-x+fx-offset
      flip-y+fx-offset
      combine+(ot ~[a+fx-offset b+fx-offset])
      absolute+svec2
  ==
++  fx-dir
  |=  jon=json
  ^-  ^fx-dir
  %.  jon
  (ol (cork so (tags ^fx-dir)) fx-dir-pairs)
++  fx-dir-pairs
  :~  face+fx-target
      relative+(ot ~[round+fx-round from+fx-loc to+fx-loc])
      round+(ot ~[round+fx-round dir+fx-dir-8])
      rotate+(ot ~[a+fx-dir b+fx-dir])
      flip-x+fx-dir
      flip-y+fx-dir
      absolute+dir
  ==
++  fx-dir-8
  |=  jon=json
  ^-  ^fx-dir-8
  %.  jon
  %+  ol  (cork so (tags ^fx-dir-8))
  :*  relative-8+fx-from-to
      rotate-8+(ot ~[a+fx-dir-8 b+fx-dir-8])
      flip-x-8+fx-dir-8
      flip-y-8+fx-dir-8
      absolute-8+dir-8
      fx-dir-pairs
  ==
++  fx-from-to  (ot ~[from+fx-loc to+fx-loc])
++  fx-round  (cork so ?(%ud %lr))
++  dir  (cork so ^dir)
++  dir-8  (cork so ^dir-8)
  :: |=  jon=json
  :: ^-  ^dir
  :: ;;(^dir (so jon))
++  svec2
  |=  jon=json
  ^-  ^svec2
  ((ot ~[x+ns y+ns]) jon)
++  vec2
  |=  jon=json
  ^-  ^vec2
  ((ot ~[x+ni y+ni]) jon)
++  mayb
  |*  wit=fist
  |=  jon=json
  ^-  (unit _*wit)
  ?~  jon  ~
  `(wit jon)
++  maybe-ni
  |*  wit=fist
  |=  jon=json
  ^-  ?(@ud _*wit)
  ?:  ?=(%n -.jon)
    (ni jon)
  (wit jon)
++  ns  :: signed integer!
  |=  jon=json
  ^-  @sd
  ?>  ?=([%n *] jon)
  (need (toi:rd (ne jon)))
++  pa-turf-id-soft
  |=  jon=json
  ^-  (unit ^turf-id)
  ?~  jon  ~
  (path-to-turf-id (pa jon))
++  pa-turf-id  (cork pa-turf-id-soft need)
++  ot-turf-id
  |=  jon=json
  ^-  ^turf-id
  ((ot ~[ship+shp path+pa]) jon)
:: ++turf-id used by %join-turf mark
:: we're trying to support an intentionally blank turf-id
:: but I think this is the wrong aporach
++  turf-id
  |=  jon=json
  ^-  (unit ^turf-id)
  =/  path  (pa jon)
  ?~  path  ~
  `(need (path-to-turf-id path))
++  vita-action
  |=  jon=json
  ^-  action:vita-client
  %.  jon
  (of ~[set-enabled+bo])
++  shp  (se %p)
++  ol
  |*  [typ=fist arg=(pole [cord fist])]
  |=  jon=json
  ?>  ?=([%o *] jon)
  =/  type  (typ (~(got by p.jon) 'type'))
  =/  argu  (~(got by p.jon) 'arg')
  :: ~&  ['type, argu' @t=type argu]
  |-
  ?-    arg
      :: [[key=@t wit=*] t=*]
      [[key=@t *] t=*]
    =>  .(arg [[* wit] *]=arg)
    ?:  =(key.arg type)
      [key.arg ~|(key+key.arg (wit.arg argu))]
    ?~  t.arg  ~|(bad-key+type !!)
    ((ol typ t.arg) jon)
  ==
--
