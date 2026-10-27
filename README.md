# ChatQuest

A cooperative Twitch adventure built with Codex. Viewers join Sun or Moon guild, solve the Whispering Gate, choose a route, and defeat the Ember Wyrm together.

## Run locally

Install Node.js 22 or later, then run `npm start` in this directory. No dependencies or installation step are needed. Open http://localhost:3000.

## Connect Twitch

Click **Connect Twitch**, enter the channel, your bot/account login, and a Twitch user OAuth token authorized for IRC chat (`chat:read` and `chat:edit`, as required by Twitch IRC authentication). Obtain the token through your registered Twitch developer application's OAuth flow. Never commit tokens or include them in screenshots. Credentials remain in the controller tab memory and are sent directly to Twitch over WSS. Keep one controller tab open. Disconnect clears the stored credentials; revoke the token in Twitch when no longer needed.

This project receives chat over Twitch IRC WebSocket, handles PING/PONG and reconnects after disconnects. It does not send bot messages. Twitch now recommends EventSub for new integrations; IRC provides the scoped MVP transport here. Documentation: https://dev.twitch.tv/docs/chat/irc/

## OBS

Start the local server. Add a Browser Source with URL http://localhost:3000/overlay, width 1920 and height 1080. Keep the control room open. Game state is shared by the local server via Server-Sent Events, including across OBS and your browser. The server binds only to your computer. No game data is retained after a server restart.

The hosted static edition is a demo with cross-tab synchronization in the same browser. Its storage does not synchronize across computers or OBS. Use the local server for streaming. On browsers with Web Locks support, one controller tab drives the shared demo clock. Keep a single controller on browsers without Web Locks. Game state is ephemeral.

## Commands

- `!join sun` or `!join moon`: join a guild once.
- `!solve echo`: solve chapter one while it is running.
- `!vote bridge` or `!vote forest`: chapter two, one current vote per player. Changing your vote replaces it. Ties choose the bridge.
- `!attack`: chapter three, route-dependent damage with a two-second per-player cooldown.
- `!charge`: Crystal Bridge only, once per hero.
- `!grow`: Shadow Forest only, once per hero.

Start each chapter from the controls. Pause freezes time and gameplay. Next chapter can skip the current encounter. Reset clears the campaign after confirmation. Retry chapter restores that chapter’s starting scores, powers, health, and timer without clearing the party. Lock vote closes voting early. The chosen route changes the boss encounter. Crystal Bridge gives 45 seconds, 15-damage attacks, and one `!charge` per hero that adds 25 damage to the next attack. Shadow Forest gives 75 seconds, 8-damage attacks, and one `!grow` per hero that restores 5 seconds, capped at 100 seconds remaining. Boss health scales to party size when chapter three starts (80–600 HP). The victory screen credits all heroes and displays guild scores.

## Verification

Run `npm test`. Eleven tests cover Twitch message parsing and duplicate delivery, case-insensitive hero names, late joins, elapsed countdown updates, empty vote results, and both route mechanics, one-time powers, vote replacement, cooldown, victory, timeout, chapter retries, paused gameplay, invalid commands, and reserved object property names. Live Twitch authentication and OBS require your accounts and local setup and have not been verified automatically.

## Submission preparation

Record a real Twitch session and Codex build footage in a public YouTube demo under three minutes. Provide this source repository, run instructions, project description, and the Codex session ID from the main build chat. No AI model runs during gameplay; Codex was used to build the project. This is an MVP, not a submitted entry.

## Accuracy and connection handling

Hero identities use lowercase login names. Extra spaces in commands are accepted. No-vote results explicitly identify the default route. Countdown updates use elapsed time so a delayed browser callback catches up. Twitch message IDs suppress duplicate deliveries (bounded to the most recent 2,000 messages). The interface shows paused, disconnected, and reconnecting states and reports a channel join timeout after 15 seconds. Live account and OBS verification is still pending.
