class DataProfilesSplitter {
  constructor(by) {
    this.by = by || 20;
  }

  profilesFromDataSet(dataSet) {
    let profiles = dataSet.profiles;
    var pages = 1

    Object.keys(dataSet).forEach(function(key) {
          if(key.indexOf("profiles")===0){
            pages++;
          }
    });
    console.log(pages)
    for (let i = 1; i < pages; i++) {
      const key = `profiles_${i}`;
      if (key in dataSet && dataSet[key].length > 0) {
        profiles = profiles.concat(dataSet[key]);
      } else {
        break;
      }
    }
    return profiles;
  }

  profilesToDataSet(profiles) {
    var pages = profiles.length/this.by
    pages = ~~pages
    const orgProfiles = profiles.splice(0, this.by);
    const dataSet = { profiles: orgProfiles };
    for (let i = 1; i < pages; i++) {
      if (profiles.length > 0) {
        dataSet[`profiles_${i}`] = profiles.splice(0, this.by);
      } else {
        dataSet[`profiles_${i}`] = [];
      }
    }
    return dataSet;  
  }
}
