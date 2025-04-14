
interface PaginationResult<T> {
    items: T[];
    currentPage: number;
    // pageSize: number;
    totalRecords: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Function to paginate an array
function paginateArray<T>(
    array: T[],
    page: number,
    pageSize: number
): PaginationResult<T> {
    // Validate inputs
    if (page < 1) throw new Error('Page must be >= 1');
    if (pageSize < 1) throw new Error('Page size must be >= 1');

    // Calculate start and end indices
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    // Slice the array to get paginated items
    const items = array.slice(start, end);

    // Calculate total items and pages
    const totalRecords = array.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

    // Determine if there are next and previous pages
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
        items,
        currentPage: page,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
        totalRecords,
        totalPages,
        hasNext,
        hasPrev,
    };
}
