#!/bin/bash
#--
# archive.sh
#--
zipfile=aws-extend-switch-roles.zip

zip -r $zipfile \
  manifest.json *.html icons/ js/ 

echo "archived: $zipfile"
