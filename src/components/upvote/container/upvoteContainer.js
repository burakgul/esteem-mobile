import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

// Realm
import { setUpvotePercent } from '../../../realm/realm';

// Services and Actions
import { setUpvotePercent as upvoteAction } from '../../../redux/actions/applicationActions';

// Component
import UpvoteView from '../view/upvoteView';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class UpvoteContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  _setUpvotePercent = (value) => {
    const { dispatch } = this.props;

    if (value) {
      setUpvotePercent(String(value));
      dispatch(upvoteAction(value));
    }
  };

  render() {
    const {
      content,
      currentAccount,
      fetchPost,
      isLoggedIn,
      isShowPayoutValue,
      upvotePercent,
      pinCode,
    } = this.props;
    let author;
    let isVoted;
    let pendingPayoutValue;
    let permlink;

    if (content) {
      ({ author } = content);
      isVoted = content.is_voted;
      pendingPayoutValue = content.pending_payout_value;
      ({ permlink } = content);
    }

    return (
      <UpvoteView
        author={author}
        currentAccount={currentAccount}
        fetchPost={fetchPost}
        handleSetUpvotePercent={this._setUpvotePercent}
        isLoggedIn={isLoggedIn}
        isShowPayoutValue={isShowPayoutValue}
        isVoted={isVoted}
        pendingPayoutValue={pendingPayoutValue}
        permlink={permlink}
        upvotePercent={upvotePercent}
        pinCode={pinCode}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  upvotePercent: state.application.upvotePercent,
  pinCode: state.account.pin,
  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(UpvoteContainer);
