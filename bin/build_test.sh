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

mkdir -p $destdir/tests
for file in src/tests/*; do
  fname="${file##*/}"
  rollup -c ./rollup.config.js src/tests/$fname --file $destdir/tests/$fname
done
