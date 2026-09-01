import React from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "../../../../constants/colors";

/*
|--------------------------------------------------------------------------
| GalleryTab
|--------------------------------------------------------------------------
|
| readOnly - set when viewing SOMEONE ELSE'S gallery. Hides the upload
| button and the FAB, and rewords the empty state, which otherwise tells
| you to upload media to a profile that isn't yours. Defaults to false,
| so your own profile behaves exactly as before.
|
*/

export default function GalleryTab({
  profile = {},
  onAddPhoto,
  readOnly = false,
}) {
  const gallery = profile?.gallery || [];

  const images = gallery.filter((item) => item.type === "IMAGE");

  const videos = gallery.filter((item) => item.type === "VIDEO");

  const renderImage = ({ item }) => (
    <Image
      source={{
        uri: item.url,
      }}
      style={styles.image}
    />
  );

  const renderVideo = ({ item }) => (
    <TouchableOpacity style={styles.videoCard} activeOpacity={0.8}>
      <Image
        source={{
          uri: item.url,
        }}
        style={styles.videoThumbnail}
      />

      <View style={styles.playOverlay}>
        <MaterialIcons name="play-arrow" size={32} color="#fff" />
      </View>
    </TouchableOpacity>
  );

  if (gallery.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="photo-library" size={60} color={COLORS.outline} />

        <Text style={styles.emptyTitle}>No Media Yet</Text>

        <Text style={styles.emptyText}>
          {readOnly
            ? "This player hasn't shared any photos or videos."
            : "Upload your cricket moments, match highlights and memories."}
        </Text>

        {!readOnly && (
          <TouchableOpacity style={styles.button} onPress={onAddPhoto}>
            <MaterialIcons
              name="add-a-photo"
              size={20}
              color={COLORS.onPrimary}
            />

            <Text style={styles.buttonText}>Upload Media</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {images.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Photos</Text>

          <FlatList
            data={images}
            keyExtractor={(item) => item.publicId}
            renderItem={renderImage}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.columnWrapper}
          />
        </>
      )}

      {videos.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Videos</Text>

          <FlatList
            data={videos}
            keyExtractor={(item) => item.publicId}
            renderItem={renderVideo}
            scrollEnabled={false}
          />
        </>
      )}

      {!readOnly && (
        <TouchableOpacity style={styles.fab} onPress={onAddPhoto}>
          <MaterialIcons name="add" size={28} color={COLORS.onPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 80,
  },

  sectionTitle: {
    fontSize: 18,

    fontWeight: "700",

    color: COLORS.onSurface,

    marginBottom: 12,

    marginTop: 16,
  },

  columnWrapper: {
    justifyContent: "space-between",

    marginBottom: 10,
  },

  image: {
    width: "31%",

    aspectRatio: 1,

    borderRadius: 12,

    backgroundColor: COLORS.surfaceContainerHighest,
  },

  videoCard: {
    height: 220,

    borderRadius: 16,

    overflow: "hidden",

    marginBottom: 16,

    backgroundColor: COLORS.surfaceContainerHighest,
  },

  videoThumbnail: {
    width: "100%",

    height: "100%",
  },

  playOverlay: {
    position: "absolute",

    top: 0,

    bottom: 0,

    left: 0,

    right: 0,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "rgba(0,0,0,0.25)",
  },

  fab: {
    position: "absolute",

    bottom: 24,

    right: 24,

    width: 58,

    height: 58,

    borderRadius: 29,

    backgroundColor: COLORS.primary,

    justifyContent: "center",

    alignItems: "center",

    elevation: 5,
  },

  emptyContainer: {
    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 30,

    paddingVertical: 60,
  },

  emptyTitle: {
    marginTop: 18,

    fontSize: 22,

    fontWeight: "700",

    color: COLORS.onSurface,
  },

  emptyText: {
    marginTop: 10,

    textAlign: "center",

    fontSize: 14,

    lineHeight: 22,

    color: COLORS.onSurfaceVariant,
  },

  button: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 28,

    paddingHorizontal: 24,

    paddingVertical: 14,

    borderRadius: 30,

    backgroundColor: COLORS.primary,
  },

  buttonText: {
    marginLeft: 8,

    color: COLORS.onPrimary,

    fontWeight: "700",

    fontSize: 15,
  },
});
