/**
 * Category type definition
 */
export interface Category {
  id: string;      // Unique identifier for the category
  name: string;    // Display name for the category
  slug: string;    // URL-friendly version of the name
  description?: string; // Optional description of the category
  parentId?: string;    // Optional parent category id for hierarchical categories
}

/**
 * Available product categories
 */
export const CATEGORIES: Category[] = [
  {
    id: 'all',
    name: 'Todos',
    slug: 'all',
    description: 'Todos los productos'
  },
  {
    id: 'hombre',
    name: 'Hombres',
    slug: 'hombre',
    description: 'Ropa y accesorios para hombres'
  },
  {
    id: 'mujer',
    name: 'Mujeres',
    slug: 'mujer',
    description: 'Ropa y accesorios para mujeres'
  },
  {
    id: 'niños',
    name: 'Niños',
    slug: 'niños',
    description: 'Ropa y accesorios para niños'
  },
  {
    id: 'hogar',
    name: 'Hogar',
    slug: 'hogar',
    description: 'Productos sostenibles para el hogar'
  },
  {
    id: 'accesorios',
    name: 'Accesorios',
    slug: 'accesorios',
    description: 'Accesorios de moda sostenible'
  }
];

/**
 * Get a category by its ID
 */
export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(category => category.id === id);
}

/**
 * Get a category by its slug
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(category => category.slug === slug);
}