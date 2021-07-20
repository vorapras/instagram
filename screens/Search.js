import React from 'react';
import { Text, TextInput, View, Image, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styles from '../styles.js';
import db from '../config/firebase';
import { getUser } from '../actions/user';

class Search extends React.Component {

  state = {
    search: '',
    query: []
  }

  searchUser = async () => {
    let search = []
    const query = await db.collection('users').where('username', '>=', this.state.search).get()
    query.forEach((response) => {
      search.push(response.data())
    })
    this.setState({query: search})
  }

  goToUser = (user) => {
    this.props.getUser(user.uid, 'GET_PROFILE')
    this.props.navigation.navigate('Profile')
  }

  render(){
    return (
      <SafeAreaView style={styles.container}>
        <TextInput
  	        style={styles.input}
  	        onChangeText={(search) => this.setState({search})}
  	        value={this.state.search}
  	        returnKeyType='send'
            placeholder='Search'
            onSubmitEditing={this.searchUser}/>
        <FlatList
          data={this.state.query}
          keyExtractor={(item) => JSON.stringify(item.uid)}
          renderItem={({ item }) => (
          <TouchableOpacity onPress={() => this.goToUser(item)} style={[styles.row, styles.space]}>
            <Image style={styles.roundImage} source={{uri: item.userphoto}} />
            <View style={[styles.container, styles.left]}>
                <Text style={styles.bold}>{item.username}</Text>
                <Text style={styles.gray}>{item.bio}</Text>  
            </View>
          </TouchableOpacity>  
          )}/> 
      </SafeAreaView>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ getUser }, dispatch)
}

const mapStateToProps = (state) => {
 return {
   user: state.user
 };
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)

