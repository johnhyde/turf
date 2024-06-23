/-  told=turf-4
:: util from rally-desk
/+  vita-client, *util
|%
+$  turf-id  [=ship =path]
+$  form-id  path
+$  shade-id  @ud
+$  dest  [for=turf-id at=portal-id]
+$  vec2  [x=@ud y=@ud]
+$  svec2  [x=@sd y=@sd]
+$  dir  ?(%right %up %left %down)
++  dir-8  ?(%dr %ur %ul %dl dir)
++  dir-9  ?(dir-8 %$)
+$  color  $~(0xff.ffff @ux)
+$  flug  $~(%.n ?)  :: flag which is false by default
+$  off-size  [offset=svec2 size=vec2]
+$  tl-br  [tl=svec2 br=svec2]
::
+$  turf
  $+  turf
  $:  =ephemera
      =deed
      =plot
  ==
::
+$  ephemera
  $:  =players
      chats=(list chat)
  ==
+$  players  (map ship player)
+$  player
  $+  player
  $:  wake=(unit @da)
      pos=svec2
      =dir
      =avatar
  ==
+$  avatar
  $:  nick=(unit @t)
      =body
      things=(list thing)
  ==
+$  body  [=color =thing]
+$  chat
  $:  from=ship
      at=time
      text=cord
  ==
::
+$  deed
  $:  name=$~('Main Turf' @t)
      =invites
      =perms
      =portals
      =port-reqs
      =port-recs
      =port-offers
      lunk=(unit lunk)
      =dinks
  ==
+$  invites  (map invite-id invite)
+$  invite-id  @t
+$  invite  [name=@t till=@da]
+$  perms
  $+  perms
  $:  default=$~(%in perm)  :: the perm that applies to most
      except=(map ship perm) :: the people with different perms
  ==
+$  perm  ?(%admin %take %add %in %n)
+$  portals  (map portal-id portal)
+$  portal-id  shade-id
+$  portal
  $:  shade-id=(unit shade-id)  :: the shade that triggers the portal
      for=turf-id
      at=(unit portal-id)  :: the portal on the other side
  ==
+$  port-reqs  (map ship [=portal-id =avatar])
+$  port-recs  (jug portal-id ship)
+$  port-offers  (map ship portal-id)
+$  port-offer  [for=turf-id =via]
::
:: via is weird because I wanted to pack more info into a unit
:: but I didn't want to break interface
+$  via  $@(?(~ invite-id) [~ u=[of=turf-id from=portal-id at=portal-id]])
:: links between planets and stars
:: lunk = uplink
:: dink = downlink
+$  lunk  [=shade-id approved=?]
+$  dinks  (map portal-id ?)
::
+$  plot
  $:  back=background
      size=$~((vec2 16 8) vec2)
      offset=svec2  :: Where is the top left corner? May change due to resizing
      tile-size=$~((vec2 [32 32]) vec2)
      =spaces
      =skye
      =cave
      stuff-counter=@ud
  ==
+$  background
  $~  color+0xa6.e4e8
  $%  [%color color]
      [%sprite sprite]
  ==
+$  spaces  $+  spaces  (map svec2 space)
+$  grid  (list col)
+$  col  (list space)
+$  skye  $+  skye  (map form-id form)
+$  cave  $+  cave  (map shade-id shade)
+$  space
  $+  space
  $:  tile=(unit shade-id)
      shades=(list shade-id)
  ==
+$  thing
  $:  husk
      =form
  ==
+$  shade
  $:  pos=svec2
      husk
  ==
+$  husk
  $+  husk
  $:  =form-id
      variation=@ud
      husk-bits
  ==
+$  husk-bits
  $:  offset=svec2  :: added to form offset
      collidable=(unit flug)  :: use form collidable if null
      fx=(unit fx)  :: override form effects
  ==
+$  form
  $+  form
  $:  name=@t
      type=form-type
      variations=(list luuk)
      form-bits
  ==
+$  form-bits
  $:  collidable=flug
      =fx
  ==
+$  form-type  ?(%tile %wall %item %garb)
+$  space-form-type  ?(%tile %wall %item)
+$  luuk
  %-  unit
  $:  =deep
      offset=svec2
      tint=(unit color)
      =sprite
  ==
+$  deep  ?(%flat %back %fore)
+$  sprite
  $@  png  anim
+$  png  @t  :: base64 encoded from js frontend or relative path to sprite image
+$  anim
  $:  type=anim-type
      timing=(list @ud)  :: frame delays in ms, 14fps=[71 ~]
      frames=(list png)
  ==
+$  anim-type  ?(%loop %once %pong %rand)
+$  fx  (list reflex)
+$  reflex  [root=root-condition =effect]
+$  root-condition
  $%  [%or roots=(list root-condition)]
      [%and root=root-condition cons=(list condition)]
      [%trigger trigger=trigger-condition]
+$  condition
  $%  [%and cons=(list condition)]
      [%or cons=(list condition)]
      [%not con=condition]
      [%eq cons=(list condition)]
      [%initiator ?(%item %player)]
      [%trigger trigger=trigger-condition]
  ==
++  trigger-type  (tags trigger)
+$  trigger
  $%  [%move start=svec2 end=svec2 collide=? smooth=?]
      [%bump ~]
      [%interact ~]
      [%click ~]
      [%message msg=@t]
  ==
+$  trigger-condition
  $%  [%move relation=movement-relation collide=(unit ?) smooth=(unit ?)]
      [%bump ~]
      [%interact ~]
      [%click ~]
      [%message msg=@t]
  ==
+$  movement-relation
  $%  [%enter radius=@ud]
      [%leave radius=@ud]
      [%within pos=?(%start %end %both) radius=@ud]
  ==
++  effect-type  (tags effect)
+$  effect
  $%  [%list serial=fx-serial effects=(list effect)]
      ::  [%sleep ms=@ud]  :: if this appears in a list, don't run the rest of the list until the sleep is done
      [%noop ~]
      [%port =portal-id]  :: port player to turf
      [%read note=@t action=(list [@t effect])]  :: show dialog box
      [%swap with=form-id]  :: for opening/closing doors
      [%seem var=@ud]  :: display item variation
      [%vary var=@ud]  :: set item variation
      [%move =target to=fx-loc collide=? smooth=?]
      [%message target=item-target msg=@t]  :: what does message a player mean? goofy
  ==
+$  fx-serial  ?(%serial %simult %atomic)
+$  target
  $@  ?(%this %user %initiator)  absolute-target
+$  absolute-target
  $%  [%item =shade-id]
      [%player =ship]
      :: [%ref ref-id=@ud]  :: 
  ==
+$  item-target
  $@  ?(%this %initiator)
  [%item =shade-id]
+$  fx-loc
  $%  [%target =target]
      [%offset offset=fx-offset loc=fx-loc]
      [%movement ?(%start %end)]
      :: [%mean locs=(list fx-loc)]
      [%absolute pos=svec2]
  ==
+$  fx-offset
  $%  [%relative fx-from-to]
      [%direction dir=fx-dir-8 distance=@ud]
      [%rotate rotation=fx-dir offset=fx-offset]
      [%flip-x offset=fx-offset]
      [%flip-y offset=fx-offset]
      :: [%multipy scalar=@ud offset=fx-offset]
      [%combine a=fx-offset b=fx-offset]
      [%absolute offset=svec2]
  ==
+$  fx-dir-8
  $%  fx-dir
      [%relative-8 fx-from-to]
      [%rotate-8 a=fx-dir-8 b=fx-dir-8]
      [%flip-x-8 dir=fx-dir-8]
      [%flip-y-8 dir=fx-dir-8]
      [%absolute-8 dir=dir-8]
  ==
+$  fx-dir
  $%  [%face =target]
      [%relative round=?(%ud %lr) fx-from-to]
      [%round round=?(%ud %lr) dir=fx-dir-8]
      [%rotate a=fx-dir b=fx-dir]
      [%flip-x dir=fx-dir]
      [%flip-y dir=fx-dir]
      [%absolute =dir]
  ==
+$  fx-from-to  [from=fx-loc to=fx-loc]
::
+$  form-spec  [=form-id =form]
+$  shade-spec  [pos=svec2 =form-id variation=@ud]
+$  add-shade-spec  [is-lunk=? shade-spec]
::
+$  pond-path  [%pond *]
+$  mist-path  [%mist *]
+$  stir-ids  (map ship @t)
+$  stir-id  (unit @t)
+$  foam
  $&  foam-all
  |=  f=foam-all
  |^  ^-  foam-1
  ?^  -.f  (from-0-to-1 f)
  ?~  -.f  (from-0-to-1 f)
  f
  ++  from-0-to-1
    |=  f=foam-0
    ^-  foam-1
    [%1 id src ~]:f
  --
+$  cur-foam-v  %1
+$  foam-all
  $^  foam-0
  $%  foam-0
      foam-1
  ==
+$  foam-1
  $:  %1
      id=stir-id
      src=(unit ship)
      wen=(unit @da)
  ==
+$  foam-0
  $:  id=stir-id
      src=(unit ship)
  ==
+$  local
  $:  =config:vita-client
      closet=skye
  ==
::
+$  skye-stir
  $:  %0
      grit=skye-grit
  ==
+$  skye-grit
  $%  [%set =skye]
      [%add-form form-spec]
      [%del-form =form-id]
  ==
++  wash-skye
  |=  [sky=skye grit=skye-grit]
  ^-  skye
  ?-  -.grit
    %set  sky
    %add-form  (~(put by sky) form-id.grit form.grit)
    %del-form  (~(del by sky) form-id.grit)
  ==
++  uvtr
  |=  vtr=avatar:told
  ^-  avatar
  `vtr(things (turn things.vtr utng), thing.body (utng thing.body.vtr))
++  utng
  |=  tng=thing:told
  ^-  thing
  :-  (uhsk -.tng)
  (ufrm form.tng)
++  uhsk
  |=  hsk=husk:told
  ^-  husk
  hsk(effects (uufx effects))
++  ufrm
  |=  frm=form:told
  ^-  form
  frm(|4 (u-fx effects.frm))
++  uufx
  |=  [=ufx:told]
  ^-  (unit fx)
  %+  murn  ~(tap by ufx)
  |=  [=trigger:told upe=(unit possible-effect:told)]
  ?~  upe  ~
  ?@  u.upe  ~
  `(trigger-effect-to-reflex trigger u.upe)
++  u-fx
  |=  [fax=fx:told]
  ^-  fx
  (turn ~(tap by fx) trigger-effect-to-reflex)
++  trigger-effect-to-reflex
  |=  [=trigger:told =effect:told]
  ^-  reflex
  :-  [%trigger (old-trigger-to-trigger-condition trigger)]
  (ueff effect)
++  old-trigger-to-trigger-condition
  |=  trg=trigger:told
  ^-  trigger-condition
  ?+  trg  [trg ~]
    %step  [%move]
    %leave  
  ==
++  ueff
  |=  eff=effect:told
  ^-  effect
  ?+  -.eff  eff
    %list  [%list (usrl serial.eff) (turn effects.eff ueff)]
    %jump  [%move %user absolute+to.eff %.n %.n]
    %read  [%read note.eff ~]
    %move  [%move target.eff to.eff %.y %.y]
    %tele  [%move target.eff to.eff %.n %.n]
  ==
++  usrl
  |=  srl=serial:told
  ^-  serial
  ?+  srl  srl
    %.y  %serial
    %.n  %simult
  ==
--
