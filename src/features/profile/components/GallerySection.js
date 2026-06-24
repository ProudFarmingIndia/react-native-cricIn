import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SectionCard } from "./FormComponents";
import { COLORS } from "../../../constants/colors";

const CELL_SIZE = (Dimensions.get("window").width - 32 - 40 - 16 * 2) / 3;

export default function GallerySection({
  profile,
  isEditMode,
  updateField,
  onAddImage,
  onDeleteImage,
  onAddVideo,
}) {
  const images = profile.galleryImages || [];
  const videos = profile.galleryVideos || [];

  return (
    <SectionCard icon="🖼️" title="Gallery">
      {/* ── Images ── */}
      <View style={styles.subHeader}>
        <Text style={styles.subTitle}>Images</Text>
        {isEditMode && (
          <Text style={styles.hint}>Max 5MB each</Text>
        )}
      </View>

      <View style={styles.imageGrid}>
        {/* Add button — edit mode only */}
        {isEditMode && (
          <TouchableOpacity
            style={styles.addCell}
            onPress={onAddImage}
          >
            <Text style={styles.addIcon}>＋</Text>
          </TouchableOpacity>
        )}

        {images.map((uri, index) => (
          <View key={index} style={styles.imageCell}>
            <Image source={{ uri }} style={styles.image} />
            {isEditMode && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => {
                  const updated = images.filter((_, i) => i !== index);
                  updateField("galleryImages", updated);
                  onDeleteImage?.(index);
                }}
              >
                <Text style={styles.deleteIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {images.length === 0 && !isEditMode && (
          <Text style={styles.empty}>No images yet.</Text>
        )}
      </View>

      {/* ── Videos ── */}
      <View style={[styles.subHeader, { marginTop: 16 }]}>
        <Text style={styles.subTitle}>Videos</Text>
        {isEditMode && (
          <Text style={styles.hint}>MP4, MOV · 50MB max</Text>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {/* Add video button */}
        {isEditMode && (
          <TouchableOpacity style={styles.videoAddCell} onPress={onAddVideo}>
            <Text style={styles.videoAddIcon}>🎬</Text>
            <Text style={styles.videoAddLabel}>ADD CLIP</Text>
          </TouchableOpacity>
        )}

        {videos.map((item, index) => (
          <View key={index} style={styles.videoCell}>
            <View style={styles.videoOverlay}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            <Text style={styles.videoName} numberOfLines={1}>
              {item.name || `VIDEO_${index + 1}`}
            </Text>
          </View>
        ))}

        {videos.length === 0 && !isEditMode && (
          <Text style={styles.empty}>No videos yet.</Text>
        )}
      </ScrollView>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
  hint: {
    fontSize: 11,
    color: COLORS.outline,
  },

  // Image grid
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  addCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  addIcon: {
    fontSize: 28,
    color: COLORS.outline,
  },
  imageCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  deleteBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIcon: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  // Video
  videoAddCell: {
    width: 140,
    height: 90,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  videoAddIcon: {
    fontSize: 22,
  },
  videoAddLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.outline,
    marginTop: 4,
  },
  videoCell: {
    width: 140,
    height: 90,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainerHighest,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  videoOverlay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    color: "#fff",
    fontSize: 14,
  },
  videoName: {
    position: "absolute",
    bottom: 6,
    left: 8,
    right: 8,
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
  },

  empty: {
    fontSize: 13,
    color: COLORS.outline,
    paddingVertical: 8,
  },
});
