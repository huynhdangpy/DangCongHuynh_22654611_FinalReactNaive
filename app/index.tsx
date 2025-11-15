import { Ionicons } from "@expo/vector-icons"; // <-- SỬA Ở ĐÂY
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getDb } from "../src/db";

export default function Index() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    setLoading(true);
    const db = await getDb();

    const result = await db.getAllAsync(
      "SELECT * FROM contacts ORDER BY favorite DESC, name ASC"
    );

    setContacts(result);
    setLoading(false);
  }

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card}>
      <View style={{ flexDirection: "column" }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phone || "Không có số điện thoại"}</Text>
      </View>

      {Number(item.favorite) === 1 && (
        <Ionicons name="star" size={24} color="#FFD700" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách liên hệ</Text>

      {loading ? (
        <Text style={styles.empty}>Đang tải...</Text>
      ) : contacts.length === 0 ? (
        <Text style={styles.empty}>Chưa có liên hệ nào.</Text>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#F8F9FA",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#222",
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    // Shadow đẹp
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  phone: {
    marginTop: 4,
    fontSize: 15,
    color: "#777",
  },
  empty: {
    marginTop: 60,
    fontSize: 18,
    color: "#888",
    textAlign: "center",
  },
});
