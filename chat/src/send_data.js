import process from "node:process";
import { printMessages } from "./print_message.js";
import { sendingMsgFormat } from "./message_fromat.js";
import { cursorTo } from "@inquirer/ansi";
import { input } from "@inquirer/prompts";

const saveName = (userInput, handler, receiver) => {
  if (userInput.startsWith("/name")) {
    const name = userInput.split("=").at(-1).trim();
    handler.saveName(receiver.id, name);
    return true;
  }
};

export const sender = async (handler, address, receiver) => {
  handler.setReadMessage(receiver.id);
  const myId = handler.getId();

  while (true) {
    receiver.name = handler.getUserName(receiver.id) || receiver.id;
    process.stdout.write(cursorTo(0, 40));

    printMessages(handler.getMessage(receiver.id));

    const message =
      (await input({ message: `${handler.getName()} --> ${receiver.name}:` })) //here
        .trim();

    if (message === "/back") return;
    if (saveName(message, handler, receiver)) continue;

    console.clear();
    handler.addMessage(receiver.id, sendingMsgFormat(message));

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
