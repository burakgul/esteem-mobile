import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';
// Constants

// Components
import { TextButton } from '../../buttons';
import { LineBreak } from '../../basicUIElements';
// Styles
import styles from './loginHeaderStyles';

class LoginHeaderView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { string }    title            - Title for header string.
    *   @prop { string }    description      - Description for header string.
    *
    */
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const {
      description, title, onPress, isKeyboardOpen,
    } = this.props;

    return (
      <View styles={styles.container}>
        <View style={styles.headerRow}>
          <Image style={styles.logo} source={require('../../../assets/esteem_transparent.png')} />
          <View style={styles.headerButton}>
            <TextButton onPress={onPress} text="Sign up" />
          </View>
        </View>
        {!isKeyboardOpen && (
          <View style={styles.body}>
            <View style={styles.titleText}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
            <Image style={styles.mascot} source={require('../../../assets/love_mascot.png')} />
          </View>
        )}
        <LineBreak />
      </View>
    );
  }
}

export default LoginHeaderView;
