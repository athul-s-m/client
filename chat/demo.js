import { cursorTo, cursorUp } from "@inquirer/ansi";
import process from "node:process";

const decoder = new TextDecoder();

const green = (text) => `\x1b[32m${text}\x1b[0m`;

const cursorToEnd = (message, cursorY, noOfTexts) =>
  process.stdout.write(cursorTo(message.length, cursorY + noOfTexts + 1));

const printInput = ({ message, cursorY, noOfTexts }) => {
  process.stdout.write(cursorTo(0, cursorY + noOfTexts + 1));
  console.log(" ".repeat(message.length + 5));

  process.stdout.write(cursorUp(1));
  console.log(message.join(""));

  cursorToEnd(message, cursorY, noOfTexts);
};

const displayTexts = (texts = "", cursorY) => {
  console.log(" ".repeat(10));
  process.stdout.write(cursorTo(0, cursorY));

  texts.forEach((text) => {
    console.log(text);
  });
};

const handleTextDisplay = (pager) => {
  const textToDisplay = pager.texts.slice();

  textToDisplay[pager.selectionIndex] = green(
    textToDisplay[pager.selectionIndex],
  );

  displayTexts(textToDisplay, pager.cursorY);
  cursorToEnd(pager.message, pager.cursorY, pager.noOfTexts);
};

const configMessage = {
  "127": (pager) => {
    pager.message.pop();
    printInput(pager);
  },
  "": (pager, chunk) => {
    pager.message.push(decoder.decode(chunk));
    printInput(pager);
  },
};

const configTexts = {
  "27,91,65": (pager) => {
    const i = pager.selectionIndex;
    pager.selectionIndex = i - 1 === -1 ? i : i - 1;
    handleTextDisplay(pager);
  },
  "27,91,66": (pager) => {
    const i = pager.selectionIndex;
    pager.selectionIndex = i + 1 === pager.noOfTexts ? i : i + 1;
    handleTextDisplay(pager);
  },
  "27,91,67": () => "right",
  "27,91,68": () => "left",
};

const handleKey = async (pager) => {
  Deno.stdin.setRaw(true);
  handleTextDisplay(pager);

  for await (const chunk of Deno.stdin.readable) {
    if (chunk[0] === 3) break;
    const key = `${[...chunk]}`;

    const handler = configTexts[key] || configMessage[key] || configMessage[""];
    handler(pager, chunk);
  }
};

const main = async () => {
  const texts = [
    "ibrahim",
    "Badusha",
    "Adhul",
    "Adharsh",
  ];

  const pager = {
    selectionIndex: 0,
    message: [],
    cursorY: 2,
    texts,
    noOfTexts: texts.length,
  };

  await handleKey(pager);
};

console.clear();
main();
