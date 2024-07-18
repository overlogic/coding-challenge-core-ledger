import { expect, it, describe, beforeAll } from "vitest";
import { Api } from "sst/node/api";
import { userService } from "../../user/services";

const getNewUserId = async (firstName = "John", lastName = "Perkins") => {
  const user = await userService.create({ firstName, lastName });
  return user.id;
};

describe("User Account API", { timeout: 30000 }, () => {
  it("zero balance", async () => {
    const testUserId = await getNewUserId();

    const getUserBalanceResponse = await fetch(`${Api.api.url}/user/${testUserId}/balance`, {
      method: "GET",
    });
    expect(getUserBalanceResponse.status).toBe(200);
    const getUserBalance = (await getUserBalanceResponse.json()) as {
      balance: number;
    };
    expect(getUserBalance.balance).toBe(0);
  });
});
