describe('ContentScripts', () => {
  context('when iam user have signed and assumed', () => {
    context('hides account id', () => {
      it('attaches color line', () => {
        loadFixtures('awsmc-iam-switched', 'data');
        document.querySelector('#nav-usernameMenu .nav-elt-label').textContent = 'a-stg';
        extendIAMFormList();
        expect(document.getElementById('AESW_ColorLine')).to.exist;
      })

      context('color not defined', () => {
        it('does not attach color line', () => {
          loadFixtures('awsmc-iam-switched', 'data');
          document.querySelector('#nav-usernameMenu .nav-elt-label').textContent = 'a-prod';
          extendIAMFormList();
          expect(document.getElementById('AESW_ColorLine')).to.be.null;
        })
      })
    })

    context('does not hide account id', () => {
      it('attaches color line', () => {
        loadFixtures('awsmc-iam-switched', 'data');
        document.querySelector('#nav-usernameMenu .nav-elt-label').textContent = 'a-stg  |  555511113333';
        extendIAMFormList();
        expect(document.getElementById('AESW_ColorLine')).to.exist;
      })

      context('color not defined', () => {
        it('does not attach color line', () => {
          loadFixtures('awsmc-iam-switched', 'data');
          document.querySelector('#nav-usernameMenu .nav-elt-label').textContent = 'a-prod  |  555511114444';
          extendIAMFormList();
          expect(document.getElementById('AESW_ColorLine')).to.be.null;
        })
      })
    })

    context('profile not found', () => {
      it('does not attach color line', () => {
          loadFixtures('awsmc-iam-switched', 'data');
        document.querySelector('#nav-usernameMenu .nav-elt-label').textContent = 'other';
        extendIAMFormList();
        expect(document.getElementById('AESW_ColorLine')).to.be.null;
      })
    })
  })

  context('when federated user have signed and assumed', () => {
    context('hides account id', () => {
      it('attaches color line', () => {
        loadFixtures('awsmc-federated-switched', 'data');
        document.querySelector('#nav-usernameMenu .nav-elt-label').textContent = 'b-prod';
        extendIAMFormList();
        expect(document.getElementById('AESW_ColorLine')).to.exist;
      })

      context('color not defined', () => {
        it('does not attach color line', () => {
          loadFixtures('awsmc-federated-switched', 'data');
          document.querySelector('#nav-usernameMenu .nav-elt-label').textContent = 'b-renpou';
          extendIAMFormList();
          expect(document.getElementById('AESW_ColorLine')).to.be.null;
        })
      })
    })

    context('does not hide account id', () => {
      it('attaches color line', () => {
        loadFixtures('awsmc-federated-switched', 'data');
        document.querySelector('#nav-usernameMenu .nav-elt-label').textContent = 'b-prod  |  666611114444';
        extendIAMFormList();
        expect(document.getElementById('AESW_ColorLine')).to.exist;
      })

      context('color not defined', () => {
        it('does not attach color line', () => {
          loadFixtures('awsmc-federated-switched', 'data');
          document.querySelector('#nav-usernameMenu .nav-elt-label').textContent = 'b-renpou  |  666611115555';
          extendIAMFormList();
          expect(document.getElementById('AESW_ColorLine')).to.be.null;
        })
      })
    })

    context('profile not found', () => {
      it('does not attach color line', () => {
        loadFixtures('awsmc-federated-switched', 'data');
        document.querySelector('#nav-usernameMenu .nav-elt-label').textContent = 'other  |  000000000000';
        extendIAMFormList();
        expect(document.getElementById('AESW_ColorLine')).to.be.null;
      })
    })
  })
})
