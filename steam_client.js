Steam = {};

// Request Steam credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
Steam.requestCredential = function (options, credentialRequestCompleteCallback) {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  } else if (!options) {
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({service: 'steam'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(new ServiceConfiguration.ConfigError("Service not configured"));
    return;
  }

  var credentialToken = Random.id();

  var loginUrl =
        'https://steamcommunity.com/openid/login' +
        '?openid.ns=http://specs.openid.net/auth/2.0' +
        '&openid.mode=checkid_setup' +
        // As I couldn't find a better place to stick in the '&state=' I simply put it here
        '&openid.return_to=' + Meteor.absoluteUrl('_oauth/steam?close%26' + credentialToken) +
        '&openid.realm=' + Meteor.absoluteUrl() +
        '&openid.identity=http://specs.openid.net/auth/2.0/identifier_select' +
        '&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select' +
        '&state=' + credentialToken;

  Oauth.initiateLogin(credentialToken,
                      loginUrl,
                      credentialRequestCompleteCallback,
                      { width: 960, height: 640 });
};
