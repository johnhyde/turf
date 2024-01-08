/+  *util
|%
+$  visibility     ?(%public %private)
+$  dest           [=ship =c-id]
+$  c-id           path
+$  uuid           @t
+$  uuids          (set uuid)
+$  ships          (set ship)
+$  clients        (jug ship uuid)
:: blacklist bans ships, whitelist permits ships
+$  access-list    [kind=?(%black %white) =ships]
+$  access-filter  (unit [dap=@tas ted=@t])
+$  access
  :: ships must pass the list, and the filter if it exists
  $:  list=access-list
      filter=access-filter
  ==
:: +$  perms  (map ship (set perm))
:: +$  ?(%confirm %kick %ban %invite %grant)  :: should this be simpler? admin y/n?
+$  crew
  $:  %0
      peers=clients
      applicants=clients  :: ships who have asked to join
      admins=ships
      =visibility
      =access
      persistent=?  :: should this crew disappear when unoccupied?
      confirm=?  :: do new peers need to be manually confirmed after they pass access checks?
  ==
:: +$  ext-crew
::   $:  host=ship
::       crew=(unit crew)
::   ==
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
      [%add-applicant =ship =uuids]
      [%del-applicant =ship]
      [%add-applicant-client =ship =uuid]
      [%del-applicant-client =ship =uuid]
      ::
      [%set-visibility =visibility]
      [%set-access-list list=access-list]
      [%set-access-filter filter=access-filter]
      [%grant-access =ship]  :: updates ships.list.access
      [%revoke-access =ship]  :: updates ships.list.access
      :: should these be by ship or ships
      [%add-admin =ships]
      [%del-admin =ships]
      [%set-persistent persistent=?]
      [%set-confirm confirm=?]
  ==
+$  client-update
  $:  %0
      [%you-are =uuid]
  ==
+$  action  [%0 =dest =stirs]
+$  stirs  (list stir)
+$  stir
  $%  any-stir
      :: peer-stir
      admin-stir
  ==
+$  any-stir
  $%  [%apply =uuids]  :: do access checks. if confirm, add-applicant; else add-peer
      [%add-client =uuid]  :: only adds clients to existing peers or applicants
      [%del-client =uuid]  :: only adds clients to existing peers or applicants
      [%leave ~]
  ==
:: +$  peer-stir
::   $%  []
+$  admin-stir
  $%  [%accept-applicant =ship]  :: del-applicant and add-peer
      [%ban =ship]  :: del-peer and revoke-access
      [%waves =waves]  :: only admins can do this
      [%wave =wave]  :: only admins can do this
  ==
++  admin-stir-tags  (tags admin-stir)
+$  roars  (list roar)
+$  roar
  $%  [%admit =ship]
      [%eject =ship]  :: either a rejection or a kick/ban
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
--
