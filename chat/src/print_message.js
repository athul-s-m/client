import process from "node:process";
import { cursorTo } from "@inquirer/ansi";

export const printMessages = (messages = [""]) => {
  console.clear();
  process.stdout.write(cursorTo(0, 40));
  messages.slice(-20).forEach((message) => {
    console.log(message);
    console.log();
  });
  console.log();
};
