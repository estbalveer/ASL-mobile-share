import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import styles from './styles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {Button} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {userActions} from '../../../redux/actions/AuthAction';

const AccountScreen = ({navigation}) => {
  const [user, setUser] = useState('');
  const dispatch = useDispatch();

  const logout = () => {
    dispatch(userActions.logout());
    navigation.navigate('Login');
  };

  const getUser = async () => {
    const user = await AsyncStorage.getItem('user');
    const parsedUser = JSON.parse(user);
    setUser(parsedUser);
  };
  useEffect(() => {
    getUser();
  }, []);
  return (
    <View style={styles.container}>
      <FontAwesome5 name="user-circle" size={60} />
      <Text>{user.full_name}</Text>
      <Button
        style={styles.logoutButton}
        mode="outlined"
        color="#004488"
        onPress={logout}>
        Logout
      </Button>
    </View>
  );
};

export default AccountScreen;
