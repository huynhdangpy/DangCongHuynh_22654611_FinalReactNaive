import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useContacts } from "../src/useContacts";

export default function Index() {
  const {
    contacts,
    loading,
    importing,
    importError,

    search,
    setSearch,
    showFavOnly,
    setShowFavOnly,

    addContact,
    updateContact,
    deleteContact,
    toggleFavorite,
    importFromApi,
  } = useContacts();

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [idEdit, setIdEdit] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  function openEdit(c: any) {
    setIdEdit(c.id);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email);

    setIsEdit(true);
    setModalVisible(true);
  }

  function resetForm() {
    setIdEdit(null);
    setName("");
    setPhone("");
    setEmail("");
    setIsEdit(false);
    setModalVisible(false);
  }

  async function onSave() {
    if (isEdit) {
      await updateContact(idEdit!, name, phone, email);
    } else {
      await addContact(name, phone, email);
    }
    resetForm();
  }

  const renderItem = ({ item }: any) => (
    <View
      style={[
        styles.card,
        Number(item.favorite) === 1 && styles.cardFavorite, // highlight UI
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.name,
            Number(item.favorite) === 1 && { color: "#b88600" },
          ]}
        >
          {item.name}
        </Text>
        <Text style={styles.phone}>{item.phone}</Text>
        {item.email ? <Text style={styles.email}>{item.email}</Text> : null}
      </View>

      {/* STAR */}
      <TouchableOpacity
        style={{ marginRight: 14 }}
        onPress={() => toggleFavorite(item.id, Number(item.favorite))}
      >
        <Text style={{ fontSize: 26 }}>
          {Number(item.favorite) === 1 ? "⭐" : "☆"}
        </Text>
      </TouchableOpacity>

      {/* EDIT */}
      <TouchableOpacity
        style={{ marginRight: 14 }}
        onPress={() => openEdit(item)}
      >
        <Text style={{ fontSize: 20 }}>✏️</Text>
      </TouchableOpacity>

      {/* DELETE */}
      <TouchableOpacity onPress={() => deleteContact(item.id)}>
        <Text style={{ fontSize: 22, color: "red" }}>❌</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách liên hệ</Text>

      <TextInput
        style={styles.search}
        placeholder="Tìm kiếm theo tên / số điện thoại"
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity
        style={styles.filter}
        onPress={() => setShowFavOnly(!showFavOnly)}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          {showFavOnly ? "Hiện tất cả" : "Chỉ Favorite"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.importBtn}
        onPress={importFromApi}
        disabled={importing}
      >
        {importing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff" }}>Import từ API</Text>
        )}
      </TouchableOpacity>

      {importError !== "" && (
        <Text style={{ color: "red", marginBottom: 10 }}>{importError}</Text>
      )}

      {loading ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Đang tải...</Text>
        </View>
      ) : contacts.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Không có liên hệ nào.</Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Text style={{ fontSize: 32, color: "#fff" }}>＋</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalWrapper}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {isEdit ? "Sửa liên hệ" : "Thêm liên hệ"}
            </Text>

            <TextInput
              placeholder="Tên"
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

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#ccc" }]}
                onPress={resetForm}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#007bff" }]}
                onPress={onSave}
              >
                <Text style={{ color: "#fff" }}>
                  {isEdit ? "Lưu" : "Thêm"}
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
    paddingTop: 55,
    paddingHorizontal: 18,
    backgroundColor: "#F8F9FA",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },

  search: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 12,
  },

  filter: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 12,
    alignSelf: "flex-start",
  },

  importBtn: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 12,
    alignSelf: "flex-start",
  },

  emptyBox: {
    marginTop: 80,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 18,
    color: "#777",
  },

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  cardFavorite: {
    backgroundColor: "#FFF7D1",
    borderColor: "#FFD76E",
    borderWidth: 1,
  },

  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  phone: {
    color: "#777",
  },
  email: {
    color: "#999",
  },

  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 30,
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

  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  input: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  modalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },

  btn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 10,
    borderRadius: 8,
  },
});
