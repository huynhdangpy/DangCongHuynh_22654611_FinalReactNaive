import { useEffect } from "react";
import { Text, View } from "react-native";
import { initDatabase } from "../src/init-db";

export default function Index() {
  useEffect(() => {
    async function setup() {
      await initDatabase();
    }
    setup();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Câu 2: Tạo bảng contacts thành công</Text>
    </View>
  );
}
