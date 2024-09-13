import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity, Modal, Button, TextInput } from 'react-native';
import axios from 'axios';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/users';

export default function App() {
  const [modalCardIdText, setModalCardIdText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const addCard = async () => {
    if (modalCardIdText.length >= 11) {
      setModalVisible(!modalVisible);
      let text = modalCardIdText;
      setModalCardIdText('');

      try {
        const response = await axios.put(API_URL + '/' + await AsyncStorage.getItem('device_id'), {
          Cards: text + ','
        });
        console.log('Card added:', response.data);
      } catch (error) {
        console.error('Error adding card:', error);
      }
    }
  };

  useEffect(() => {
    const initializeUniqueId = async () => {
      try {
        let id = await AsyncStorage.getItem('device_id');
        if (!id) {
          id = uuidv4();
          await AsyncStorage.setItem('device_id', id);
          console.log('New Unique ID generated and stored:', id);
        } else {
          console.log('Existing Unique ID from AsyncStorage:', id);
        }
      } catch (error) {
        console.error('Error getting or setting unique ID:', error);
      }
    };

    initializeUniqueId();
  }, []);

  useEffect(() => {
    const readUsers = async () => {
      try {
        const response = await axios.get(API_URL);
        if (response.data['length'] === 0) {
          addUser();
        }
        for (var i=0; i < response.data['length']; i++) {
          if (response.data[i]['UUID'] === await AsyncStorage.getItem('device_id')) {
            break;
          }
          if (i === response.data['length'] - 1) {
            addUser();
          }
        }
        console.log('Data fetched from API:', response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const addUser = async () => {
      try {
        const response = await axios.post(API_URL, {
          UUID: await AsyncStorage.getItem('device_id'),
          Cards: ''
        });
        console.log('User added:', response.data);
      } catch (error) {
        console.error('Error adding user:', error);
      }
    };

    readUsers();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const url = "https://service.kentkart.com/rl1/api/card/balance?region=004&lang=tr&authType=3&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrZW50a2FydC5jb20iLCJzdWIiOiJBQzE2IiwiYXVkIjoiYUMxdW4iLCJleHAiOjE3NjcyMTQ4MDAsIm5iZiI6MTY5Mjk2ODY2OSwiaWF0IjoxNjkyOTY4NjY5LCJqdGkiOiJmOWM5MDFmMi1iMTgzLTQ1NjYtYjIwYi1hMGI0YjZiYzM0MjUiLCJzeXN0ZW1faWQiOiIwMDQiLCJzY29wZXMiOltdfQ.V9c4Ud9Vjpc1bzHXnM1aL96xLCgeWQ1B3NejsdMTYow_eHgu8M6FiYFqYu9d56VjYwAJ7eMpFvr7cQPfRKCcAzB4MB0tyJWwS6LZybKlZvpu5XMiVhrh_wDYvvhbLO22oucYL7OIke0LFf92DLE65uhO7bbUv6pG6-RCUND7Ggn-v5B8XjjtYNUGU5-L27vr5iVLH_7pA7-Pw4EPHUQRP1rocxnhQYkVwk5T2I_NIMYOaL3ycDa_Mv_u9SfB0hBgcp9cEVU9PoxvlX8TP24rRjJtGVSlt0ina8EFh-20FzlqBPc8OjFjAbjegaynmOtrPOf3hCcrm80ZgS60o4IpOw&alias=" + "0111352307";
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json["cardlist"][0]["balance"]);
      } catch (error) {
        console.error(error.message);
      }
    }

    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.containerContent}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.modalBackground}>
            <View style={styles.modalView}>
              <Text style={styles.text}>Card ID</Text>
              <TextInput
                style={styles.modalCardIdTextInput}
                maxLength={11}
                onChangeText={setModalCardIdText}
                value={modalCardIdText}
              />
              <Button title="Add Card" onPress={() => addCard()} />
            </View>
          </View>
        </Modal>
        <TouchableOpacity style={styles.addCardBox} onPress={() => setModalVisible(true)}>
          <Image style={{
            height: 50,
            width: 50
          }} source={require('./assets/plus.png')} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e2124',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerContent: {
    flex: 1,
    width: '90%',
    paddingTop: 20,
    backgroundColor: '#1e2124',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  text: {
    color: '#fff'
  },
  addCardBox: {
    padding: 15,
    width: '100%',
    borderRadius: 15,
    backgroundColor: '#36393e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalView: {
    backgroundColor: '#1e2124',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  modalCardIdTextInput: {
    backgroundColor: '#36393e',
    color: '#fff',
    borderRadius: 15,
    width: 200,
    height: 40,
    margin: 20,
    padding: 10,
  },
});
