// This function is taken from http://krazydad.com/tutorials/makecolors.php
function byte2Hex (n){
  var nybHexString = "0123456789ABCDEF";
  return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
}

function RGB2Color (r,g,b){
	return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function colorText (str,phase){
  (phase === undefined) && (phase = 0);
  center = 128;
  width = 127;
  frequency = Math.PI*2/str.length;
  for (var i = 0; i < str.length; ++i)
  {
    red   = Math.sin(frequency*i+2+phase) * width + center;
    green = Math.sin(frequency*i+0+phase) * width + center;
    blue  = Math.sin(frequency*i+4+phase) * width + center;
    document.write( '<font color="' + RGB2Color(red,green,blue) + '">' + str.substr(i,1) + '</font>');
  }
}

$("#container").text = colorText("You are here");