/+  test
:: The test file that does almost nothing and merely tests that the test system itself is working.
:: You can run this with: -test /~nec/turf/=/tests/test-tests
:: And multiple tests with eg: -test /~nec/turf/=/tests/test-tests /~nec/turf/=/tests/test-other ~
:: (Curiously, no other forms suggested on https://developers.urbit.org/guides/additional/unit-tests seem to work ¯\_(ツ)_/¯)
|%
  ++  test-default-success
    ~
  ++  test-expected-eq-success
    %+  expect-eq:test
      !>  'the result I expect'
      !>  'the result I expect'
  ++  test-expect-success
    (expect:test !>(%.y))
  ++  test-expect-fail-success
    (expect-fail:test |.(!!))
  ++  test-use-of-category
    (category:test "You shouldn't see this message because the tang is an empty list! Otherwise it would be prepended" ~)
--