import names from "./names.json";

export default class {
    public static getName(guestId: string): string {
        return names[this.idToIndex(guestId)].name;
    }

    private static idToIndex(id: string): number {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = (hash << 5) - hash + id.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash) % names.length;
    }
}
