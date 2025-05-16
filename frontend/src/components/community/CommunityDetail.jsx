import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getCommunity, createPost, leaveCommunity } from '../../store/slices/communitySlice';
import useApi from '../../hooks/useApi';

const CommunityDetail = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [postContent, setPostContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  
  const { currentCommunity } = useSelector((state) => state.community);
  const { user } = useSelector((state) => state.auth);
  
  const { execute: fetchCommunity, loading: loadingCommunity, error: communityError } = useApi({
    asyncAction: getCommunity,
    feature: 'community',
  });
  
  const { execute: addPost, loading: addingPost, error: postError } = useApi({
    asyncAction: createPost,
    feature: 'community',
  });
  
  const { execute: leave, loading: leavingCommunity, error: leaveError } = useApi({
    asyncAction: leaveCommunity,
    feature: 'community',
  });

  useEffect(() => {
    if (communityId) {
      loadCommunity();
    }
  }, [communityId]);

  const loadCommunity = async () => {
    await fetchCommunity(communityId);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!postContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }
    
    const result = await addPost({
      communityId,
      postData: {
        content: postContent,
        isAnonymous
      }
    });
    
    if (result.success) {
      toast.success('Post created successfully');
      setPostContent('');
      setIsAnonymous(false);
    } else {
      toast.error('Failed to create post');
    }
  };

  const handleLeaveCommunity = async () => {
    const result = await leave(communityId);
    
    if (result.success) {
      toast.success('Left community successfully');
      navigate('/community');
    } else {
      toast.error('Failed to leave community');
    }
  };

  if (loadingCommunity && !currentCommunity) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (communityError && !currentCommunity) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{communityError}</p>
        <button
          onClick={loadCommunity}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!currentCommunity) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Community not found</p>
        <Link
          to="/community"
          className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Back to Communities
        </Link>
      </div>
    );
  }

  const isUserMember = currentCommunity.members?.some(member => member._id === user?._id) || 
                       currentCommunity.createdBy?._id === user?._id;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {currentCommunity.name}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {currentCommunity.description}
          </p>
          <div className="mt-2 flex items-center">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800`}>
              {currentCommunity.category}
            </span>
            <span className="ml-2 text-xs text-gray-500">
              {currentCommunity.memberCount || currentCommunity.members?.length || 0} members
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link
            to="/community"
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Back
          </Link>
          {isUserMember && (
            <button
              onClick={() => setConfirmLeave(true)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Leave
            </button>
          )}
        </div>
      </div>
      
      {(postError || leaveError) && (
        <div className="px-4 py-3 bg-red-50 text-red-700 text-sm">
          {postError || leaveError}
        </div>
      )}
      
      {confirmLeave && (
        <div className="px-4 py-5 sm:p-6 border-b border-gray-200 bg-red-50">
          <h3 className="text-lg leading-6 font-medium text-red-800">
            Leave Community
          </h3>
          <div className="mt-2 max-w-xl text-sm text-red-700">
            <p>
              Are you sure you want to leave this community? You will need to rejoin to access it again.
            </p>
          </div>
          <div className="mt-5 flex space-x-3">
            <button
              type="button"
              onClick={() => setConfirmLeave(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLeaveCommunity}
              disabled={leavingCommunity}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
            >
              {leavingCommunity ? 'Leaving...' : 'Leave Community'}
            </button>
          </div>
        </div>
      )}
      
      {isUserMember && (
        <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">Create a Post</h4>
          <form onSubmit={handleCreatePost}>
            <div>
              <label htmlFor="postContent" className="sr-only">
                Post Content
              </label>
              <textarea
                id="postContent"
                name="postContent"
                rows="3"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Share your thoughts, questions, or experiences..."
                required
              />
            </div>
            <div className="mt-3 flex items-center">
              <input
                id="isAnonymous"
                name="isAnonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-700">
                Post anonymously
              </label>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={addingPost || !postContent.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
              >
                {addingPost ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="px-4 py-5 sm:p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Community Posts</h4>
        
        {currentCommunity.posts && currentCommunity.posts.length > 0 ? (
          <div className="space-y-6">
            {currentCommunity.posts.map((post) => (
              <div key={post._id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-800">
                        {post.isAnonymous ? 'A' : post.author?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {post.isAnonymous ? 'Anonymous' : post.author?.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {post.content}
                  </p>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex space-x-4 text-sm">
                    <button className="text-gray-500 hover:text-gray-700">
                      <span className="font-medium">{post.likes?.length || 0}</span> Likes
                    </button>
                    <button className="text-gray-500 hover:text-gray-700">
                      <span className="font-medium">{post.comments?.length || 0}</span> Comments
                    </button>
                  </div>
                  <Link
                    to={`/community/${communityId}/post/${post._id}`}
                    className="text-sm font-medium text-purple-600 hover:text-purple-500"
                  >
                    View Discussion
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No posts in this community yet.</p>
            {isUserMember && (
              <p className="mt-2 text-sm text-gray-500">
                Be the first to start a conversation!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityDetail;
