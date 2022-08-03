import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'

export default function Login() {

  const navigation = useNavigation();
  const endpoint = 'https://api-portal-cefet-dev.herokuapp.com/';

  const onBtnEntrarClick = async (matricula, senha) => {
    setLoading(true);

    let _matricula = matricula == '' ? '1820391GCOM' : matricula;
    let _senha = senha == ''? 'dvsa100800*' : senha;

    try {
      
      let response = await fetch(endpoint + 'autenticacao', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuario: _matricula,
          senha: _senha
        })
      });

      let json = await response.json();

      //Se conseguiu logar
      if (json.code == 200){
        setLoading(false);
        
        let _cookie = json.data.cookie;
        let _matricula = json.data.matricula;
        
        navigation.navigate('Materias', {
          cookie: _cookie,
          matricula: _matricula
        });
      }
      else {
        Alert.alert('Falha ao logar', json.data);
        setLoading(false);
      }

    }
    catch (error) {
      Alert.alert('Falha ao logar', 'Algo de errado não está certo: ' + error);
      setLoading(false);
    }
  }

  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.conteiner}>
      <View style={styles.conteinerLogo}>
      <Image
          source={require('../assets/logo.png')}
          style={{width:'70%', alignSelf:'center'}}
          resizeMode='contain'
        />
      </View>

      <Text style={{alignSelf:'center', color:'#38ada9', fontSize:30, fontWeight:'bold'}} >Calcula Notas CEFET</Text>
      
      <View style={styles.conteinerLogin}>
        <Text style={styles.textItem} >Matrícula</Text>
        <TextInput
          placeholder='Digite sua Matrícula'
          style={styles.inputItem}
          value={matricula}
          onChangeText={text => setMatricula(text)}
          placeholderTextColor='#38ada9'
          editable={!loading}
          disabled={loading}
        />

        <Text style={styles.textItem} >Senha</Text>
        <TextInput
          placeholder='Digite sua Senha'
          secureTextEntry={true}
          value={senha}
          style={styles.inputItem}
          onChangeText={text => setSenha(text)}
          placeholderTextColor='#38ada9'
          editable={!loading}
          disabled={loading}
        />

        <TouchableOpacity 
          style={styles.button}
          onPress={() => {onBtnEntrarClick(matricula, senha)}}
          disabled={loading}
        >
          {loading && (
            <ActivityIndicator animating={loading} color='#FFFFFF' style={{alignSelf:'center'}}/>
          )}
          {!loading && (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  conteiner: {
    flex:1,
    backgroundColor:'#FFFFFF'
  },
  conteinerLogin: {
    flex:1,
    backgroundColor:'#FFFFFF',
    paddingLeft:25,
    paddingRight:25,
    paddingTop:30
  },
  conteinerLogo: {
    flex:1,
    backgroundColor:'#FFFFFF',
  },
  button:{
    marginTop: 40,
    backgroundColor:'#38ada9',
    borderRadius:50,
    alignSelf:'center',
    alignItems:'baseline',
    justifyContent:'center',
    width: '50%',
    height: '12%',
    paddingVertical:8
  },
  buttonText:{
    alignSelf:'center',
    fontSize: 25,
    color:'#FFFFFF',
    fontWeight:'bold'
  },
  textItem:{
    fontSize: 24,
    marginTop: 28
  },
  inputItem:{
    marginBottom:20,
    borderBottomWidth:1,
    height: 40
  }
})