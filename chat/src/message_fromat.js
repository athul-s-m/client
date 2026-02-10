import { chunk } from "@std/collections";

export const receivingMsgFormat = (message, lineSize = 30, textSize = 20) => {
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

export const sendingMsgFormat = (message, lineSize = 20) => {
  return chunk(message.split(""), lineSize)
    .map((line) => line.join(""))
    .join("\n");
};
