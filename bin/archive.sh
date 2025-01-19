#!/bin/bash
#--
# archive.sh
#--
copydest=$1
version=$(cat dist/version)

cd dist/chrome;
zipfile="aesr-chrome-$version.zip"
if [ -e $zipfile ]; then
  \rm $zipfile
fi
zip -r $zipfile \
  manifest.json *.html icons/ js/ 
echo "archived: chrome/$zipfile"
if [ "$copydest" != "" ]; then
  \cp $zipfile $copydest
fi

echo "----"

cd ../firefox;
zipfile="aesr-firefox-$version.zip"
if [ -e $zipfile ]; then
  \rm $zipfile
fi
zip -r $zipfile \
  manifest.json *.html icons/ js/ 

echo "archived: firefox/$zipfile"
if [ "$copydest" != "" ]; then
  \cp $zipfile $copydest
fi
