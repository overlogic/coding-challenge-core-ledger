import { baseManager } from "../../base.manager";
import { UserEvents } from "../events/user";
import { users } from "../models";
import { UserRepository } from "../repositories/user.repository";

export const UserManager = baseManager<typeof users, UserRepository>(
  new UserRepository(),
  UserEvents
);
