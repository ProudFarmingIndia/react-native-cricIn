import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { SectionCard } from "../../../components/common/FormComponents";

import useUpload from "../../upload/hooks/useUpload";

import { COLORS } from "../../../constants/colors";

export default function GallerySection({ profile = {}, updateField, isEditMode }) {
  const { uploading, pickImage, pickVideo } = useUpload();

  const gallery = profile.gallery || [];

  const images = gallery.filter((item) => item.type === "IMAGE");

  const videos = gallery.filter((item) => item.type === "VIDEO");

  /////////////////////////////////////////////////////

  const addImage = async () => {
    const uploaded = await pickImage("players/gallery");

    if (!uploaded) return;

    updateField("gallery", [
      ...gallery,
      {
        type: "IMAGE",

        url: uploaded.url,

        publicId: uploaded.publicId,

        uploadedAt: new Date(),
      },
    ]);
  };

  /////////////////////////////////////////////////////

  const addVideo = async () => {
    const uploaded = await pickVideo("players/gallery");

    if (!uploaded) return;

    updateField("gallery", [
      ...gallery,
      {
        type: "VIDEO",

        url: uploaded.url,

        publicId: uploaded.publicId,

        uploadedAt: new Date(),
      },
    ]);
  };

  /////////////////////////////////////////////////////

  const deleteMedia = (publicId) => {
    updateField(
      "gallery",
      gallery.filter((item) => item.publicId !== publicId),
    );
  };

  /////////////////////////////////////////////////////

  return (
    <SectionCard icon="🖼" title="Gallery">
      {/* Images */}

      <View style={styles.header}>
        <Text style={styles.heading}>Images</Text>

        {isEditMode && (
          <TouchableOpacity style={styles.addBtn} onPress={addImage}>
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {images.map((item) => (
          <View key={item.publicId} style={styles.mediaBox}>
            <Image
              source={{
                uri: item.url,
              }}
              style={styles.image}
            />

            {isEditMode && (
              <TouchableOpacity
                style={styles.delete}
                onPress={() => deleteMedia(item.publicId)}
              >
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {images.length === 0 && <Text style={styles.empty}>No Images</Text>}
      </ScrollView>

      {/* Videos */}

      <View
        style={[
          styles.header,
          styles.mrgTwtyFv,
        ]}
      >
        <Text style={styles.heading}>Videos</Text>

        {isEditMode && (
          <TouchableOpacity style={styles.addBtn} onPress={addVideo}>
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {videos.map((item) => (
          <View key={item.publicId} style={styles.video}>
            <Text style={styles.videoIcon}>🎥</Text>

            <Text numberOfLines={1} style={styles.videoText}>
              Video
            </Text>

            {isEditMode && (
              <TouchableOpacity
                style={styles.delete}
                onPress={() => deleteMedia(item.publicId)}
              >
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {videos.length === 0 && <Text style={styles.empty}>No Videos</Text>}
      </ScrollView>

      {uploading && (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.mrgTwty}
        />
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 12,
  },

  heading: {
    fontSize: 16,

    fontWeight: "700",

    color: COLORS.onSurface,
  },

  addBtn: {
    paddingHorizontal: 14,

    paddingVertical: 7,

    borderRadius: 8,

    backgroundColor: COLORS.primary,
  },

  addText: {
    color: "#fff",

    fontWeight: "700",
  },

  mediaBox: {
    marginRight: 12,

    position: "relative",
  },

  image: {
    width: 110,

    height: 110,

    borderRadius: 12,

    backgroundColor: COLORS.surfaceVariant,
  },

  video: {
    width: 110,

    height: 110,

    borderRadius: 12,

    backgroundColor: COLORS.surfaceVariant,

    justifyContent: "center",

    alignItems: "center",

    marginRight: 12,
  },

  videoIcon: {
    fontSize: 32,
  },

  videoText: {
    marginTop: 10,

    fontWeight: "600",
  },

  delete: {
    position: "absolute",

    top: 6,

    right: 6,

    width: 26,

    height: 26,

    borderRadius: 13,

    backgroundColor: "#ff4d4f",

    justifyContent: "center",

    alignItems: "center",
  },

  deleteText: {
    color: "#fff",

    fontWeight: "700",
  },

  empty: {
    color: COLORS.onSurfaceVariant,

    marginVertical: 20,
  },
  mrgTwtyFv : {
    marginTop : 25
  },
  mrgTwty : {
    marginTop : 20
  }
});
