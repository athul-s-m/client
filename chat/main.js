import { input, select } from "@inquirer/prompts";
import { cursorTo } from "@inquirer/ansi";
import { chunk } from "@std/collections";
import process from "node:process";
import { dataHandler } from "./src/user_data_handle.js";

const green = (text) => `\x1b[32m${text}\x1b[0m`;

let myId;
// let RECEIVER_ID;
// const myData = {};
// let NAME;

const printMessage = (messages = [""]) => {
  console.clear();
  process.stdout.write(cursorTo(0, 40));
  messages.slice(-20).forEach((message) => {
    console.log(message);
    console.log("");
  });
  console.log("");
};

const createAccount = async (address, handler) => {
  const name = await input({ message: "Enter your name:" });
  // NAME = name;
  handler.setName(name);

  const body = {
    task: "create_account",
    data: { name, empId: "12345" },
  };

  const response = await fetch(address, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const { status, id } = await response.json();
  myId = id;
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
  while (true) {
    const response = await fetch(address, {
      method: "GET",
      headers: { myId, receiverId: receiver.id },
    });

    const datas = await response.json();

    Object.entries(datas).forEach((data) => {
      const [id, message] = data;
      const formatedMessage = message.map((m) => receivingTextFormat(m));
      // if (!myData[id]) myData[id] = { name: id, message: [] };
      if (handler.isValidUser(id)) {
        // myData[id].message.push(...formatedMessage);
        handler.addMessage(id, formatedMessage); //herreeee
      }
      // myData[id].message.isNew = true;
      handler.setReadMessage(id, true);
    });

    if (Object.keys(datas).includes(receiver.id)) {
      handler.setReadMessage(receiver.id, false);
      // myData[receiver.id].message.isNew = false;
      // printMessage(myData[receiver.id].message);
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
    .join("\n"); //here
};

const saveName = (userInput, handler, receiver) => {
  if (userInput.startsWith("/name")) {
    const name = userInput.split("=").at(-1).trim();
    // myData[receiver.id].name = name;
    handler.saveName(receiver.id, name);
    return true;
  }
};

const sender = async (handler, address, receiver) => {
  // myData[receiver.id].message.isNew = false;
  handler.setReadMessage(receiver.id);

  while (true) {
    // receiver.name = myData[receiver.id].name || receiver.id;
    receiver.name = handler.getUserName(receiver.id) || receiver.id;
    process.stdout.write(cursorTo(0, 40));

    // printMessage(myData[receiver.id].message);
    printMessage(handler.getMessage(receiver.id));

    // const message = (await input({ message: `${NAME} --> ${receiver.name}:` })) //here
    //   .trim();

    const message =
      (await input({ message: `${handler.getName()} --> ${receiver.name}:` })) //here
        .trim();

    if (message === "/back") return;
    if (saveName(message, handler, receiver)) continue;

    console.clear();
    // if (!myData[receiver.id]) myData[receiver.id] = []; //   <look>
    // myData[receiver.id].message.messages.push(sendingMessageFormat(message));
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

// const getAllMyContacts = (myData) => {
//   return Object.keys(myData).map((id) => {
//     let name = myData[id].name || "unknown";
//     if (myData[id].message.isNew) name = green(name);
//     return [id, name];
//   });
// };

const createChoices = (choices) => {
  choices.push(["", "New Chat"]);
  choices.push([" ", "Refresh"]);

  return choices.map((user) => ({
    name: user[1],
    value: user,
  }));
};

const createNewChat = async (handler, user) => {
  //
  // const nameAndId = [await input({ message: "Enter Receiver Id" }), "Unknown"];
  const [id, name] = [
    await input({ message: "Enter Receiver Id", required: true }),
    "Unknown",
  ];
  // myData[id] = { name, message: [] };
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
  const serverAddress = await getServerAddress();
  const handler = new dataHandler({});

  await createAccount(serverAddress, handler);
  await home(serverAddress, handler);
};

app();
