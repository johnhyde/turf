/+  *util
|%
+$  flug           $~(%.n ?)  :: flag which is false by default
+$  visibility     ?(%public %private)
+$  dest           [=ship =c-id]
+$  c-id           path
+$  uuid           @t
+$  uuids          (set uuid)
+$  ships          (set ship)
+$  clients        (jug ship uuid)
:: blacklist bans ships, whitelist permits ships
+$  access-list    [kind=?(%black %white) =ships]
+$  access-filter  (unit [=desk ted=term])
+$  access
  :: ships must pass the list, and the filter if it exists
  $:  list=access-list
      filter=access-filter
  ==
:: +$  perms  (map ship (set perm))
:: +$  ?(%confirm %kick %ban %invite %grant)  :: should this be simpler? admin y/n?
+$  crew
  $+  crew
  $:  %0
      peers=clients
      noobs=clients  :: ships who have asked to join
      filtered=(set ship)
      admins=ships
      =access
      =visibility
      persistent=flug  :: should this crew persist when unoccupied?
      confirm=flug  :: do noobs need to be manually accepted after they pass access checks?
  ==
+$  crow  (unit crew)
:: %active means we've been admitted
+$  foot  ?(%incoming %outgoing %active)
+$  update
  $:  %0
      $%  [%waves waves=waves]
          [%quit host=(unit ship)]   :: stop hosting and optionally name a successor
  ==  ==
+$  waves  (list wave)
+$  wave
  $%  [%set-crew =crew]
      [%add-peer =ship =uuids]
      [%del-peer =ship]
      [%add-peer-client =ship =uuid]
      [%del-peer-client =ship =uuid]
      [%add-noob =ship =uuids]
      [%del-noob =ship]
      [%add-noob-client =ship =uuid]
      [%del-noob-client =ship =uuid]
      [%set-filtered =ship filtered=?]
      ::
      [%set-access-list list=access-list]
      [%set-access-filter filter=access-filter]
      [%grant-access =ship]  :: updates ships.list.access
      [%revoke-access =ship]  :: updates ships.list.access
      :: should these be by ship or ships
      [%add-admin =ships]
      [%del-admin =ships]
      [%set-visibility =visibility]
      [%set-persistent persistent=?]
      [%set-confirm confirm=?]
  ==
+$  client-update  [%0 client-update-core]
+$  client-update-core
  $%  [%you-are =uuid]
      [%ejected ~]
  ==
+$  action  [%0 =dest =stirs]
+$  stirs  (list stir)
+$  stir
  $%  any-stir
      :: peer-stir
      admin-stir
  ==
+$  any-stir
  $%  [%add-client =uuid]  :: only adds clients to existing peers or noobs
      [%del-client =uuid]  :: only adds clients to existing peers or noobs
      [%leave ~]
  ==
:: +$  peer-stir
::   $%  []
+$  admin-stir
  $%  [%accept-noob =ship]  :: del-noob and add-peer
      [%pass-noob =ship]  :: mark noob as filtered
      [%ban =ship]  :: del-peer and revoke-access
      [%waves =waves]  :: only admins can do this
      [%wave =wave]  :: only admins can do this
  ==
++  admin-stir-tags  (tags admin-stir)
+$  roars  (list roar)
+$  roar
  $%  [%admit =ship]
      [%eject =ship kick=?]  :: either a rejection or a kick/ban
      [%filter =ship]  :: start the filter thread for this noob
      [?(%cry %fade) ~]  :: when its visibility changes, so we can update /crews
      [%wave =wave]
      :: [%quit host=(unit ship)]  :: stop hosting and optionally name a successor
  ==
+$  echo
  $%  [%admit ~]
      [%eject ~]  :: either a rejection or a kick/ban
  ==
+$  shell
  $:  =c-id
      =echo
  ==
::
+$  dests-update
  $:  %0
      dests-update-core
  ==
+$  dests-update-core
  $%  [%cries dests=(set dest)]
      [%cry =dest]
      [%fade =dest]
  ==
--
