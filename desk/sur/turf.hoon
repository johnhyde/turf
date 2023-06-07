|%
+$  turf
  $:  =ephemera
      =plot
  ==
::
+$  ephemera
  $:  players=(map ship player)
      chats=(list chat)
  ==
+$  player
  $:  pos=svec2
      dir=?(%right %up %left %down)
      =avatar
  ==
+$  avatar
  $:  color=@t
      things=(list thing)
  ==
+$  chat
  $:  from=ship
      at=time
      text=cord
  ==
::
+$  plot
  $:  size=_(vec2 16 8)
      offset=svec2  :: Where is the top left corner? May change due to resizing
      tile-size=_(vec2 [32 32])
      =spaces
      =skye
      =cave
      stuff-counter=@ud
  ==
+$  turf-id  [=ship =path]
+$  form-id  path
+$  shade-id  @ud
+$  vec2  [x=@ud y=@ud]
+$  svec2  [x=@sd y=@sd]
+$  flug  $~(%.n ?)  :: flag which is false by default
+$  off-size  [offset=svec2 size=vec2]
+$  tl-br  [tl=svec2 br=svec2]
+$  spaces  (map svec2 space)
+$  grid  (list col)
+$  col  (list space)
+$  skye  (map form-id form)
+$  cave  (map shade-id shade)
+$  space
  $:  tile=(unit husk)
      shades=(list shade-id)
  ==
+$  thing
  $:  husk
      =form
  ==
+$  husk
  $:  =form-id
      variation=@ud
      husk-bits
  ==
+$  husk-bits
  $:  offset=svec2  :: added to form offset
      collidable=(unit flug)  :: use form collidable if null
      effects=(map trigger effect)  :: override form effects and implement form seeds
  ==
+$  shade
  $:  pos=svec2
      husk
  ==
+$  form
  $:  name=@t
      type=form-type
      variations=(list look)
      form-bits
  ==
+$  form-bits
  $:  offset=svec2
      collidable=flug
      effects=(map trigger effect)
      seeds=(map trigger effect-type)
  ==
+$  form-type  ?(%tile %wall %item %garb)
+$  space-form-type  ?(%tile %wall %item)
+$  look
  $:  back=(unit sprite)
      fore=(unit sprite)
  ==
+$  sprite
  $@  png  animation
+$  png  @t  :: base64 encoded from js frontend
+$  animation
  $:  type=?(%loop %once %pong %rand)
      frames=(list png)
  ==
+$  trigger  ?(%step %leave %bump %interact)
+$  possible-effect  $@(effect-type effect)
+$  effect-type  ?(%port %jump %read %swap)
+$  effect
  $%  [%port for=turf-id]
      [%jump to=svec2]
      [%read note=@t]
      [%swap with=form-id]  :: for opening/closing doors
  ==
::
+$  husk-spec  [pos=svec2 =form-id variation=@ud]
::
+$  pond-path  ,[%pond *]
--
