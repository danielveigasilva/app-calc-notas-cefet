import {createNativeStackNavigator} from '@react-navigation/native-stack'

import Login from './pages/Login'
import Materias from './pages/Materias'

const Stack = createNativeStackNavigator()

export default function Routes() {
  return (
    <Stack.Navigator>
        <Stack.Screen 
            name='Login' 
            component={Login}
            options={{headerShown:false}}
        />
        <Stack.Screen 
            name='Materias' 
            component={Materias}
            options={{headerShown:false}}
        />
    </Stack.Navigator>
  )
}