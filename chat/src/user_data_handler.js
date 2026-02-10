const green = (text) => `\x1b[32m${text}\x1b[0m`;
import { DatabaseSync } from "node:sqlite";

export class dataHandler {
  #db;
  #dbSqlite;
  #name;
  #id;
  #DBPath;

  #initDb() {
    const db = new DatabaseSync("chat.db");
    this.#dbSqlite = db;
  }

  createTables() {
    // id|name|phone|isNew|
    const queryForCreateUser = `
      CREATE TABLE IF NOT EXISTS user(
        id INTEGER PRIMARY KEY,
        name TEXT,
        phone TEXT,
        isNew BOOLEAN
      );
    `;

    // contact_id|message|
    const queryForCreateMessage = `
      CREATE TABLE IF NOT EXISTS message(
        contact_id INTEGER, 
        message TEXT,
        CONSTRAINT message_constraint
        FOREIGN KEY (contact_id)
        REFERENCES user(id)
      );
    `;

    // id|name|phone
    const queryForCreateProfile = `
      CREATE TABLE IF NOT EXISTS user(
        id INTEGER PRIMARY KEY,
        name TEXT,
        phone TEXT
      );
    `;

    this.#dbSqlite.exec(queryForCreateUser);
    this.#dbSqlite.exec(queryForCreateMessage);
    this.#dbSqlite.exec(queryForCreateProfile);
  }

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
    // return Object.keys(this.#db).filter((id) => id !== "userDetails").map(
    //   (id) => {
    //     let name = this.#db[id].name || "unknown";
    //     if (this.#db[id].message.isNew) name = green(name);
    //     return [id, name];
    //   },
    // );
    return this.#dbSqlite.prepare(`SELECT id, name FROM user;`).all();
  }

  createNewUser(id, name) {
    this.#db[id] = { name, message: { messages: [], isNew: false } };
    this.saveDB();
  }

  setReadMessage(id, status = false) {
    this.#db[id].message.isNew = status;
    this.saveDB();
  }

  getUserName(id) {
    return this.#dbSqlite.prepare(`SELECT name FROM user WHERE id = ?;`).run(
      id,
    );
    // return this.#db[id].name;
  }

  getMessage(id) {
    return this.#dbSqlite.prepare(`SELECT message FROM message WHERE id = ?;`)
      .run(id);
    // return this.#db[id].message.messages;
  }

  saveName(id, name) {
    this.#dbSqlite.prepare(`UPDATE user SET name = ? WHERE id = ?;`)
      .run(name, id);
    // this.#db[id].name = name;
    // this.saveDB();
  }

  addMessage(id, message) {
    if (typeof message === "string") {
      message = [message];
    }

    this.#dbSqlite.prepare(`INSERT INTO message (id, message) VALUES (?, ?);`)
      .run(id, message);
    // this.#db[id].message.messages.push(...message);
    // this.saveDB();
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
    this.#dbSqlite.prepare(`UPDATE user SET phone = ? WHERE id = ?;`).run(
      phoneNo,
      this.#id,
    ); // what is
    // this.#db.userDetails.phoneNo = phoneNo;
    // this.saveDB();
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
