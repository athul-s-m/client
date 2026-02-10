import { receivingMsgFormat } from "./message_fromat.js";
import { printMessages } from "./print_message.js";
import { requestPhoneNo } from "./server_fns.js";

export const receiveData = async (address, receiver, handler) => {
  const myId = handler.getId();

  while (true) {
    const response = await fetch(address, {
      method: "GET",
      headers: { myId, receiverId: receiver.id },
    });

    const datas = await response.json();

    Object.entries(datas).forEach(async (data) => {
      const [id, message] = data;
      const formatedMessage = message.map((m) => receivingMsgFormat(m));

      if (!handler.isValidUser(id)) {
        const phoneNo = await requestPhoneNo(address, id);
        // console.log(phoneNo, "is phone number ok?");
        // prompt("ok?");
        handler.createNewUser(id, phoneNo);
      }

      handler.addMessage(id, formatedMessage);
      handler.setReadMessage(id, true);
    });

    if (Object.keys(datas).includes(receiver.id)) {
      handler.setReadMessage(receiver.id, false);
      printMessages(handler.getMessage(receiver.id));
    }

    await fetch(address, {
      method: "POST",
      body: JSON.stringify({ task: "got_message", data: null }),
      headers: { myId, receiverId: receiver.id },
    });
  }
};
