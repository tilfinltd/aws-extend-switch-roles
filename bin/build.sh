#!/bin/bash
#--
# build.sh
#--

mkdir -p dist/chrome/js
mkdir -p dist/firefox/js

options=dist/chrome/js/options.js
popup=dist/chrome/js/popup.js
background=dist/chrome/js/background.js

cat src/lib/load_aws_config.js         > $options
cat src/lib/color_picker.js           >> $options
cat src/lib/data_profiles_splitter.js >> $options
cat src/lib/lz-string.min.js          >> $options
cat src/options.js                    >> $options

cat src/lib/common.js                  > $popup
cat src/lib/profile_set.js            >> $popup
cat src/lib/data_profiles_splitter.js >> $popup
cat src/popup.js                      >> $popup

cat src/lib/data_profiles_splitter.js  > $background
cat src/lib/load_aws_config.js        >> $background
cat src/lib/lz-string.min.js          >> $background
cat src/background.js                 >> $background

\cp -f $options    dist/firefox/js/options.js
\cp -f $popup      dist/firefox/js/popup.js
\cp -f $background dist/firefox/js/background.js

jq -s '.[0] * .[1]' manifest.json manifest_chrome.json > dist/chrome/manifest.json
jq -s '.[0] * .[1]' manifest.json manifest_firefox.json > dist/firefox/manifest.json

for brw in `ls dist`
do
  \cp src/content.js dist/$brw/js/
  \cp src/attach_target.js dist/$brw/js/
  \cp src/sanitizer.js dist/$brw/js/
  \cp -r *.html dist/$brw/
  \cp -r icons  dist/$brw/
done
echo "build done"
