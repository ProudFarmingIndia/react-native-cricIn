/*
|--------------------------------------------------------------------------
| Babel
|--------------------------------------------------------------------------
|
| THE WORKLETS PLUGIN IS NOT OPTIONAL.
|
| This file had `react-native-reanimated/plugin` active and
| `react-native-worklets/plugin` commented out, which is backwards for the
| versions installed here:
|
|     react-native-reanimated  ~4.1.1
|     react-native-worklets     0.5.1
|
| In Reanimated 4 the Babel plugin was moved out of the reanimated package
| and into react-native-worklets. Its job is to find functions that run on
| the UI thread and compile them into worklets; without it they are left as
| ordinary JavaScript and Reanimated fails when it tries to run them.
|
| That failure is not confined to animations you wrote. Reanimated is pulled
| in at startup by react-native-screens, React Navigation's transitions,
| gesture-handler and @gorhom/bottom-sheet - so the app dies before any
| screen renders. On a release build that surfaces as the phone's own
| "app keeps stopping" dialog, with no JavaScript error to read.
|
| It must stay LAST in the plugins array. The plugin rewrites function
| bodies, so anything that transforms code after it would be operating on
| output it has already claimed.
|
*/

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],

    plugins: ["react-native-worklets/plugin"],
  };
};