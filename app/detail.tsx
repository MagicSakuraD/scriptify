import { View, Text, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";

const Detail = () => {
  const { photoUri } = useLocalSearchParams(); // 获取传递的参数

  return (
    <View className="flex-1 justify-center items-center bg-transparent">
      {photoUri ? (
        <>
          <Image
            source={{ uri: Array.isArray(photoUri) ? photoUri[0] : photoUri }}
            className="w-full h-full"
          />
        </>
      ) : (
        <Text>还没有拍照</Text>
      )}
    </View>
  );
};

export default Detail;
