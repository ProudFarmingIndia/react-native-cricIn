import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import styles from "../styles/notification.styles";
import { NOTIFICATION_FILTERS as FILTERS } from "../constants/notificationTypes";

export default function NotificationFilter({
  filters = FILTERS,
  selectedFilter,
  onSelectFilter,
}) {
  /*
  |--------------------------------------------------------------------------
  | Render Filter Chip
  |--------------------------------------------------------------------------
  */

  const renderChip = (filter, index) => {
    const active =
      selectedFilter === filter.value;

    return (
      <TouchableOpacity
        key={filter.value || index}
        activeOpacity={0.8}
        style={[
          styles.filterChip,

          active &&
            styles.activeFilterChip,
        ]}
        onPress={() =>
          onSelectFilter(filter.value)
        }
      >
        <Text
          style={[
            styles.filterText,

            active &&
              styles.activeFilterText,
          ]}
        >
          {filter.label}
        </Text>
      </TouchableOpacity>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.filterContainer
      }
    >
      {filters.map((filter, index) => renderChip(filter, index))}
    </ScrollView>
  );
}