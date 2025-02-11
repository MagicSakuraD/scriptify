import React, { useState, useEffect , useRef} from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView, VideoSource, VideoPlayer } from "expo-video";
import { useEventListener } from "expo";

export default function Detail() {
  const { photoUri, isVideo } = useLocalSearchParams();
  const paramUri = Array.isArray(photoUri) ? photoUri[0] : photoUri;
  const videoSource: VideoSource = paramUri;

  const [error, setError] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef<VideoPlayer | null>(null);

  const player = useVideoPlayer(videoSource, (instance) => {
    if (instance) {
      playerRef.current = instance;
      instance.loop = false;
      instance.play();
      setIsPlayerReady(true);
    }
  });

  useEventListener(player, "statusChange", ({ error, status }) => {
    if (error) {
      setError(true);
      setIsPlayerReady(false);
    }
    // 当播放器状态变为 idle 时，表示已经不可用
    if (status === 'idle') {
      setIsPlayerReady(false);
    }
  });

  useEffect(() => {
    return () => {
      // 只在播放器就绪状态下尝试暂停
      if (playerRef.current && isPlayerReady) {
        try {
          playerRef.current.pause();
        } catch (err) {
          // 静默处理错误，因为组件正在卸载
        }
      }
      // 清理引用
      playerRef.current = null;
      setIsPlayerReady(false);
    };
  }, [isPlayerReady]);


  if (!videoSource && !paramUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>你还没有拍摄</Text>
      </View>
    );
  }

  const isTypeVideo = isVideo === "true";

  return (
    <View style={styles.container}>
      {isTypeVideo ? (
        <View style={styles.videoContainer}>
          <VideoView
            style={styles.video}
            player={player}
            nativeControls
            allowsFullscreen
            allowsPictureInPicture
          />
        </View>
      ) : (
        <Image
          source={{ uri: paramUri }}
          style={styles.image}
          resizeMode="contain"
          onError={() => setError(true)}
        />
      )}
      {error && <Text style={styles.text}>加载失败</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    flex: 1,
    width: "100%",
  },
  video: {
    flex: 1,
    width: "100%",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  text: {
    color: "white",
    fontSize: 16,
  },
});