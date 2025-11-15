import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getDb } from "../src/db";

export default function Index() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal form state
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

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

  // ======================
  //   CÂU 5 – TOGGLE FAVORITE
  // ======================
  async function toggleFavorite(id: number, favorite: number) {
    const newValue = favorite === 1 ? 0 : 1;

    const db = await getDb();
    await db.runAsync(
      "UPDATE contacts SET favorite = ? WHERE id = ?",
      [newValue, id]
    );

    loadContacts();
  }

  // ======================
  //   THÊM CONTACT (CÂU 4)
  // ======================
  async function addContact() {
    if (name.trim() === "") {
      Alert.alert("Lỗi", "Tên không được để trống.");
      return;
    }

    if (email.trim() !== "" && !email.includes("@")) {
      Alert.alert("Lỗi", "Email không hợp lệ.");
      return;
    }

    const db = await getDb();

    await db.runAsync(
      `INSERT INTO contacts (name, phone, email, favorite, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [name, phone, email, 0, Date.now()]
    );

    setName("");
    setPhone("");
    setEmail("");
    setModalVisible(false);

    loadContacts();
  }

  // ======================
  //   RENDER ITEM
  // ======================
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{ flexDirection: "column" }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>
          {item.phone || "Không có số điện thoại"}
        </Text>
      </View>

      {/* ICON FAVORITE – CHẠM ĐỂ TOGGLE */}
      <TouchableOpacity
        onPress={() => toggleFavorite(item.id, Number(item.favorite))}
      >
        <Text style={{ fontSize: 26 }}>
          {Number(item.favorite) === 1 ? "⭐" : "☆"}
        </Text>
      </TouchableOpacity>
    </View>
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
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Nút thêm liên hệ */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ fontSize: 32, color: "white" }}>＋</Text>
      </TouchableOpacity>

      {/* Modal Thêm contact */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm liên hệ mới</Text>

            <TextInput
              placeholder="Tên (bắt buộc)"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Số điện thoại"
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
            />

            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#CCC" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#007bff" }]}
                onPress={addContact}
              >
                <Text style={styles.btnText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ======================
//        STYLES
// ======================
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

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#F1F1F1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginLeft: 10,
  },
  btnText: {
    color: "white",
    fontWeight: "600",
  },
});
