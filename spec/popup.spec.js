describe('Popup', function() {
  afterEach(function(){
    fixture.cleanup()
  });

  describe('#loadAwsConfig', function() {
    it('load multi account profiles', function() {
      fixture.load('popup-config-text.html');

      var profiles = loadAwsConfig(document.getElementById('awsConfigTextArea').value);

      expect(profiles[0].profile).toBe('src-A');
      expect(profiles[0].aws_account_id).toBe('000011112222');

      expect(profiles[1].profile).toBe('src/B');
      expect(profiles[1].aws_account_id).toBe('111122223333');

      expect(profiles[2].profile).toBe('A1');
      expect(profiles[2].aws_account_id).toBe('000011112223');
      expect(profiles[2].role_name).toBe('target/a1');
      expect(profiles[2].source_profile).toBe('src-A');
      expect(profiles[2].color).toBe('ffcccc');

      expect(profiles[3].profile).toBe('B1');
      expect(profiles[3].aws_account_id).toBe('111122223334');
      expect(profiles[3].role_name).toBe('roleB1');
      expect(profiles[3].source_profile).toBe('src/B');

      expect(profiles[4].profile).toBe('A/2');
      expect(profiles[4].aws_account_id).toBe('000011112224');
      expect(profiles[4].role_name).toBe('target-a2');
      expect(profiles[4].source_profile).toBe('src-A');
      expect(profiles[4].color).toBe('#00cc33');
    });
  });
});
