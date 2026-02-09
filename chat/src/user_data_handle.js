export class dataHandler {
  #db;
  #name;

  constructor(db) {
    this.#db = db;
  }

  getAllMyContacts = () => {
    return Object.keys(this.#db).map((id) => {
      let name = this.#db[id].name || "unknown";
      if (this.#db[id].message.isNew) name = green(name);
      return [id, name];
    });
  };

  createNewUser(id, name) {
    this.#db[id] = { name, message: { messages: [], isNew: false } };
  }

  setReadMessage(id, status = false) {
    this.#db[id].message.isNew = status;
  }

  getUserName(id) {
    return this.#db[id].name;
  }

  getMessage(id) {
    return this.#db[id].message.messages;
  }

  saveName(id, name) {
    this.#db[id].name = name;
  }

  addMessage(id, message) {
    if (typeof message === "string") {
      message = [message];
    }

    this.#db[id].message.messages.push(...message);
  }

  isValidUser(id) {
    return id in this.#db;
  }

  setName(name) {
    this.#name = name;
  }

  getName() {
    return this.#name;
  }
}
