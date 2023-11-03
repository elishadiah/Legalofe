module.exports = function serveStatic (sails) {

  let serveStaticHandler;

  const serveStatic = require('serve-static');
  var staticFilePath = sails.config.appPath + '/.tmp';
  serveStaticHandler = serveStatic(staticFilePath);
  sails.log.info('Serving static files from: «%s»', staticFilePath);

  // Adding middleware, make sure to enable it in your config.
  sails.config.http.middleware.serveStatic = function (req, res, next) {
    if (serveStaticHandler) {
      serveStaticHandler.apply(serveStaticHandler, arguments);
    } else {
      next();
    }
  };

  return {};
};
