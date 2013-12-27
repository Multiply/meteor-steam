Steam = {};

Oauth.registerService('steam', 2, null, function(query) {
  // XX fix the state
  query.state = _.last(query['openid.return_to'].split('?close&'));
  var steamId = getSteamId(query);
  var identity = getIdentity(steamId);

  return {
    serviceData: {
      id: identity.steamid,
      username: identity.personaname,
      avatar: {
      	small: identity.avatar,
      	medium: identity.avatarmedium,
      	full: identity.avatarfull
      }
    },
    options: {profile: { name: identity.personaname }}
  };
});

var getSteamId = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'steam'});
  if (!config)
    throw new ServiceConfiguration.ConfigError("Service not configured");

  var response;
  try {
    response = HTTP.post("https://steamcommunity.com/openid/login", { params: _.extend(query, { 'openid.mode': 'check_authentication' }) });
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with Steam. " + err.message), { response: err.response });
  }

  if (response.content && response.content.indexOf("is_valid:true") !== -1) {
  	// Grab the SteamID from the claimed_id
  	return _.last(query['openid.claimed_id'].split('/'));
  } else {
    throw new Error("Failed to complete OAuth handshake with Steam. " + response.data.error);
  }
};

var getIdentity = function (steamId) {
  var config = ServiceConfiguration.configurations.findOne({service: 'steam'});
  if (!config)
    throw new ServiceConfiguration.ConfigError("Service not configured");

  var response;
  try {
    response = HTTP.get("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/", {
      params: {
      	key: config.apiKey,
      	steamids: steamId
      }
    });

    // Return the first player
    return _.first(response.data.response.players);
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Steam. " + err.message), { response: err.response });
  }
};


Steam.retrieveCredential = function(credentialToken) {
  return Oauth.retrieveCredential(credentialToken);
};
