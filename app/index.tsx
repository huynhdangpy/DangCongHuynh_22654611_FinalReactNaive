import { useEffect } from "react";
import { Text, View } from "react-native";
import { getDb } from "../src/db";

export default function Index() {
  useEffect(() => {
    async function testDB() {
      const db = await getDb();
      console.log("SQLite connected:", db);
    }
    testDB();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Simple Contacts App - Câu 1 OK</Text>
    </View>
  );
}
