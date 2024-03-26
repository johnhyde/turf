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
      size-turf+(ot ~[offset+svec2 size+vec2])
      add-form+form-spec
      del-form+(ot ~['formId'^pa])
      add-husk+add-husk-spec
      del-shade+(ot ~['shadeId'^ni])
      move-shade+(ot ~['shadeId'^ni pos+svec2])
      cycle-husk+(ot ~['huskId'^husk-id amount+ni])
      set-husk-var+(ot ~['huskId'^husk-id variation+ni])
      set-husk-effect+(ot ~['huskId'^husk-id trigger+(cork so trigger) effect+maybe-possible-effect])
      set-husk-collidable+(ot ~['huskId'^husk-id collidable+bo:soft])
      approve-dink+(ot ~['portalId'^ni])
      :-  %create-bridge
      %-  ot
      :~  shade+(maybe-ni add-husk-spec)
          trigger+(cork so trigger)
          portal+(maybe-ni ot-turf-id)
      ==
      ::
      add-portal+(ot ~[for+ot-turf-id at+ni:soft])
      del-portal+(ot ~[from+ni loud+bo])
      send-chat+(ot ~[from+shp text+so])
      move+(ot ~[ship+shp pos+svec2])
      face+(ot ~[ship+shp dir+dir])
      ping-player+(ot ~[ship+shp by+shp])
      del-player+(ot ~[ship+shp])
      add-invite+(ot ~[id+so name+so till+di])
      del-invite+(ot ~[id+so])
      call+(cork (ot ~[ships+(cork (ar shp) silt)]) (late ~))
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
      offset+svec2
      collidable+bo
      effects+|=(json *fx)
      seeds+|=(json *sfx)
  ==
++  luuk
  |=  jon=json
  ^-  ^luuk
  ?~  jon  ~
  `((ot ~[deep+(cork so deep) sprite+sprite]) jon)
++  sprite
  |=  jon=json
  ^-  ^sprite
  ?:  ?=([%s *] jon)  (so jon)
  %.  jon
  (ot ~[type+(cork so anim-type) frames+(ar so)])
++  add-husk-spec
  |=  jon=json
  ^-  ^add-husk-spec
  %.  jon
  (ot ~['isLunk'^bo pos+svec2 'formId'^pa variation+ni])
++  maybe-possible-effect
  |=  jon=json
  ^-  (unit possible-effect)
  ?~  jon  ~
  :-  ~
  ?:  ?=([%s *] jon)
    (effect-type jon)
  (effect jon)
++  effect-type  (cork so ^effect-type)
++  effect
  |=  jon=json
  ^-  ^effect
  ?>  ?=([%o *] jon)
  =/  type  (effect-type (~(got by p.jon) 'type'))
  =/  arg  (~(got by p.jon) 'arg')
  ?-  type
    %port  port+(ni arg)
    %jump  jump+(svec2 arg)
    %read  read+(so arg)
    %swap  swap+(pa arg)
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
++  dir
  |=  jon=json
  ^-  ^dir
  ;;(^dir (so jon))
++  husk-id
  |=  jon=json
  ^-  ^husk-id
  ?:  ?=([%o *] jon)
    (svec2 jon)
  (ni jon)
++  svec2
  |=  jon=json
  ^-  ^svec2
  ((ot ~[x+ns y+ns]) jon)
++  vec2
  |=  jon=json
  ^-  ^vec2
  ((ot ~[x+ni y+ni]) jon)
++  maybe-ni
  |*  wit=fist
  |=  jon=json
  ^-  ?(@ud _(wit *json))
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
--
