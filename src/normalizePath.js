const loc = window.location + '';
if (!loc.includes('/apps/turf/')) {
  window.location.replace(loc.replace('/apps/turf', '/apps/turf/'));
}