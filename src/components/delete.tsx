// import React from 'react';
// import { useMutation } from '@tanstack/react-query';

// function deletePost({ postId }: { postId: string }) {
//   const deletePostMutation = useMutation(
//     ['/api/subreddit/post/delete', postId],
//     () => fetch(`/api/subreddit/post/delete/${postId}`, {
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     }),
//     {
//       onSuccess: () => {
//         console.log('Post deleted successfully');
//       },
//       onError: () => {
//         throw new Error('Could not delete the post');
//       },
//     }
//   );

//   const handleDelete = () => {
//     deletePostMutation.mutate();
//   };

//   return (
//     <button onClick={handleDelete}>Delete Post</button>
//   );
// }

// export default deletePost;
