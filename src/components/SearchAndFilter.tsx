// src/components/SearchAndFilter.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { debounce } from '@/lib/utils';
import { REGIONS, TOURNAMENT_STATUSES } from '@/lib/constants';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  prizeFilter: number | '';
  onPrizeFilterChange: (prize: number | '') => void;
  dateFilter: string;
  onDateFilterChange: (date: string) => void;
  regionFilter: string;
  onRegionFilterChange: (region: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onResetFilters: () => void;
  resultCount?: number;
  placeholder?: string;
}

export default function SearchAndFilter({
  searchQuery,
  onSearchChange,
  prizeFilter,
  onPrizeFilterChange,
  dateFilter,
  onDateFilterChange,
  regionFilter,
  onRegionFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onResetFilters,
  resultCount,
  placeholder = "Search tournaments..."
}: SearchAndFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounced search to avoid excessive API calls
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearchChange(query);
    }, 300),
    [onSearchChange]
  );

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    debouncedSearch(value);
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      searchQuery ||
      prizeFilter ||
      dateFilter ||
      regionFilter !== 'All' ||
      statusFilter !== 'All'
    );
  }, [searchQuery, prizeFilter, dateFilter, regionFilter, statusFilter]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (prizeFilter) count++;
    if (dateFilter) count++;
    if (regionFilter !== 'All') count++;
    if (statusFilter !== 'All') count++;
    return count;
  }, [searchQuery, prizeFilter, dateFilter, regionFilter, statusFilter]);

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 sm:p-6 mb-8 border border-[#2a2a2a]">
      {/* Main search and filter row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e6915b] h-5 w-5" />
          <input
            type="text"
            placeholder={placeholder}
            className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 pl-10 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0] transition-all"
            value={localSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {localSearchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#e6915b] hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* Filter Controls */}
        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`bg-[#2a2a2a] hover:bg-[#333] px-4 py-2 rounded-lg flex items-center gap-2 relative ${
              hasActiveFilters ? 'ring-2 ring-[#e6915b]' : ''
            }`}
          >
            <SlidersHorizontal className="h-5 w-5 text-[#e6915b]" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#e6915b] text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button 
              onClick={onResetFilters}
              className="bg-[#2a2a2a] hover:bg-[#333] px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <X size={16} />
              Reset
            </Button>
          )}
          
          {resultCount !== undefined && (
            <div className="flex items-center px-3 py-2 bg-[#2a2a2a] rounded-lg">
              <span className="text-sm text-[#e6915b]">
                {resultCount} result{resultCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Advanced Filters */}
      {isFilterOpen && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-[#2a2a2a] rounded-lg border border-[#333]">
          {/* Min Prize Filter */}
          <div>
            <label className="block text-[#e6915b] text-sm mb-2 font-medium">
              Min Prize Pool
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e6915b]">$</span>
              <input
                type="number"
                placeholder="0"
                className="w-full bg-[#1a1a1a] rounded-lg px-4 py-2 pl-8 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0] transition-all"
                value={prizeFilter}
                onChange={(e) => onPrizeFilterChange(e.target.value ? Number(e.target.value) : '')}
              />
            </div>
          </div>
          
          {/* Date Filter */}
          <div>
            <label className="block text-[#e6915b] text-sm mb-2 font-medium">
              Starting After
            </label>
            <input
              type="date"
              className="w-full bg-[#1a1a1a] rounded-lg px-4 py-2 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0] transition-all"
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
            />
          </div>
          
          {/* Region Filter */}
          <div>
            <label className="block text-[#e6915b] text-sm mb-2 font-medium">
              Region
            </label>
            <select
              className="w-full bg-[#1a1a1a] rounded-lg px-4 py-2 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0] transition-all"
              value={regionFilter}
              onChange={(e) => onRegionFilterChange(e.target.value)}
            >
              {REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-[#e6915b] text-sm mb-2 font-medium">
              Status
            </label>
            <select
              className="w-full bg-[#1a1a1a] rounded-lg px-4 py-2 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0] transition-all"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              {TOURNAMENT_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          {/* Sort Options */}
          <div>
            <label className="block text-[#e6915b] text-sm mb-2 font-medium">
              Sort By
            </label>
            <div className="flex gap-2">
              <select
                className="flex-1 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0] transition-all"
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
              >
                <option value="date">Date</option>
                <option value="prize">Prize</option>
                <option value="participants">Participants</option>
              </select>
              <button
                onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-[#1a1a1a] hover:bg-[#333] px-3 rounded-lg border border-[#333] transition-all"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#e6915b]/20 text-[#e6915b] rounded-full text-sm">
              Search: &quot;{searchQuery}&quot;
              <button onClick={() => onSearchChange('')}>
                <X size={14} />
              </button>
            </span>
          )}
          
          {prizeFilter && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#6b8ab0]/20 text-[#6b8ab0] rounded-full text-sm">
              Min Prize: ${prizeFilter.toLocaleString()}
              <button onClick={() => onPrizeFilterChange('')}>
                <X size={14} />
              </button>
            </span>
          )}
          
          {dateFilter && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#8a675e]/20 text-[#8a675e] rounded-full text-sm">
              After: {new Date(dateFilter).toLocaleDateString()}
              <button onClick={() => onDateFilterChange('')}>
                <X size={14} />
              </button>
            </span>
          )}
          
          {regionFilter !== 'All' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
              Region: {regionFilter}
              <button onClick={() => onRegionFilterChange('All')}>
                <X size={14} />
              </button>
            </span>
          )}
          
          {statusFilter !== 'All' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
              Status: {statusFilter}
              <button onClick={() => onStatusFilterChange('All')}>
                <X size={14} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}