import apiClient from "../../../services/api/apiClient";

/*
|--------------------------------------------------------------------------
| Upload Image
|--------------------------------------------------------------------------
*/

export const uploadImageApi = async (
  image,
  folder = "players/profile"
) => {
  const formData = new FormData();

  formData.append("file", {
    uri: image.uri,
    name:
      image.fileName ||
      `image_${Date.now()}.jpg`,
    type:
      image.mimeType ||
      image.type ||
      "image/jpeg",
  });

  formData.append(
    "folder",
    folder
  );

  const response =
    await apiClient.post(
      "/upload/image",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Upload Video
|--------------------------------------------------------------------------
*/

export const uploadVideoApi = async (
  video,
  folder = "players/gallery"
) => {
  const formData = new FormData();

  formData.append("file", {
    uri: video.uri,
    name:
      video.fileName ||
      `video_${Date.now()}.mp4`,
    type:
      video.mimeType ||
      video.type ||
      "video/mp4",
  });

  formData.append(
    "folder",
    folder
  );

  const response =
    await apiClient.post(
      "/upload/video",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return response.data;
};