import { UserEvents } from "./events/user";
import { UserRepository } from "./repositories";

export class UserService {
  constructor(private repo: UserRepository, private events: typeof UserEvents) {}

  async get(id: string) {
    return this.repo.get(id);
  }

  async create(item: { firstName: string; lastName: string }, notify: boolean = true) {
    const newUser = await this.repo.create(item);
    if (notify) await this.events.Created.publish(newUser);
    return newUser;
  }

  async update(id: string, item: { id: string; firstName: string; lastName: string }) {
    // Broadcast to events.Updated if required
    return this.repo.update(id, item);
  }
}

// TODO: Replace with a DI container in the future
export const userService = new UserService(new UserRepository(), UserEvents);
