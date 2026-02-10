export const requestPhoneNo = async (address, id, retrieve = fetch) => {
  const body = { task: "get_phoneNo", data: id };
  const response = await retrieve(address, {
    method: "POST",
    body: JSON.stringify(body),
  });

  console.log(response);

  const phoneNo = await response.json();
  return phoneNo;
};

export const getServerAddress = async (url, filterer = []) => {
  let webcontent;

  try {
    console.log({ url });
    webcontent = await fetch(url);
  } catch (error) {
    console.log("throwing", error.message);
    throw new Error("filed to fetch Url");
  }

  const prefix = "http://";
  const webContentsIntext = await webcontent.text();

  const ipAddress = filterer.reduce((out, reg) => {
    return out.match(reg).join("");
  }, webContentsIntext);

  return prefix + ipAddress;
};
