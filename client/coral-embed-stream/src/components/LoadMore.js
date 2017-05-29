import React, {PropTypes} from 'react';
import {ADDTL_COMMENTS_ON_LOAD_MORE} from '../constants/stream';
import {Button} from 'coral-ui';
import t from 'coral-framework/services/i18n';

const loadMoreComments = (assetId, comments, loadMore, parentId, replyCount) => {

  let cursor = null;
  if (comments.length) {
    cursor = parentId
      ? comments[0].created_at
      : comments[comments.length - 1].created_at;
  }

  loadMore({
    limit: parentId ? replyCount : ADDTL_COMMENTS_ON_LOAD_MORE,
    cursor,
    asset_id: assetId,
    parent_id: parentId,
    sort: parentId ? 'CHRONOLOGICAL' : 'REVERSE_CHRONOLOGICAL'
  });
};

class LoadMore extends React.Component {

  componentDidMount () {
    this.initialState = true;
  }

  replyCountFormat = (count) => {
    if (count === 1) {
      return t('framework.view_reply');
    }

    if (this.initialState) {
      return t('framework.view_all_replies_initial', count);
    } else {
      return t('framework.view_all_replies', count);
    }
  }

  render () {
    const {assetId, comments, loadMore, moreComments, parentId, replyCount, topLevel} = this.props;
    return moreComments
      ? <div className='coral-load-more'>
        <Button
          onClick={() => {
            this.initialState = false;
            loadMoreComments(assetId, comments, loadMore, parentId, replyCount);
          }}>
          {topLevel ? t('framework.view_more_comments') : this.replyCountFormat(replyCount)}
        </Button>
      </div>
      : null;
  }
}

LoadMore.propTypes = {
  assetId: PropTypes.string.isRequired,
  comments: PropTypes.array.isRequired,
  moreComments: PropTypes.bool.isRequired,
  topLevel: PropTypes.bool.isRequired,
  replyCount: PropTypes.number,
  loadMore: PropTypes.func.isRequired
};

export default LoadMore;
