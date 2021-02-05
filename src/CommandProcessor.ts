import { MatrixClient, RichReply } from "matrix-bot-sdk";
import { LogService } from "matrix-js-snippets";
import striptags = require("striptags");
import config from "./config";

export class CommandProcessor {
    constructor(private client: MatrixClient) {
    }

    public tryCommand(roomId: string, event: any): Promise<any> {
        if (!config.respond_to || config.respond_to.length === 0) {
            return this.sendHtmlReply(roomId, event, "RespnderBot is misconfigured");
        }

        const message = event['content']['body'];
        if (!message) return;
        const messageForCompare = (config.caseSensitive ? message: message.toLowerCase());

        try {
            const matchedRecord = config.respond_to.find((r) => {
                const matcher = config.caseSensitive ? r.term : r.term.toLowerCase();
                if (r.match_type === "strict" && messageForCompare === matcher) return true;
                if (r.match_type === "starts" && messageForCompare.startsWith(matcher)) return true;
                if (r.match_type === "anywhere" && messageForCompare.indexOf(matcher) !== -1) return true;
                return false;
            });
            if (!matchedRecord) return;
            if (matchedRecord && !matchedRecord.response) {
                LogService.warn("index", `Matched term ${matchedRecord.term} does not have a valid response`);
                return;
            }
            else return this.sendHtmlReply(roomId, event, matchedRecord.response);
        } catch (err) {
            LogService.error("CommandProcessor", err);
            return this.sendHtmlReply(roomId, event, "There was an error processing your command");
        }
    }

    private sendHtmlReply(roomId: string, event: any, message: string): Promise<any> {
        const reply = RichReply.createFor(roomId, event, striptags(message), message);
        reply["msgtype"] = "m.notice";
        return this.client.sendMessage(roomId, reply);
    }
}
