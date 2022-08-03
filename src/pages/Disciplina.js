import { View, Text, ActivityIndicator, StyleSheet,TextInput, Image, FlatList, Alert, TouchableOpacity} from 'react-native'
import {React, useEffect, useState} from 'react'
import {createTable, getDBConnection, saveTurma, getTurmaByCod} from '../database/SQLiteManager'

export default function Disciplina({ route, navigation }) {

  const endpoint = 'https://api-portal-cefet-dev.herokuapp.com/';
  const { disciplina } = route.params;

  const [listObjetos, setListObjetos] = useState([{name: 'p1', value: '8,1'}, {name: 'p2', value: '8,1'}, {name: 'p3', value: '8,1'}]);
  const [formula, setFormula] = useState('(P1 + P2)/2');
  const [media, setMedia] = useState('0,0');

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
    let turmaSave = getTurmaByCod(disciplina.codTurma);
    if (turmaSave != undefined && turmaSave.notas != null){
      setListObjetos(turmaSave.notas.listObjetos);
      setFormula(turmaSave.notas.formula);
      atualizaMedia(turmaSave.notas.formula, turmaSave.notas.listObjetos);
    }
    else{
      let listObjetos_ = [{name: 'P1', value: disciplina.p1}, {name: 'P2', value: disciplina.p2}, {name: 'PF', value: disciplina.pf}];
      setListObjetos(listObjetos_);
      atualizaMedia('(P1 + P2)/2', listObjetos_);
      salvaTurmaAtual(formula, listObjetos_);
    }
  }

  const onBtAddClick = async () => {
    let newList = listObjetos.concat({name: 'PX', value: null});
    setListObjetos(newList);

    atualizaMedia(formula, newList);
    salvaTurmaAtual(formula, newList);
  }

  const onSetNameClick = async (newName, indexName) => {
    let newList = listObjetos.map((item, index) => index == indexName ? ({name: newName, value: item.value}) : item);
    setListObjetos(newList);
    atualizaMedia(formula, newList);
    salvaTurmaAtual(formula, newList);
  }

  const onSetValueClick = async (newValue, indexValue) => {
    let newList = listObjetos.map((item, index) => index == indexValue ? ({name: item.name, value: newValue}) : item);
    setListObjetos(newList);
    atualizaMedia(formula, newList);
    salvaTurmaAtual(formula, newList);
  }

  const onSetFormulaClick = async (newValue) => {
    setFormula(newValue);
    atualizaMedia(newValue, listObjetos);
    salvaTurmaAtual(newValue, listObjetos);
  }

  const atualizaMedia = async (formula_, listObjetos_) => {
    
    let args = listObjetos_.map((item) => (isNaN(parseFloat(item.value))? 0 : parseFloat(item.value)));
    let parm = listObjetos_.map((item) => (item.name));

    try{
      var funcMedia = new Function(parm, "return " + formula_);
      let media = funcMedia.apply(this, args);
      setMedia(media + "");
    }
    catch(err){
      setMedia("Fórmula Inválida!");
    }
  }

  const salvaTurmaAtual = (formula_, listObjetos_) => {
    let turma = {codTurma: disciplina.codTurma, disciplina: disciplina, notas: {listObjetos: listObjetos_, formula: formula_}};
    saveTurma(turma);
  }

  useEffect(() => {
    onScreenLoad();
  }, [])

  return (
    <View style={styles.conteiner}>
        <Text style={styles.materia_nome}>{disciplina.nome}</Text>
        <Text style={styles.materia_turma}>{disciplina.codTurma + " - " + disciplina.situacao}</Text>
        
        <View style={styles.conteiner_pagina}>
          
          <View style={{marginBottom:50, alignSelf:'center'}}>
            <Text style={styles.campo_nome}>
              FÓRMULA
            </Text>
            <TextInput style={{alignSelf:'center'}}
              value={formula}
              onChangeText={text => onSetFormulaClick(text)}
            />
          </View>
          
          <FlatList
                data={listObjetos}
                renderItem={({item, index}) => 
                  <View>
                    <TouchableOpacity style={styles.campo}>
                      <TextInput
                        style={styles.campo_nome}
                        value={item.name}
                        onChangeText={text => onSetNameClick(text, index)}
                      />
                      <TextInput
                        placeholder='Nota'
                        value={item.value}
                        onChangeText={text => onSetValueClick(text, index)}
                        placeholderTextColor='#38ada9'
                      />
                    </TouchableOpacity>
                  </View>
                }
              />

          <View style={{marginBottom:50, marginTop:50, alignSelf:'center'}}>
            <Text style={styles.campo_nome}>
              MÉDIA FINAL
            </Text>
            <TextInput style={{alignSelf:'center'}}
              value={media}
              editable={false}
            />
          </View>

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