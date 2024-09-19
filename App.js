import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity, Modal, Button, TextInput, ScrollView } from 'react-native';
import axios from 'axios';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://emin-homeserver.online/users';

export default function App() {
  const [modalCardIdText, setModalCardIdText] = useState('');
  const [modalTagText, setModalTagText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoKey, setInfoKey] = useState(null);
  const [views, setViews] = useState([]);

  const editCard = async () => {
    if (modalCardIdText.length >= 11) {
      setInfoModalVisible(!infoModalVisible);
      let cardid = modalCardIdText;
      let tagtext = modalTagText;
      setModalCardIdText('');
      setModalTagText('');
      let cards = '';

      try {
        const response = await axios.get(API_URL);
        for (var i=0; i < response.data['length']; i++) {
          if (response.data[i]['UUID'] === await AsyncStorage.getItem('device_id')) {
            cards = response.data[i]['Cards'];
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      const cleanedCards = cards.replace(/,$/, '');
      const card = cleanedCards.split(',');
      card[infoKey] = cardid + '-' + tagtext;
      
      cards = '';
      for (var i=0; i < card.length; i++) {
        cards += card[i];
        cards += ',';
      }

      try {
        const response = await axios.put(API_URL + '/' + await AsyncStorage.getItem('device_id'), {
          Cards: cards,
          append: false
        });
      } catch (error) {
        console.error('Error adding card:', error);
      }
    }
  };

  const deleteCard = async () => {
    setInfoModalVisible(!infoModalVisible);
    setModalCardIdText('');
    setModalTagText('');
    let cards = '';

    try {
      const response = await axios.get(API_URL);
      for (var i=0; i < response.data['length']; i++) {
        if (response.data[i]['UUID'] === await AsyncStorage.getItem('device_id')) {
          cards = response.data[i]['Cards'];
        }
      }
    } catch (error) {
      console.error('Error updating data:', error);
    }

    const cleanedCards = cards.replace(/,$/, '');
    const card = cleanedCards.split(',');
    card[infoKey] = '';
    
    cards = '';
    for (var i=0; i < card.length; i++) {
      cards += card[i];
      if (card[i] !== '') {
        cards += ',';
      }
    }

    try {
      const response = await axios.put(API_URL + '/' + await AsyncStorage.getItem('device_id'), {
        Cards: cards,
        append: false
      });
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const cardInfo = async (key) => {
    setInfoKey(key);
    let cards = '';

    try {
      const response = await axios.get(API_URL);
      for (var i=0; i < response.data['length']; i++) {
        if (response.data[i]['UUID'] === await AsyncStorage.getItem('device_id')) {
          cards = response.data[i]['Cards'];
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    const cleanedCards = cards.replace(/,$/, '');
    const card = cleanedCards.split(',');
    const infocardtag = card[key].split('-')[1];
    const infocardid = card[key].split('-')[0];

    setModalTagText(infocardtag);
    setModalCardIdText(infocardid);
    setInfoModalVisible(true);
  };

  const goBack = async () => {
    setInfoModalVisible(false);
    setModalVisible(false);
    setInfoKey(null);
    setModalCardIdText('');
    setModalTagText('');
  };

  const addCard = async () => {
    if (modalCardIdText.length >= 11) {
      setModalVisible(!modalVisible);
      let cardid = modalCardIdText;
      let tagtext = modalTagText;
      setModalCardIdText('');
      setModalTagText('');

      try {
        const response = await axios.put(API_URL + '/' + await AsyncStorage.getItem('device_id'), {
          Cards: cardid + '-' + tagtext + ',',
          append: true
        });
      } catch (error) {
        console.error('Error adding card:', error);
      }
    }
  };

  const loadCards = async () => {
    setTimeout(async () => {
      let cardInformation = ''
      const newViews = [];

      try {
        const response = await axios.get(API_URL);
        for (var i=0; i < response.data['length']; i++) {
          if (response.data[i]['UUID'] === await AsyncStorage.getItem('device_id')) {
            cardInformation = response.data[i]['Cards'];
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      const elements = cardInformation.split(',').filter(el => el);

      const count = elements.length;
      const ids = [];
      const tags = [];

      elements.forEach(element => {
        const [id, tag] = element.split('-');
        ids.push(id);
        tags.push(tag);
      });

      for (var i=0; i < count; i++) {
        const url = "https://service.kentkart.com/rl1/api/card/balance?region=004&lang=tr&authType=3&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrZW50a2FydC5jb20iLCJzdWIiOiJBQzE2IiwiYXVkIjoiYUMxdW4iLCJleHAiOjE3NjcyMTQ4MDAsIm5iZiI6MTY5Mjk2ODY2OSwiaWF0IjoxNjkyOTY4NjY5LCJqdGkiOiJmOWM5MDFmMi1iMTgzLTQ1NjYtYjIwYi1hMGI0YjZiYzM0MjUiLCJzeXN0ZW1faWQiOiIwMDQiLCJzY29wZXMiOltdfQ.V9c4Ud9Vjpc1bzHXnM1aL96xLCgeWQ1B3NejsdMTYow_eHgu8M6FiYFqYu9d56VjYwAJ7eMpFvr7cQPfRKCcAzB4MB0tyJWwS6LZybKlZvpu5XMiVhrh_wDYvvhbLO22oucYL7OIke0LFf92DLE65uhO7bbUv6pG6-RCUND7Ggn-v5B8XjjtYNUGU5-L27vr5iVLH_7pA7-Pw4EPHUQRP1rocxnhQYkVwk5T2I_NIMYOaL3ycDa_Mv_u9SfB0hBgcp9cEVU9PoxvlX8TP24rRjJtGVSlt0ina8EFh-20FzlqBPc8OjFjAbjegaynmOtrPOf3hCcrm80ZgS60o4IpOw&alias=" + ids[i];
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
          }
          const json = await response.json();
          const balance = json["cardlist"][0]["balance"];
          const lastusage = json["cardlist"][0]["usage"][0]["date"];

          newViews.push({
            idnumber: i,
            cardidtext: ids[i],
            tagtext: tags[i],
            balancetext: balance,
            lastusagetext: lastusage
          });

        } catch (error) {
          console.error(error.message);
          newViews.push({
            idnumber: i,
            cardidtext: ids[i],
            tagtext: tags[i],
            balancetext: 'Error',
            lastusagetext: 'Error'
          });
        }
      }
      setViews(newViews);
    }, 1000);
  };
  
  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    const initializeUniqueId = async () => {
      try {
        let id = await AsyncStorage.getItem('device_id');
        if (!id) {
          id = uuidv4();
          await AsyncStorage.setItem('device_id', id);
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
      } catch (error) {
        console.error('Error adding user:', error);
      }
    };

    readUsers();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.containerContent}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.modalBackground}>
            <View style={styles.modalView}>
              <View style={styles.modalHead}>
                <View style={{
                  width: '25%',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}>
                  <TouchableOpacity>
                    <Image style={{
                      height: 25,
                      width: 25
                    }} source={require('./assets/nfc.png')} />
                  </TouchableOpacity>
                </View>
                <View style={{
                  width: '50%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{
                    color: '#fff'
                  }}>Card Information</Text>
                </View>
                <View style={{
                  width: '25%',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}>
                  <TouchableOpacity onPress={() => goBack()}>
                    <Image style={{
                      height: 25,
                      width: 25
                    }} source={require('./assets/back.png')} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.modalContent}>
              <Text style={styles.textModal}>Tag</Text>
                <TextInput
                  style={styles.modalCardIdTextInput}
                  maxLength={10}
                  onChangeText={setModalTagText}
                  value={modalTagText}
                />
                <Text style={styles.textModal}>Card ID</Text>
                <TextInput
                  style={styles.modalCardIdTextInput}
                  maxLength={11}
                  onChangeText={setModalCardIdText}
                  value={modalCardIdText}
                />
                <TouchableOpacity style={{
                  borderRadius: 15,
                  padding: 10,
                  backgroundColor: '#258fff'
                }} onPress={() => {addCard(); loadCards();}}>
                  <Text style={{
                    color: '#fff'
                  }}>Add Card</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={infoModalVisible}
          onRequestClose={() => {
            setInfoModalVisible(!infoModalVisible);
          }}>
          <View style={styles.modalBackground}>
            <View style={styles.modalView}>
              <View style={styles.modalHead}>
                <View style={{
                  width: '25%',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}></View>
                <View style={{
                  width: '50%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{
                    color: '#fff'
                  }}>Card Information</Text>
                </View>
                <View style={{
                  width: '25%',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}>
                  <TouchableOpacity onPress={() => goBack()}>
                    <Image style={{
                      height: 25,
                      width: 25
                    }} source={require('./assets/back.png')} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.modalContent}>
              <Text style={styles.textModal}>Tag</Text>
                <TextInput
                  style={styles.modalCardIdTextInput}
                  maxLength={10}
                  onChangeText={setModalTagText}
                  value={modalTagText}
                />
                <Text style={styles.textModal}>Card ID</Text>
                <TextInput
                  style={styles.modalCardIdTextInput}
                  maxLength={11}
                  onChangeText={setModalCardIdText}
                  value={modalCardIdText}
                />
                <View style={{
                  flexDirection: 'row'
                }}>
                  <TouchableOpacity style={{
                    borderRadius: 15,
                    padding: 10,
                    backgroundColor: '#258fff',
                    marginRight: 10
                  }} onPress={() => {editCard(); loadCards();}}>
                    <Text style={{
                      color: '#fff'
                    }}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{
                    borderRadius: 15,
                    padding: 10,
                    backgroundColor: '#ff2525'
                  }} onPress={() => {deleteCard(); loadCards();}}>
                    <Text style={{
                      color: '#fff'
                    }}>Delete Card</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        {views.map((view) => (
          <TouchableOpacity key={view.idnumber} onPress={() => cardInfo(view.idnumber)} style={{
            padding: 15,
            marginTop: 10,
            height: 150,
            width: '100%',
            borderRadius: 15,
            backgroundColor: '#36393e',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row'
          }}>
            <View style={{
              width: '50%',
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}>
              <View style={{
                height: 50,
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
              }}>
                <Text style={{
                  color: '#fff',
                  fontSize: 25
                }}>{view.tagtext}</Text>
              </View>
              <View style={{
                height: 50,
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
              }}>
                <Text style={{
                  color: '#fff',
                  fontSize: 20
                }}>{view.cardidtext.replace(/(\d{5})(\d{5})(\d{1})/, '$1-$2-$3')}</Text>
              </View>
            </View>
            <View style={{
              width: '50%',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}>
              <View style={{
                height: 50,
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
              }}>
                
              </View>
              <View style={{
                width: '100%',
                height: 50,
                alignItems: 'flex-end',
                justifyContent: 'flex-end'
              }}>
                <View style={{
                  height: 50,
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  flexDirection: 'row'
                }}>
                  <Text style={{
                    color: '#fff',
                    fontSize: 30,
                    textAlign: 'right'
                  }}>{view.balancetext}</Text>
                  <Text style={{
                    color: '#fff',
                    fontSize: 17.5,
                    textAlign: 'right'
                  }}>₺</Text>
                </View>
                <View style={{
                  height: 50,
                  alignItems: 'flex-start',
                  justifyContent: 'flex-end',
                }}>
                  <Text style={{
                    color: '#fff',
                    fontSize: 10,
                    textAlign: 'right'
                  }}>Last usage: {view.lastusagetext.slice(0, 10) + '\n' + view.lastusagetext.slice(10)}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.addCardBox} onPress={() => setModalVisible(true)}>
          <Image style={{
            height: 50,
            width: 50
          }} source={require('./assets/plus.png')} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e2124',
    alignItems: 'center',
    justifyContent: 'center'
  },
  containerContent: {
    flex: 1,
    width: '90%',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#1e2124',
  },
  textModal: {
    color: '#fff',
    width: 200,
  },
  addCardBox: {
    padding: 15,
    marginTop: 10,
    width: '100%',
    borderRadius: 15,
    backgroundColor: '#36393e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalView: {
    backgroundColor: '#1e2124',
    borderRadius: 15,
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
    marginRight: 20,
    marginLeft: 20,
    marginBottom: 20,
    marginTop: 5,
    padding: 10,
  },
  modalHead: {
    flexDirection: 'row',
    width: 250,
    height: 30,
    marginTop: 20,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    paddingRight: 30,
    paddingLeft: 30,
    paddingBottom: 30,
    paddingTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
