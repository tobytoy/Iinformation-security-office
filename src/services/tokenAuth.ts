const GOOGLE_SHEET_CSV_URL = import.meta.env.VITE_GOOGLE_SHEET_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1QK15YwFcE1ZGuC_AJkA0C86VydRmLtWtEOap73zRlps/export?format=csv';

const LOCAL_STORAGE_TOKEN_KEY = 'sec_exchange_auth_token';
// ⚠️ No hardcoded fallback tokens in production build.
// All valid tokens must be set in the Google Sheet.

export interface TokenValidationResult {
  success: boolean;
  message: string;
  source?: 'google_sheet' | 'fallback';
}

export async function fetchValidTokensFromSheet(): Promise<string[]> {
  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv,text/plain,*/*'
      }
    });

    let sheetTokens: string[] = [];
    if (response.ok) {
      const text = await response.text();
      sheetTokens = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .flatMap(line => line.split(',').map(item => item.trim().replace(/^"|"$/g, '')))
        .filter(token => token.length > 0 && token.toLowerCase() !== 'token'); // Filter out header row
    }

    return sheetTokens;
  } catch (error) {
    // Return empty array on failure — do NOT fall back to hardcoded tokens in production
    console.warn('Failed to fetch tokens from Google Sheet:', error);
    return [];
  }
}

export async function validateToken(inputToken: string): Promise<TokenValidationResult> {
  const cleanInput = inputToken.trim();
  if (!cleanInput) {
    return { success: false, message: '請輸入 Token' };
  }

  const validTokens = await fetchValidTokensFromSheet();
  
  // Check exact or case-insensitive match
  const isValid = validTokens.some(t => t === cleanInput || t.toLowerCase() === cleanInput.toLowerCase());

  if (isValid) {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, cleanInput);
    return { 
      success: true, 
      message: 'Token 驗證成功！'
    };
  }

  return { success: false, message: 'Token 無效，請檢查 Google Sheet 授權清單後再試' };
}

export function getSavedToken(): string | null {
  return localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
}

export function logoutToken(): void {
  localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
}
