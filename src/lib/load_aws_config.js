function parseKeyValue(line) {
  var strs = line.split('=', 2);
  var key = strs[0].trim();
  var val = strs[1].trim();
  return { key: key, value: val };
}

function brushProfile(item) {
  if (item.role_arn) {
    var parts = item.role_arn.split('/');
    var iams = parts.shift().split(':');

    item.aws_account_id = iams[4];
    item.role_name = parts.join('/');

    delete item.role_arn;
  }

  return item;
}


function loadAwsConfig(text) {
  var profiles = [];
  var lines = text.split(/\r\n|\r|\n/);

  var item = null;
  lines.forEach(function(rawline) {
    var line = rawline.trim();
    var field, r;

    var firstChar = line.charAt(0);
    if (firstChar === ';' || firstChar === '#') {
      line = ''; // Comment Line
    }

    if (r = line.match(/^\[(.+)\]$/)) {
      if (item) profiles.push(brushProfile(item));

      var pname = r[1].trim();
      pname = pname.replace(/^profile\s+/i, '');
      item = { profile: pname };
    } else if (item) {
      if (line.length > 0) {
        var field = parseKeyValue(line);
        item[field.key] = field.value;
      } else {
        profiles.push(brushProfile(item));
        item = null;
      }
    }
  })
  if (item) profiles.push(brushProfile(item));

  return profiles;
}
