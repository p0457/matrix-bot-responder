import { AutojoinRoomsMixin, AutojoinUpgradedRoomsMixin, MatrixClient, SimpleRetryJoinStrategy } from "matrix-bot-sdk";
import config from "./config";
import { LogService } from "matrix-js-snippets";
import { CommandProcessor } from "./CommandProcessor";

LogService.configure(config.logging);
const client = new MatrixClient(config.homeserverUrl, config.accessToken);
const commands = new CommandProcessor(client);

AutojoinRoomsMixin.setupOnClient(client);
AutojoinUpgradedRoomsMixin.setupOnClient(client);
client.setJoinStrategy(new SimpleRetryJoinStrategy());

async function finishInit() {
    // If no responses defined, return
    if (!config.respond_to || config.respond_to.length === 0) {
        return;
    }

    const userId = await client.getUserId();
    LogService.info("index", `ResponderBot logged in as ${userId}`);

    client.on("room.message", async (roomId, event) => {
        if (event["sender"] === userId) return;
        if (event["type"] !== "m.room.message") return;
        if (!event["content"]) return;
        if (event["content"]["msgtype"] !== "m.text") return;

        // Check message is received from a date not too far behind
        // NOTE: When restarting application, bot will respond to most messages in the room, instead of just new ones
        if (isNaN(config.msBetweenResponses) || config.msBetweenResponses < 0) {
            LogService.error("index", "Invalid value for msBetweenResponses");
            return;
        }
        const secondsSinceEpoch = new Date().getTime(); // Get current ms since epoch for now UTC
        const eventSecondsSinceEpoch = event.origin_server_ts; // Get ms since epoch for message UTC
        const tsDiff = secondsSinceEpoch - eventSecondsSinceEpoch; // Find difference
        if (tsDiff >= 200) {
            const eventId = event["event_id"];
            const sender = event["sender"]
            LogService.warn("index", `Will not respond to a message that has likely already been responded to (or ignored) ${tsDiff}ms ago (${eventId} sent by ${sender})`);
            return;
        }

        // Process the command
        try {
            return Promise.resolve(commands.tryCommand(roomId, event));
        } catch (err) {
            LogService.error("index", err);
            return client.sendNotice(roomId, "There was an error processing your command");
        }
    });

    return client.start();
}

finishInit().then(() => LogService.info("index", "ResponderBot started"));
