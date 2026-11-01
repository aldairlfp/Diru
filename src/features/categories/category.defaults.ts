import type { Category } from "./category.types";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-food", name: "Food", type: "expense", icon: "🍽️" },
  { id: "cat-transport", name: "Transport", type: "expense", icon: "🚌" },
  { id: "cat-home", name: "Home", type: "expense", icon: "🏠" },
  { id: "cat-bills", name: "Bills", type: "expense", icon: "🧾" },
  { id: "cat-health", name: "Health", type: "expense", icon: "💊" },
  { id: "cat-shopping", name: "Shopping", type: "expense", icon: "🛍️" },
  { id: "cat-fun", name: "Entertainment", type: "expense", icon: "🎬" },
  { id: "cat-other-expense", name: "Other", type: "expense", icon: "📦" },
  { id: "cat-salary", name: "Salary", type: "income", icon: "💼" },
  { id: "cat-freelance", name: "Freelance", type: "income", icon: "💻" },
  { id: "cat-gift", name: "Gift", type: "income", icon: "🎁" },
  { id: "cat-other-income", name: "Other", type: "income", icon: "📦" },
];
