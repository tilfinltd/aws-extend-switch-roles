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

rollup src/options.js --file $options
rollup src/popup.js --file $popup
rollup src/background.js --file $background
rollup src/supporters.js --file $supporters

\cp -f $options    dist/firefox/js/options.js
\cp -f $popup      dist/firefox/js/popup.js
\cp -f $background dist/firefox/js/background.js
\cp -f $supporters dist/firefox/js/supporters.js

jq -s '.[0] * .[1]' manifest.json manifest_chrome.json > dist/chrome/manifest.json
jq -s '.[0] * .[1]' manifest.json manifest_firefox.json > dist/firefox/manifest.json

for brw in `ls dist`
do
  \cp src/content.js dist/$brw/js/
  \cp src/attach_target.js dist/$brw/js/
  \cp -r *.html dist/$brw/
  \cp -r icons  dist/$brw/
done
echo "build done"
