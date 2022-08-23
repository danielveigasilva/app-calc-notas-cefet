import { View, Text, StyleSheet,TextInput, Image, FlatList, Alert, TouchableOpacity} from 'react-native'
import {React, useEffect, useState} from 'react'
import {saveTurma, getTurmaByCod} from '../database/SQLiteManager'
import Icon from 'react-native-vector-icons/FontAwesome'

export default function Disciplina({ route, navigation }) {

  const endpoint = 'https://api-portal-cefet-dev.herokuapp.com/';

  const { disciplina, codPeriodo, cookie, matricula } = route.params;

  const [listObjetos, setListObjetos] = useState([]);
  const [formula, setFormula] = useState('(P1 + P2)/2');
  const [media, setMedia] = useState('0,0');
  const [loading, setLoading] = useState(true);

  const onScreenLoad = async () => {

    let unmounted = false;

    try {          
          setLoading(true);
          let turmaSave = getTurmaByCod(disciplina.codTurma);

          if (turmaSave != undefined && turmaSave.notas != null){
            let listObjects = turmaSave.notas.listObjetos;

            setListObjetos(listObjects);
            setFormula(turmaSave.notas.formula);
            atualizaMedia(turmaSave.notas.formula, listObjects);

            let responseDisciplinas = await fetch(endpoint + 'periodos/' + codPeriodo + '/disciplinas?' + 'cookie=' + cookie + '&' + 'matricula=' + matricula);
            let jsonDisciplinas = await responseDisciplinas.json();
      
            if (jsonDisciplinas.code == 200) {
              if(!unmounted){

                jsonDisciplinas.data.forEach(materia => {
                  if(materia.codTurma == disciplina.codTurma){
                    
                    let newList = listObjects.map((item) => 
                      (item.originalName == 'P1' && item.value != materia.p1 && materia.p1 != '') || 
                      (item.originalName == 'P2' && item.value != materia.p2 && materia.p2 != '') ||
                      (item.originalName == 'PF' && item.value != materia.pf && materia.pf != '') ? 
                      ({
                          name: item.name, 
                          value: item.value, 
                          originalName: item.originalName, 
                          alert: true,
                          valuePortal: item.originalName == 'P1' ? materia.p1 : item.originalName == 'P2' ? materia.p2 : item.originalName == 'PF' ? materia.pf : item.value
                        }) : item);

                    setListObjetos(newList);
                    setLoading(false);
                  }
                });

              }
            }

          }
          else{

            let listObjetos_ = [{name: 'P1', value: disciplina.p1, originalName: 'P1', alert: false, valuePortal: null}, {name: 'P2', value: disciplina.p2, originalName: 'P2', alert: false, valuePortal: null}, {name: 'PF', value: disciplina.pf, originalName: 'PF', alert: false, valuePortal: null}];

            setListObjetos(listObjetos_);
            atualizaMedia('(P1 + P2)/2', listObjetos_);
            salvaTurmaAtual(formula, listObjetos_);

            setLoading(false);
          }

          return () => {
            unmounted = true
          }
    }
    catch(error){
      
    }
  }

  const onBtAddClick = async () => {
    let newList = listObjetos.concat({name: 'PX', value: null, originalName: null, alert: false, valuePortal: null});
    setListObjetos(newList);

    atualizaMedia(formula, newList);
    salvaTurmaAtual(formula, newList);
  }

  const onBtRmClick = async (indexValue) => {

    Alert.alert(  
      'Remover Avaliação',  
      'Tem certeza que deseja remover esta avaliação?',  
      [  
          {  
              text: 'Não',  
              style: 'cancel',  
          },  
          {
            text: 'Sim', 
            onPress: () => {
              let newList = [];
              for (var index = 0 ; index < listObjetos.length; index++){
                if (index != indexValue){
                  newList = newList.concat(listObjetos[index]);
                }
              }
              setListObjetos(newList);
              atualizaMedia(formula, newList);
              salvaTurmaAtual(formula, newList);
            } 
          },  
      ]  
    );  

  }

  const onBtAlertClick = async (indexValue) => {

    let nota = listObjetos[indexValue];

    Alert.alert(  
      'Diferença de dados',  
      'Identificamos que nota da avaliação ' + nota.name + ' está com valor ' + nota.value + ' no aplicativo, mas no portal foi atualizada para o valor ' + nota.valuePortal + '. Deseja atualizar a nota?',  
      [  
          {  
              text: 'Não',  
              style: 'cancel',  
          },  
          {
            text: 'Sim', 
            onPress: () => {
              let newList = listObjetos.map((item, index) => index == indexValue ? ({name: item.name, value: item.valuePortal, originalName: item.originalName, alert: false, valuePortal: item.valuePortal}) : item);

              setListObjetos(newList);
              atualizaMedia(formula, newList);
              salvaTurmaAtual(formula, newList);
            } 
          },  
      ]  
    );  
  }

  const onSetNameClick = async (newName, indexName) => {
    let newList = listObjetos.map((item, index) => index == indexName ? ({name: newName, value: item.value, originalName: item.originalName, alert: item.alert, valuePortal: item.valuePortal}) : item);
    setListObjetos(newList);
    atualizaMedia(formula, newList);
    salvaTurmaAtual(formula, newList);
  }

  const onSetValueClick = async (newValue, indexValue) => {
    if (newValue.match(/^\d+(\,\d+)?$/) || newValue == "" || (newValue[newValue.length - 1] == ',' && (newValue.split(',').length - 1) == 1)){
      let newList = listObjetos.map((item, index) => index == indexValue ? ({name: item.name, value: newValue, originalName: item.originalName, alert: item.alert, valuePortal: item.valuePortal}) : item);
      setListObjetos(newList);
      atualizaMedia(formula, newList);
      salvaTurmaAtual(formula, newList);
    }
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
                  <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>

                    {item.alert && (
                        <TouchableOpacity 
                          disabled={loading}
                          onPress={() => onBtAlertClick(index)}>
                            <Icon name="warning" size={25} color="#FF6400" />
                        </TouchableOpacity>
                      )}

                    {item.originalName == null && (
                      <TouchableOpacity 
                        disabled={loading}
                        onPress={() => {onBtRmClick(index)}}
                      >
                        <Icon name="remove" size={25} color="#FF0000" />
                      </TouchableOpacity>
                    )}

                    {(!item.alert && item.originalName != null) && (
                      <Icon name="lock" size={25} color="#0000FF" />
                    )}
                    
                    <TouchableOpacity style={styles.campo}>
                      <TextInput
                        style={styles.campo_nome}
                        value={item.name}
                        editable={!loading}
                        onChangeText={text => onSetNameClick(text, index)}
                      />
                      <TextInput
                        placeholder='Nota'
                        value={item.value}
                        editable={!loading}
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
            disabled={loading}
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
  buttonRM:{
    backgroundColor:'#38ada9',
    borderRadius:50,
    alignSelf:'center',
    alignItems:'baseline',
    justifyContent:'center',
    width: '15%',
    height: '15%',
    paddingVertical:1
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