#!/bin/bash
#--
# build.sh
#--
content=js/content.js
popup=js/popup.js

cat src/lib/profile.js         > $content
cat src/content.js            >> $content

cat src/lib/load_aws_config.js > $popup
cat src/lib/color_picker.js   >> $popup
cat src/popup.js              >> $popup

echo "build done"
