import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, TextInput, View,
  FlatList, TouchableOpacity, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskBeingEdited, setTaskBeingEdited] = useState(null);
  const [editText, setEditText] = useState('');
  const [taskAnimations, setTaskAnimations] = useState({});

  useEffect(() => {
    // Load tasks from AsyncStorage when the app starts
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error('Failed to load tasks', error);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    // Save tasks to AsyncStorage whenever they change
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks', error);
      }
    };
    saveTasks();
  }, [tasks]);

  const addTask = () => {
    if (task.trim()) {
      const newTask = { id: Date.now().toString(), text: task, completed: false };
      const fadeAnim = new Animated.Value(0);
      const slideAnim = new Animated.Value(0); // Initialize slideAnim

      setTaskAnimations({
        ...taskAnimations,
        [newTask.id]: { fadeAnim, slideAnim }, // Save both animations for each task
      });

      // Animate the task fade-in and scale-up effect
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTasks([...tasks, newTask]);
      setTask('');
    }
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((item) => item.id !== taskId));
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const startEditingTask = (taskId, currentText) => {
    setTaskBeingEdited(taskId);
    setEditText(currentText);
  };

  const saveEditedTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, text: editText } : task
    ));
    setTaskBeingEdited(null);
    setEditText('');
  };

  const cancelEditing = () => {
    setTaskBeingEdited(null);
    setEditText('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => {
          const animation = taskAnimations[item.id];

          return (
            <Animated.View
              style={[
                styles.taskContainer,
                {
                  opacity: animation ? animation.fadeAnim : 1,
                  transform: animation ? [{ translateX: animation.slideAnim }] : [],
                }
              ]}
            >
              {taskBeingEdited === item.id ? (
                <TextInput
                  style={[styles.input, styles.editInput]}
                  value={editText}
                  onChangeText={(text) => setEditText(text)}
                />
              ) : (
                <Text
                  style={[styles.taskText, item.completed && styles.completedTask]}
                  onPress={() => toggleTaskCompletion(item.id)}
                >
                  {item.text}
                </Text>
              )}
              {taskBeingEdited === item.id ? (
                <View style={styles.editButtonsContainer}>
                  <TouchableOpacity onPress={() => saveEditedTask(item.id)}>
                    <Text style={styles.saveButton}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={cancelEditing}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.taskButtonsContainer}>
                  <TouchableOpacity onPress={() => startEditingTask(item.id, item.text)}>
                    <Text style={styles.editButton}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteTask(item.id)}>
                    <Text style={styles.deleteButton}>X</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          );
        }}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  taskButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    marginRight: 10,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    color: '#5C5CFF',
    fontWeight: 'bold',
    marginRight: 10,
  },
  cancelButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
  },
  editButton: {
    color: '#5C5CFF',
    fontWeight: 'bold',
    marginRight: 10,
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 18,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
});
