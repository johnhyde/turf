/-  *turf-0
/+  vita-client
|%
:: +$  turf-id  [=ship =path]
:: +$  form-id  path
:: +$  shade-id  @ud
:: +$  husk-id  $@(shade-id svec2)
:: +$  dest  [for=turf-id at=portal-id]
:: +$  vec2  [x=@ud y=@ud]
:: +$  svec2  [x=@sd y=@sd]
:: +$  dir  ?(%right %up %left %down)
:: +$  color  $~(0xff.ffff @ux)
:: +$  flug  $~(%.n ?)  :: flag which is false by default
:: +$  off-size  [offset=svec2 size=vec2]
:: +$  tl-br  [tl=svec2 br=svec2]
::
+$  turf
  $+  turf
  $:  =ephemera
      =deed
      =plot
  ==
::
:: +$  ephemera
::   $:  =players
::       chats=(list chat)
::   ==
:: +$  players  (map ship player)
:: +$  player
::   $+  player
::   $:  pos=svec2
::       =dir
::       =avatar
::   ==
:: +$  avatar
::   $:  =body
::       things=(list thing)
::   ==
:: +$  body  [=color =thing]
:: +$  chat
::   $:  from=ship
::       at=time
::       text=cord
::   ==
:: ::
+$  deed
  $:  =invites
      =perms
      =portals
      =port-reqs
      =port-recs
      =port-offers
      lunk=(unit lunk)
      =dinks
  ==
+$  invites  (map @t invite)
+$  invite  [name=@t long=@dr]
:: +$  perms
::   $+  perms
::   $:  default=$~(%in perm)  :: the perm that applies to most
::       except=(map ship perm) :: the people with different perms
::   ==
:: +$  perm  ?(%admin %take %add %in %n)
:: +$  portals  (map portal-id portal)
:: +$  portal-id  shade-id
:: +$  portal
::   $:  shade-id=(unit shade-id)  :: the shade that triggers the portal
::       for=turf-id
::       at=(unit portal-id)  :: the portal on the other side
::   ==
:: +$  port-reqs  (map ship [=portal-id =avatar])
:: +$  port-recs  (jug portal-id ship)
:: +$  port-offers  (map ship portal-id)
:: +$  port-offer  [for=turf-id via=(unit [of=turf-id from=portal-id at=portal-id])]
:: :: links between planets and stars
:: :: lunk = uplink
:: :: dink = downlink
:: +$  lunk  [=shade-id approved=?]
:: +$  dinks  (map portal-id ?)
:: ::
:: +$  plot
::   $:  size=$~((vec2 16 8) vec2)
::       offset=svec2  :: Where is the top left corner? May change due to resizing
::       tile-size=$~((vec2 [32 32]) vec2)
::       =spaces
::       =skye
::       =cave
::       stuff-counter=@ud
::   ==
:: +$  spaces  $+  spaces  (map svec2 space)
:: +$  grid  (list col)
:: +$  col  (list space)
:: +$  skye  $+  skye  (map form-id form)
:: +$  cave  $+  cave  (map shade-id shade)
:: +$  space
::   $+  space
::   $:  tile=(unit husk)
::       shades=(list shade-id)
::   ==
:: +$  thing
::   $:  husk
::       =form
::   ==
:: +$  shade
::   $:  pos=svec2
::       husk
::   ==
:: +$  husk
::   $+  husk
::   $:  =form-id
::       variation=@ud
::       husk-bits
::   ==
:: +$  husk-bits
::   $:  offset=svec2  :: added to form offset
::       collidable=(unit flug)  :: use form collidable if null
::       effects=ufx  :: override form effects and implement form seeds
::   ==
:: +$  form
::   $+  form
::   $:  name=@t
::       type=form-type
::       variations=(list luuk)
::       form-bits
::   ==
:: +$  form-bits
::   $:  offset=svec2
::       collidable=flug
::       effects=fx
::       seeds=sfx
::   ==
:: +$  form-type  ?(%tile %wall %item %garb)
:: +$  space-form-type  ?(%tile %wall %item)
:: +$  luuk
::   %-  unit
::   $:  =deep
::       :: todo: tint=(unit color)
::       =sprite
::   ==
:: +$  deep  ?(%flat %back %fore)
:: +$  sprite
::   $@  png  anim
:: +$  png  @t  :: base64 encoded from js frontend or relative path to sprite image
:: +$  anim
::   $:  type=?(%loop %once %pong %rand)
::       frames=(list png)
::   ==
:: +$  fx   (map trigger effect)
:: +$  sfx  (map trigger effect-type)
:: +$  pfx  (map trigger possible-effect)
:: +$  ufx  (map trigger (unit possible-effect))
:: +$  trigger  ?(%step %leave %bump %interact)
:: +$  possible-effect  $@(effect-type effect)
:: +$  effect-type  ?(%port %jump %read %swap)
:: +$  effect
::   $%  [%port =portal-id]
::       [%jump to=svec2]
::       [%read note=@t]
::       [%swap with=form-id]  :: for opening/closing doors
::   ==
:: ::
:: +$  form-spec  [=form-id =form]
:: +$  husk-spec  [pos=svec2 =form-id variation=@ud]
:: +$  add-husk-spec  [is-lunk=? husk-spec]
:: ::
:: +$  pond-path  [%pond *]
:: +$  mist-path  [%mist *]
:: +$  stir-ids  (map ship @t)
:: +$  stir-id  (unit @t)
:: +$  foam
::   $:  id=stir-id
::       src=(unit ship)
::   ==
:: :: ++  stirred-rock
:: ::
:: +$  local
::   $:  =config:vita-client
::       closet=skye
::   ==
--
