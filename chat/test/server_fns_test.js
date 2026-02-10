import { assertEquals, assertRejects, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { getServerAddress, requestPhoneNo } from "../src/server_fns.js";

describe("test server Fns", () => {
  describe("Get server address", () => {
    const url =
      "https://github.com/ibrahim-thoughtworks/chatroom/blob/main/ip.json";
    const ipFilterer = [/"serverAddress\\":\\"[^}]*/g, /\d[\d.:]*/g];

    it("should give the address", async () => {
      assertEquals(
        await getServerAddress(url, ipFilterer),
        "http://10.132.125.223:2307",
      );
    });

    it("if url is wrong throws error", async () => {
      await assertRejects(async () => {
        await getServerAddress("123", ipFilterer);
      });
    });
  });

  describe("reqeust Phone no", () => {
    it("should return phone no", async () => {
      //
      const fakeFetch = () => {
        return {
          "phone": 9656891128,
          json() {
            return this.phone;
          },
        };
      };

      assertEquals(
        await requestPhoneNo("address", "id", fakeFetch),
        9656891128,
      );
    });
  });
});
