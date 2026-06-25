#!/bin/bash
#--
# build_test.sh
#--
set -e
destdir=test/extension

cp src/*.html $destdir/

mkdir -p $destdir/js
for file in src/js/*; do
  if [ -f "$file" ]; then
    fname="${file##*/}"
    rolldown -c ./rolldown.config.js --input src/js/$fname --file $destdir/js/$fname
  fi
done

rolldown -c ./rolldown.config.js --input src/js/lib/profile_db.js --file $destdir/js/lib/profile_db.js

mkdir -p $destdir/tests
for file in src/tests/*; do
  fname="${file##*/}"
  rolldown -c ./rolldown.config.js --input src/tests/$fname --file $destdir/tests/$fname
done
