import { Stack } from "expo-router";
import "./global.css";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 默认隐藏 header
        statusBarStyle: "auto",
        statusBarTranslucent: true,
        statusBarBackgroundColor: "transparent",
      }}
    >
      {/* 针对 detail.tsx 页面单独配置 */}
      <Stack.Screen
        name="detail"
        options={{
          title: "预览", // 设置标题
          headerShown: true, // 显示 header
          statusBarStyle: "dark", // 设置状态栏样式（可选）
        }}
      />
    </Stack>
  );
}
