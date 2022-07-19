import { View, Text, ActivityIndicator, StyleSheet,TextInput, Image, FlatList, Alert, TouchableOpacity} from 'react-native'
import {React, useEffect, useState} from 'react'
import { Picker } from '@react-native-picker/picker';

export default function Disciplina({ route, navigation }) {

  const endpoint = 'https://api-portal-cefet.herokuapp.com/';
  const { disciplina } = route.params;

  const [listObjetos, setListObjetos] = useState([{name: 'p1', value: '8,1'}, {name: 'p2', value: '8,1'}, {name: 'p3', value: '8,1'}]);

  /** 
   * "codDisciplina": "GCOM1002PE",
            "codTurma": "T.1002",
            "media": "8,9",
            "mediaFinal": "8,9",
            "nome": "ADMINISTRACAO E ORGANIZACAO EMPRESARIAL",
            "p1": "10,0",
            "p2": "7,8",
            "pf": "",
            "situacao": "Aprovado"
  */
  const onScreenLoad = async () => {
    setListObjetos([{name: 'Prova 1', value: disciplina.p1}, {name: 'Prova 2', value: disciplina.p2}, {name: 'Prova Final', value: disciplina.pf}]);
  }

  const onBtAddClick = async () => {
    let newList = listObjetos.concat({name: 'Prova X', value: null});
    setListObjetos(newList);
  }

  useEffect(() => {
    onScreenLoad();
  }, [])

  return (
    <View style={styles.conteiner}>
        <Text style={styles.materia_nome}>{disciplina.nome}</Text>
        <Text style={styles.materia_turma}>{disciplina.codTurma + " - " + disciplina.situacao}</Text>
        <View style={styles.conteiner_pagina}>
          <FlatList
                data={listObjetos}
                renderItem={({item}) => 
                  <View>
                    <TouchableOpacity style={styles.campo}>
                      <Text style={styles.campo_nome} >{item.name}</Text>
                      <TextInput
                        placeholder='Nota'
                        value={item.value}
                        placeholderTextColor='#38ada9'
                      />
                    </TouchableOpacity>
                  </View>
                }
              />
          <TouchableOpacity 
            style={styles.button}
            onPress={() => {onBtAddClick()}}
          >
            <Text style={styles.buttonText}>Adicionar Avaliação</Text>
          </TouchableOpacity>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  conteiner: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100
  },
  conteiner_pagina: {
    paddingTop: 100
  },
  campo:{
    margin: 13
  },
  campo_nome: {
    fontSize: 15,
    fontWeight:'bold'
  },
  materia_nome: {
    fontSize: 15,
    fontWeight:'bold'
  },
  materia_turma: {
    fontSize: 10
  },
  button:{
    backgroundColor:'#38ada9',
    borderRadius:50,
    alignSelf:'center',
    alignItems:'baseline',
    justifyContent:'center',
    width: '100%',
    height: '7%',
    paddingVertical:1,
    marginBottom: 70,
    marginTop: 20
  },
  buttonText:{
    alignSelf:'center',
    fontSize: 15,
    marginLeft: 10,
    marginRight: 10,    
    color:'#FFFFFF',
    fontWeight:'bold'
  }
})