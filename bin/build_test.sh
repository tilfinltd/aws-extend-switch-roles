#!/bin/bash
#--
# build_test.sh
#--
destdir=test/extension

cp src/*.html $destdir/

mkdir -p $destdir/js
for file in src/js/*; do
  if [ -f "$file" ]; then
    fname="${file##*/}"
    rollup -c ./rollup.config.js src/js/$fname --file $destdir/js/$fname
  fi
done

rollup -c ./rollup.config.js src/js/lib/profile_db.js --file $destdir/js/lib/profile_db.js

mkdir -p $destdir/tests
for file in src/tests/*; do
  fname="${file##*/}"
  rollup -c ./rollup.config.js src/tests/$fname --file $destdir/tests/$fname
done
