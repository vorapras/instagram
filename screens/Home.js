import React from 'react';
import { Text, View, Button, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getPosts, likePost, unlikePost } from '../actions/post.js';
import styles from '../styles.js';
import { TouchableOpacity } from 'react-native-gesture-handler';
import moment from 'moment';

class Home extends React.Component {
  
  componentDidMount() {
    this.props.getPosts()
  }

  likePost = (post) => {
    const { uid } = this.props.user
    if (post.likes.includes(uid)) {
      this.props.unlikePost(post)
    } else {
      this.props.likePost(post)
    }
  }

  navigateMap = (item) => {
    this.props.navigation.navigate('Map', {location: item.postLocation})
  }

  render(){
    if (this.props.post === null) return null
    return(
      <View style={styles.container}>
        <FlatList
          onRefresh={() => this.props.getPosts()}
          refreshing={false}
          data={this.props.post.feed}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => {
            const liked = item.likes.includes(this.props.user.uid)
            return (
              <View>
                <View style={[styles.row, styles.space]}>
                  <View style={[styles.row, styles.center]}>
                    <Image style={styles.roundImage} source={{uri: item.userphoto}}/>
                    <View>
                      <Text>{item.username}</Text>
                      <TouchableOpacity onPress={() => this.navigateMap(item)}>
                          <Text>{item.postLocation ? item.postLocation.name : null}</Text>
                      </TouchableOpacity>
                      <Text>{moment(item.date).format('lll')}</Text>
                    </View>
                  </View>
                  <Ionicons style={{margin: 5}} name='ios-flag' size={25} />
                </View>
                <TouchableOpacity onPress={() => this.likePost(item)}>
                  <Image style={styles.postPhoto} source={{uri: item.postPhoto}}/>
                </TouchableOpacity>
                <View style={styles.row}>
                  <Ionicons style={{margin: 5}} color ={liked ? "#db565b" : "#000"} name={ liked ? 'ios-heart' : 'ios-heart-empty'} size={25} />
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('Comment', item)}>
                    <Ionicons style={{margin: 5}} name='ios-chatbubbles' size={25} />
                  </TouchableOpacity>
                  <Ionicons style={{margin: 5}} name='ios-send' size={25} />
                </View>
                <Text>{item.postDescription}</Text>
              </View>
            )
          }}
        />
      </View>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
   return bindActionCreators({ getPosts, likePost, unlikePost }, dispatch)
}

const mapStateToProps = (state) => {
  return {
    post: state.post,
    user: state.user
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)

