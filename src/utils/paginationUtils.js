/**
 * Pagination utilities for the blog list.
 * Requirements: 9.6, Property 28
 */

/**
 * @param {Array} items
 * @param {number} page - 1-based page number
 * @param {number} [perPage=12]
 */
export function paginate(items, page, perPage = 12) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const offset = (currentPage - 1) * perPage;

  return {
    items: items.slice(offset, offset + perPage),
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage: perPage,
  };
}

export default paginate;
