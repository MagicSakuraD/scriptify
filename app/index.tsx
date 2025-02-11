import React, { useRef, useState, useCallback, useEffect } from "react";
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
  // Update previewUri state to include media type
  const [mediaState, setMediaState] = useState<{
    uri: string | null;
    isVideo: boolean;
  }>({
    uri: null,
    isVideo: false,
  });
  const [isVideoMode, setIsVideoMode] = useState(false); // 新的状态变量，控制拍照/视频模式
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(isFrontCamera ? "front" : "back");
  const isFocused = useIsFocused();
  const appState = useAppState();
  const isActive = isFocused && appState === "active";
  const format = useCameraFormat(device, Templates.Snapchat);
  const camera = useRef<Camera>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0); // 录像时间（秒）

  // 拍照函数
  const takePhoto = useCallback(async () => {
    try {
      if (camera.current) {
        const photo = await camera.current.takePhoto({
          flash: "off",
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("权限不足", "需要媒体库权限才能保存照片。");
          return;
        }
        const asset = await MediaLibrary.createAssetAsync(photo.path);
        setMediaState({ uri: asset.uri, isVideo: false });
      }
    } catch (error: unknown) {
      console.error("拍照失败:", error);
      Alert.alert(
        "拍照失败",
        error instanceof Error ? error.message : "出现未知错误"
      );
    }
  }, []);

  // 视频录制函数
  const handleVideo = useCallback(async () => {
    if (!camera.current) return;

    if (!isRecording) {
      try {
        setIsRecording(true);
        setRecordSeconds(0); // 重置计时器
        await camera.current.startRecording({
          onRecordingFinished: async (video) => {
            console.log("Recording finished:", video);
            try {
              // 请求媒体库权限
              const { status } = await MediaLibrary.requestPermissionsAsync();
              if (status !== "granted") {
                Alert.alert("权限不足", "需要媒体库权限才能保存视频。");
                return;
              }
              // 保存视频到媒体库
              const asset = await MediaLibrary.createAssetAsync(video.path);
              setMediaState({ uri: asset.uri, isVideo: true });
            } catch (error) {
              console.error("保存视频失败:", error);
              Alert.alert("错误", "保存视频失败");
            }
          },
          onRecordingError: (error) => {
            console.error("Recording failed:", error);
            Alert.alert("错误", "录制视频失败");
            setIsRecording(false);
          },
        });
      } catch (error) {
        console.error("开始录制失败:", error);
        setIsRecording(false);
        setRecordSeconds(0); // 发生错误时也重置计时器
      }
    } else {
      try {
        await camera.current.stopRecording();
        setIsRecording(false);
        setRecordSeconds(0); // 发生错误时也重置计时器
      } catch (error) {
        console.error("停止录制失败:", error);
      }
    }
  }, [isRecording]);

  // 切换相机
  const toggleCamera = useCallback(() => {
    setIsFrontCamera((current) => !current);
  }, []);

  // 切换模式
  const toggleMode = useCallback(() => {
    setIsVideoMode((current) => !current);
  }, []);

  // 统一的拍摄处理函数
  const handleCapture = useCallback(() => {
    if (isVideoMode) {
      handleVideo();
    } else {
      takePhoto();
    }
  }, [isVideoMode, handleVideo, takePhoto]);

  // 录像计时器
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    const mm = String(min).padStart(2, "0");
    const ss = String(sec).padStart(2, "0");
    return `${mm}:${ss}`;
  };

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
          video={true}
          audio={false}
          photo={!isVideoMode} // 如果是视频模式，不拍照
          onInitialized={() => console.log("相机已初始化")}
          onError={(error) =>
            console.error("相机运行时错误:", error.code, error.message)
          }
          onStarted={() => console.log("相机开始工作")}
          onStopped={() => console.log("相机已停止")}
        />
      )}

      {/* 录像时间显示 */}
      {isVideoMode && isRecording && (
        <View
          className="absolute top-10 -right-6"
          style={{ transform: [{ translateX: -50 }] }}
        >
          <View className="flex-row items-center">
            <View
              className="w-2 h-2 rounded-full bg-red-500 mr-2"
              style={{
                opacity: recordSeconds % 2 ? 0.3 : 1, // 每秒闪烁一次
              }}
            />
            <Text style={{ color: "red", fontSize: 18 }}>
              {formatTime(recordSeconds)}
            </Text>
          </View>
        </View>
      )}

      {/* 工具栏 */}
      <View className="absolute top-20 right-5 flex-col items-center justify-between w-20 h-96">
        {/* 切换模式按钮 */}
        <TouchableOpacity
          onPress={toggleMode}
          className="bg-gray-500/30 w-12 h-12 rounded-full flex items-center justify-center"
        >
          <FontAwesome6
            name={isVideoMode ? "camera" : "video"} // 根据模式显示不同的图标
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* 按钮栏 */}
      <View className="absolute bottom-10 flex-row items-center justify-between px-6 w-full">
        {/* 图片预览 */}
        <TouchableOpacity
          onPress={() => {}}
          className="bg-gray-500/30 w-16 h-16 rounded-full flex items-center justify-center"
        >
          <Link
            href={{
              pathname: "/detail",
              params: {
                photoUri: mediaState.uri,
                isVideo: mediaState.isVideo.toString(),
              },
            }}
          >
            {mediaState.uri ? (
              <Image
                source={{ uri: mediaState.uri }}
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
        <TouchableOpacity
          onPress={handleCapture}
          className="mx-6 relative items-center justify-center"
        >
          <FontAwesome name="circle-thin" size={80} color="white" />
          {isVideoMode && (
            <View
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 52,
                height: 52,
                justifyContent: "center",
                alignItems: "center",
                marginLeft: -26,
                marginTop: -26,
              }}
            >
              {isRecording ? (
                <View
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: "red",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <FontAwesome name="circle" size={52} color="red" />
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* 切换相机前后置 */}
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
