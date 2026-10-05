export type Palette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  borderStrong: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  placeholder: string;

  primary: string;
  onPrimary: string;
  primarySurface: string;
  onPrimarySurface: string;
  primaryBorder: string;

  danger: string;
  dangerSurface: string;
  dangerBorder: string;

  income: string;
  incomeSurface: string;
  expense: string;
  expenseSurface: string;

  typeMarkBackground: string;
  typeMarkText: string;
  archiveButtonBackground: string;
  archiveButtonText: string;

  summary: string;
  onSummary: string;
  onSummaryMuted: string;
};

export const lightColors: Palette = {
  background: "#f3f6f4",
  surface: "#ffffff",
  surfaceMuted: "#f8faf9",
  border: "#e1e8e4",
  borderStrong: "#d8e1dc",

  textPrimary: "#182522",
  textSecondary: "#53625b",
  textMuted: "#77847d",
  placeholder: "#929b98",

  primary: "#176c4c",
  onPrimary: "#ffffff",
  primarySurface: "#e8f2ed",
  onPrimarySurface: "#16583f",
  primaryBorder: "#bfdccc",

  danger: "#a33d32",
  dangerSurface: "#fff0ed",
  dangerBorder: "#edc2bd",

  income: "#167253",
  incomeSurface: "#e8f5ee",
  expense: "#ba4b42",
  expenseSurface: "#fff0ed",

  typeMarkBackground: "#e8f2ed",
  typeMarkText: "#176c4c",
  archiveButtonBackground: "#fff0ed",
  archiveButtonText: "#a33d32",

  summary: "#174f3b",
  onSummary: "#ffffff",
  onSummaryMuted: "#c6ded2",
};

export const darkColors: Palette = {
  background: "#0e1512",
  surface: "#16201b",
  surfaceMuted: "#1c2823",
  border: "#26352e",
  borderStrong: "#33463d",

  textPrimary: "#e7efe9",
  textSecondary: "#a9b8b0",
  textMuted: "#7f9188",
  placeholder: "#6b7c73",

  primary: "#4cc795",
  onPrimary: "#06130d",
  primarySurface: "#1a3a2d",
  onPrimarySurface: "#a6e3c6",
  primaryBorder: "#2c5a46",

  danger: "#f08a7e",
  dangerSurface: "#3a1f1c",
  dangerBorder: "#6b3a35",

  income: "#4cc795",
  incomeSurface: "#1a3a2d",
  expense: "#f08a7e",
  expenseSurface: "#3a1f1c",

  typeMarkBackground: "#1a3a2d",
  typeMarkText: "#4cc795",
  archiveButtonBackground: "#3a1f1c",
  archiveButtonText: "#f08a7e",

  summary: "#174f3b",
  onSummary: "#ffffff",
  onSummaryMuted: "#c6ded2",
};
