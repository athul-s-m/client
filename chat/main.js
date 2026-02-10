import { input, select } from "@inquirer/prompts";
import { cursorTo } from "@inquirer/ansi";
import { chunk } from "@std/collections";
import process from "node:process";
import { dataHandler } from "./src/user_data_handle.js";
import { update } from "./update.js";

const VERSION = 1.1;
const DB_PATH = "./data/db.json";

const printMessage = (messages = [""]) => {
  console.clear();
  process.stdout.write(cursorTo(0, 40));
  messages.slice(-20).forEach((message) => {
    console.log(message);
    console.log();
  });
  console.log();
};

const createAccount = async (address, handler) => {
  const name = (await input({ message: "Enter your name:", required: true }))
    .trim();

  const phoneNo = (await input({
    message: "Enter your phone number:",
    validate: (string) =>
      string.length === 10 && string.match(/^\d*$/g).length === 1,
  })).trim();

  const body = {
    task: "create_account",
    data: { name, phoneNo },
  };

  const response = await fetch(address, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const { status, id } = await response.json();
  handler.createAccount(name, id, phoneNo);
};

const receivingTextFormat = (message, lineSize = 30, textSize = 20) => {
  if (message.length < textSize) return message.padStart(lineSize, " ");
  return message.split(" ")
    .flatMap((word) =>
      word.length > textSize
        ? chunk(word.split(""), textSize - 1)
          .map((part) => part.join(""))
        : word
    )
    .reduce((line, word) => {
      let lastLine = "";

      if ((line.at(-1) + word).length <= textSize) {
        lastLine = line.pop();
      }

      line.push(lastLine + " " + word);
      return line;
    }, [""])
    .map((line) => line.padEnd(textSize, " "))
    .map((line) => line.padStart(lineSize, " "))
    .join("\n");
};

const receiveData = async (address, receiver, handler) => {
  const myId = handler.getId();
  while (true) {
    const response = await fetch(address, {
      method: "GET",
      headers: { myId, receiverId: receiver.id },
    });

    const datas = await response.json();

    Object.entries(datas).forEach((data) => {
      const [id, message] = data;
      const formatedMessage = message.map((m) => receivingTextFormat(m));

      if (!handler.isValidUser(id)) {
        handler.createNewUser(id, id);
      }

      handler.addMessage(id, formatedMessage);
      handler.setReadMessage(id, true);
    });

    if (Object.keys(datas).includes(receiver.id)) {
      handler.setReadMessage(receiver.id, false);
      printMessage(handler.getMessage(receiver.id));
    }

    await fetch(address, {
      method: "POST",
      body: JSON.stringify({ task: "got_message", data: null }),
      headers: { myId, receiverId: receiver.id },
    });
  }
};

const sendingMessageFormat = (message, lineSize = 20) => {
  return chunk(message.split(""), lineSize)
    .map((line) => line.join(""))
    .join("\n");
};

const saveName = (userInput, handler, receiver) => {
  if (userInput.startsWith("/name")) {
    const name = userInput.split("=").at(-1).trim();
    handler.saveName(receiver.id, name);
    return true;
  }
};

const sender = async (handler, address, receiver) => {
  handler.setReadMessage(receiver.id);
  const myId = handler.getId();

  while (true) {
    receiver.name = handler.getUserName(receiver.id) || receiver.id;
    process.stdout.write(cursorTo(0, 40));

    printMessage(handler.getMessage(receiver.id));

    const message =
      (await input({ message: `${handler.getName()} --> ${receiver.name}:` })) //here
        .trim();

    if (message === "/back") return;
    if (saveName(message, handler, receiver)) continue;

    console.clear();
    handler.addMessage(receiver.id, sendingMessageFormat(message));

    const body = {
      task: "send_data",
      data: message,
    };

    await fetch(address, {
      method: "POST",
      headers: { myId, receiverId: receiver.id },
      body: JSON.stringify(body),
    });
  }
};

const printSelect = async (message, choices) =>
  await select({
    message,
    choices,
  });

const messageScreen = async (handler, serverAddress, receiver) => {
  console.clear();
  return await sender(handler, serverAddress, receiver);
};

const createChoices = (choices) => {
  choices.push(["", "New Chat"]);
  choices.push([" ", "Refresh"]);

  return choices.map((user) => ({
    name: user[1],
    value: user,
  }));
};

const createNewChat = async (handler, user) => {
  const [id, name] = [
    await input({ message: "Enter Receiver Id", required: true }),
    "Unknown",
  ];

  handler.createNewUser(id, name);
  user.id = id;
  user.name = name;
};

const assignIdAndName = (id, name, user) => {
  user.id = id;
  user.name = name;
};

const home = async (serverAddress, handler) => {
  const receiver = { id: undefined, name: undefined };
  receiveData(serverAddress, receiver, handler);

  while (true) {
    console.clear();
    const allUsers = handler.getAllMyContacts();
    const choices = createChoices(allUsers);

    const [id, name] = await printSelect("Select User", choices);
    assignIdAndName(id, name, receiver);

    if (id === " ") continue;
    if (id === "") await createNewChat(handler, receiver);

    await messageScreen(handler, serverAddress, receiver);
    receiver.id = undefined;
  }
};

const getServerAddress = async () => {
  const serverAddressUrl = await fetch(
    "https://github.com/ibrahim-thoughtworks/chatroom/blob/main/ip.json",
  );

  const prefix = "http://";
  const severInfo = await serverAddressUrl.text();

  const regExOfSeverAddress = /"serverAddress\\":\\"[^}]*/g;
  const severAddressPart = severInfo.match(regExOfSeverAddress).join("");

  const regExOfIpAddress = /\d[\d.:]*/g;
  const ipAddress = severAddressPart.match(regExOfIpAddress).join("");

  const serverAddress = prefix + ipAddress;
  return serverAddress;
};

const app = async () => {
  update(VERSION, DB_PATH);
  const serverAddress = await getServerAddress();
  const handler = new dataHandler(DB_PATH);

  if (!handler.getId()) {
    console.log(handler.getId());
    prompt("ok?");
    await createAccount(serverAddress, handler);
  }

  await home(serverAddress, handler);
};

app();
