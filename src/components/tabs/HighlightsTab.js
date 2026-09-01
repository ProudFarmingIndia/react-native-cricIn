import React from "react";

import HighlightsFeed from "../../features/highlights/components/HighlightsFeed";

/*
|--------------------------------------------------------------------------
| Highlights Tab (Matches Screen)
|--------------------------------------------------------------------------
|
| Was two hardcoded Unsplash photos captioned "Kohli Stunning Century" and
| "Bumrah Deadly Yorkers" - mock data that never touched the API.
|
| It is now the real feed: the top moments across CricIn, ranked, with a
| Today / This Week / This Month / All Time filter. Everything is derived
| from ball-by-ball scoring data, so there is no video to upload and the
| tab fills itself as soon as anyone scores a match.
|
| The feed component is shared with MatchDetailsScreen, which passes a
| matchId to scope it to one game.
|
*/

export default function HighlightsTab() {
  return <HighlightsFeed />;
}
