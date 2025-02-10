import { View, Text, Image, Button } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useState } from "react";

const Detail = () => {
  const { photoUri, isVideo } = useLocalSearchParams();
  const [error, setError] = useState(false);

  const uri = Array.isArray(photoUri) ? photoUri[0] : photoUri;

  // Video player setup
  const player = useVideoPlayer(uri, (player) => {
    if (player) {
      player.loop = true;
      player.play();
    }
  });

  // Track playback state
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player?.playing || false,
  });

  if (!uri) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white">未找到媒体文件</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-black">
      {isVideo === "true" ? (
        <>
          <VideoView
            className="w-full h-4/5"
            player={player}
            allowsFullscreen
            allowsPictureInPicture
          />
          <View className="p-4">
            <Button
              title={isPlaying ? "暂停" : "播放"}
              onPress={() => {
                if (isPlaying) {
                  player?.pause();
                } else {
                  player?.play();
                }
              }}
            />
          </View>
        </>
      ) : (
        <Image
          source={{ uri }}
          className="w-full h-full"
          resizeMode="contain"
          onError={() => setError(true)}
        />
      )}
      {error && <Text className="text-white">加载失败</Text>}
    </View>
  );
};

export default Detail;
