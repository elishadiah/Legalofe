'use strict';

function setSearchParam(param, value) {
  var u = new URLSearchParams(location.search);
  u.set(param, value);
  location.search = u.toString();
}

function getSearchParam(param) {
  return new URLSearchParams(location.search).get(param);
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

window.onerror = function (message, source, lineno, colno, error) {
  axios.get('/errors/report', {
    params: { message: message, source: source, lineno: lineno, colno: colno, error: JSON.stringify(error) }
  });
  return true;
};
