'use client'

import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  SxProps,
  Theme,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Skeleton,
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'
import { FloatingInput } from './floating-input'
import { FloatingSelect, SelectOption } from './floating-select'

// System colors from globals.css (Tailwind theme)
const SYSTEM_COLORS = {
  background: '#ffffff',
  foreground: '#374151',
  foregroundMuted: '#6b7280',
  card: '#ecfeff',
  primary: '#164e63',
  primaryForeground: '#ffffff',
  border: '#e5e7eb',
  borderHover: '#d1d5db',
  muted: '#f0fdf4',
  accent: '#84cc16',
}

// Types
export interface Column<T> {
  key: string
  header: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render?: (row: T, index: number) => React.ReactNode
  sx?: SxProps<Theme>
}

export interface Action<T> {
  label: string
  icon?: React.ReactNode
  onClick: (row: T) => void
  disabled?: (row: T) => boolean
  hidden?: (row: T) => boolean
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Filter types
export interface SelectFilter {
  key: string
  label: string
  options: SelectOption[]
  multiple?: boolean
  placeholder?: string
}

export interface SearchFilter {
  placeholder?: string
  debounceMs?: number
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T, index: number) => string | number
  actions?: Action<T>[]
  pagination?: PaginationMeta
  onPageChange?: (page: number) => void
  onRowsPerPageChange?: (rowsPerPage: number) => void
  rowsPerPageOptions?: number[]
  loading?: boolean
  emptyMessage?: string
  containerSx?: SxProps<Theme>
  tableSx?: SxProps<Theme>
  headerSx?: SxProps<Theme>
  showHeader?: boolean
  stickyHeader?: boolean
  maxHeight?: string | number
  size?: 'small' | 'medium'
  // Filters
  searchFilter?: SearchFilter
  selectFilters?: SelectFilter[]
  searchValue?: string
  onSearchChange?: (value: string) => void
  filterValues?: Record<string, string | string[]>
  onFilterChange?: (key: string, value: string | string[]) => void
  onClearFilters?: () => void
  showFilters?: boolean
  title?: string
  // Toolbar buttons
  toolbarButtons?: React.ReactNode
}

// MD3 Styled TablePagination component
function MD3TablePagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
}: {
  count: number
  page: number
  rowsPerPage: number
  onPageChange: (event: unknown, newPage: number) => void
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  rowsPerPageOptions?: number[]
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: 2,
        py: 1.5,
        borderTop: `1px solid ${SYSTEM_COLORS.border}`,
        backgroundColor: SYSTEM_COLORS.background,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: SYSTEM_COLORS.foregroundMuted,
          mr: 2,
          fontSize: '14px',
        }}
      >
        {(page - 1) * rowsPerPage + 1}-{Math.min(page * rowsPerPage, count)} de {count}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          size="small"
          disabled={page <= 1}
          onClick={(e) => onPageChange(e, page - 1)}
          sx={{
            color: SYSTEM_COLORS.foreground,
            '&:hover': { backgroundColor: SYSTEM_COLORS.muted },
            '&.Mui-disabled': { color: SYSTEM_COLORS.borderHover },
          }}
        >
          <KeyboardArrowLeft />
        </IconButton>
        <Typography
          variant="body2"
          sx={{
            color: SYSTEM_COLORS.foreground,
            minWidth: '40px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {page}
        </Typography>
        <IconButton
          size="small"
          disabled={page >= Math.ceil(count / rowsPerPage)}
          onClick={(e) => onPageChange(e, page + 1)}
          sx={{
            color: SYSTEM_COLORS.foreground,
            '&:hover': { backgroundColor: SYSTEM_COLORS.muted },
            '&.Mui-disabled': { color: SYSTEM_COLORS.borderHover },
          }}
        >
          <KeyboardArrowRight />
        </IconButton>
      </Box>
    </Box>
  )
}

// Actions menu component
function ActionsMenu<T>({ actions, row }: { actions: Action<T>[]; row: T }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (event?: React.MouseEvent | {}, reason?: string) => {
    if (event && 'stopPropagation' in event) {
      (event as React.MouseEvent).stopPropagation()
    }
    setAnchorEl(null)
  }

  const handleAction = (action: Action<T>) => {
    handleClose()
    action.onClick(row)
  }

  const visibleActions = actions.filter((action) => !action.hidden?.(row))

  if (visibleActions.length === 0) return null

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          color: SYSTEM_COLORS.foregroundMuted,
          '&:hover': { backgroundColor: SYSTEM_COLORS.muted },
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            backgroundColor: SYSTEM_COLORS.background,
            borderRadius: '8px',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
            minWidth: '140px',
            mt: 0.5,
            border: `1px solid ${SYSTEM_COLORS.border}`,
          },
        }}
        MenuListProps={{
          dense: true,
        }}
      >
        {visibleActions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => handleAction(action)}
            disabled={action.disabled?.(row) ?? false}
            sx={{
              py: 1,
              px: 2,
              fontSize: '14px',
              color: SYSTEM_COLORS.foreground,
              borderRadius: '8px',
              mx: 0.5,
              my: 0.25,
              '&:hover': {
                backgroundColor: SYSTEM_COLORS.muted,
              },
              '&.Mui-disabled': {
                color: SYSTEM_COLORS.borderHover,
              },
            }}
          >
            {action.icon && (
              <Box component="span" sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
                {action.icon}
              </Box>
            )}
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Filters toolbar component
interface FiltersToolbarProps {
  searchFilter?: SearchFilter
  selectFilters?: SelectFilter[]
  searchValue: string
  onSearchChange: (value: string) => void
  filterValues: Record<string, string | string[]>
  onFilterChange: (key: string, value: string | string[]) => void
  onClearFilters: () => void
  showFilters?: boolean
  title?: string
  hasActiveFilters: boolean
  toolbarButtons?: React.ReactNode
}

function FiltersToolbar({
  searchFilter,
  selectFilters,
  searchValue,
  onSearchChange,
  filterValues,
  onFilterChange,
  onClearFilters,
  showFilters = true,
  title,
  hasActiveFilters,
  toolbarButtons,
}: FiltersToolbarProps) {
  const [localSearch, setLocalSearch] = React.useState(searchValue)
  const debouncedSearch = useDebounce(localSearch, searchFilter?.debounceMs || 300)

  React.useEffect(() => {
    onSearchChange(debouncedSearch)
  }, [debouncedSearch, onSearchChange])

  React.useEffect(() => {
    setLocalSearch(searchValue)
  }, [searchValue])

  if (!showFilters) return null

  return (
    <Box
      sx={{
        px: 2,
        py: 2,
        borderBottom: `1px solid ${SYSTEM_COLORS.border}`,
        backgroundColor: SYSTEM_COLORS.background,
      }}
    >
      {title && (
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontSize: '22px',
            fontWeight: 400,
            color: SYSTEM_COLORS.foreground,
          }}
        >
          {title}
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
        }}
      >
        {/* Search filter */}
        {searchFilter && (
          <div className="w-full sm:max-w-[33.333%] sm:w-[400px]">
            <FloatingInput
              label={searchFilter.placeholder || 'Buscar'}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              startAdornment={<SearchIcon className="w-4 h-4" />}
              containerClassName="w-full compact-search"
            />
          </div>
        )}

        {/* Select filters */}
        {selectFilters?.map((filter) => (
          <div key={filter.key} className="w-full sm:w-auto sm:min-w-[180px]">
            <FloatingSelect
              label={filter.label}
              value={filterValues[filter.key] || (filter.multiple ? [] : '')}
              onChange={(value) => onFilterChange(filter.key, value)}
              options={filter.options}
              multiple={filter.multiple}
              placeholder={filter.placeholder || `Seleccionar ${filter.label.toLowerCase()}`}
            />
          </div>
        ))}

        {/* Toolbar buttons */}
        {toolbarButtons && (
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            {toolbarButtons}
          </Box>
        )}

      </Box>
    </Box>
  )
}

// Loading skeleton rows
function LoadingRows({ columns, hasActions, size }: { columns: number; hasActions: boolean; size?: 'small' | 'medium' }) {
  const height = size === 'small' ? 40 : 52
  return (
    <>
      {[1, 2, 3, 4, 5].map((row) => (
        <TableRow key={`skeleton-${row}`}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex} sx={{ py: 1 }}>
              <Skeleton variant="rectangular" height={height - 16} sx={{ borderRadius: '4px' }} />
            </TableCell>
          ))}
          {hasActions && (
            <TableCell sx={{ py: 1 }}>
              <Skeleton variant="circular" width={32} height={32} />
            </TableCell>
          )}
        </TableRow>
      ))}
    </>
  )
}

// Main DataTable component
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  actions,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  containerSx,
  tableSx,
  headerSx,
  showHeader = true,
  stickyHeader = false,
  maxHeight,
  size = 'medium',
  // Filters
  searchFilter,
  selectFilters,
  searchValue: controlledSearchValue,
  onSearchChange,
  filterValues: controlledFilterValues,
  onFilterChange,
  onClearFilters,
  showFilters = true,
  title,
  // Toolbar buttons
  toolbarButtons,
}: DataTableProps<T>) {
  // Internal state for uncontrolled usage
  const [internalSearch, setInternalSearch] = React.useState('')
  const [internalFilters, setInternalFilters] = React.useState<Record<string, string | string[]>>({})

  // Use controlled or uncontrolled values
  const searchValue = controlledSearchValue ?? internalSearch
  const filterValues = controlledFilterValues ?? internalFilters

  const handleSearchChange = React.useCallback((value: string) => {
    if (onSearchChange) {
      onSearchChange(value)
    } else {
      setInternalSearch(value)
    }
  }, [onSearchChange])

  const handleFilterChange = React.useCallback((key: string, value: string | string[]) => {
    if (onFilterChange) {
      onFilterChange(key, value)
    } else {
      setInternalFilters((prev) => ({ ...prev, [key]: value }))
    }
  }, [onFilterChange])

  const handleClearFilters = React.useCallback(() => {
    if (onClearFilters) {
      onClearFilters()
    } else {
      setInternalSearch('')
      setInternalFilters({})
    }
  }, [onClearFilters])

  const handlePageChange = (_event: unknown, newPage: number) => {
    onPageChange?.(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    onRowsPerPageChange?.(newRowsPerPage)
  }

  const hasPagination = pagination !== undefined
  const hasActions = actions && actions.length > 0
  const hasActiveFilters = searchValue !== '' || Object.values(filterValues).some((v) => v !== '' && (!Array.isArray(v) || v.length > 0))

  const hasAnyFilters = !!searchFilter || (selectFilters && selectFilters.length > 0)

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: SYSTEM_COLORS.background,
        borderRadius: '12px',
        border: 'none',
        overflow: 'visible',
        ...containerSx,
      }}
    >
      {/* Filters Toolbar */}
      {(hasAnyFilters || toolbarButtons) && showFilters && (
        <FiltersToolbar
          searchFilter={searchFilter}
          selectFilters={selectFilters}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          showFilters={showFilters}
          title={title}
          hasActiveFilters={hasActiveFilters}
          toolbarButtons={toolbarButtons}
        />
      )}
      <TableContainer sx={{ maxHeight: maxHeight }}>
        <Table
          stickyHeader={stickyHeader}
          size={size}
          sx={{
            minWidth: 650,
            '& .MuiTableCell-root': {
              fontFamily: '"Roboto", "Geist", sans-serif',
              fontSize: '14px',
            },
            ...tableSx,
          }}
        >
          {showHeader && (
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: SYSTEM_COLORS.muted,
                  '& .MuiTableCell-root': {
                    color: SYSTEM_COLORS.foreground,
                    fontWeight: 500,
                    fontSize: '14px',
                    borderBottom: `1px solid ${SYSTEM_COLORS.border}`,
                    py: 1.5,
                    px: 2,
                  },
                  ...headerSx,
                }}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    align={column.align || 'left'}
                    sx={{ width: column.width, ...column.sx }}
                  >
                    {column.header}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell align="right" sx={{ width: '50px' }}>
                    Acciones
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {loading ? (
              <LoadingRows columns={columns.length} hasActions={!!hasActions} size={size} />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  align="center"
                  sx={{
                    py: 6,
                    color: SYSTEM_COLORS.foregroundMuted,
                    fontSize: '14px',
                  }}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={keyExtractor(row, index)}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(22, 78, 99, 0.04)',
                    },
                    '& .MuiTableCell-root': {
                      color: SYSTEM_COLORS.foreground,
                      borderBottom: `1px solid ${SYSTEM_COLORS.border}`,
                      py: size === 'small' ? 1 : 1.5,
                      px: 2,
                    },
                    '&:last-child .MuiTableCell-root': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      align={column.align || 'left'}
                      sx={{ width: column.width, ...column.sx }}
                    >
                      {column.render
                        ? column.render(row, index)
                        : (row as Record<string, unknown>)[column.key] as React.ReactNode}
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell align="right">
                      <ActionsMenu actions={actions} row={row} />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {hasPagination && (
        <MD3TablePagination
          count={pagination.total}
          page={pagination.page}
          rowsPerPage={pagination.limit}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={rowsPerPageOptions}
        />
      )}
    </Paper>
  )
}
