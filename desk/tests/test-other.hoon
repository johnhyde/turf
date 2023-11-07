/-  pond
/+  test
/+  plow
:: The test file that does almost nothing and merely tests that the test system itself is working.
:: You can run this with -test /~nec/turf/=/tests/test-tests
:: (Curiously, no other forms suggested on https://developers.urbit.org/guides/additional/unit-tests seem to work ¯\_(ツ)_/¯)
|%
  ++  test-plow-exists
    %+  expect-eq:test
      !>  plow
      !>  plow
  ++  test-two-arms-exist :: This is just testing that their names exist, and evaluates merely to a sig to indicate success. This would be a -tests-build-time error, tanking the whole file, if it failed.
    ~:[filter-mist-goal:plow filter-pond-goal:plow]
  ++  test-fpg
  :: Remember: |=  [[=bowl:gall =rock:pond top=?] pre-roars=roars:pond =goal:pond]
    ::~&  !>(filter-pond-goal:plow)
    :: ~&  "And then, sample of the gate:..."
    :: ~&  +6:filter-pond-goal:plow
    :: :: Hmm, yes, interesting...
::     [ [bowl=[[our=~zod src=~zod dap=%$] [wex=~ sup=~ sky=~] act=0 eny=0v0 now=~2000.1.1 byk=[p=~zod q=%$ r=[%uv p=0v0]]] rock=[%0 stir-ids=~ turf=~] top=%.y]
::   pre-roars=~
::     goal
::   [ %import-player
::     ship=~zod
::     from=~
::     avatar=[body=[color=0xff.ffff thing=[[form-id=/ variation=0 offset=[x=--0 y=--0] collidable=~ effects=~] form=[name='' type=%garb variations=~ offset=[x=--0 y=--0] collidable=%.n effects=~ seeds=~]]] things=~]
::   ]
:: ]
    ~&  (filter-pond-goal:plow [[bowl:gall rock:pond %.y] roars:pond goal:pond])
    ~
--