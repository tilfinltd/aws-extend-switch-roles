describe('Popup', () => {
  afterEach(() =>{
    fixture.cleanup()
  });

  describe('#loadAwsConfig', () => {
    it('load multi account profiles', () => {
      fixture.load('popup-config-text.html');

      var profiles = loadAwsConfig(document.getElementById('awsConfigTextArea').value);

      expect(profiles[0].profile).to.eq('src-A');
      expect(profiles[0].aws_account_id).to.eq('000011112222');

      expect(profiles[1].profile).to.eq('src/B');
      expect(profiles[1].aws_account_id).to.eq('111122223333');

      expect(profiles[2].profile).to.eq('A1');
      expect(profiles[2].aws_account_id).to.eq('000011112223');
      expect(profiles[2].role_name).to.eq('target/a1');
      expect(profiles[2].source_profile).to.eq('src-A');
      expect(profiles[2].color).to.eq('ffcccc');

      expect(profiles[3].profile).to.eq('B1');
      expect(profiles[3].aws_account_id).to.eq('111122223334');
      expect(profiles[3].role_name).to.eq('roleB1');
      expect(profiles[3].source_profile).to.eq('src/B');

      expect(profiles[4].profile).to.eq('A/2');
      expect(profiles[4].aws_account_id).to.eq('000011112224');
      expect(profiles[4].role_name).to.eq('target-a2');
      expect(profiles[4].source_profile).to.eq('src-A');
      expect(profiles[4].color).to.eq('#00cc33');
    });
  });
});
