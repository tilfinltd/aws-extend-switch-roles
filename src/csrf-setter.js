setTimeout(function(){
  var csrf = AWSC.Auth.getMbtc();
  var forms = document.querySelectorAll('#awsc-username-menu-recent-roles form');
  for (var i = 0, len = forms.length; i < len; i++) {
    forms[i].csrf.value = csrf;
  }
}, 200);
