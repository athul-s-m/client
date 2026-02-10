import { dataHandler } from "./src/user_data_handle.js";
// import { update } from "./update.js";
import { createAccount } from "./src/create_account.js";
import { getServerAddress } from "./src/server_fns.js";
import { home } from "./src/UI/home.js";
import { update } from "./src/update.js";

const VERSION = 1.1;
const DB_PATH = "./data/db.json";

const addressFetchingUrl =
  "https://github.com/ibrahim-thoughtworks/chatroom/blob/main/ip.json";

const ipFilterer = [/"serverAddress\\":\\"[^}]*/g, /\d[\d.:]*/g];

const app = async () => {
  update(VERSION, DB_PATH);

  const serverAddress = await getServerAddress(addressFetchingUrl, ipFilterer);
  const handler = new dataHandler(DB_PATH);

  if (!handler.getId()) {
    await createAccount(serverAddress, handler);
  }

  await home(serverAddress, handler);
};

app();
