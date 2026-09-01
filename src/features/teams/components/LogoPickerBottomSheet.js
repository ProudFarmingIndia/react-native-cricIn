import React, { useMemo, useRef, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "../../../constants/colors";

export default function LogoPickerBottomSheet({
  visible,
  onClose,
  onCamera,
  onGallery,
  onRemove,
  hasLogo,
}) {
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  const sheetRef = useRef(null);

  const snapPoints = useMemo(() => ["40%"], []);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);

  const renderItem = (icon, title, color, onPress) => (
    <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={onPress}>
      <Ionicons name={icon} size={24} color={color} />

      <Text
        style={[
          styles.text,
          {
            color,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Team Logo</Text>

        {renderItem("camera-outline", "Take Photo", COLORS.primary, onCamera)}

        {renderItem(
          "images-outline",
          "Choose From Gallery",
          COLORS.primary,
          onGallery,
        )}

        {hasLogo &&
          renderItem("trash-outline", "Remove Logo", "#E53935", onRemove)}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: COLORS.primary,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
  },

  text: {
    marginLeft: 16,
    fontSize: 17,
    fontWeight: "600",
  },
});
