import * as config from "config";
import { LogConfig } from "matrix-js-snippets";

class respondToItem {
    term: string;
    response: string;
    match_type: string;
}

interface IConfig {
    homeserverUrl: string;
    accessToken: string;

    msBetweenResponses: number;

    caseSensitive: boolean;

    respond_to: Array<respondToItem>;

    logging: LogConfig;
}

const conf = <IConfig>config;

if (process.env["BOT_DOCKER_LOGS"]) {
    console.log("Altering log configuration to only write out to console");
    conf.logging = {
        file: "/data/logs/matrix-bot-responder.log",
        console: true,
        consoleLevel: conf.logging.consoleLevel,
        fileLevel: "error",
        writeFiles: false,
        rotate: {
            size: 0,
            count: 0,
        },
    };
}

export default conf;
