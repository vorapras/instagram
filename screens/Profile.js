import React from 'react';
import firebase from 'firebase';
import { Text, View, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styles from '../styles.js';
import { followerUser, unfollowerUser } from '../actions/user.js';

class Profile extends React.Component {

  signout = () => {
    firebase.auth().signOut()
    this.props.navigation.navigate('Login')
  }

  follow = (user) => {
    if (user.followers.indexOf(this.props.user.uid) >= 0) {
      this.props.unfollowerUser(user)
    } else {
      this.props.followerUser(user)
    }
  }

  render(){
    let user = {}
    const { state, navigate } = this.props.navigation
    if(state.routeName === 'Profile'){
      user = this.props.profile
    } else {
      user = this.props.user
    }
    if (!user.posts) return <ActivityIndicator style={styles.container}/>
    return (
      <View style={styles.container}>
        <View style={[styles.row, styles.space, {paddingHorizontal: 20}]}>
          <View style={styles.center}>
            <Image style={styles.roundImage} source={{uri: user.userphoto}}/>
            <Text>{user.username}</Text>
            <Text>{user.bio}</Text>
          </View>
          <View style={styles.center}>
            <Text style={styles.bold}>{user.posts.length}</Text>
            <Text>posts</Text>
          </View>
          <View style={styles.center}>
            <Text style={styles.bold}>{user.followers.length}</Text>
            <Text>followers</Text>
          </View>
          <View style={styles.center}>
            <Text style={styles.bold}>{user.following.length}</Text>
            <Text>following</Text>
          </View>
        </View>
        <View style={styles.center}>
        {
          state.routeName === 'MyProfile' ? 
          <View style={styles.row}>
            <TouchableOpacity style={styles.buttonSmall} onPress={() => this.props.navigation.navigate('Edit')}>
              <Text style={styles.bold}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonSmall} onPress={() => this.signout()}>
              <Text style={styles.bold}>Logout</Text>
            </TouchableOpacity>
          </View> :
          <View style={styles.row}>
            <TouchableOpacity style={styles.buttonSmall} onPress={() => this.follow(user)}>
              <Text style={styles.bold}>{user.followers.indexOf(this.props.user.uid) >= 0 ? 'UnFollow User' : 'Follow User'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonSmall} onPress={() => this.props.navigation.navigate('Chat', user.uid)}>
              <Text style={styles.bold}>Message</Text>
            </TouchableOpacity>
        </View>
        }
        </View>
        <FlatList
          horizontal={false}
          numColumns={3}
          data={user.posts}
          keyExtractor={(item) => JSON.stringify(item.date)}
          renderItem={({item}) => <Image style={styles.squareLarge} source={{uri: item.postPhoto}} /> }/>
      </View>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ followerUser, unfollowerUser }, dispatch)
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    profile: state.profile
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)