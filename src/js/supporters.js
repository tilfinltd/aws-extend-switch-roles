import { validateKeyCode } from './lib/verify_jwt'
import { SessionMemory, SyncStorageRepository } from './lib/storage_repository'
import { setIcon } from './lib/set_icon'

const syncStorageRepo = new SyncStorageRepository(chrome || browser)
const sessionMemory = new SessionMemory(chrome || browser)

function updateKeyExpire(exp) {
  syncStorageRepo.set({ goldenKeyExpire: exp })
  .then(() => {
    return sessionMemory.set({ hasGoldenKey: exp ? exp : '' })
  })
  .then(() => {
    return setIcon(`/icons/Icon_48x48${exp ? '_g' : ''}.png`);
  })
}

function setEventHandler() {
  const keyCodeValid = document.getElementById('keyCodeValid');
  const keyCodeInvalid = document.getElementById('keyCodeInvalid');

  textareaKeyCode.oninput = function() {
    const keyCode = this.value;
    if (!keyCode) {
      keyCodeValid.style.display = 'none';
      keyCodeInvalid.style.display = 'none';
      updateKeyExpire(null);
      return;
    }

    validateKeyCode(keyCode)
    .then(data => {
      keyCodeValid.style.display = 'block';
      keyCodeInvalid.style.display = 'none';
      updateKeyExpire(data.exp);
    })
    .catch(err => {
      keyCodeValid.style.display = 'none';
      keyCodeInvalid.style.display = 'block';
      updateKeyExpire(null);
    });
  }
}

window.onload = function() {
  const textareaKeyCode = document.getElementById('textareaKeyCode');

  textareaKeyCode.placeholder = `\
---------- BEGIN ------ AESR GOLDEN KEY ----------
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
----------- END ------- AESR GOLDEN KEY ----------`;

  syncStorageRepo.get(['goldenKeyExpire'])
  .then(data => {
    const { goldenKeyExpire } = data;
    if ((new Date().getTime() / 1000) < Number(goldenKeyExpire)) {
      document.getElementById('keyCodeValid').style.display = 'block';
    }
    setEventHandler();
  });
}
