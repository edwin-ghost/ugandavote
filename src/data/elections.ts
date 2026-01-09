import { Constituency } from '@/types';

// ============================================================================
// CONSTITUENCIES
// ============================================================================
// Constituencies data - available for use in dropdowns, filters, etc.
export const constituencies: Constituency[] = [
  { id: 'national', name: 'National', type: 'national' },
  { id: 'central', name: 'Central Region', type: 'region' },
  { id: 'eastern', name: 'Eastern Region', type: 'region' },
  { id: 'northern', name: 'Northern Region', type: 'region' },
  { id: 'western', name: 'Western Region', type: 'region' },
  { id: 'kampala', name: 'Kampala District', type: 'district' },
  { id: 'wakiso', name: 'Wakiso District', type: 'district' },
  { id: 'jinja', name: 'Jinja District', type: 'district' },
  { id: 'gulu', name: 'Gulu District', type: 'district' },
  { id: 'mbarara', name: 'Mbarara District', type: 'district' },
];

// ============================================================================
// ELECTION TYPES
// ============================================================================
// Election types helper - useful for dropdowns in admin panel
export const electionTypes = [
  { value: 'presidential', label: 'Presidential' },
  { value: 'parliamentary', label: 'Parliamentary' },
  { value: 'gubernatorial', label: 'Gubernatorial' },
  { value: 'special', label: 'Special Seats' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get constituency name by ID
 * @param id - Constituency ID
 * @returns Constituency name or the ID if not found
 * 
 * @example
 * getConstituencyName('kampala') // Returns "Kampala District"
 * getConstituencyName('unknown') // Returns "unknown"
 */
export const getConstituencyName = (id: string): string => {
  const constituency = constituencies.find(c => c.id === id);
  return constituency?.name || id;
};

/**
 * Get election type label
 * @param type - Election type value
 * @returns Human-readable label or the type if not found
 * 
 * @example
 * getElectionTypeLabel('presidential') // Returns "Presidential"
 * getElectionTypeLabel('unknown') // Returns "unknown"
 */
export const getElectionTypeLabel = (type: string): string => {
  const electionType = electionTypes.find(t => t.value === type);
  return electionType?.label || type;
};

/**
 * Get constituencies by type
 * @param type - Type of constituency ('national', 'region', 'district')
 * @returns Array of constituencies matching the type
 * 
 * @example
 * getConstituenciesByType('region') // Returns all regional constituencies
 */
export const getConstituenciesByType = (type: 'national' | 'region' | 'district'): Constituency[] => {
  return constituencies.filter(c => c.type === type);
};

/**
 * Check if a constituency exists
 * @param id - Constituency ID to check
 * @returns True if constituency exists
 */
export const constituencyExists = (id: string): boolean => {
  return constituencies.some(c => c.id === id);
};