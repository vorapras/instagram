import { createAppContainer } from "react-navigation";
import { createStackNavigator } from 'react-navigation-stack';

//screens
import Login from '../screens/Login.js';
import Signup from '../screens/Signup.js';

const StackNavigator = createStackNavigator({
    Login: {
        screen: Login,
        navigationOptions: {
            header: null
        }
    },
    Signup: {
        screen: Signup,
        navigationOptions: {
            title: 'Signup'
        }
    }
});

export default createAppContainer(StackNavigator);