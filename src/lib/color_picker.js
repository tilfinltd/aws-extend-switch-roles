function ColorPicker(doc) {
  var colorPicker = doc.getElementById('colorPicker');
  var colorValue = doc.getElementById('colorValue');
  this.onpick = null;

  var me = this;

  colorPicker.oninput = function() {
    var rrggbb = this.value.substr(1);
    colorValue.value = rrggbb;
    if (me.onpick != null) {
      me.onpick(rrggbb);
    }
  }

  colorValue.oninput = function() {
    colorPicker.value = '#'+this.value;
    if (me.onpick != null) {
      me.onpick(this.value);
    }
  }

  colorValue.oninput = function() {
    colorPicker.value = '#'+this.value;
  }

  colorValue.onkeypress = function(evt) {
    if (evt.keyCode === 13) {
      if (me.onpick != null) {
        me.onpick(this.value);
      }
    }
  }
}

ColorPicker.prototype.setColor = function(color){
  colorPicker.value = '#'+color;
  colorValue.value = color;
}
