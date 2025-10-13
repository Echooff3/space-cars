
type Persistence = {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
};

export const persistence: Persistence = {
  setItem(key, value) {
    return Promise.resolve(window.localStorage.setItem(key, value));
  },
  getItem(key) {
    return Promise.resolve(window.localStorage.getItem(key));
  },
  removeItem(key) {
    return Promise.resolve(window.localStorage.removeItem(key));
  },
  clear() {
    return Promise.resolve(window.localStorage.clear());
  }
};
