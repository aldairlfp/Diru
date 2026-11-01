import type { CategoryRepository } from "./category.repository";
import type { Category, CategoryType } from "./category.types";

const MAX_NAME_LENGTH = 24;

export class CategoryService {
  constructor(private repo: CategoryRepository) {}

  async getAll(): Promise<Category[]> {
    return this.repo.getAll();
  }

  async create(input: { name: string; type: CategoryType }): Promise<void> {
    const name = input.name.trim();

    if (!name) {
      throw new Error("Category name is required.");
    }
    if (name.length > MAX_NAME_LENGTH) {
      throw new Error(`Keep the name under ${MAX_NAME_LENGTH} characters.`);
    }

    const existing = await this.repo.getAll();
    const duplicate = existing.some(
      (category) =>
        category.type === input.type &&
        category.name.toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      throw new Error(`"${name}" already exists in ${input.type} categories.`);
    }

    await this.repo.create({
      id: Date.now().toString(),
      name,
      type: input.type,
    });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
