/-  *turf
/-  pold=pond-old
/+  *turf
=<
|%
++  name  %pond
+$  rock  ^rock
+$  vock  ^vock
+$  grit  ^grit
+$  vrit  ^vrit
+$  goal  ^goal
+$  foam  ^foam  :: from sur/turf
+$  voam  foam-all
++  urck  ^urck
++  ugrt  ^ugrt
++  ufam  foam
++  wash  wash-grit
--
|%
+$  rock  $+  pond-rock  [%3 =stir-ids turf=(unit turf)]
+$  rock-v  _-:*rock
+$  vock
  $%  vock:pold
      rock
  ==

+$  grit  $+  pond-grit  [cur-grit-v cur-grit]
+$  vrit  $%(vrit:pold grit)
+$  cur-grit-v  rock-v
+$  cur-grit
  $%  [%noop ~]
      [%wake ~]
      [%set-turf =turf]
      [%del-turf ~]
      [%size-turf off-size]
      [%add-form form-spec]
      [%del-form =form-id]
      [%add-husk add-husk-spec]
      [%del-shade =shade-id]
      [%move-shade =shade-id pos=svec2]
      [%cycle-husk =husk-id amt=@ud]
      [%set-husk-var =husk-id variation=@ud]
      [%set-husk-effect =husk-id =trigger effect=(unit possible-effect)]
      [%set-husk-collidable =husk-id collidable=(unit ?)]
      [%set-lunk lunk=(unit lunk)]
      [%set-dink =portal-id approved=?]
      [%del-dink =portal-id]
      [%add-portal for=turf-id at=(unit portal-id)]
      [%del-portal from=portal-id loud=?]
      ::  secret grits
      [%add-shade-to-portal from=portal-id =shade-id]
      [%del-shade-from-portal from=portal-id =shade-id]
      [%del-portal-from-shade =shade-id =portal-id]
      ::
      [%portal-confirmed from=portal-id at=portal-id]
      ::
      [%chat =chat]
      [%move =ship pos=svec2]
      [%tele =ship pos=svec2]
      [%face =ship =dir]
      [%ping-player =ship by=ship]
      [%set-avatar =ship =avatar]
      [%add-invite id=invite-id =invite]
      [%del-invite id=invite-id]
      [%add-port-offer =ship from=portal-id]
      [%del-port-offer =ship]
      [%add-port-req =ship from=$@(?(~ invite-id) [~ u=portal-id]) =avatar]
      [%del-port-req =ship]
      [%add-port-rec from=portal-id =ship]
      [%del-port-rec from=portal-id =ship]
      [%del-port-recs from=portal-id]
      [%add-player =ship =player]
      [%del-player =ship]
  ==
+$  grits  (list grit)
+$  cur-grits  (list cur-grit)
::
+$  stir
  $+  pond-stir
  $:  =turf-id
      id=stir-id
      =goals
  ==
::
+$  stirred
  $%  [what=%rock =rock]
      [what=%wave foam =grits]
  ==
::  let's us create a shade and/or portal
::  and link them in one transaction
+$  create-bridge-goal
  $:  %create-bridge
      shade=?(shade-id add-husk-spec) 
      =trigger
      portal=?(portal-id turf-id)
      :: link=(unit ?(%lunk %dink))
  ==
+$  goal
  $%  cur-grit
      [%call ships=(set ship) ~]
      [%send-chat from=ship text=cord]
      [%join-player =ship =avatar]
      [%approve-dink =portal-id]
      create-bridge-goal
      ::  we are receiving updates about a peer's portal
      ::  these are produced from roars of various goals
      [%portal-requested for=turf-id at=portal-id is-link=?]
      [%portal-retracted for=turf-id at=portal-id]
      [%portal-discarded from=portal-id]
      ::
      [%port-offer-accepted =ship from=portal-id]
      [%port-offer-rejected =ship from=portal-id]
      [%import-player =ship from=$@(?(~ invite-id) [~ u=portal-id]) =avatar]
  ==
+$  goals  (list goal)
::
:: roars are turf-scoped effects emitted by filters
:: which update state and produce cards
+$  portal-event  ?(%requested %retracted %confirmed %rejected %discarded)
+$  roar
  $%  [%portal-request from=portal-id for=turf-id is-link=?]
      [%portal-retract from=portal-id for=turf-id]
      [%portal-confirm from=portal-id for=turf-id at=portal-id]
      [%portal-discard for=turf-id at=portal-id]
      [%portal-hark event=portal-event is-link=? from=portal-id for=turf-id]
      [%port =ship for=turf-id at=portal-id]
      [%port-offer =ship from=portal-id for=turf-id at=portal-id]
      [%port-reject =ship]
      [%player-add =ship]
      [%player-del =ship]
      [%host-call ships=(set ship) ~]
  ==
+$  roars  (list roar)
::
++  wash-grit
  |=  [=rock foam * grit=cur-grit]
  ^-  ^rock
  =?  stir-ids.rock  &(?=(^ src) ?=(^ id))
    (~(put by stir-ids.rock) (need src) (need id))
  :+  -.rock  stir-ids.rock
  ?:  ?=([%set-turf *] grit)  `turf.grit
  :: only %set-turf can change a null turf
  ?:  ?=([%del-turf *] grit)  ~
  ?~  turf.rock  ~
  :-  ~
  =*  turf  u.turf.rock
  =*  players  players.ephemera.turf
  =?  players  &(?=(^ wen) ?=(^ src))
    ?.  (~(has by players) u.src)  players
    %+  ~(jab by players)  u.src
    |=  =player
    player(wake wen)
  ?-    -.grit
    ?(%noop %wake)  turf
    ::
      %size-turf
    =.  turf  %=  turf
        offset.plot  offset.grit
        size.plot  size.grit
        ::
          players.ephemera
        %-  ~(run by players)
        |=  =player
        player(pos (clamp-pos pos.player offset.grit size.grit))
      ==
    (fill-empty-space turf /grass)
    ::
    %add-form  (add-form turf +.grit)
    %del-form  (del-form turf form-id.grit)
    %add-husk  (add-husk turf +>.grit)
    %del-shade  (del-shade turf +.grit)
    %move-shade  (move-shade turf +.grit)
    %cycle-husk  (cycle-husk turf +.grit)
    %set-husk-var  (set-husk-var turf +.grit)
    %set-husk-effect  (set-husk-effect turf +.grit)
    %set-husk-collidable  (set-husk-collidable turf +.grit)
    ::
    %set-lunk  turf(lunk.deed lunk.grit)
      %set-dink
    =.  dinks.deed.turf
      (~(put by dinks.deed.turf) portal-id.grit approved.grit)
    turf
      %del-dink
    =.  dinks.deed.turf
      (~(del by dinks.deed.turf) portal-id.grit)
    turf
    %add-portal  (add-portal turf for.grit at.grit)
    %del-portal  (del-portal turf from.grit)
      %add-shade-to-portal
    %^  jab-by-portals  turf  from.grit
    |=  =portal
    portal(shade-id `shade-id.grit)
      %del-shade-from-portal
    %^  jab-by-portals  turf  from.grit
    |=  =portal
    ?.  =(shade-id.portal `shade-id.grit)
      portal
    portal(shade-id ~)
      %del-portal-from-shade
    ?.  (~(has by cave.plot.turf) shade-id.grit)
      turf
    =.  cave.plot.turf
      %+  ~(jab by cave.plot.turf)  shade-id.grit
      |=  =shade
      =+  (get-effects-by-shade turf shade)
      =/  overrides
        %-  malt
        %+  murn  ~(tap by full-fx)
        |=  [=trigger eff=(unit possible-effect)]
        ^-  (unit [_trigger _eff])
        ?~  eff  ~
        ?@  u.eff  ~
        ?.  ?=(%port -.u.eff)  ~
        ?.  =(portal-id.u.eff portal-id.grit)
          ~
        `[trigger `%port]
      shade(effects (~(uni by husk-fx) overrides))
    turf
    ::
      %portal-confirmed
    %^  jab-by-portals  turf  from.grit
    |=  =portal
    portal(at `at.grit)
    ::
      %chat
    turf(chats.ephemera [chat.grit (scag 19 chats.ephemera.turf)])
      ?(%move %tele)
    %^  jab-by-players  turf  ship.grit
    |=  =player
    player(pos pos.grit)
      %face
    %^  jab-by-players  turf  ship.grit
    |=  =player
    player(dir dir.grit)
      %ping-player
    turf
      %set-avatar
    %^  jab-by-players  turf  ship.grit
    |=  =player
    player(avatar avatar.grit)
      %add-port-offer
    =.  port-offers.deed.turf
      (~(put by port-offers.deed.turf) ship.grit from.grit)
    turf
      %del-port-offer
    =.  port-offers.deed.turf
      (~(del by port-offers.deed.turf) ship.grit)
    turf
      %add-port-req
    ?@  from.grit  turf
    =.  port-reqs.deed.turf
      (~(put by port-reqs.deed.turf) ship.grit [u.from.grit avatar.grit])
    turf
      %del-port-req
    =.  port-reqs.deed.turf
      (~(del by port-reqs.deed.turf) ship.grit)
    turf
      %add-port-rec
    =.  port-recs.deed.turf
      (~(put ju port-recs.deed.turf) from.grit ship.grit)
    turf
      %del-port-rec
    =.  port-recs.deed.turf
      (~(del ju port-recs.deed.turf) from.grit ship.grit)
    turf
      %del-port-recs
    =.  port-recs.deed.turf
      (~(del by port-recs.deed.turf) from.grit)
    turf
      %add-player
    =.  players
      (~(put by players) ship.grit player.grit)
    turf
      %del-player
    =.  players
      (~(del by players) ship.grit)
    turf
      %add-invite
    =.  invites.deed.turf
      (~(put by invites.deed.turf) id.grit invite.grit)
    turf
      %del-invite
    =.  invites.deed.turf
      (~(del by invites.deed.turf) id.grit)
    turf
  ==
::
:: upgrades
++  urck
  |=  rock=vock
  ^-  ^rock
  ?+  -.rock     $(rock (urck:pold rock))
    rock-v       rock
    rock-v:pold  (rock-to-next rock)
  ==
++  rock-to-next
  |=  =rock:pold
  :+  *rock-v  stir-ids.rock
  ?~  turf.rock  ~
  :-  ~
  (turf-to-next u.turf.rock)
++  turf-to-next
  |=  =turf:pold
  ^-  ^turf
  turf(deed 'Main Turf'^deed.turf)
::
++  ugrt
  |=  g=vrit
  ^-  grit
  ?+  g                        $(g (ugrt:pold g))
    [cur-grit-v *]             g
    [_(prev-v *cur-grit-v) *]  (grit-to-next g)
  ==
++  grit-to-next
  |=  [g=grit:pold]
  ^-  grit
  =/  grit  +.g
  :-  *cur-grit-v
  ?+    -.grit  grit
      %set-turf
    grit(turf (turf-to-next turf.grit))
      %upgrade
    noop+~
      %cycle-shade
    [%cycle-husk +.grit]
      %set-shade-var
    [%set-husk-var +.grit]
      %set-shade-effect
    [%set-husk-effect +.grit]
  ==
::
+$  version
  ?(%0 %1 %2 %3 %4 %5 %6 %7 %8 %9 %10 %11 %12 %13 %14 %15 %16 %17 %18 %19 %20 %21 %22 %23 %24 %25 %26 %27 %28 %29 %30 %31 %32 %33 %34 %35 %36 %37 %38 %39 %40 %41 %42 %43 %44 %45 %46 %47 %48 %49 %50 %51 %52 %53 %54 %55 %56 %57 %58 %59 %60 %61 %62 %63 %64 %65 %66 %67 %68 %69 %70 %71 %72 %73 %74 %75 %76 %77 %78 %79 %80 %81 %82 %83 %84 %85 %86 %87 %88 %89 %90 %91 %92 %93 %94 %95 %96 %97 %98 %99 %100)
++  prev-v
  |*  v=version
  ?-(v %0 %0, %1 %0, %2 %1, %3 %2, %4 %3, %5 %4, %6 %5, %7 %6, %8 %7, %9 %8, %10 %9, %11 %10, %12 %11, %13 %12, %14 %13, %15 %14, %16 %15, %17 %16, %18 %17, %19 %18, %20 %19, %21 %20, %22 %21, %23 %22, %24 %23, %25 %24, %26 %25, %27 %26, %28 %27, %29 %28, %30 %29, %31 %30, %32 %31, %33 %32, %34 %33, %35 %34, %36 %35, %37 %36, %38 %37, %39 %38, %40 %39, %41 %40, %42 %41, %43 %42, %44 %43, %45 %44, %46 %45, %47 %46, %48 %47, %49 %48, %50 %49, %51 %50, %52 %51, %53 %52, %54 %53, %55 %54, %56 %55, %57 %56, %58 %57, %59 %58, %60 %59, %61 %60, %62 %61, %63 %62, %64 %63, %65 %64, %66 %65, %67 %66, %68 %67, %69 %68, %70 %69, %71 %70, %72 %71, %73 %72, %74 %73, %75 %74, %76 %75, %77 %76, %78 %77, %79 %78, %80 %79, %81 %80, %82 %81, %83 %82, %84 %83, %85 %84, %86 %85, %87 %86, %88 %87, %89 %88, %90 %89, %91 %90, %92 %91, %93 %92, %94 %93, %95 %94, %96 %95, %97 %96, %98 %97, %99 %98, %100 %99)
++  next-v
  |*  v=version
  ?-(v %0 %1, %1 %2, %2 %3, %3 %4, %4 %5, %5 %6, %6 %7, %7 %8, %8 %9, %9 %10, %10 %11, %11 %12, %12 %13, %13 %14, %14 %15, %15 %16, %16 %17, %17 %18, %18 %19, %19 %20, %20 %21, %21 %22, %22 %23, %23 %24, %24 %25, %25 %26, %26 %27, %27 %28, %28 %29, %29 %30, %30 %31, %31 %32, %32 %33, %33 %34, %34 %35, %35 %36, %36 %37, %37 %38, %38 %39, %39 %40, %40 %41, %41 %42, %42 %43, %43 %44, %44 %45, %45 %46, %46 %47, %47 %48, %48 %49, %49 %50, %50 %51, %51 %52, %52 %53, %53 %54, %54 %55, %55 %56, %56 %57, %57 %58, %58 %59, %59 %60, %60 %61, %61 %62, %62 %63, %63 %64, %64 %65, %65 %66, %66 %67, %67 %68, %68 %69, %69 %70, %70 %71, %71 %72, %72 %73, %73 %74, %74 %75, %75 %76, %76 %77, %77 %78, %78 %79, %79 %80, %80 %81, %81 %82, %82 %83, %83 %84, %84 %85, %85 %86, %86 %87, %87 %88, %88 %89, %89 %90, %90 %91, %91 %92, %92 %93, %93 %94, %94 %95, %95 %96, %96 %97, %97 %98, %98 %99, %99 %100, %100 %100)
--
