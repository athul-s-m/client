import { sender } from "../send_data.js";

export const messageScreen = async (handler, serverAddress, receiver) => {
  console.clear();
  return await sender(handler, serverAddress, receiver);
};
