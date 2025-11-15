import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { getDb } from "./db";

export function useContacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [showFavOnly, setShowFavOnly] = useState(false);

  // Import API state
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  // Load contacts
  const loadContacts = useCallback(async () => {
    setLoading(true);
    const db = await getDb();
    const rows = await db.getAllAsync(
      "SELECT * FROM contacts ORDER BY favorite DESC, name ASC"
    );
    setContacts(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Insert contact
  const addContact = useCallback(
    async (name: string, phone: string, email: string) => {
      const db = await getDb();
      await db.runAsync(
        `INSERT INTO contacts (name, phone, email, favorite, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [name, phone, email, 0, Date.now()]
      );
      loadContacts();
    },
    [loadContacts]
  );

  // Update contact
  const updateContact = useCallback(
    async (id: number, name: string, phone: string, email: string) => {
      const db = await getDb();
      await db.runAsync(
        `UPDATE contacts
         SET name = ?, phone = ?, email = ?
         WHERE id = ?`,
        [name, phone, email, id]
      );
      loadContacts();
    },
    [loadContacts]
  );

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (id: number, current: number) => {
      const db = await getDb();
      await db.runAsync(
        "UPDATE contacts SET favorite = ? WHERE id = ?",
        [current === 1 ? 0 : 1, id]
      );
      loadContacts();
    },
    [loadContacts]
  );

  // Delete contact
  const deleteContact = useCallback(
    async (id: number) => {
      Alert.alert("Xóa liên hệ", "Bạn có muốn xóa không?", [
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
    },
    [loadContacts]
  );

  // Import API
  const importFromApi = useCallback(async () => {
    try {
      setImporting(true);
      setImportError("");

      const res = await fetch("https://jsonplaceholder.typicode.com/users");
      const data = await res.json();

      const db = await getDb();

      for (let u of data) {
        const exists = await db.getFirstAsync(
          "SELECT * FROM contacts WHERE phone = ?",
          [u.phone]
        );
        if (!exists) {
          await db.runAsync(
            `INSERT INTO contacts (name, phone, email, favorite, created_at)
             VALUES (?, ?, ?, ?, ?)`,
            [u.name, u.phone, u.email, 0, Date.now()]
          );
        }
      }
      loadContacts();
    } catch (err: any) {
      setImportError(err.message);
    } finally {
      setImporting(false);
    }
  }, [loadContacts]);

  // Filter + Search (useMemo)
  const filteredContacts = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return contacts.filter((c) => {
      const match =
        c.name.toLowerCase().includes(keyword) ||
        (c.phone && c.phone.includes(keyword));

      const fav = showFavOnly ? Number(c.favorite) === 1 : true;

      return match && fav;
    });
  }, [contacts, search, showFavOnly]);

  return {
    contacts: filteredContacts,
    loading,
    importing,
    importError,

    search,
    setSearch,
    showFavOnly,
    setShowFavOnly,

    loadContacts,
    addContact,
    updateContact,
    deleteContact,
    toggleFavorite,
    importFromApi,
  };
}
