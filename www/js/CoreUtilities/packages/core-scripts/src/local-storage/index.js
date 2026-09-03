class LocalStorageService {
  STORAGE_STATS_LAST_LOGGED = "Roblox.LocalStorage.StatsLastLogged";
  ONE_DAY_MS = 24 * 60 * 60 * 1000;
  // TODO: old, migrated code
  // eslint-disable-next-line class-methods-use-this
  getUserKey(userId) {
    return `user_${userId}`;
  }

  // TODO: old, migrated code
  // eslint-disable-next-line class-methods-use-this
  storage() {
    const { LocalStorage } = window.Roblox;
    if (LocalStorage) {
      return LocalStorage.isAvailable();
    }
    return localStorage;
  }

  getLength() {
    if (this.storage()) {
      return localStorage.length;
    }
    return 0;
  }

  getKey(i) {
    if (this.storage()) {
      return localStorage.key(i);
    }
    return "";
  }

  setLocalStorage(key, value) {
    if (this.storage()) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  getLocalStorage(key) {
    if (this.storage()) {
      return JSON.parse(localStorage.getItem(key));
    }
    return undefined;
  }

  listenLocalStorage(handlerCallback) {
    if (this.storage() && typeof handlerCallback !== "undefined") {
      if (window.addEventListener) {
        // Normal browsers
        window.addEventListener("storage", handlerCallback, false);
      } else {
        // for IE (why make your life more difficult)
        window.attachEvent("onstorage", handlerCallback);
      }
    }
  }

  removeLocalStorage(key) {
    if (this.storage()) {
      localStorage.removeItem(key);
    }
  }

  saveDataByTimeStamp(key, data, expirationMS) {
    const currentTime = new Date().getTime();
    const existingData = this.getLocalStorage(key) ?? {};
    existingData.data = data;
    existingData.timeStamp = currentTime;
    if (expirationMS) {
      existingData.expirationMS = expirationMS;
    }
    this.setLocalStorage(key, existingData);
  }

  fetchNonExpiredCachedData(key, expirationMS) {
    const currentTimeStamp = new Date().getTime();
    const cachedData = this.getLocalStorage(key);
    if (cachedData && cachedData.timeStamp) {
      const cachedTimeStamp = cachedData.timeStamp;
      const expiration = cachedData.expirationMS || expirationMS || 30000; // default is 30s
      if (currentTimeStamp - cachedTimeStamp < expiration) {
        return cachedData;
      }
      // if cache is expired, remove it from localstorage
      this.removeLocalStorage(key);
    }
    return null;
  }

  updateDailyStorageUsage() {
    try {
      let totalSize = 0;
      const len = this.getLength();
      for (let i = 0; i < len; i += 1) {
        const key = this.getKey(i);
        const value = localStorage.getItem(key) ?? "";
        totalSize += key.length + value.length;
      }

      const eventStream = window?.Roblox?.EventStream;
      if (!eventStream?.SendEventWithTarget) return;

      eventStream.SendEventWithTarget(
        "localStorage2Usage",
        "localStorage2",
        {
          timestamp: new Date().toISOString(),
          totalSize,
          itemCount: len,
        },
        eventStream.TargetTypes?.WWW ?? eventStream.TargetTypes?.DEFAULT,
      );

      this.saveDataByTimeStamp(this.STORAGE_STATS_LAST_LOGGED, "success");
    } catch {
      // ignore telemetry errors
    }
  }

  cleanUpExpiredData() {
    this.storage()
      .keys()
      .forEach(key => {
        const cached = this.getLocalStorage(key);
        if (
          cached &&
          cached.timeStamp &&
          cached.expirationMS != null &&
          Date.now() - cached.timeStamp >= cached.expirationMS
        ) {
          this.removeLocalStorage(key);
        }
      });
  }

  updateLocalStorageUsage() {
    if (!this.storage()) return;
    const cached = this.fetchNonExpiredCachedData(this.STORAGE_STATS_LAST_LOGGED, this.ONE_DAY_MS);
    if (!cached) {
      this.cleanUpExpiredData();
      this.updateDailyStorageUsage();
    }
  }
}

export default new LocalStorageService();
