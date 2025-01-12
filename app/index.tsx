import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCameraFormat,
  Templates,
} from "react-native-vision-camera";
import { useIsFocused } from "@react-navigation/native";
import { useAppState } from "@react-native-community/hooks";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as MediaLibrary from "expo-media-library";

export default function App() {
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null); // 用于存储图片预览路径
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(isFrontCamera ? "front" : "back");
  const isFocused = useIsFocused();
  const appState = useAppState();
  const isActive = isFocused && appState === "active";
  const format = useCameraFormat(device, Templates.Snapchat);
  const camera = useRef<Camera>(null);

  if (hasPermission === undefined) {
    return <View className="flex-1 bg-gray-100" />;
  }

  if (!hasPermission) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-lg text-center mb-4 text-black">
          我们需要相机权限来使用这个功能
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-full"
          onPress={requestPermission}
        >
          <Text className="text-white text-lg">授予权限</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-lg text-center text-black">
          无法找到可用的相机设备
        </Text>
      </View>
    );
  }

  const takePhoto = async () => {
    try {
      if (camera.current) {
        const photo = await camera.current.takePhoto({
          flash: "off", // 可选：控制闪光灯模式
        });

        // 请求媒体库写入权限
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("权限不足", "需要媒体库权限才能保存照片。");
          return;
        }

        // 保存照片到媒体库
        const asset = await MediaLibrary.createAssetAsync(photo.path);
        setPreviewUri(asset.uri); // 更新预览图片路径
        Alert.alert("拍照成功", `照片已保存到相册\n路径：${asset.uri}`);
      }
    } catch (error: unknown) {
      console.error("拍照失败:", error);
      Alert.alert(
        "拍照失败",
        error instanceof Error ? error.message : "出现未知错误"
      );
    }
  };

  const toggleCamera = () => {
    setIsFrontCamera((current) => !current);
  };

  const openMediaLibrary = async () => {
    try {
      // 尝试获取用户默认相册
      const albums = await MediaLibrary.getAlbumsAsync();
      if (albums.length > 0) {
        // 打开媒体库，跳转到 Google Photos 或系统媒体库
        const mediaLibraryUrl = "content://media/internal/images/media";
        Linking.openURL(mediaLibraryUrl).catch((err) =>
          Alert.alert("无法打开媒体库", err.message)
        );
      } else {
        Alert.alert("没有找到相册", "您可能还没有照片可查看。");
      }
    } catch (error: unknown) {
      console.error("打开媒体库失败:", error);
      Alert.alert(
        "错误",
        error instanceof Error ? error.message : "无法访问媒体库。"
      );
    }
  };

  return (
    <View className="flex-1 relative">
      {/* 相机预览 */}
      <Camera
        ref={camera}
        style={{ flex: 1 }}
        device={device}
        isActive={isActive}
        format={format}
        photo={true}
      />

      {/* 按钮栏 */}
      <View className="absolute bottom-10 flex-row items-center justify-evenly px-6 w-full">
        {/* 图片预览 */}
        <TouchableOpacity onPress={openMediaLibrary}>
          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                borderWidth: 2,
                borderColor: "white",
              }}
            />
          ) : (
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "gray",
                borderWidth: 2,
                borderColor: "white",
              }}
            />
          )}
        </TouchableOpacity>

        {/* 拍照按钮 */}
        <TouchableOpacity onPress={takePhoto} className="mx-6">
          <FontAwesome name="circle-thin" size={80} color="white" />
        </TouchableOpacity>

        {/* 切换相机按钮 */}
        <TouchableOpacity
          onPress={toggleCamera}
          className="bg-gray-500/30 w-16 h-16 rounded-full flex items-center justify-center"
        >
          <FontAwesome6 name="rotate" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
