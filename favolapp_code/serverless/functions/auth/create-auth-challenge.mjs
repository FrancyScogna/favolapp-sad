export const handler = async function (event, context) {
  if (event.request.challengeName !== 'CUSTOM_CHALLENGE') {
    return event;
  }

  if (event.request.challengeName === 'CUSTOM_CHALLENGE') {
    event.response.publicChallengeParameters = {};
    event.response.privateChallengeParameters = {};
    event.response.publicChallengeParameters.name =
      'ACCEPT_TERMS_AND_CONDITIONS';
    event.response.privateChallengeParameters.answer = 'accept';
  }

  context.done(null, event);
};
