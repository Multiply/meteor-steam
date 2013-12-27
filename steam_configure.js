Template.configureLoginServiceDialogForSteam.siteUrl = function () {
  return Meteor.absoluteUrl();
};

Template.configureLoginServiceDialogForSteam.fields = function () {
  return [
    {property: 'apiKey', label: 'Steam Web API Key'}
  ];
};
