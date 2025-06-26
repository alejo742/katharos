/**
 * Category type definition
 */
export interface Category {
  name: string;         // Display name for the category
  slug: string;         // URL-friendly version of the name
  description?: string; // Optional description of the category
  parentId?: string;    // Optional parent category id for hierarchical categories
}

/**
 * Type for the categories object with id as key
 */
export interface CategoriesMap {
  [id: string]: Category;
}

/**
 * Available product categories
 */
export const CATEGORIES: CategoriesMap = {
  'all': {
    name: 'Todos',
    slug: 'all',
    description: 'Todos los productos'
  },
  'hombre': {
    name: 'Hombres',
    slug: 'hombre',
    description: 'Ropa y accesorios para hombres'
  },
  'mujer': {
    name: 'Mujeres',
    slug: 'mujer',
    description: 'Ropa y accesorios para mujeres'
  },
  'niños': {
    name: 'Niños',
    slug: 'niños',
    description: 'Ropa y accesorios para niños'
  },
  'hogar': {
    name: 'Hogar',
    slug: 'hogar',
    description: 'Productos sostenibles para el hogar'
  },
  'accesorios': {
    name: 'Accesorios',
    slug: 'accesorios',
    description: 'Accesorios de moda sostenible'
  }
};

/**
 * Get a category by its ID
 */
export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES[id];
}

/**
 * Get all categories as an array (for iteration)
 */
export function getAllCategories(): Array<{ id: string } & Category> {
  return Object.entries(CATEGORIES).map(([id, category]) => ({
    id,
    ...category
  }));
}

/**
 * Get a category by its slug
 */
export function getCategoryBySlug(slug: string): { id: string, category: Category } | undefined {
  const entry = Object.entries(CATEGORIES).find(([_, category]) => category.slug === slug);
  return entry ? { id: entry[0], category: entry[1] } : undefined;
}

/**
 * Get category ID from slug
 */
export function getCategoryIdFromSlug(slug: string): string | undefined {
  const entry = Object.entries(CATEGORIES).find(([_, category]) => category.slug === slug);
  return entry ? entry[0] : undefined;
}

/**
 * Get category name by ID
 */
export function getCategoryName(id: string): string {
  return CATEGORIES[id]?.name || 'Categoría Desconocida';
}