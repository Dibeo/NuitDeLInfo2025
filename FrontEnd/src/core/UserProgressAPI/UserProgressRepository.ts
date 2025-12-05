import UserProgressAPI from './UserProgressAPI';

export interface User {
  id: string;
  name: string;
  xp: number;
}

export default class UserProgressRepository {
  public static getUniqueId(): string {
    const STORAGE_KEY = 'temp_guest_id';
    let guestId = localStorage.getItem(STORAGE_KEY);
    if (!guestId) {
      guestId = self.crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, guestId);
    }
    return guestId;
  }

  public static async getAll(): Promise<Array<User>> {
    const response: Response = await UserProgressAPI.fetch('GET', `/xp/all`);
    const data: any = await response.json();
    return data;
  }

  public static async getXp(): Promise<number> {
    const guestId = this.getUniqueId();
    const response: Response = await UserProgressAPI.fetch('GET', `/xp/${guestId}`);
    const data: any = await response.json();
    return data.xp;
  }

  public static async addXp(amount: number): Promise<number> {
    const guestId = this.getUniqueId();
    const body: BodyInit = JSON.stringify({ userId: guestId, amount });
    const response: Response = await UserProgressAPI.fetch('POST', `/xp`, body);
    const data: any = await response.json();
    return data.currentXp;
  }

  public static async resetXp(): Promise<void> {
    const guestId = this.getUniqueId();
    await UserProgressAPI.fetch('DELETE', `/xp/${guestId}`);
  }
}
