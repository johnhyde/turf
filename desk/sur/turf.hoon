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
  $:  items=(list item-instance)
      color=@t
  ==
+$  chat
  $:  =ship
      =time
      text=cord
  ==
::
+$  plot
  $:  size=_(vec2 4 4)
      offset=svec2  :: Where is the top left corner? May change due to resizing
      tile-size=_(vec2 [32 32])
      =spaces
      =library
      item-counter=@ud
  ==
+$  turf-id  [=ship =path]
+$  item-id  path
+$  vec2  [x=@ud y=@ud]
+$  svec2  [x=@sd y=@sd]
+$  spaces  (map svec2 space)
+$  grid  (list col)
+$  col  (list space)
+$  library  (map item-id item)
+$  space
  $:  tile=(unit item-instance)
      items=(list item-instance)
  ==
+$  item-instance
  $:  id=item-instance-id
      =item-id
      variation=@ud
      offset=svec2
  ==
+$  item-instance-id  @ud
+$  item
  $:  name=@t
      type=item-type
      collidable=?
      variations=(list look)
      effects=(map trigger effect)
  ==
+$  item-type  ?(%tile %wall %item %garb)
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
+$  effect
  $%  [%port for=turf-id]
      [%jump to=svec2]
      [%read note=@t]
      [%swap with=item-id]  :: for opening/closing doors
  ==
::
+$  pond-path  ,[%pond *]
--
