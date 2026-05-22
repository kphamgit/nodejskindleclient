// Polyfill fetch() using XMLHttpRequest for browsers that lack it (e.g. Kindle PaperWhite)
if (typeof window.fetch === 'undefined') {
  window.fetch = function(url, options) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      var method = (options && options.method) || 'GET';
      xhr.open(method, url, true);
      if (options && options.headers) {
        Object.keys(options.headers).forEach(function(key) {
          xhr.setRequestHeader(key, options.headers[key]);
        });
      }
      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;
        var ok = xhr.status >= 200 && xhr.status < 300;
        resolve({
          ok: ok,
          status: xhr.status,
          json: function() {
            return Promise.resolve(JSON.parse(xhr.responseText));
          }
        });
      };
      xhr.onerror = function() { reject(new Error('Network error')); };
      xhr.send((options && options.body) ? options.body : null);
    });
  };
}
