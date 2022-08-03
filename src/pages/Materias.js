import { View, Text, ActivityIndicator, StyleSheet, Image, FlatList, Alert, TouchableOpacity} from 'react-native'
import {React, useEffect, useState} from 'react'
import { Picker } from '@react-native-picker/picker';

export default function Materias({ route, navigation }) {

  const endpoint = 'https://api-portal-cefet-dev.herokuapp.com/';
  const { cookie, matricula } = route.params;

  const onScreenLoad = async () => {

    setLoading(true);
    let unmounted = false;
    setDescricaoLoad("Acessando portal");

    try {

      setDescricaoLoad("Carregando dados do aluno");
      let responseDados = await fetch(endpoint + 'perfil/academico?' + 'cookie=' + cookie + '&' + 'matricula=' + matricula);
      let jsonDados = await responseDados.json();

      if (jsonDados.code == 200)
        if(!unmounted)
          setDadosPerfil(jsonDados.data);
      else {
        Alert.alert('Ocorreu um erro', jsonDados.data);
        setLoading(false);
      }


      setDescricaoLoad("Carregando períodos");
      let responsePeriodos = await fetch(endpoint + 'periodos?' + 'cookie=' + cookie + '&' + 'matricula=' + matricula);
      let jsonPeriodos = await responsePeriodos.json();

      let newListMateriasCache = [];
      
      if (jsonPeriodos.code == 200)
        
        if(!unmounted){

          setPeriodos(jsonPeriodos.data);

          setDescricaoLoad("Carregando disciplinas");
          setPeriodoSelecionado(jsonPeriodos.data[0].cod);
          
          let responseDisciplinas = await fetch(endpoint + 'periodos/' + jsonPeriodos.data[0].cod + '/disciplinas?' + 'cookie=' + cookie + '&' + 'matricula=' + matricula);
          let jsonDisciplinas = await responseDisciplinas.json();
    
          //Se conseguiu logar
          if (jsonDisciplinas.code == 200) {
            if(!unmounted){
              
              let list = [];
    
              jsonDisciplinas.data.forEach(materia => {
                list = list.concat(materia);
              });

              setListMaterias(list);
              
              newListMateriasCache = jsonPeriodos.data.map((periodo)=>(
                [{periodoCod: periodo.cod, materias: null}]
              ));
              newListMateriasCache[0].materias = list;
    
              setListMateriasCache(newListMateriasCache);
              setLoading(false);
            }
          }
          else {
            Alert.alert('Ocorreu um erro', jsonDisciplinas.data);
            setLoading(false);
          }
        }
      else {
        Alert.alert('Ocorreu um erro', jsonPeriodos.data);
        setLoading(false);
      }

      setLoading(false);

    } catch (error) {
      Alert.alert('Ocorreu um erro', 'Algo de errado não está certo: ' + error);
      setLoading(false);
    }

    return () => {
      unmounted = true
    }
  }
  
  useEffect(() => {
    onScreenLoad();
  }, [])

  const onBtnMateriaClick = async (materia) => {
    
    navigation.navigate('Disciplina', {
      disciplina: materia
    });

  }

  const onValueChangePeriodo = async (periodoCod, index) => {

      setPeriodoSelecionado(periodoCod);
      let unmounted = false;

      if (listMateriasCache[index].materias == null){

        setLoading(true);
        setDescricaoLoad("Carregando disciplinas (" + periodoCod + ")");

        let responseDisciplinas = await fetch(endpoint + 'periodos/' + periodoCod + '/disciplinas?' + 'cookie=' + cookie + '&' + 'matricula=' + matricula);
        let jsonDisciplinas = await responseDisciplinas.json();

        if (jsonDisciplinas.code == 200) {
          if(!unmounted){
            
            let list = [];

            jsonDisciplinas.data.forEach(materia => {
              list = list.concat(materia);
            });
            
            setListMaterias(list);
            
            let newListMateriasCache = listMateriasCache;
            newListMateriasCache[index].materias = list;
            setListMateriasCache(newListMateriasCache);

            setLoading(false);
          }
        }
        else {
          Alert.alert('Ocorreu um erro', jsonDisciplinas.data);
          setLoading(false);
        }
      }
      else
        setListMaterias(listMateriasCache[index].materias);

      return () => {
        unmounted = true
      }
  }

  const [loading, setLoading] = useState(false);
  const [descricaoLoad, setDescricaoLoad] = useState("Carregando");
  const [listMaterias, setListMaterias] = useState([]);
  const [listMateriasCache, setListMateriasCache] = useState([]);
  const [dadosPerfil, setDadosPerfil] = useState({});
  const [periodos, setPeriodos] = useState([]);
  const [periodoSelecionado, setPeriodoSelecionado] = useState("");

  return (
    <View style={styles.conteiner}>
        {loading && (
          <View>
              <ActivityIndicator animating={loading} style={{alignSelf:'center'}}/>
              <Text style={{alignSelf:'center'}}>{descricaoLoad}</Text>
          </View>
        )}
        {!loading && (
          <View style={styles.conteiner_pagina}>
            <Text>{"BEM VINDO, " + dadosPerfil?.nome?.split(" ")[0] + "!"}</Text>
            <Text>{dadosPerfil?.curso + " - " + dadosPerfil?.codCampus}</Text>
            <View style={styles.conteiner_listagem}>
              <Picker
                onValueChange={(periodoCod, index) => onValueChangePeriodo(periodoCod, index)}
                mode="dropdown"
                selectedValue={periodoSelecionado}
              >
                {periodos.map((item, index) => (
                  <Picker.Item
                    label={item.cod}
                    value={item.cod}
                    index={index}
                    key={item.cod}
                  />
                ))}
              </Picker>
              <FlatList
                data={listMaterias}
                renderItem={({item}) => 
                  <View>
                    <TouchableOpacity 
                      style={styles.materia}
                      onPress={()=>onBtnMateriaClick(item)}
                      >
                      <Text style={styles.materia_nome}>{item.nome}</Text>
                      <Text style={styles.materia_turma}>{item.codTurma + " - " + item.situacao}</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            </View>
          </View>
        )}
    </View>
  )
}

const styles = StyleSheet.create({
  conteiner: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center'
  },
  materia:{
    margin: 13
  },
  materia_nome: {
    fontSize: 15,
    fontWeight:'bold'
  },
  materia_turma: {
    fontSize: 10
  },
  conteiner_pagina: {
    paddingTop: 100
  },
  conteiner_listagem: {
    paddingTop: 50
  }
})