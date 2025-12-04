import UserProgressAPI from './UserProgressAPI';

export default class UserProgressRepository {
  private static getUniqueId(): string {
    const STORAGE_KEY = 'temp_guest_id';
    let guestId = localStorage.getItem(STORAGE_KEY);
    if (!guestId) {
      guestId = self.crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, guestId);
    }
    return guestId;
  }

  public static async getAll(): Promise<Array<{ id: string; xp: number }>> {
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
}
