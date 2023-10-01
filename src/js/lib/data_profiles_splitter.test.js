import { expect } from 'chai'
import { DataProfilesSplitter } from './data_profiles_splitter.js'

describe('DataProfilesSplitter', () => {
  const dps = new DataProfilesSplitter();

  describe('#profilesFromDataSet', () => {
    it('returns all profiles from profiles, profiles_1, profiles_2, profiles_3, profiles_4', () => {
      const profiles = dps.profilesFromDataSet({
        profiles: [{ profile: 'p0' }],
        profiles_1: [{ profile: 'p1' }],
        profiles_2: [{ profile: 'p2' }],
        profiles_3: [{ profile: 'p3' }],
        profiles_4: [{ profile: 'p4' }]
      })

      expect(profiles.length).to.eq(5);
      for (let i = 0; i < 5; i++) expect(profiles[i].profile).to.eq(`p${i}`);
    })

    it('returns all profiles from profiles, profiles_1, profiles_2, profiles_3, profiles_4 except profiles_5', () => {
      const profiles = dps.profilesFromDataSet({
        profiles: [{ profile: 'p0' }],
        profiles_1: [{ profile: 'p1' }],
        profiles_2: [{ profile: 'p2' }],
        profiles_3: [{ profile: 'p3' }],
        profiles_4: [{ profile: 'p4' }],
        profiles_5: [{ profile: 'p5' }],
      })

      expect(profiles.length).to.eq(5);
      for (let i = 0; i < 5; i++) expect(profiles[i].profile).to.eq(`p${i}`);
    })

    it('returns all profiles from profiles, profiles_1, profiles_2, profiles_3', () => {
      const profiles = dps.profilesFromDataSet({
        profiles: [{ profile: 'p0' }, { profile: 'p1' }],
        profiles_1: [{ profile: 'p2' }],
        profiles_2: [{ profile: 'p3' }],
        profiles_3: [{ profile: 'p4' }]
      })

      expect(profiles.length).to.eq(5);
      for (let i = 0; i < 5; i++) expect(profiles[i].profile).to.eq(`p${i}`);
    })

    it('returns all profiles from only profiles', () => {
      const profiles = dps.profilesFromDataSet({
        profiles: [{ profile: 'p0' }, { profile: 'p1' }, { profile: 'p2' }]
      })

      expect(profiles.length).to.eq(3);
      for (let i = 0; i < 3; i++) expect(profiles[i].profile).to.eq(`p${i}`);
    })
  })

  describe('#profilesToDataSet', () => {
    it('returns dataSet thas has 1 profiles field from 40 profiles', () => {
      const profiles = [];
      for (let i = 0; i < 40; i++) profiles.push({ profile: `p${i}` });
      const dataSet = dps.profilesToDataSet(profiles);

      expect(dataSet.profiles[0].profile).to.eq('p0');
      expect(dataSet.profiles[39].profile).to.eq('p39');
      expect(dataSet.profiles.length).to.eq(40);
      expect(dataSet.profiles_1).to.be.empty;
      expect(dataSet.profiles_2).to.be.empty;
      expect(dataSet.profiles_3).to.be.empty;
      expect(dataSet.profiles_4).to.be.empty;
    })

    it('returns dataSet thas has 2 profiles fields from 41 profiles', () => {
      const profiles = [];
      for (let i = 0; i < 41; i++) profiles.push({ profile: `p${i}` });
      const dataSet = dps.profilesToDataSet(profiles);

      expect(dataSet.profiles[0].profile).to.eq('p0');
      expect(dataSet.profiles[39].profile).to.eq('p39');
      expect(dataSet.profiles.length).to.eq(40);
      expect(dataSet.profiles_1[0].profile).to.eq('p40');
      expect(dataSet.profiles_1.length).to.eq(1);
      expect(dataSet.profiles_2).to.be.empty;
      expect(dataSet.profiles_3).to.be.empty;
      expect(dataSet.profiles_4).to.be.empty;
    })

    it('returns dataSet thas has 5 profiles fields from 200 profiles', () => {
      const profiles = [];
      for (let i = 0; i < 200; i++) profiles.push({ profile: `p${i}` });
      const dataSet = dps.profilesToDataSet(profiles);

      expect(dataSet.profiles[0].profile).to.eq('p0');
      expect(dataSet.profiles[39].profile).to.eq('p39');
      expect(dataSet.profiles.length).to.eq(40);
      expect(dataSet.profiles_1[0].profile).to.eq('p40');
      expect(dataSet.profiles_1.length).to.eq(40);
      expect(dataSet.profiles_2.length).to.eq(40);
      expect(dataSet.profiles_3.length).to.eq(40);
      expect(dataSet.profiles_4[0].profile).to.eq('p160');
      expect(dataSet.profiles_4[39].profile).to.eq('p199');
      expect(dataSet.profiles_4.length).to.eq(40);
      expect(dataSet.profiles_5).to.be.undefined;
    })

    it('returns dataSet thas has 5 profiles fields from 201 profiles', () => {
      const profiles = [];
      for (let i = 0; i < 201; i++) profiles.push({ profile: `p${i}` });
      const dataSet = dps.profilesToDataSet(profiles);

      expect(dataSet.profiles.length).to.eq(40);
      expect(dataSet.profiles_1.length).to.eq(40);
      expect(dataSet.profiles_2.length).to.eq(40);
      expect(dataSet.profiles_3.length).to.eq(40);
      expect(dataSet.profiles_4.length).to.eq(40);
      expect(dataSet.profiles_5).to.be.undefined;
    })
  })
})
