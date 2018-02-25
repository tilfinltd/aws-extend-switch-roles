#!/bin/bash
#--
# build.sh
#--

mkdir -p dist/chrome/js
mkdir -p dist/firefox/js

content=dist/chrome/js/content.js
popup=dist/chrome/js/popup.js

cat src/lib/profile.js         > $content
cat src/lib/content.js        >> $content
cat src/content.js            >> $content

cat src/lib/load_aws_config.js > $popup
cat src/lib/color_picker.js   >> $popup
cat src/popup.js              >> $popup

\cp -f $content dist/firefox/js/content.js
\cp -f $popup   dist/firefox/js/popup.js

\cp -f manifest.json dist/chrome/
jq -s '.[0] * .[1]' manifest.json manifest_firefox.json > dist/firefox/manifest.json

for brw in `ls dist`
do
  \cp src/csrf-setter.js dist/$brw/js/
  \cp src/sanitizer.js dist/$brw/js/
  \cp -r *.html dist/$brw/
  \cp -r icons  dist/$brw/
done
echo "build done"
