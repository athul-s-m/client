import { input } from "@inquirer/prompts";

export const createAccount = async (address, handler) => {
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
