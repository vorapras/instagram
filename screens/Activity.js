import React from 'react';
import { connect } from 'react-redux';
import { Text, View, FlatList, Image, ActivityIndicator } from 'react-native';
import styles from '../styles.js';
import db from '../config/firebase';
import moment from 'moment';
import orderBy from 'lodash.orderby';

class Activity extends React.Component {

  state = {
    activity : []
  }

  componentDidMount = () => {
    this.getActivity()
  }

  getActivity = async () => {
    let activity = []
    const query = await db.collection('activity').where('uid','==',this.props.user.uid).get()
    query.forEach((response) => {
      activity.push(response.data())
    })
    this.setState({activity: orderBy(activity, 'date', 'desc')})
  }

  renderList = (item) => {
    switch (item.type) {
      case 'LIKE':
        return (
          <View style={[styles.row, styles.space]}>
            <Image style={styles.roundImage} source={{uri: item.likerPhoto}} />
            <View style={[styles.container, styles.left]}>
                <Text style={styles.bold}>{item.likerName}</Text>
                <Text style={styles.gray}>Liked Your Photo</Text>  
                <Text style={[styles.gray, styles.small]}>{moment(item.date).format('lll')}</Text>
            </View>
            <Image style={styles.roundImage} source={{uri: item.postPhoto}}/>
          </View>
        )
      case 'COMMENT':
        return (
          <View style={[styles.row, styles.space]}>
            <Image style={styles.roundImage} source={{uri: item.commenterPhoto}} />
            <View style={[styles.container, styles.left]}>
                <Text style={styles.bold}>{item.commenterName}</Text>
                <Text style={styles.gray}>{item.comment}</Text>  
                <Text style={[styles.gray, styles.small]}>{moment(item.date).format('lll')}</Text>
            </View>
            <Image style={styles.roundImage} source={{uri: item.postPhoto}}/>
          </View>
        )
      case 'FOLLOWER':
        return (
          <View style={[styles.row, styles.space]}>
            <Image style={styles.roundImage} source={{uri: item.followerPhoto}} />
            <View style={[styles.container, styles.left]}>
                <Text style={styles.bold}>{item.followerName}</Text>
                <Text style={styles.gray}>Started Follow You</Text>  
                <Text style={[styles.gray, styles.small]}>{moment(item.date).format('lll')}</Text>
            </View>
            <Image style={styles.roundImage} source={{uri: item.photo}}/>
          </View>
        )
      default:
        null;
    }
  }

  render(){
    if (this.state.activity.length <= 0) return <ActivityIndicator style={styles.container}/>
    return (
      <View style={styles.container}>
        <FlatList
          onRefresh={() => this.getActivity()}
          refreshing={false}
          data={this.state.activity}
          keyExtractor={(item) => JSON.stringify(item.date)}
          renderItem={({ item }) => this.renderList(item)} />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}

export default connect(mapStateToProps)(Activity)
