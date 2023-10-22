#!/bin/bash
#--
# archive.sh
#--
copydest=$1

cd dist/chrome;
version=`cat manifest.json | jq -r '.version' | sed 's/\./-/g'`
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
version=`cat manifest.json | jq -r '.version' | sed 's/\./-/g'`
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
