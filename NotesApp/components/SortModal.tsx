import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { SortOption } from '../types';

interface SortModalProps {
  visible: boolean;
  currentSort: SortOption;
  onClose: () => void;
  onSelectSort: (sort: SortOption) => void;
}

export const SortModal: React.FC<SortModalProps> = ({
  visible,
  currentSort,
  onClose,
  onSelectSort,
}) => {
  const sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Last Updated (Newest First)', value: 'newest' },
    { label: 'Last Updated (Oldest First)', value: 'oldest' },
    { label: 'Title (A → Z)', value: 'titleAZ' },
    { label: 'Title (Z → A)', value: 'titleZA' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modal}>
          <Text style={styles.title}>Sort By</Text>
          
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                currentSort === option.value && styles.selectedOption,
              ]}
              onPress={() => {
                onSelectSort(option.value);
                onClose();
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  currentSort === option.value && styles.selectedText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  option: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});
