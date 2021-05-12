import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Container from '../../../../../components/Common/Container';
import Input from '../../../../../components/Common/Input';
import CustomButton from '../../../../../components/Common/CustomButton';

import styles from './styles';
import UserCard from './UserCard';
import { TextInput } from 'react-native';

const HomeComponent = ({
  onChange,
  onSubmit,
  onSave,
  onStop,
  form,
  errors,
  barcode,
  quantity,
}) => {
  console.log(`quantity`, quantity);
  return (
    <Container>
      <Image
        style={styles.logo}
        source={require('../../../../../assets/images/logo.png')}
      />
      {!form.showQrSection && (
        <View>
          <Input
            label={'User'}
            value={form.userCode}
            onChangeText={(value) => {
              onChange({ name: 'userCode', value });
            }}
            error={errors.userCode}
            editable={form.editable}
            maxLength={15}
          />
          <Input
            label={'Zone'}
            value={form.zone}
            onChangeText={(value) => {
              onChange({ name: 'zone', value });
            }}
            error={errors.zone}
            editable={form.editable}
            maxLength={9 - form.alley?.length || 8}
          />
          <Input
            label={'Alley'}
            value={form.alley}
            onChangeText={(value) => {
              onChange({ name: 'alley', value });
            }}
            error={errors.alley}
            editable={form.editable}
            maxLength={9 - form.zone?.length || 1}
          />

          <CustomButton
            onPress={onSubmit}
            style={{ marginTop: 20 }}
            title={'Start'}
            primary
          />
        </View>
      )}
      {form.showQrSection && (
        <View>
          <UserCard
            userCode={form.userCode}
            zone={form.zone}
            alley={form.alley}
            onStop={onStop}
          />
          <View style={styles.qrWrapper}>
            <Input
              label={'barcode'}
              value={barcode}
              onChangeText={(value) => {
                console.log('call change from components');
                onChange({ name: 'barcode', value });
              }}
              error={errors.barcode}
              maxLength={13}
              keyboardType={'numeric'}
            />

            <Input
              label={'Tuongbede'}
              onChangeText={(text) => {
                onChange({ name: 'quantity', value: text });
              }}
              value={quantity}
              error={errors.quantity}
              maxLength={8}
              keyboardType={'numeric'}
            />

            <CustomButton
              onPress={onSave}
              style={{ marginTop: 20 }}
              title={'Save'}
              primary
            />
          </View>
        </View>
      )}
    </Container>
  );
};

export default HomeComponent;
