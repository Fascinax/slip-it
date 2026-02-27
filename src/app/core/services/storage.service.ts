import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

/** Wrapper around Ionic Storage (SQLite via Capacitor).
 *  Provides type-safe async get/set/remove operations. */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private _initialized = false;

  constructor(private storage: Storage) {}

  async init(): Promise<void> {
    if (!this._initialized) {
      await this.storage.create();
      this._initialized = true;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    await this.init();
    return this.storage.get(key);
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.init();
    await this.storage.set(key, value);
  }

  async remove(key: string): Promise<void> {
    await this.init();
    await this.storage.remove(key);
  }

  async clear(): Promise<void> {
    await this.init();
    await this.storage.clear();
  }
}
