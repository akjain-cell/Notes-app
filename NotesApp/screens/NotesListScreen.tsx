import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { Note, SortOption } from '../types';
import { NoteCard } from '../components/NoteCard';
import { SearchBar } from '../components/SearchBar';
import { SortModal } from '../components/SortModal';

export const NotesListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortModal, setShowSortModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [user])
  );

  useEffect(() => {
    filterAndSortNotes();
  }, [notes, searchQuery, sortBy]);

  const loadNotes = async () => {
    if (user) {
      const userNotes = await storageService.getUserNotes(user.id);
      setNotes(userNotes);
    }
  };

  const filterAndSortNotes = () => {
    let filtered = [...notes];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.body.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'oldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'titleAZ':
          return a.title.localeCompare(b.title);
        case 'titleZA':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    setFilteredNotes(filtered);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const handleCreateNote = () => {
    navigation.navigate('NoteEditor', { mode: 'create' });
  };

  const handleEditNote = (note: Note) => {
    navigation.navigate('NoteEditor', { mode: 'edit', note });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.username}!</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <Text style={styles.sortButtonText}>Sort</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      {filteredNotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No notes found' : 'No notes yet'}
          </Text>
          {!searchQuery && (
            <Text style={styles.emptySubtext}>
              Tap the + button to create your first note
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NoteCard note={item} onPress={() => handleEditNote(item)} />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleCreateNote}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <SortModal
        visible={showSortModal}
        currentSort={sortBy}
        onClose={() => setShowSortModal(false)}
        onSelectSort={setSortBy}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sortButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sortButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  headerButton: {
    marginRight: 16,
  },
  headerButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});
