import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainTabParamList, RootStackParamList } from '../types';
import { Colors, Spacing, Typography, BorderRadius } from '../utils/theme';
import { HostelCard } from '../components/Card';
import { useHostels } from '../hooks/useHostels';
import { mapHostelsToCardData } from '../utils/hostel';
import type { HostelCardData, HostelFilters, SupabaseHostelRecord } from '../types/hostels';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Search'>,
  NativeStackScreenProps<RootStackParamList>
>;

type PriceFilter = 'any' | 'under500' | 'under1000';

type FilterOverrides = Partial<{
  searchQuery: string;
  priceFilter: PriceFilter;
  nearCampus: boolean;
  topRated: boolean;
}>;

const DEFAULT_DISTANCE_KM = 2;
const HIGH_RATING_THRESHOLD = 4;

const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('any');
  const [nearCampus, setNearCampus] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<HostelFilters>({});

  const { data: hostelsData = [], isLoading, isRefetching, refetch } = useHostels(appliedFilters);

  const hostels = useMemo(
    () => mapHostelsToCardData(hostelsData as SupabaseHostelRecord[]),
    [hostelsData]
  );

  const buildFilters = useCallback(
    (overrides?: FilterOverrides): HostelFilters => {
      const state = {
        searchQuery,
        priceFilter,
        nearCampus,
        topRated,
        ...overrides,
      };

      const filters: HostelFilters = {};

      if (state.searchQuery.trim()) {
        filters.search_query = state.searchQuery.trim();
      }

      if (state.priceFilter === 'under500') {
        filters.price_range = { min: 0, max: 500 };
      } else if (state.priceFilter === 'under1000') {
        filters.price_range = { min: 0, max: 1000 };
      }

      if (state.nearCampus) {
        filters.distance_from_campus = DEFAULT_DISTANCE_KM;
      }

      if (state.topRated) {
        filters.rating_min = HIGH_RATING_THRESHOLD;
      }

      return filters;
    },
    [searchQuery, priceFilter, nearCampus, topRated]
  );

  const applyFilters = useCallback(
    (overrides?: FilterOverrides) => {
      const filters = buildFilters(overrides);
      setAppliedFilters(filters);
    },
    [buildFilters]
  );

  const handleSearch = () => {
    Keyboard.dismiss();
    applyFilters();
  };

  const handlePriceFilterChange = (value: PriceFilter) => {
    setPriceFilter(value);
    applyFilters({ priceFilter: value });
  };

  const handleToggleNearCampus = () => {
    setNearCampus((prev) => {
      const next = !prev;
      applyFilters({ nearCampus: next });
      return next;
    });
  };

  const handleToggleTopRated = () => {
    setTopRated((prev) => {
      const next = !prev;
      applyFilters({ topRated: next });
      return next;
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setPriceFilter('any');
    setNearCampus(false);
    setTopRated(false);
    setAppliedFilters({});
    Keyboard.dismiss();
  };

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        appliedFilters.search_query?.length ||
          appliedFilters.price_range ||
          appliedFilters.distance_from_campus ||
          appliedFilters.rating_min
      ),
    [appliedFilters]
  );

  const renderFilterChip = (label: string, isActive: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={label}
      style={[styles.filterChip, isActive && styles.filterChipActive]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderHostel = ({ item }: { item: HostelCardData }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('HostelDetails', { hostelId: item.id })}
      activeOpacity={0.9}
    >
      <HostelCard hostel={item} onPress={() => navigation.navigate('HostelDetails', { hostelId: item.id })} />
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      {isLoading ? (
        <ActivityIndicator color={Colors.primary} size="small" />
      ) : (
        <Text style={styles.emptyStateText}>
          No hostels matched your filters. Try adjusting the search or removing some filters.
        </Text>
      )}
    </View>
  );

  const listHeader = (
    <View style={styles.headerContainer}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search hostels by name or location..."
          placeholderTextColor={Colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.9}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersHeader}>
        <Text style={styles.filtersTitle}>Quick Filters</Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        {renderFilterChip('Near Campus', nearCampus, handleToggleNearCampus)}
        {renderFilterChip('4★ & above', topRated, handleToggleTopRated)}
      </View>
      <View style={styles.filterRow}>
        {renderFilterChip('Any Price', priceFilter === 'any', () => handlePriceFilterChange('any'))}
        {renderFilterChip('≤ 500 GHS', priceFilter === 'under500', () => handlePriceFilterChange('under500'))}
        {renderFilterChip('≤ 1000 GHS', priceFilter === 'under1000', () => handlePriceFilterChange('under1000'))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={hostels}
        keyExtractor={(item) => item.id}
        renderItem={renderHostel}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          hostels.length === 0
            ? [styles.listContent, styles.emptyListContent]
            : styles.listContent
        }
        refreshing={isRefetching}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  listContent: {
    paddingBottom: Spacing['3xl'],
  },
  emptyListContent: {
    flexGrow: 1,
  },
  headerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    height: 52,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  searchButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  searchButtonText: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
    fontSize: Typography.fontSize.sm,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  filtersTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  clearFiltersText: {
    color: Colors.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background.accent,
  },
  filterChipActive: {
    backgroundColor: Colors.secondary,
  },
  filterChipText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  filterChipTextActive: {
    color: Colors.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing['2xl'],
    gap: Spacing.md,
  },
  emptyStateText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.base,
  },
});

export default SearchScreen;