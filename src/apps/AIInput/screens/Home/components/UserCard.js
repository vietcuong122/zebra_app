import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import CustomButton from '../../../../../components/Common/CustomButton';
import CustomText from '../../../../../components/Common/CustomText';

const UserCard = ({ userCode, zone, alley, onStop }) => {
  return (
    <View style={styles.wrapper}>
      <Image
        style={styles.avatar}
        source={require('../../../../../assets/images/staff.png')}
      />
      <View style={styles.info}>
        <CustomText style={styles.text}>
          User: {userCode.toUpperCase()}
        </CustomText>
        <CustomText style={styles.text}>
          Zone: {zone.toUpperCase()} - Alley: {alley.toUpperCase()}
        </CustomText>
        <CustomButton
          onPress={onStop}
          danger
          title={'Stop'}
          style={styles.stopBtn}
        />
      </View>
    </View>
  );
};

export default UserCard;

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: 10,
    paddingVertical: 10,
    width: '100%',
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  avatar: {
    width: 60,
    height: 60,
  },
  info: {
    marginLeft: 20,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    height: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 5,
  },
  stopBtn: {
    width: 80,
    height: 42,
  },
});
