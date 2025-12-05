const API_URL: string = 'http://localhost:3000';

export default class UserProgressAPI {
  public static async fetch(method: string, route: string, body?: BodyInit): Promise<any> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    let response: Response;
    try {
      response = await fetch(`${API_URL}${route}`, {
        method,
        headers,
        body,
      });
    } catch (networkError) {
      console.error('Fetch network error:', networkError);
      return null;
    }
    return response;
  }
}
