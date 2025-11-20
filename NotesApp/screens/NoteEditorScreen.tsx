import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { Note } from '../types';

export const NoteEditorScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { user } = useAuth();
  const { mode, note } = route.params || { mode: 'create', note: null };
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && note) {
      setTitle(note.title);
      setBody(note.body);
      setImageUri(note.imageUri);
    }

    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!cameraPermission.granted || !mediaPermission.granted) {
      Alert.alert(
        'Permissions Required',
        'Camera and gallery permissions are needed to add images'
      );
    }
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Add Image', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickImageFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const removeImage = () => {
    Alert.alert('Remove Image', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setImageUri(undefined) },
    ]);
  };

  const handleSave = async () => {
    if (!title.trim() && !body.trim()) {
      Alert.alert('Error', 'Please add a title or content');
      return;
    }

    setSaving(true);

    try {
      const now = new Date().toISOString();
      const noteData: Note = {
        id: mode === 'edit' && note ? note.id : Date.now().toString(),
        userId: user!.id,
        title: title.trim(),
        body: body.trim(),
        imageUri,
        createdAt: mode === 'edit' && note ? note.createdAt : now,
        updatedAt: now,
      };

      await storageService.saveNote(noteData);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (note) {
            await storageService.deleteNote(note.id);
            navigation.goBack();
          }
        },
      },
    ]);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: mode === 'create' ? 'New Note' : 'Edit Note',
      headerRight: () => (
        <View style={styles.headerButtons}>
          {mode === 'edit' && (
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={styles.headerButton}
          >
            <Text style={[styles.saveButtonText, saving && styles.disabledText]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, mode, title, body, imageUri, saving]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.bodyInput}
          placeholder="Start typing..."
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
          placeholderTextColor="#999"
        />

        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
              <Text style={styles.removeImageText}>×</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.addImageButton} onPress={showImageOptions}>
          <Text style={styles.addImageText}>
            {imageUri ? '📷 Change Image' : '📷 Add Image'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    marginRight: 8,
  },
  headerButton: {
    marginLeft: 16,
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledText: {
    opacity: 0.5,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    color: '#333',
  },
  bodyInput: {
    fontSize: 16,
    padding: 16,
    paddingTop: 0,
    minHeight: 200,
    color: '#333',
  },
  imageContainer: {
    margin: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addImageButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});
