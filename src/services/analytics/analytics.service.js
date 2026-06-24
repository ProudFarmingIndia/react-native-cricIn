export const AnalyticsService = {

  trackScreen(
    screenName,
  ) {

    console.log(
      'Screen:',
      screenName,
    );

  },

  trackEvent(
    eventName,
    payload,
  ) {

    console.log(
      eventName,
      payload,
    );

  },

};