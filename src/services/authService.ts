// src/services/authService.ts
interface AuthState {
  isAuthenticated: boolean;
  pubkey: string | null;
  npub: string | null;
  modalDismissed: boolean;
  lastChecked: number;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState | null = null;
  private readonly SESSION_KEY = 'meetstr_auth_state';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private constructor() {
    this.loadFromSession();
  }

  private loadFromSession(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = sessionStorage.getItem(this.SESSION_KEY);
      if (stored) {
        this.authState = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load auth state from session:', error);
      this.authState = null;
    }
  }

  private saveToSession(): void {
    if (typeof window === 'undefined' || !this.authState) return;
    
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(this.authState));
    } catch (error) {
      console.warn('Failed to save auth state to session:', error);
    }
  }

  private isStateFresh(): boolean {
    if (!this.authState) return false;
    return (Date.now() - this.authState.lastChecked) < this.CACHE_DURATION;
  }

  /**
   * Check if user is authenticated without triggering modal
   * Returns cached state if fresh, otherwise checks window.nostr availability
   */
  async isAuthenticated(): Promise<boolean> {
    // Return cached state if fresh
    if (this.authState && this.isStateFresh()) {
      return this.authState.isAuthenticated;
    }

    // Check if window.nostr is available without calling getPublicKey
    const hasNostr = typeof window !== 'undefined' && !!window.nostr;
    
    if (!hasNostr) {
      this.authState = {
        isAuthenticated: false,
        pubkey: null,
        npub: null,
        modalDismissed: false,
        lastChecked: Date.now(),
      };
      this.saveToSession();
      return false;
    }

    // If we had a previous authentication and window.nostr exists, assume still authenticated
    if (this.authState?.isAuthenticated && this.authState.pubkey) {
      this.authState.lastChecked = Date.now();
      this.saveToSession();
      return true;
    }

    return false;
  }

  /**
   * Get user info without triggering modal (returns cached data)
   */
  getUserInfo(): { pubkey: string; npub: string } | null {
    if (this.authState?.isAuthenticated && this.authState.pubkey && this.authState.npub) {
      return {
        pubkey: this.authState.pubkey,
        npub: this.authState.npub,
      };
    }
    return null;
  }

  /**
   * Check if user owns an event/calendar without triggering modal
   */
  isOwner(pubkey: string): boolean {
    const userInfo = this.getUserInfo();
    return userInfo?.pubkey === pubkey;
  }

  /**
   * Force authentication check by calling window.nostr.getPublicKey()
   * This WILL trigger the modal if not authenticated
   */
  async authenticate(): Promise<{ pubkey: string; npub: string } | null> {
    if (typeof window === 'undefined' || !window.nostr) {
      throw new Error('Nostr extension not available');
    }

    try {
      const pubkey = await window.nostr.getPublicKey();
      
      if (pubkey) {
        const { nip19 } = await import('nostr-tools');
        const npub = nip19.npubEncode(pubkey);
        
        this.authState = {
          isAuthenticated: true,
          pubkey,
          npub,
          modalDismissed: false,
          lastChecked: Date.now(),
        };
        this.saveToSession();
        
        return { pubkey, npub };
      }
    } catch (error) {
      console.warn('Authentication failed:', error);
      this.markModalDismissed();
    }
    
    return null;
  }

  /**
   * Sign an event - requires authentication
   */
  async signEvent(unsignedEvent: any): Promise<any> {
    if (typeof window === 'undefined' || !window.nostr) {
      throw new Error('Nostr extension not available');
    }

    // Ensure we're authenticated first
    const userInfo = await this.authenticate();
    if (!userInfo) {
      throw new Error('Authentication required for signing');
    }

    // Ensure pubkey matches
    unsignedEvent.pubkey = userInfo.pubkey;
    
    return await window.nostr.signEvent(unsignedEvent);
  }

  /**
   * Mark that user dismissed the modal to prevent repeated attempts
   */
  markModalDismissed(): void {
    if (!this.authState) {
      this.authState = {
        isAuthenticated: false,
        pubkey: null,
        npub: null,
        modalDismissed: true,
        lastChecked: Date.now(),
      };
    } else {
      this.authState.modalDismissed = true;
      this.authState.lastChecked = Date.now();
    }
    this.saveToSession();
  }

  /**
   * Check if modal was dismissed in this session
   */
  wasModalDismissed(): boolean {
    return this.authState?.modalDismissed ?? false;
  }

  /**
   * Clear authentication state (for logout)
   */
  logout(): void {
    this.authState = {
      isAuthenticated: false,
      pubkey: null,
      npub: null,
      modalDismissed: false,
      lastChecked: Date.now(),
    };
    this.saveToSession();
  }

  /**
   * Refresh authentication state (call after nostr-login events)
   */
  async refreshAuthState(): Promise<void> {
    // Clear cached state to force fresh check
    this.authState = null;
    
    // Try to authenticate without triggering modal if possible
    const hasNostr = typeof window !== 'undefined' && !!window.nostr;
    if (hasNostr) {
      try {
        // Only call getPublicKey if we believe user is logged in (nostr-login event)
        const pubkey = await window.nostr!.getPublicKey();
        if (pubkey) {
          const { nip19 } = await import('nostr-tools');
          const npub = nip19.npubEncode(pubkey);
          
          this.authState = {
            isAuthenticated: true,
            pubkey,
            npub,
            modalDismissed: false,
            lastChecked: Date.now(),
          };
          this.saveToSession();
        }
      } catch (error) {
        // If getPublicKey fails, user is not authenticated
        this.logout();
      }
    } else {
      this.logout();
    }
  }
}

export const authService = AuthService.getInstance();