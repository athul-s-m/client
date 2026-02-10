const createFiles = (detailse, path) => {
  const files = Object.keys(detailse);
  if (files.length === 0) return;

  files.forEach(async (file) => {
    const filePath = `${path}/${file}`;
    await Deno.writeTextFile(filePath, detailse[file]);
  });
};

const createFolders = (detailse, path) => {
  const files = Object.keys(detailse);
  if (files.length === 0) return;

  files.forEach((folder) => {
    install({ [folder]: detailse[folder] }, path);
  });
};

// const remove = async (path) => {
//   try {
//     await Deno.remove(path, { recursive: true });
//   } catch {
//     //
//   }
// };

const install = async (installationDetailsedetailse, parentPath) => {
  const folderName = Object.keys(installationDetailsedetailse).at(0);
  const path = `${parentPath}/${folderName}`;
  // await remove(path);

  try {
    await Deno.mkdir(path);
  } catch {
    //
  }

  await createFiles(installationDetailsedetailse[folderName].files, path);
  await createFolders(installationDetailsedetailse[folderName].folders, path);
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

const printCompletedMessage = (space) => {
  console.clear();
  console.log("\n\n\n");
  console.log(green(space + "installation Done"));
  console.log(yellow(space + "RUN : < deno task upgrade >"));
  console.log("\n\n\n");
  Deno.exit();
};

const sendRequest = async (server, version) => {
  return await fetch(server, {
    method: "POST",
    body: JSON.stringify({ task: "upgrade", version }),
  });
};

export const update = async (version = 1.1, dbPath) => {
  let response;

  try {
    const server = await getServerAddress();
    response = await sendRequest(server, version);
  } catch {
    return;
  }

  const space = " ".repeat(5);
  const body = await response.json();
  const { status, code } = body;

  if (!status) return;

  let userData = "";

  try {
    userData = await Deno.readTextFile(dbPath);
  } catch {
    //
  }

  console.log(yellow(space + "updating......."));
  await install(code, "..");

  try {
    Deno.writeTextFile(dbPath, userData);
  } catch {
    //
  }

  printCompletedMessage(space);
};

update();
