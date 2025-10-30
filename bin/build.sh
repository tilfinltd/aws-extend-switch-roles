#!/bin/bash
#--
# build.sh
#--

mkdir -p dist/chrome/js
mkdir -p dist/firefox/js

options=dist/chrome/js/options.js
popup=dist/chrome/js/popup.js
background=dist/chrome/js/background.js
supporters=dist/chrome/js/supporters.js
updated=dist/chrome/js/updated.js

rollup -c ./rollup.config.js src/js/options.js --file $options
rollup -c ./rollup.config.js src/js/popup.js --file $popup
rollup -c ./rollup.config.js src/js/background.js --file $background
rollup -c ./rollup.config.js src/js/supporters.js --file $supporters
rollup -c ./rollup.config.js src/js/updated.js --file $updated

\cp -f $options    dist/firefox/js/options.js
\cp -f $popup      dist/firefox/js/popup.js
\cp -f $background dist/firefox/js/background.js
\cp -f $supporters dist/firefox/js/supporters.js

bin/setup_manifest.mjs $1

browsers=("chrome" "firefox")
for brw in ${browsers[@]}
do
  \cp src/js/content.js dist/$brw/js/
  \cp -r src/js/war dist/$brw/js/
  \cp -r src/*.html dist/$brw/
  \cp -r icons  dist/$brw/
done
echo "build done"
