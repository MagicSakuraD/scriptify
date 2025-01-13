import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
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
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import * as MediaLibrary from "expo-media-library";

export default function App() {
  const [isFrontCamera, setIsFrontCamera] = useState(false);
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
      {/* 切换相机按钮 */}
      <TouchableOpacity
        className="absolute top-12 right-6  p-2 rounded-full"
        onPress={toggleCamera}
      >
        <FontAwesome name="exchange" size={24} color="white" />
      </TouchableOpacity>
      {/* 拍照按钮 */}
      <TouchableOpacity
        className="absolute bottom-10 self-center"
        onPress={takePhoto}
      >
        <FontAwesome
          name="circle-thin"
          size={80}
          color="white"
          className="stroke-0"
        />
      </TouchableOpacity>
    </View>
  );
}
