class AwsConfigIniParser {
  load(text) {
    const lines = text.split(/\r\n|\r|\n/);

    this.profiles = [];
    this.item = null;
    lines.forEach(line => { this.parseLine(line) });
    this.appendProfile();

    return this.profiles;
  }

  parseLine(line) {
    line = line.replace(/[\;\#].*$/, '').trim() // trim comment and spaces
    if (line.length === 0) return; // skip empty line

    const item = this.item;
    const md = line.match(/^\[(.+)\]$/);
    if (md) {
      this.appendProfile();
      this.newProfile(md[1].trim());
    } else if (item) {
      const field = this.parseKeyValue(line);
      if (field.key in item) throw new Error(`duplicate definition of ${field.key}`)
      item[field.key] = field.value;
    } else {
      throw new Error('profile is not declared before the key property definitions')
    }
  }

  trimComment(str) {
    return str.replace(/[;#].*$/, '')
  }

  parseKeyValue(line) {
    const [key, val] = line.split('=', 2);
    if (val === undefined) throw new Error('invalid key property definition')
    return { key: key.trim(), value: val.trim() };
  }

  newProfile(name) {
    const pname = name.replace(/^profile\s+/i, '');
    this.item = { profile: pname };
  }

  appendProfile() {
    if (!this.item) return;

    const profile = this.brushAwsProfile(this.item);
    this.profiles.push(profile);
    this.item = null;
  }

  brushAwsProfile(item) {
    if (item.role_arn) {
      const parts = item.role_arn.split('/');
      const iams = parts.shift().split(':');

      item.aws_account_id = iams[4];
      item.role_name = parts.join('/');

      delete item.role_arn;
    }

    if (!item.aws_account_id) throw new Error('invalid profile definition whose the AWS account id is not specified')

    return item;
  }
}

export function loadAwsConfig(text) {
  const parser = new AwsConfigIniParser()
  return parser.load(text);
}
