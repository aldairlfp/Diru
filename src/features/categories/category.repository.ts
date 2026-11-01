import type { SQLiteDatabase } from "expo-sqlite";
import { DEFAULT_CATEGORIES } from "./category.defaults";
import type { Category, CategoryType } from "./category.types";

type CategoryRow = {
  id: string;
  name: string;
  type: CategoryType;
  icon: string | null;
};

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    icon: row.icon ?? undefined,
  };
}

export class CategoryRepository {
  constructor(private db: SQLiteDatabase) {}

  async getAll(): Promise<Category[]> {
    const rows = await this.db.getAllAsync<CategoryRow>(
      "SELECT * FROM categories ORDER BY rowid",
    );
    return rows.map(toCategory);
  }

  async create(category: Category): Promise<void> {
    await this.db.runAsync(
      "INSERT INTO categories (id, name, type, icon) VALUES (?, ?, ?, ?)",
      [category.id, category.name, category.type, category.icon ?? null],
    );
  }

  // Foreign keys are enforced, so transactions must be detached first.
  async delete(id: string): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        "UPDATE transactions SET category_id = NULL WHERE category_id = ?",
        [id],
      );
      await this.db.runAsync("DELETE FROM categories WHERE id = ?", [id]);
    });
  }

  async deleteAll(): Promise<void> {
    await this.db.runAsync("DELETE FROM categories");
  }

  async seedDefaults(): Promise<void> {
    for (const category of DEFAULT_CATEGORIES) {
      await this.db.runAsync(
        "INSERT OR IGNORE INTO categories (id, name, type, icon) VALUES (?, ?, ?, ?)",
        [category.id, category.name, category.type, category.icon ?? null],
      );
    }
  }
}