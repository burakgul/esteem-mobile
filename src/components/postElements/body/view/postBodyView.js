import React, { Fragment, useState } from 'react';
import { Dimensions, Linking, Alert, Modal, PermissionsAndroid, Platform } from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import { withNavigation } from 'react-navigation';
import { useIntl, injectIntl } from 'react-intl';
import AutoHeightWebView from 'react-native-autoheight-webview';
import EStyleSheet from 'react-native-extended-stylesheet';
import get from 'lodash/get';
import ImageViewer from 'react-native-image-zoom-viewer';
import RNFetchBlob from 'rn-fetch-blob';

import script from './config';
import { PostPlaceHolder, CommentPlaceHolder } from '../../../basicUIElements';

// Constants
import { default as ROUTES } from '../../../../constants/routeNames';

const WIDTH = Dimensions.get('window').width;

const PostBody = ({
  navigation,
  body,
  commentDepth,
  isComment,
  handleOnUserPress,
  handleOnPostPress,
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [postImages, setPostImages] = useState([]);
  const intl = useIntl();

  const _handleOnLinkPress = event => {
    if ((!event && !get(event, 'nativeEvent.data'), false)) {
      return;
    }

    try {
      let data = {};
      try {
        data = JSON.parse(get(event, 'nativeEvent.data'));
      } catch (error) {
        data = {};
      }

      const { type, href, author, category, permlink, tag, proposal, videoHref } = data;

      switch (type) {
        case '_external':
        case 'markdown-external-link':
          _handleBrowserLink(href);
          break;
        case 'markdown-author-link':
          if (!handleOnUserPress) {
            _handleOnUserPress(author);
          } else {
            handleOnUserPress(author);
          }
          break;
        case 'markdown-post-link':
          if (!handleOnPostPress) {
            _handleOnPostPress(permlink, author);
          } else {
            handleOnPostPress(permlink, author);
          }
          break;
        case 'markdown-tag-link':
          _handleTagPress(tag);
          break;
        case 'markdown-witnesses-link':
          break;
        case 'markdown-proposal-link':
          break;
        case 'markdown-video-link':
          break;
        case 'image':
          setPostImages([{ url: href }]);
          setIsImageModalOpen(true);
          break;

        default:
          break;
      }
    } catch (error) {}
  };

  const _handleTagPress = tag => {
    if (tag) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.SEARCH_RESULT,
        params: {
          tag,
        },
      });
    }
  };

  const _handleBrowserLink = async url => {
    if (url) {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(intl.formatMessage({ id: 'alert.failed_to_open' }));
        }
      });
    }
  };

  const _handleOnPostPress = (permlink, author) => {
    if (permlink) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.POST,
        params: {
          author,
          permlink,
        },
        key: permlink,
      });
    }
  };

  const _handleOnUserPress = username => {
    if (username) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.PROFILE,
        params: {
          username,
        },
        key: username,
      });
    } else {
      Alert.alert('Opss!', 'Wrong link.');
    }
  };

  const checkAndroidPermission = async () => {
    try {
      const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
      await PermissionsAndroid.request(permission);
      Promise.resolve();
    } catch (error) {
      Promise.reject(error);
    }
  };

  const _downloadImage = async uri => {
    return RNFetchBlob.config({
      fileCache: true,
      appendExt: 'jpg',
    })
      .fetch('GET', uri)
      .then(res => {
        let status = res.info().status;

        if (status == 200) {
          return res.path();
        } else {
          Promise.reject();
        }
      })
      .catch(errorMessage => {
        Promise.reject(errorMessage);
      });
  };

  const _saveImage = async uri => {
    try {
      if (Platform.OS === 'android') {
        await checkAndroidPermission();
        uri = `file://${await _downloadImage(uri)}`;
      }
      CameraRoll.saveToCameraRoll(uri)
        .then(res => {
          Alert.alert(
            intl.formatMessage({ id: 'alert.success' }),
            intl.formatMessage({ id: 'post.image_saved' }),
            [{ text: 'OK' }],
            { cancelable: false },
          );
        })
        .catch(error => {
          Alert.alert(
            intl.formatMessage({ id: 'post.image_saved_error' }),
            error.message,
            [{ text: 'OK' }],
            {
              cancelable: false,
            },
          );
        });
    } catch (error) {
      Alert.alert(
        intl.formatMessage({ id: 'post.image_saved_error' }),
        error.message,
        [{ text: 'OK' }],
        {
          cancelable: false,
        },
      );
    }
  };

  const html = body.replace(/<a/g, '<a target="_blank"');
  const customStyle = `
  * {
    color: ${EStyleSheet.value('$primaryBlack')};
    font-family: Roboto, sans-serif;
    max-width: 100%;
  }
  body {
    color: ${EStyleSheet.value('$primaryBlack')};
    display: flex;
    align-items: center;
  }
  a {
    color: ${EStyleSheet.value('$primaryBlue')};
    cursor: pointer;
    text-decoration: underline;
  }
  img {
    align-self: 'center';
    max-width: 100%;
  }
  center {
    text-align: 'center';
    align-items: 'center';
    justify-content: 'center';
  }
  th {
    flex: 1;
    justify-content: 'center';
    font-weight: 'bold';
    color: ${EStyleSheet.value('$primaryBlack')};
    font-size: 14;
    padding: 5;
  }
  tr {
    background-color: ${EStyleSheet.value('$darkIconColor')};
    flex-direction: 'row';
  }
  td: {
    border-width: 0.5;
    border-color: ${EStyleSheet.value('$tableBorderColor')};
    flex: 1;
    padding: 10;
    background-color: ${EStyleSheet.value('$tableTrColor')};
  }
  blockquote: {
    border-left-width: 5;
    border-color: ${EStyleSheet.value('$darkIconColor')};
    padding-left: 5;
  }
  code: {
    background-color: ${EStyleSheet.value('$darkIconColor')};
    font-family: ${EStyleSheet.value('$editorFont')};
  }
  center: {
    text-align: 'center';
    align-items: 'center';
    justify-content: 'center';
  }
  .markdown-video-link {
    max-width: 100%;
  }
  .pull-right {
    float: right;
  }
  .pull-left {
    float: left;
  }
  .pull-left,
  .pull-right {
    max-width: calc(50% - 10px);
    padding-left: 10px;
    margin-bottom: 10px;
    box-sizing: border-box;
  }
  .phishy {
    display: inline;
    color: red;
  }

  .text-justify {
    text-align: justify;
    text-justify: inter-word;
    letter-spacing: 0px;
  }
  `;
  return (
    <Fragment>
      <Modal visible={isImageModalOpen} transparent={true}>
        <ImageViewer
          imageUrls={postImages}
          enableSwipeDown
          onCancel={() => setIsImageModalOpen(false)}
          onSave={uri => _saveImage(uri)}
          menuContext={{
            saveToLocal: intl.formatMessage({ id: 'post.save_to_local' }),
            cancel: intl.formatMessage({ id: 'alert.cancel' }),
          }}
        />
      </Modal>
      <AutoHeightWebView
        source={{ html }}
        style={{ width: isComment ? WIDTH - (32 + 29 * commentDepth) : WIDTH - 32 }}
        customStyle={customStyle}
        onMessage={_handleOnLinkPress}
        customScript={script.toString()}
        renderLoading={() => (isComment ? <CommentPlaceHolder /> : <PostPlaceHolder />)}
        startInLoadingState={true}
        onShouldStartLoadWithRequest={false}
        scrollEnabled={false}
      />
    </Fragment>
  );
};

const areEqual = (prevProps, nextProps) => {
  if (prevProps.body !== nextProps.body) {
    return true;
  }
  return false;
};

export default React.memo(injectIntl(withNavigation(PostBody)), areEqual);
