// Utility untuk manage user data di localStorage

export type UserData = {
  name: string;
  credits: number;
  address: string;
  lastUpdated: string;
};

const STORAGE_PREFIX = 'hooklab_user_';
const INITIAL_CREDITS = 1000;

export const userStorage = {
  // Get user data by address
  getUserData(address: string): UserData | null {
    if (typeof window === 'undefined') return null;

    const key = `${STORAGE_PREFIX}${address.toLowerCase()}`;
    const data = localStorage.getItem(key);

    if (!data) return null;

    try {
      return JSON.parse(data) as UserData;
    } catch {
      return null;
    }
  },

  // Save user data
  saveUserData(address: string, data: Partial<UserData>): void {
    if (typeof window === 'undefined') return;

    const key = `${STORAGE_PREFIX}${address.toLowerCase()}`;
    const existing = this.getUserData(address);

    const newData: UserData = {
      name: data.name ?? existing?.name ?? '',
      credits: data.credits ?? existing?.credits ?? INITIAL_CREDITS,
      address: address.toLowerCase(),
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify(newData));
  },

  // Check if user is registered
  isUserRegistered(address: string): boolean {
    const userData = this.getUserData(address);
    return userData !== null && userData.name !== '';
  },

  // Update credits
  updateCredits(address: string, newCredits: number): void {
    const userData = this.getUserData(address);
    if (!userData) return;

    this.saveUserData(address, {
      ...userData,
      credits: Math.max(0, newCredits), // Prevent negative credits
    });
  },

  // Decrease credits (for using a hook)
  decreaseCredits(address: string): boolean {
    const userData = this.getUserData(address);
    if (!userData || userData.credits <= 0) return false;

    this.updateCredits(address, userData.credits - 1);
    return true;
  },

  // Get credits
  getCredits(address: string): number {
    const userData = this.getUserData(address);
    return userData?.credits ?? INITIAL_CREDITS;
  },

  // Clear user data (for testing)
  clearUserData(address: string): void {
    if (typeof window === 'undefined') return;
    const key = `${STORAGE_PREFIX}${address.toLowerCase()}`;
    localStorage.removeItem(key);
  },
};