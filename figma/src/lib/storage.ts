import { User, Beehive } from '../types';
import { mockUsers, mockBeehives } from './mock-data';

const STORAGE_KEYS = {
  USER: 'kbee_current_user',
  BEEHIVES: 'kbee_beehives',
  SETUP_COMPLETE: 'kbee_setup_complete',
};

export const storage = {
  // User methods
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  // Beehive methods
  getBeehives(): Beehive[] {
    const hivesJson = localStorage.getItem(STORAGE_KEYS.BEEHIVES);
    if (hivesJson) {
      return JSON.parse(hivesJson);
    }
    // Initialize with mock data
    this.setBeehives(mockBeehives);
    return mockBeehives;
  },

  setBeehives(beehives: Beehive[]): void {
    localStorage.setItem(STORAGE_KEYS.BEEHIVES, JSON.stringify(beehives));
  },

  addBeehive(beehive: Beehive): void {
    const beehives = this.getBeehives();
    beehives.push(beehive);
    this.setBeehives(beehives);
  },

  updateBeehive(serialNumber: string, updates: Partial<Beehive>): void {
    const beehives = this.getBeehives();
    const index = beehives.findIndex(b => b.serial_number === serialNumber);
    if (index !== -1) {
      beehives[index] = { ...beehives[index], ...updates, updated_at: new Date().toISOString() };
      this.setBeehives(beehives);
    }
  },

  deleteBeehive(serialNumber: string): void {
    const beehives = this.getBeehives();
    const filtered = beehives.filter(b => b.serial_number !== serialNumber);
    this.setBeehives(filtered);
  },

  getBeehiveBySerial(serialNumber: string): Beehive | null {
    const beehives = this.getBeehives();
    return beehives.find(b => b.serial_number === serialNumber) || null;
  },

  getBeehiveByToken(token: string): Beehive | null {
    const beehives = this.getBeehives();
    return beehives.find(b => b.qr_token === token) || null;
  },

  // Setup methods
  isSetupComplete(): boolean {
    return localStorage.getItem(STORAGE_KEYS.SETUP_COMPLETE) === 'true';
  },

  setSetupComplete(complete: boolean): void {
    localStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, String(complete));
  },

  // Auth methods
  login(username: string, password: string): User | null {
    // Mock authentication - in real app this would call API
    const user = mockUsers.find(u => u.username === username);
    if (user && password === 'admin123') {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  },

  logout(): void {
    this.setCurrentUser(null);
  },

  updateUser(updates: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.setCurrentUser(updatedUser);
    }
  },
};
