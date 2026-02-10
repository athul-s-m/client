import { input, select } from "@inquirer/prompts";
import { receiveData } from "../receive_data.js";
import { messageScreen } from "./msg_screen.js";

const assignIdAndName = (id, name, user) => {
  user.id = id;
  user.name = name;
};

const createNewChat = async (handler, user) => {
  const [id, phoneNo] = [
    await input({ message: "Enter Receiver Id", required: true }),
    1233211232,
  ];

  handler.createNewUser(id, phoneNo);
  user.id = id;
  user.name = phoneNo;
};

const printSelect = async (message, choices) =>
  await select({
    message,
    choices,
  });

const createChoices = (choices) => {
  choices.push(["", "New Chat"]);
  choices.push([" ", "Refresh"]);

  return choices.map((user) => ({
    name: user[1],
    value: user,
  }));
};

export const home = async (serverAddress, handler) => {
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
