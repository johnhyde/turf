/-  *turf, pond, mist
/+  *turf, *plow, vita-client
=,  enjs:format
|%
++  pond-rock
  |=  =rock:pond
  ^-  json
  :: ~&  ["trying to encode the rock" rock]
  %+  frond  %rock
  %-  pairs
  :~  'stirIds'^(stir-ids stir-ids.rock)
    ::
      :-  %core
      ?~  turf.rock  ~
      (turf u.turf.rock)
  ==
++  pond-wave
  |=  [foam:pond =grits:pond]
  ^-  json
  %+  frond  %wave
  %-  pairs
  :_  :~  id+?~(id ~ s+u.id)
          src+?~(src ~ (ship-json u.src))
          wen+?~(wen ~ (time u.wen))
      ==
  :-  %grits
  a+(turn grits pond-grit)
++  pond-grit
  |=  vgrit=grit:pond
  ^-  json
  =/  grit=cur-grit:pond  +.vgrit
  %-  pairs
  :~  :-  %type
      s+-.grit
    ::
      :-  %arg
      ?-  -.grit
        %noop  ~
        %wake  ~
          %set-turf
        (turf turf.grit)
        %del-turf  ~
          %size-turf
        (pairs ~[offset+(svec2 offset.grit) size+(vec2 size.grit)])
          %add-form
        (form-spec +.grit)
          %del-form
        (frond 'formId' (path form-id.grit))
          %add-husk
        (add-husk-spec +.grit)
          %del-shade
        (frond 'shadeId' (numb +.grit))
          %move-shade
        (pairs ~['shadeId'^(numb shade-id.grit) pos+(svec2 pos.grit)])
          %cycle-husk
        (pairs ~['huskId'^(husk-id husk-id.grit) amount+(numb amt.grit)])
          %set-husk-var
        (pairs ~['huskId'^(husk-id husk-id.grit) variation+(numb variation.grit)])
          %set-husk-effect
        %-  pairs
        :~  'huskId'^(husk-id husk-id.grit)
            'trigger'^s+trigger.grit
            'effect'^+:(maybe-possible-effect trigger.grit effect.grit)
        ==
          %set-husk-collidable
        (pairs ~['huskId'^(husk-id husk-id.grit) collidable+?~(collidable.grit ~ b+u.collidable.grit)])
        %set-lunk  (maybe-lunk lunk.grit)
          %set-dink
        %-  pairs
        :~  'portalId'^(numb portal-id.grit)
            approved+b+approved.grit
        ==
          %del-dink
        (frond 'portalId' (numb portal-id.grit))
          %add-portal
        %-  pairs
        :~  for+(turf-id for.grit)
            at+?~(at.grit ~ (numb u.at.grit))
        ==
          %del-portal
        %-  pairs
        :~  from+(numb from.grit)
            loud+b+loud.grit
        ==
          %add-shade-to-portal
        %-  pairs
        :~  'from'^(numb from.grit)
            'shadeId'^(numb shade-id.grit)
        ==
          %del-shade-from-portal
        %-  pairs
        :~  'from'^(numb from.grit)
            'shadeId'^(numb shade-id.grit)
        ==
          %del-portal-from-shade
        %-  pairs
        :~  'shadeId'^(numb shade-id.grit)
            'portalId'^(numb portal-id.grit)
        ==
          %portal-confirmed
        %-  pairs
        :~  from+(numb from.grit)
            at+(numb at.grit)
        ==
          %chat
        (chat chat.grit)
          %move
        (move +.grit)
          %tele
        (move +.grit)
          %face
        (face +.grit)
          %ping-player
        %-  pairs
        :~  ship+(ship-json ship.grit)
            by+(ship-json by.grit)
        ==
          %set-avatar
        (pond-set-avatar +.grit)
          %add-port-offer
        %-  pairs
        :~  ship+(ship-json ship.grit)
            from+(numb from.grit)
        ==
          %del-port-offer
        (ship-json ship.grit)
          %add-port-req
        %-  pairs
        :~  ship+(ship-json ship.grit)
            from+?@(from.grit s+`@t`from.grit (numb u.from.grit))
            avatar+(avatar avatar.grit)
        ==
          %del-port-req
        (ship-json ship.grit)
          %add-port-rec
        %-  pairs
        :~  from+(numb from.grit)
            ship+(ship-json ship.grit)
        ==
          %del-port-rec
        %-  pairs
        :~  from+(numb from.grit)
            ship+(ship-json ship.grit)
        ==
          %del-port-recs
        (numb from.grit)
          %add-player
        (add-player +.grit)
          %del-player
        (frond 'ship' (ship-json +.grit))
          %add-invite
        %-  pairs
        :~  id+s+id.grit
            name+s+name.invite.grit
            till+(time till.invite.grit)
        ==
          %del-invite
        (frond id+s+id.grit)
  ==  ==
++  mist-rock
  |=  =rock:mist
  ^-  json
  %+  frond  %rock
  %-  pairs
  :~  'stirIds'^(stir-ids stir-ids.rock)
    ::
      :-  'core'
      %-  pairs
      :~  'currentTurfId'^(maybe-turf-id-path ctid.rock)
          'targetTurfId'^(maybe-turf-id-path ttid.rock)
          'portOffer'^?~(port-offer.rock ~ (port-offer u.port-offer.rock))
          avatar+(avatar avatar.rock)
  ==  ==
++  mist-wave
  |=  [id=stir-id:mist =grits:mist]
  ^-  json
  %+  frond  %wave
  %-  pairs
  :_  [id+(fall (bind id |=(i=@t s+i)) ~)]~
  :-  %grits
  a+(turn grits mist-grit)
++  mist-grit
  |=  [vgrit=grit:mist]
  ^-  json
  =/  grit=cur-grit:mist  +.vgrit
  %-  pairs
  :~  :-  %type
      s+-.grit
    ::
      :-  %arg
      ?-    -.grit
          %set-ctid
        (maybe-turf-id-path +.grit)
          %set-avatar
        (avatar +.grit)
          %set-color
        (numb +.grit)
          %add-thing
        (thing +.grit)
          %del-thing
        (numb +.grit)
          %set-thing
        %-  pairs
        :~  index+(numb index.grit)
            thing+(thing thing.grit)
        ==
          %port-offered
        (port-offer +.grit)
          %accept-port-offer
        (turf-id-path +.grit)
          %reject-port-offer
        (turf-id-path +.grit)
          %clear-port-offer
        ~
  ==  ==
++  skye-grit
  |=  grit=^skye-grit
  ^-  json
  %-  pairs
  :~  :-  %type
      s+-.grit
    ::
      :-  %arg
      :: ?@  grit  ~
      ?-  -.grit
        %set       (frond 'skye' (skye skye.grit))
        %add-form  (form-spec +.grit)
        %del-form  (frond 'formId' (path form-id.grit))
  ==  ==
++  stir-ids
  |=  [ids=^stir-ids]
  ^-  json
  (pairs (turn ~(tap by ids) stir-id-pair))
++  stir-id-pair
  |=  [src=^ship id=@t]
  :-  (scot %p src)
  s+id
++  local
  |=  loc=^local
  ^-  json
  %-  pairs
  :~  config+(vita-config config.loc)
      closet+(skye closet.loc)
  ==
++  vita-config
  |=  =config:vita-client
  %-  pairs
  :~  enabled+b+enabled.config
      'vitaParent'^(ship-json vita-parent.config)
  ==
++  turf
  |=  =^turf
  =,  ephemera.turf
  =,  deed.turf
  =,  plot.turf
  |^  ^-  json
  %-  pairs
  :~  players+(pairs (turn ~(tap by players) player-pair))
      chats+a+(turn chats chat)
      name+s+name
      invites+invites
      :: todo: add perms (?)
      portals+portals
      'portReqs'^port-reqs
      'portRecs'^port-recs
      'portOffers'^port-offers
      lunk+(maybe-lunk lunk)
      dinks+(^dinks dinks)
      size+(vec2 size)
      offset+(svec2 offset)
      'tileSize'^(vec2 tile-size)
      spaces+spaces
      skye+(^skye skye)
      cave+cave
      'stuffCounter'^(numb stuff-counter)
  ==
  ++  invites
    ^-  json
    %-  pairs
    %+  turn  ~(tap by ^invites)
    |=  [key=invite-id inv=^invite]
    ^-  [@t json]
    :-  key
    %-  pairs
    :~  name+s+name.inv
        till+(time till.inv)
    ==
  ++  portals
    ^-  json
    %-  pairs
    %+  turn  ~(tap by ^portals)
    |=  [key=portal-id pol=^portal]
    ^-  [@t json]
    :-  (numbt key)
    (portal pol)
  ++  port-reqs
    ^-  json
    %-  pairs
    %+  turn  ~(tap by ^port-reqs)
    |=  [key=^ship =portal-id av=^avatar]
    ^-  [@t json]
    :-  (ship-cord key)
    %-  pairs
    :~  'portalId'^(numb portal-id)
        avatar+(avatar av)
    ==
  ++  port-recs
    ^-  json
    %-  pairs
    %+  turn  ~(tap by ^port-recs)
    |=  [key=portal-id ships=(set ^ship)]
    ^-  [@t json]
    :-  (numbt key)
    :-  %a
    (turn ~(tap in ships) ship-json)
  ++  port-offers
    ^-  json
    %-  pairs
    %+  turn  ~(tap by ^port-offers)
    |=  [key=^ship =portal-id]
    ^-  [@t json]
    :-  (ship-cord key)
    (numb portal-id)
  ++  spaces
    ^-  json
    %-  pairs
    %+  turn  ~(tap by ^spaces)
    |=  [pos=^svec2 spot=^space]
    ^-  [@t json]
    :-  :(welk (snumbt x.pos) ',' (snumbt y.pos))
    (space spot)
  ++  cave
    ^-  json
    %-  pairs
    %+  turn  ~(tap by ^cave)
    |=  [=shade-id =shade]
    ^-  [@ta json]
    :-  (numbt shade-id)
    (pairs (shade-pairs shade))
  --
++  skye
  |=  =^skye
  ^-  json
  %-  pairs
  %+  turn  ~(tap by skye)
  |=  [=form-id frm=^form]
  :-  (spat form-id)
  (form frm)
++  port-offer
  |=  po=^port-offer
  ^-  json
  %-  pairs
  :~  for+(turf-id-path for.po)
      via+?@(via.po s+`@t`via.po ~)
      of+?@(via.po ~ (turf-id-path of.u.via.po))
      from+?@(via.po ~ (numb from.u.via.po))
      at+?@(via.po ~ (numb at.u.via.po))
  ==
++  maybe-lunk
  |=  lunk=(unit lunk)
  ^-  json
  ?~  lunk  ~
  %-  pairs
  :~  'shadeId'^(numb shade-id.u.lunk)
      approved+b+approved.u.lunk
  ==
++  dinks
  |=  =^dinks
  ^-  json
  %-  pairs
  %+  turn  ~(tap by dinks)
  |=  [=portal-id approved=?]
  ^-  [@t json]
  :-  (numbt portal-id)
  b+approved
++  husk-id
  |=  =^husk-id
  ^-  json
  ?@(husk-id (numb husk-id) (svec2 husk-id))
++  vec2
  |=  =^vec2
  ^-  json
  %-  pairs
  :~  x+(numb x.vec2)
      y+(numb y.vec2)
  ==
++  svec2
  |=  =^svec2
  ^-  json
  %-  pairs
  :~  x+(snumb x.svec2)
      y+(snumb y.svec2)
  ==
++  numbt
  |=  a=@u
  ^-  @t
  (crip (a-co:co a))
++  snumbt
  |=  a=@s
  ^-  @t
  =/  [sign=? abs=@u]
    (old:si a)
  =/  num  (numbt abs)
  ?:  sign  num
  `@t`(cat 3 '-' num)
++  snumb
  |=  a=@s
  ^-  json
  n+(snumbt a)
++  player-pair
  |=  [who=^ship plr=^player]
  :-  (scot %p who)
  (player plr)
++  player
  |=  =^player
  ^-  json
  %-  pairs
  :~  wake+(wake wake.player)
      pos+(svec2 pos.player)
      dir+s+dir.player
      avatar+(avatar avatar.player)
  ==
++  wake
  |=  wek=(unit @da)
  ^-  json
  ?~(wek ~ (time u.wek))
++  avatar
  |=  =^avatar
  ^-  json
  %-  pairs
  :~  body+(body body.avatar)
      things+a+(turn things.avatar thing)
  ==
++  body
  |=  =^body
  ^-  json
  %-  pairs
  :~  color+(numb color.body)
      thing+(thing thing.body)
  ==
++  chat
  |=  =^chat
  ^-  json
  %-  pairs
  :~  from+(ship-json from.chat)
      at+(time at.chat)
      text+s+text.chat
  ==
++  portal
  |=  pol=^portal
  ^-  json
  %-  pairs
  :~  'shadeId'^?~(shade-id.pol ~ (numb u.shade-id.pol))
      for+(turf-id for.pol)
      at+?~(at.pol ~ (numb u.at.pol))
  ==
++  space
  |=  =^space
  ^-  json
  %-  pairs
  :~  tile+(fall (bind tile.space husk) ~)
      shades+a+(turn shades.space numb)
  ==
++  thing
  |=  =^thing
  ^-  json
  %-  pairs
  :-  form+(pairs (form-pairs +.thing))
  (husk-pairs -.thing)
++  husk
  |=  =^husk
  ^-  json
  (pairs (husk-pairs husk))
++  husk-pairs
  |=  =^husk
  ^-  (list [@t json])
  =,  husk
  =/  collidable=(unit ?)  collidable
  :~  'formId'^(path form-id)
      variation+(numb variation)
      offset+(svec2 offset)
      :: collidable+(fall (bind collidable |=(c=? b+c)) ~)
      collidable+?~(collidable ~ b+u.collidable)
      effects+(pairs (turn ~(tap by effects) maybe-possible-effect))
  ==
++  shade-pairs
  |=  =shade
  ^-  (list [@t json])
  :-  pos+(svec2 pos.shade)
  (husk-pairs +.shade)
++  form
  |=  =^form
  ^-  json
  (pairs (form-pairs form))
++  form-pairs
  |=  =^form
  ^-  (list [@t json])
  =,  form
  :~  name+s+name
      type+s+type
      variations+a+(turn variations luuk)
      offset+(svec2 offset)
      collidable+b+collidable
      effects+(pairs (turn ~(tap by effects) effect))
      seeds+(pairs (turn ~(tap by seeds) effect-type))
  ==
++  form-spec
  |=  spec=^form-spec
  ^-  json
  %-  pairs
  :~  'formId'^(path form-id.spec)
      form+(form form.spec)
  ==
++  add-husk-spec
  |=  =^add-husk-spec
  =,  add-husk-spec
  ^-  json
  %-  pairs
  :~  'isLunk'^b+is-lunk
      pos+(svec2 pos)
      'formId'^(path form-id)
      variation+(numb variation)
  ==
++  luuk
  |=  =^luuk
  ^-  json
  ?~  luuk  ~
  %-  pairs
  :~  deep+s+deep.u.luuk
      sprite+(sprite sprite.u.luuk)
  ==
++  sprite
  |=  =^sprite
  ^-  json
  ?@  sprite  s+sprite
  %-  pairs
  :~  type+s+type.sprite
      frames+a+(turn frames.sprite (lead %s))
  ==
++  maybe-possible-effect
  |=  [=trigger eff=(unit ^possible-effect)]
  ^-  (pair @t json)
  ?~  eff  trigger^~
  (possible-effect trigger u.eff)
++  possible-effect
  |=  [=trigger eff=^possible-effect]
  ^-  (pair @t json)
  ?@  eff
    (effect-type trigger eff)
  (effect trigger eff)
++  effect
  |=  [=trigger eff=^effect]
  ^-  (pair @t json)
  :-  trigger
  ^-  json
  %-  pairs
  :~  type+s+-.eff
      :-  %arg
      ^-  json
      ?-  -.eff
        %port  (numb +.eff)
        %jump  (svec2 +.eff)
        %read  s+note.eff
        %swap  (path +.eff)
  ==  ==
++  effect-type
  |=  [=trigger =^effect-type]
  ^-  (pair @t json)
  [trigger s+effect-type]
++  maybe-turf-id-path
  |=  tid=(unit ^turf-id)
  ^-  json
  ?~  tid  ~
  (turf-id-path u.tid)
++  turf-id-path
  |=  tid=^turf-id
  ^-  json
  (path (turf-id-to-path tid))
++  turf-id
  |=  id=^turf-id
  ^-  json
  %-  pairs
  :~  ship+(ship-json ship.id)
      path+(path path.id)
  ==
++  move
  |=  [shp=^ship pos=^svec2]
  ^-  json
  %-  pairs
  :~  ship+(ship-json shp)
      pos+(svec2 pos)
  ==
++  face
  |=  [shp=^ship =dir]
  ^-  json
  %-  pairs
  :~  ship+(ship-json shp)
      dir+s+dir
  ==
++  pond-set-avatar
  |=  [shp=^ship av=^avatar]
  ^-  json
  %-  pairs
  :~  ship+(ship-json shp)
      avatar+(avatar av)
  ==
++  add-player
  |=  [shp=^ship plr=^player]
  ^-  json
  %-  pairs
  :~  ship+(ship-json shp)
      player+(player plr)
  ==
++  ship-json
  |=  shp=^ship
  ^-  json
  s+(scot %p shp)
++  ship-cord
  |=  shp=^ship
  ^-  @t
  (scot %p shp)
--
