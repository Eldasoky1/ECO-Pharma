export interface PasswordRule {
  key: string;
  label: string;
  test: (password: string) => boolean;
}

/** Password rules — must match the backend policy in smart_eco_pharma/services/auth_service.py */
export const PASSWORD_RULES: PasswordRule[] = [
  { key: "length", label: "At least 12 characters", test: (p) => p.length >= 12 },
  { key: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { key: "lower", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { key: "digit", label: "One number", test: (p) => /[0-9]/.test(p) },
  { key: "symbol", label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export interface PasswordScore {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  missing: PasswordRule[];
  meetsAll: boolean;
}

function evaluate(pw: string): PasswordScore {
  const passed = PASSWORD_RULES.filter((r) => r.test(pw));
  const missing = PASSWORD_RULES.filter((r) => !r.test(pw));
  let score: PasswordScore["score"] = 0;
  if (passed.length >= 5) score = 4;
  else if (passed.length >= 4) score = 3;
  else if (passed.length >= 3) score = 2;
  else if (passed.length >= 2) score = 1;

  const label = pw.length === 0 ? "" : score >= 4 ? "Very strong" : score === 3 ? "Strong" : score === 2 ? "Fair" : score === 1 ? "Weak" : "Very weak";
  return { score, label, missing, meetsAll: missing.length === 0 && pw.length >= 12 };
}

export function evaluatePassword(pw: string): PasswordScore {
  return evaluate(pw);
}