export default class LocalStorageCache {
  id;
  constructor(id:string) {
    this.id = id;
  }

  set(data:object) {
    window.localStorage.setItem(this.id, JSON.stringify(data));
  }

  get() {
    const cachedData = window.localStorage.getItem(this.id);
    return cachedData && JSON.parse(cachedData);
  }
}
