const green = (text) => `\x1b[32m${text}\x1b[0m`;

export class dataHandler {
  #db;
  #name;
  #id;
  #DBPath;

  constructor(dbPath) {
    this.#DBPath = dbPath;

    try {
      this.#db = JSON.parse(Deno.readTextFileSync(dbPath)) ||
        { userDetails: { name: undefined, id: undefined } };
    } catch {
      console.log("error", dbPath);
      this.#db = { userDetails: { name: undefined, id: undefined } };
    }

    this.#id = this.#db.userDetails.id;
    this.#name = this.#db.userDetails.name;
  }

  saveDB() {
    Deno.writeTextFile(this.#DBPath, JSON.stringify(this.#db));
  }

  getAllMyContacts() {
    return Object.keys(this.#db).filter((id) => id !== "userDetails").map(
      (id) => {
        let name = this.#db[id].name || this.#db[id].phoneNo;
        if (this.#db[id].message.isNew) name = green(name);
        return [id, name];
      },
    );
  }

  createNewUser(id, phoneNo) {
    this.#db[id] = {
      phoneNo,
      message: { messages: [], isNew: false, name: undefined },
    };
    this.saveDB();
  }

  setReadMessage(id, status = false) {
    this.#db[id].message.isNew = status;
    this.saveDB();
  }

  getUserName(id) {
    return this.#db[id].name;
  }

  getMessage(id) {
    return this.#db[id].message.messages;
  }

  saveName(id, name) {
    this.#db[id].name = name;
    this.saveDB();
  }

  addMessage(id, message) {
    if (typeof message === "string") {
      message = [message];
    }

    this.#db[id].message.messages.push(...message);
    this.saveDB();
  }

  isValidUser(id) {
    return id in this.#db;
  }

  createAccount(name, id, phoneNo) {
    this.setName(name);
    this.setId(id);
    this.setPhoneNo(phoneNo);
  }

  setPhoneNo(phoneNo) {
    this.#db.userDetails.phoneNo = phoneNo;
    this.saveDB();
  }

  setName(name) {
    this.#name = name;
    this.#db.userDetails.name = name;
    this.saveDB();
  }

  setId(id) {
    this.#id = id;
    this.#db.userDetails.id = id;
    this.saveDB();
  }

  getName() {
    return this.#name;
  }

  getId() {
    return this.#id;
  }
}
