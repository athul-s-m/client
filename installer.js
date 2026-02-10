const encoder = new TextEncoder();

const showProgress = (value, char = " ") => {
  const n = 100 / value;
  let preveousN = 0;
  let i = 0;

  return () => {
    const x = Math.round(n * ++i);
    Deno.stdout.write(encoder.encode(char.repeat(x - preveousN)));
    preveousN = x;
  };
};

const createFiles = async (detailse, path, progressShower = () => null) => {
  const files = Object.keys(detailse);
  if (files.length === 0) return;

  for (const file of files) {
    const filePath = `${path}/${file}`;
    await Deno.writeTextFile(filePath, detailse[file]);
    progressShower();
  }
};

const createFolders = async (detailse, path, progressShower) => {
  const files = Object.keys(detailse);
  if (files.length === 0) return;

  for (const folder of files) {
    await install({ [folder]: detailse[folder] }, path, progressShower);
  }
};

const remove = async (path) => {
  try {
    await Deno.remove(path, { recursive: true });
  } catch {
    //
  }
};

const install = async (filesToCreate, parentPath, progressShower) => {
  const dirName = Object.keys(filesToCreate).at(0);
  const path = `${parentPath}/${dirName}`;
  await remove(path);

  try {
    await Deno.mkdir(path);
    // console.log(".".repeat(100 / noOfFiles));
  } catch {
    //
  }
  progressShower();

  await createFiles(filesToCreate[dirName].files, path, progressShower);
  await createFolders(filesToCreate[dirName].folders, path, progressShower);
};

const green = (text) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;

const getServerAddress = async () => {
  const serverAddressUrl = await fetch(
    "https://github.com/ibrahim-thoughtworks/chatroom/blob/main/ip.json",
  );

  const prefix = "http://";
  const allInfo = await serverAddressUrl.text();

  const regExOfSeverAddress = /"installationServer\\":\\"[^}]*/g;
  const severAddressPart = allInfo.match(regExOfSeverAddress).join("");

  const regExOfIpAddress = /\d[\d.:]*/g;
  const ipAddress = severAddressPart.match(regExOfIpAddress).join("");

  const serverAddress = prefix + ipAddress;
  return serverAddress;
};

const printCompletedMessage = () => {
  const space = " ".repeat(5);
  console.log(" 100%");
  console.log("\n\n\n");
  console.log(green(space + "installation Done"));
  console.log(yellow(space + "RUN : source upgrade >"));
  console.log("\n\n\n");
};

const main = async () => {
  const server = await getServerAddress();
  const response = await fetch(server, {
    method: "POST",
    body: JSON.stringify({ task: "install" }),
  });

  const installationDetails = await response.json();

  console.log(installationDetails);

  const noOfFiles = installationDetails["//"].at(-1);
  const routFiles = installationDetails["../"];
  delete installationDetails["//"];

  console.clear();

  const progressShower = showProgress(noOfFiles, "x");
  await install(installationDetails, ".", progressShower);
  if (routFiles) await createFiles(routFiles, "./");
  printCompletedMessage();
};

main();
