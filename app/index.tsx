import React, { useRef, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
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
import { Link } from "expo-router"; // 引入 Link 组件

export default function App() {
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(isFrontCamera ? "front" : "back");
  const isFocused = useIsFocused();
  const appState = useAppState();
  const isActive = isFocused && appState === "active";
  const format = useCameraFormat(device, Templates.Snapchat);
  const camera = useRef<Camera>(null);

  // 拍照函数
  const takePhoto = useCallback(async () => {
    try {
      if (camera.current) {
        const photo = await camera.current.takePhoto({
          flash: "off",
        });

        // 请求媒体库写入权限
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("权限不足", "需要媒体库权限才能保存照片。");
          return;
        }

        // 保存照片到媒体库
        const asset = await MediaLibrary.createAssetAsync(photo.path);
        setPreviewUri(asset.uri);
      }
    } catch (error: unknown) {
      console.error("拍照失败:", error);
      Alert.alert(
        "拍照失败",
        error instanceof Error ? error.message : "出现未知错误"
      );
    }
  }, []);

  // 切换相机
  const toggleCamera = useCallback(() => {
    setIsFrontCamera((current) => !current);
  }, []);

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

  return (
    <View className="flex-1 relative">
      {/* 相机预览 */}
      {isActive && (
        <Camera
          ref={camera}
          style={{ flex: 1 }}
          device={device}
          isActive={isActive}
          format={format}
          photo={true}
          onInitialized={() => console.log("相机已初始化")}
          onError={(error) =>
            console.error("相机运行时错误:", error.code, error.message)
          }
          onStarted={() => console.log("相机开始工作")}
          onStopped={() => console.log("相机已停止")}
        />
      )}

      {/* 按钮栏 */}
      <View className="absolute bottom-10 flex-row items-center justify-evenly px-6 w-full">
        {/* 图片预览 */}

        <TouchableOpacity
          onPress={() => {}}
          className="bg-gray-500/30 w-16 h-16 rounded-full flex items-center justify-center"
        >
          {/* 使用 Link 组件来跳转到详情页，并携带 previewUri 参数 */}
          <Link
            href={{
              pathname: "/detail", // 目标页面路径
              params: { photoUri: previewUri }, // 传递的参数
            }}
          >
            {previewUri ? (
              <Image
                source={{ uri: previewUri }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 30,
                  borderWidth: 2,
                  borderColor: "white",
                }}
              />
            ) : (
              <FontAwesome6 name="photo-film" size={24} color="white" />
            )}
          </Link>
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
          <FontAwesome6 name="rotate" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
