import { expect, it, describe } from "vitest";
import { Api } from "sst/node/api";
import { User } from "../models";

describe("User", { timeout: 30000 }, () => {
  it("should create", async () => {
    const firstName = "John";
    const response = await fetch(`${Api.api.url}/user`, {
      method: "POST",
      body: JSON.stringify({
        firstName,
        lastName: "Perkins",
      }),
    });
    // Check the newly created user exists
    expect(response.status).toBe(200);
    const user = (await response.json()) as User;
    expect(user.firstName).toBe(firstName);

    const getUserResponse = await fetch(`${Api.api.url}/user/${user.id}`, {
      method: "GET",
    });

    expect(getUserResponse.status).toBe(200);
    const getUser = (await getUserResponse.json()) as User;
    expect(getUser.firstName).toBe(firstName);
  });
});
