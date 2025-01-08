import {
  Camera,
  useCameraDevice,
  useCameraDevices,
  useCameraPermission,
} from "react-native-vision-camera";
import { useState, useEffect } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useAppState } from "@react-native-community/hooks";

export default function App() {
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(isFrontCamera ? "front" : "back");
  const isFocused = useIsFocused();
  // const appState = useAppState();
  // const isActive = isFocused && appState === "active";

  if (hasPermission === undefined) {
    // 权限状态还在加载中
    return <View className="flex-1" />;
  }

  if (!hasPermission) {
    // 相机权限未授予
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-center mb-4 text-lg">
          我们需要相机权限来使用这个功能
        </Text>
        <Button onPress={requestPermission} title="授予权限" />
      </View>
    );
  }

  if (device == null) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-center text-lg">无法找到可用的相机设备</Text>
      </View>
    );
  }

  function toggleCamera() {
    setIsFrontCamera((current) => !current);
  }

  return (
    <View className="flex-1 bg-green-600 w-full h-full">
      <Camera
        style={{ flex: 1, height: "100%", width: "100%" }}
        device={device}
        isActive={true}
      />

      {/* <View className=" flex-row justify-center items-end mb-16 bg-transparent">
        <TouchableOpacity
          className="px-6 py-3 rounded-full bg-black/30 backdrop-blur-md"
          onPress={toggleCamera}
        >
          <Text className="text-green-600 text-lg font-bold">切换相机</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
}
