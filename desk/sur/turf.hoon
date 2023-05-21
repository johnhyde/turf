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
  $:  pos=vec2
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
      origin=vec2  :: Where is the top left corner? May change due to resizing
      tile-size=_(vec2 [32 32])
      =spaces
      =library
      item-counter=@ud
  ==
+$  turf-id  [=ship =path]
+$  item-id  path
+$  vec2  [x=@ud y=@ud]
+$  spaces  (map vec2 space)
+$  library  (map item-id item)
+$  space
  $:  tile=(unit item-instance)
      items=(list item-instance)
  ==
+$  item-instance
  $:  id=@ud
      =item-id
      variation=@ud
      offset=vec2
  ==
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
  $%  [%port dest=turf-id]
      [%read note=@t]
      [%swap with=item-id] :: for opening/closing doors
      [%cust =cage]
  ==
::
+$  sub-pond-path  ,[%pond *]
+$  pub-pond-path  ,[%pond *]
--
