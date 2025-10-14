import { router } from 'expo-router';
import React from 'react'
import { Text, View, TextInput, ScrollView, TouchableOpacity } from 'react-native'

type TestingProps = {

}

const Testing: React.FC<TestingProps> = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={{ fontSize: 40 }}>Hi, am Yui</Text>
      <TextInput style={{
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
      }}
        placeholder='Type in'
      />

    </View>

  );
};

export default Testing
