import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

  // Search + Filter
  const [search, setSearch] = useState("");
  const [showFavOnly, setShowFavOnly] = useState(false);

  // Import loading / error
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  // Modal thêm/sửa
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // form fields
  const [editingId, setEditingId] = useState<number | null>(null);
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
  //     THÊM CONTACT
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

    resetForm();
    loadContacts();
  }

  // ======================
  //     SỬA CONTACT
  // ======================
  async function updateContact() {
    if (name.trim() === "") {
      Alert.alert("Lỗi", "Tên không được để trống");
      return;
    }
    if (email.trim() !== "" && !email.includes("@")) {
      Alert.alert("Lỗi", "Email không hợp lệ.");
      return;
    }
    if (editingId === null) return;

    const db = await getDb();

    await db.runAsync(
      `UPDATE contacts
       SET name = ?, phone = ?, email = ?
       WHERE id = ?`,
      [name, phone, email, editingId]
    );

    resetForm();
    loadContacts();
  }

  // reset modal form
  function resetForm() {
    setName("");
    setPhone("");
    setEmail("");
    setEditingId(null);
    setIsEdit(false);
    setModalVisible(false);
  }

  // ======================
  //     TOGGLE FAVORITE
  // ======================
  async function toggleFavorite(id: number, favorite: number) {
    const newValue = favorite === 1 ? 0 : 1;

    const db = await getDb();
    await db.runAsync("UPDATE contacts SET favorite = ? WHERE id = ?", [
      newValue,
      id,
    ]);

    loadContacts();
  }

  // ======================
  //     DELETE CONTACT
  // ======================
  async function deleteContact(id: number) {
    Alert.alert("Xóa liên hệ", "Bạn có chắc muốn xóa liên hệ này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          const db = await getDb();
          await db.runAsync("DELETE FROM contacts WHERE id = ?", [id]);
          loadContacts();
        },
      },
    ]);
  }

  // ======================
  //     MỞ MODAL EDIT
  // ======================
  function openEditModal(item: any) {
    setEditingId(item.id);
    setName(item.name);
    setPhone(item.phone);
    setEmail(item.email);

    setIsEdit(true);
    setModalVisible(true);
  }

  // ======================
  //     CÂU 9 – Import từ API
  // ======================
  async function importFromApi() {
    try {
      setImporting(true);
      setImportError("");

      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );

      if (!response.ok) throw new Error("Không thể tải dữ liệu từ API");

      const data = await response.json();

      const db = await getDb();

      for (let item of data) {
        const name = item.name;
        const phone = item.phone || "";
        const email = item.email || "";

        // Check trùng phone
        const exists = await db.getFirstAsync(
          "SELECT * FROM contacts WHERE phone = ?",
          [phone]
        );

        if (!exists) {
          await db.runAsync(
            `INSERT INTO contacts (name, phone, email, favorite, created_at)
             VALUES (?, ?, ?, ?, ?)`,
            [name, phone, email, 0, Date.now()]
          );
        }
      }

      loadContacts();
    } catch (err: any) {
      setImportError(err.message || "Lỗi khi import API");
    } finally {
      setImporting(false);
    }
  }

  // ======================
  //   SEARCH + FILTER
  // ======================
  const filteredContacts = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return contacts.filter((c) => {
      const matchText =
        c.name.toLowerCase().includes(keyword) ||
        (c.phone && c.phone.includes(keyword));

      const matchFav = showFavOnly ? Number(c.favorite) === 1 : true;

      return matchText && matchFav;
    });
  }, [search, showFavOnly, contacts]);

  // ======================
  //     UI LIST ITEM
  // ======================
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{ flexDirection: "column", flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>
          {item.phone || "Không có số điện thoại"}
        </Text>
      </View>

      {/* STAR FAVORITE */}
      <TouchableOpacity
        onPress={() => toggleFavorite(item.id, Number(item.favorite))}
        style={{ marginRight: 12 }}
      >
        <Text style={{ fontSize: 26 }}>
          {Number(item.favorite) === 1 ? "⭐" : "☆"}
        </Text>
      </TouchableOpacity>

      {/* EDIT BUTTON */}
      <TouchableOpacity
        style={{ marginRight: 12 }}
        onPress={() => openEditModal(item)}
      >
        <Text style={{ fontSize: 20 }}>✏️</Text>
      </TouchableOpacity>

      {/* DELETE BUTTON */}
      <TouchableOpacity onPress={() => deleteContact(item.id)}>
        <Text style={{ fontSize: 22, color: "red" }}>❌</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách liên hệ</Text>

      {/* Search */}
      <TextInput
        style={styles.searchBox}
        placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Favorite filter */}
      <TouchableOpacity
        style={styles.filterBtn}
        onPress={() => setShowFavOnly(!showFavOnly)}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          {showFavOnly ? "Hiện tất cả" : "Chỉ Favorite"}
        </Text>
      </TouchableOpacity>

      {/* Import API button */}
      <TouchableOpacity
        style={styles.importBtn}
        onPress={importFromApi}
        disabled={importing}
      >
        {importing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "white", fontWeight: "600" }}>
            Import từ API
          </Text>
        )}
      </TouchableOpacity>

      {importError !== "" && (
        <Text style={{ color: "red", marginBottom: 10 }}>{importError}</Text>
      )}

      {loading ? (
        <Text style={styles.empty}>Đang tải...</Text>
      ) : filteredContacts.length === 0 ? (
        <Text style={styles.empty}>Không tìm thấy liên hệ.</Text>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Nút thêm (+) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Text style={{ fontSize: 32, color: "white" }}>＋</Text>
      </TouchableOpacity>

      {/* Modal thêm/sửa */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEdit ? "Sửa liên hệ" : "Thêm liên hệ"}
            </Text>

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
                onPress={resetForm}
              >
                <Text style={styles.btnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#007bff" }]}
                onPress={isEdit ? updateContact : addContact}
              >
                <Text style={styles.btnText}>
                  {isEdit ? "Cập nhật" : "Lưu"}
                </Text>
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

  searchBox: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#DDD",
  },

  filterBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
  },

  importBtn: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    flexDirection: "row",
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
    fontSize: 15,
    color: "#777",
    marginTop: 3,
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
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
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
