import { View, Text, ActivityIndicator, StyleSheet, Image, FlatList, Alert, TouchableOpacity} from 'react-native'
import {React, useEffect, useState} from 'react'

export default function Materias({ route, navigation }) {

  const endpoint = 'https://api-portal-cefet.herokuapp.com/';
  const { cookie, matricula } = route.params;

  const onScreenLoad = async () => {
    setLoading(true);
    let unmounted = false;

    try {

      let response = await fetch(endpoint + 'periodos/2022.1/disciplinas?' + 'cookie=' + cookie + '&' + 'matricula=' + matricula);
      let json = await response.json();

      //Se conseguiu logar
      if (json.code == 200) {
        if(!unmounted){
          
          let list = [];

          json.data.forEach(materia => {
            list = list.concat(materia);
          });
          
          setListMaterias(list);
          setLoading(false);
        }
      }
      else {
        Alert.alert('Ocorreu um erro', json.data);
        setLoading(false);
      }

    }catch (error) {
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
    let info =  "Código : " + materia.codDisciplina + "\n" +
                "P1     : " + materia.p1 + "\n" +
                "P2     : " + materia.p2 + "\n" +
                "PF     : " + materia.pf + "\n" +
                "Média  : " + materia.media + "\n" +
                "M Final: " + materia.mediaFinal; 

    Alert.alert(materia.nome + ' (' + materia.codTurma + ')', info);
  }

  const [loading, setLoading] = useState(false);
  const [listMaterias, setListMaterias] = useState([]);

  return (
    <View style={styles.conteiner}>
        {loading && (
          <View>
              <ActivityIndicator animating={loading} style={{alignSelf:'center'}}/>
              <Text style={{alignSelf:'center'}}>Carregando Matérias</Text>
          </View>
        )}
        {!loading && (
          <View>
            {listMaterias.map((mat) => (
              <TouchableOpacity
                key={mat.codTurma} 
                style={styles.button}
                onPress={() => {onBtnMateriaClick(mat)}}
                disabled={loading}
              >
                  <Text style={styles.buttonText}>{mat.nome}</Text>
            </TouchableOpacity>
            ))}
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
  button:{
    height: 100,
    marginTop: 5,
    backgroundColor:'#38ada9',
    borderRadius:5,
    alignSelf:'center',
    alignItems:'baseline',
    justifyContent:'center',
    width:'100%',
    paddingVertical:10
  },
  buttonText:{
    alignSelf:'center',
    fontSize: 15,
    color:'#FFFFFF',
    fontWeight:'bold'
  }
})