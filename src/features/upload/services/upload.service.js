import { Platform } from "react-native";

import apiClient from "../../../services/api/apiClient";

/*
|--------------------------------------------------------------------------
| Upload Service
|--------------------------------------------------------------------------
|
| Web vs native is the whole story here.
|
| On React Native, FormData.append accepts a plain { uri, name, type }
| object and the networking layer streams the file from that uri. That
| form is a React Native extension - it does NOT exist in browsers.
|
| On react-native-web the same object reaches the DOM FormData, which
| stringifies anything that isn't a Blob or File. The server then gets a
| text field reading literally "[object Object]" and no file at all,
| which surfaced as "Upload Failed / Unable to upload image."
|
| So on web the picked asset is converted into a real File first.
| expo-image-picker gives a blob:/data: uri there, which fetch() can read
| back as a Blob.
|
| Content-Type is deliberately NOT set on these requests: apiClient strips
| it for FormData bodies so the platform can generate the multipart
| boundary itself. A hand-written "multipart/form-data" has no boundary,
| and multer cannot split the parts without one - which was the second
| half of this bug.
|
*/

/*
|--------------------------------------------------------------------------
| MIME Type
|--------------------------------------------------------------------------
|
| asset.type from expo-image-picker is "image" or "video" - a media KIND,
| not a MIME type. Using it directly produced Content-Type: "image",
| which is not valid. Prefer the real mimeType, then guess from the file
| extension, then fall back.
|
*/

const EXTENSION_MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  mp4: "video/mp4",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  webm: "video/webm",
};

const guessMimeType = (asset, fallback) => {
  if (asset?.mimeType) return asset.mimeType;

  const source = asset?.fileName || asset?.uri || "";

  const match = /\.([a-z0-9]+)(?:\?|#|$)/i.exec(source);

  const extension = match?.[1]?.toLowerCase();

  return EXTENSION_MIME[extension] || fallback;
};

const buildFileName = (asset, mimeType, prefix) => {
  if (asset?.fileName) return asset.fileName;

  const extension = mimeType?.split("/")?.[1] || "bin";

  return `${prefix}_${Date.now()}.${extension}`;
};

/*
|--------------------------------------------------------------------------
| Build The FormData Part
|--------------------------------------------------------------------------
*/

const appendAsset = async (formData, asset, fallbackMime, prefix) => {
  if (!asset?.uri && !asset?.file) {
    throw new Error("No file was selected.");
  }

  const mimeType = guessMimeType(asset, fallbackMime);

  const name = buildFileName(asset, mimeType, prefix);

  if (Platform.OS === "web") {
    // Some SDK versions hand back a real File already; otherwise read the
    // blob: / data: uri back into one.
    const blob =
      asset?.file instanceof Blob
        ? asset.file
        : await (await fetch(asset.uri)).blob();

    formData.append(
      "file",
      new File([blob], name, { type: blob.type || mimeType }),
    );

    return;
  }

  formData.append("file", {
    uri: asset.uri,
    name,
    type: mimeType,
  });
};

/*
|--------------------------------------------------------------------------
| Upload Image
|--------------------------------------------------------------------------
*/

export const uploadImageApi = async (image, folder = "players/profile") => {
  const formData = new FormData();

  await appendAsset(formData, image, "image/jpeg", "image");

  formData.append("folder", folder);

  const response = await apiClient.post("/upload/image", formData);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Upload Video
|--------------------------------------------------------------------------
*/

export const uploadVideoApi = async (video, folder = "players/gallery") => {
  const formData = new FormData();

  await appendAsset(formData, video, "video/mp4", "video");

  formData.append("folder", folder);

  const response = await apiClient.post("/upload/video", formData);

  return response.data;
};
