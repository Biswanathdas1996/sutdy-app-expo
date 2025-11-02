/**
 * SpeakEdge - Conversation Buddy System Routes
 * Social module for finding and connecting with English speaking partners
 * Req: 8_3 - SpeakEdge Conversation Buddy System
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Emoji reactions with auto-comments
const EMOJI_REACTIONS = {
  '❤️': 'I love this status!',
  '🔥': 'This is on fire!',
  '😂': 'This made me laugh so hard! 😂',
  '😮': 'Wow! This really surprised me.',
  '💯': 'Totally agree with this! 💯',
  '👏': 'Well said! 👏',
  '🤔': 'This got me thinking...',
  '🥹': 'This touched my heart',
  '🤯': 'Mind = Blown! 🤯',
  '🙌': 'Respect! You nailed it 🙌',
  '😍': 'I am obsessed with this! 😍',
  '👍': 'I like this!'
};

// =====================================================
// PROFILE MANAGEMENT
// =====================================================

/**
 * Get or create SpeakEdge profile for user
 */
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user data with SpeakEdge profile
    const query = `
      SELECT 
        u.id,
        u.name,
        u.profile_photo,
        u.english_level,
        sp.speakedge_badge,
        sp.bio,
        sp.is_available_for_conversation,
        (SELECT COUNT(*) FROM speakedge_partners WHERE user1_id = u.id OR user2_id = u.id) as partner_count,
        (SELECT COUNT(*) FROM speakedge_posts WHERE user_id = u.id) as post_count
      FROM users u
      LEFT JOIN speakedge_profiles sp ON u.id = sp.user_id
      WHERE u.id = $1
    `;

    const result = await pool.query(query, [parseInt(userId)]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profile = result.rows[0];

    // Create profile if doesn't exist
    if (!profile.speakedge_badge) {
      await pool.query(
        `INSERT INTO speakedge_profiles (user_id, english_level, speakedge_badge)
         VALUES ($1, $2, '🌟 New Member')
         ON CONFLICT (user_id) DO NOTHING`,
        [parseInt(userId), profile.english_level || 'Beginner']
      );
      profile.speakedge_badge = '🌟 New Member';
    }

    res.json({
      success: true,
      data: {
        userId: profile.id.toString(),
        name: profile.name,
        profilePhoto: profile.profile_photo,
        englishLevel: profile.english_level,
        speakedgeBadge: profile.speakedge_badge,
        bio: profile.bio,
        isAvailable: profile.is_available_for_conversation !== false,
        partnerCount: parseInt(profile.partner_count),
        postCount: parseInt(profile.post_count)
      }
    });
  } catch (error) {
    console.error('Error fetching SpeakEdge profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

/**
 * Update SpeakEdge profile
 */
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { bio, isAvailable } = req.body;

    const query = `
      UPDATE speakedge_profiles
      SET 
        bio = COALESCE($1, bio),
        is_available_for_conversation = COALESCE($2, is_available_for_conversation),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [bio, isAvailable, parseInt(userId)]);

    if (result.rows.length === 0) {
      // Create profile if doesn't exist
      const createResult = await pool.query(
        `INSERT INTO speakedge_profiles (user_id, bio, is_available_for_conversation)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [parseInt(userId), bio || '', isAvailable !== undefined ? isAvailable : true]
      );
      
      res.json({
        success: true,
        message: 'Profile created',
        data: createResult.rows[0]
      });
    } else {
      res.json({
        success: true,
        message: 'Profile updated',
        data: result.rows[0]
      });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// =====================================================
// FEED & POSTS
// =====================================================

/**
 * Get feed (posts from all users, latest first, with ads)
 * Excludes blocked users and users who blocked the requester
 */
router.get('/feed/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const query = `
      SELECT 
        p.id,
        p.user_id,
        p.content,
        p.media_url,
        p.is_advertisement,
        p.ad_clicks,
        p.created_at,
        u.name,
        u.profile_photo,
        u.english_level,
        sp.speakedge_badge,
        (SELECT COUNT(*) FROM speakedge_reactions WHERE post_id = p.id) as reaction_count,
        (SELECT COUNT(*) FROM speakedge_comments WHERE post_id = p.id) as comment_count,
        (SELECT emoji FROM speakedge_reactions WHERE post_id = p.id AND user_id = $1 LIMIT 1) as user_reaction
      FROM speakedge_posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN speakedge_profiles sp ON u.id = sp.user_id
      WHERE p.user_id NOT IN (
        SELECT blocked_id FROM speakedge_blocks WHERE blocker_id = $1
        UNION
        SELECT blocker_id FROM speakedge_blocks WHERE blocked_id = $1
      )
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [parseInt(userId), parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: result.rows.map(post => ({
        id: post.id,
        userId: post.user_id.toString(),
        userName: post.name,
        userPhoto: post.profile_photo,
        englishLevel: post.english_level,
        speakedgeBadge: post.speakedge_badge,
        content: post.content,
        mediaUrl: post.media_url,
        isAd: post.is_advertisement,
        adClicks: post.ad_clicks,
        reactionCount: parseInt(post.reaction_count),
        commentCount: parseInt(post.comment_count),
        userReaction: post.user_reaction,
        createdAt: post.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed',
      error: error.message
    });
  }
});

/**
 * Create new status post
 */
router.post('/posts/create', async (req, res) => {
  try {
    const { userId, content, mediaUrl } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, content'
      });
    }

    const query = `
      INSERT INTO speakedge_posts (user_id, content, media_url)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await pool.query(query, [
      parseInt(userId),
      content,
      mediaUrl || null
    ]);

    res.json({
      success: true,
      message: 'Post created successfully',
      data: {
        id: result.rows[0].id,
        userId: result.rows[0].user_id.toString(),
        content: result.rows[0].content,
        mediaUrl: result.rows[0].media_url,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
});

/**
 * Delete post
 */
router.delete('/posts/:postId/:userId', async (req, res) => {
  try {
    const { postId, userId } = req.params;

    // Verify post belongs to user
    const verifyQuery = 'SELECT user_id FROM speakedge_posts WHERE id = $1';
    const verifyResult = await pool.query(verifyQuery, [parseInt(postId)]);

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (verifyResult.rows[0].user_id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await pool.query('DELETE FROM speakedge_posts WHERE id = $1', [parseInt(postId)]);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
});

// =====================================================
// REACTIONS
// =====================================================

/**
 * React to post with emoji (auto-comment)
 */
router.post('/posts/:postId/react', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, emoji } = req.body;

    if (!userId || !emoji) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, emoji'
      });
    }

    // Validate emoji
    const autoComment = EMOJI_REACTIONS[emoji];
    if (!autoComment) {
      return res.status(400).json({
        success: false,
        message: 'Invalid emoji. Must be one of the predefined reactions.'
      });
    }

    // Check if post author has blocked this user
    const blockQuery = `
      SELECT 1 FROM speakedge_blocks b
      JOIN speakedge_posts p ON p.user_id = b.blocker_id
      WHERE p.id = $1 AND b.blocked_id = $2
    `;
    const blockResult = await pool.query(blockQuery, [parseInt(postId), parseInt(userId)]);
    
    if (blockResult.rows.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'You cannot react to this post'
      });
    }

    const query = `
      INSERT INTO speakedge_reactions (post_id, user_id, emoji, auto_comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (post_id, user_id) DO UPDATE SET
        emoji = $3,
        auto_comment = $4,
        created_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [
      parseInt(postId),
      parseInt(userId),
      emoji,
      autoComment
    ]);

    // Create notification for post author
    const postQuery = 'SELECT user_id FROM speakedge_posts WHERE id = $1';
    const postResult = await pool.query(postQuery, [parseInt(postId)]);
    
    if (postResult.rows.length > 0 && postResult.rows[0].user_id !== parseInt(userId)) {
      const userQuery = 'SELECT name FROM users WHERE id = $1';
      const userResult = await pool.query(userQuery, [parseInt(userId)]);
      
      await pool.query(
        `INSERT INTO speakedge_notifications (user_id, type, content, related_user_id, related_post_id)
         VALUES ($1, 'reaction', $2, $3, $4)`,
        [
          postResult.rows[0].user_id,
          `${userResult.rows[0].name} reacted ${emoji} to your post`,
          parseInt(userId),
          parseInt(postId)
        ]
      );
    }

    res.json({
      success: true,
      message: 'Reaction added successfully',
      data: {
        postId: result.rows[0].post_id,
        emoji: result.rows[0].emoji,
        autoComment: result.rows[0].auto_comment
      }
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: error.message
    });
  }
});

/**
 * Remove reaction from post
 */
router.delete('/posts/:postId/react/:userId', async (req, res) => {
  try {
    const { postId, userId } = req.params;

    await pool.query(
      'DELETE FROM speakedge_reactions WHERE post_id = $1 AND user_id = $2',
      [parseInt(postId), parseInt(userId)]
    );

    res.json({
      success: true,
      message: 'Reaction removed successfully'
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove reaction',
      error: error.message
    });
  }
});

/**
 * Get all reactions for a post
 */
router.get('/posts/:postId/reactions', async (req, res) => {
  try {
    const { postId } = req.params;

    const query = `
      SELECT 
        r.emoji,
        r.auto_comment,
        r.created_at,
        u.id as user_id,
        u.name,
        u.profile_photo
      FROM speakedge_reactions r
      JOIN users u ON r.user_id = u.id
      WHERE r.post_id = $1
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, [parseInt(postId)]);

    res.json({
      success: true,
      data: result.rows.map(reaction => ({
        emoji: reaction.emoji,
        autoComment: reaction.auto_comment,
        userId: reaction.user_id.toString(),
        userName: reaction.name,
        userPhoto: reaction.profile_photo,
        createdAt: reaction.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reactions',
      error: error.message
    });
  }
});

// =====================================================
// COMMENTS
// =====================================================

/**
 * Add manual comment to post
 */
router.post('/posts/:postId/comment', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, content } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, content'
      });
    }

    // Check if post author has blocked this user
    const blockQuery = `
      SELECT 1 FROM speakedge_blocks b
      JOIN speakedge_posts p ON p.user_id = b.blocker_id
      WHERE p.id = $1 AND b.blocked_id = $2
    `;
    const blockResult = await pool.query(blockQuery, [parseInt(postId), parseInt(userId)]);
    
    if (blockResult.rows.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'You cannot comment on this post'
      });
    }

    const query = `
      INSERT INTO speakedge_comments (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await pool.query(query, [
      parseInt(postId),
      parseInt(userId),
      content
    ]);

    // Create notification for post author
    const postQuery = 'SELECT user_id FROM speakedge_posts WHERE id = $1';
    const postResult = await pool.query(postQuery, [parseInt(postId)]);
    
    if (postResult.rows.length > 0 && postResult.rows[0].user_id !== parseInt(userId)) {
      const userQuery = 'SELECT name FROM users WHERE id = $1';
      const userResult = await pool.query(userQuery, [parseInt(userId)]);
      
      await pool.query(
        `INSERT INTO speakedge_notifications (user_id, type, content, related_user_id, related_post_id)
         VALUES ($1, 'comment', $2, $3, $4)`,
        [
          postResult.rows[0].user_id,
          `${userResult.rows[0].name} commented on your post`,
          parseInt(userId),
          parseInt(postId)
        ]
      );
    }

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: {
        id: result.rows[0].id,
        postId: result.rows[0].post_id,
        userId: result.rows[0].user_id.toString(),
        content: result.rows[0].content,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

/**
 * Get all comments for a post
 */
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;

    const query = `
      SELECT 
        c.id,
        c.content,
        c.created_at,
        u.id as user_id,
        u.name,
        u.profile_photo
      FROM speakedge_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `;

    const result = await pool.query(query, [parseInt(postId)]);

    res.json({
      success: true,
      data: result.rows.map(comment => ({
        id: comment.id,
        userId: comment.user_id.toString(),
        userName: comment.name,
        userPhoto: comment.profile_photo,
        content: comment.content,
        createdAt: comment.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
});

/**
 * Delete comment
 */
router.delete('/comments/:commentId/:userId', async (req, res) => {
  try {
    const { commentId, userId } = req.params;

    // Verify comment belongs to user
    const verifyQuery = 'SELECT user_id FROM speakedge_comments WHERE id = $1';
    const verifyResult = await pool.query(verifyQuery, [parseInt(commentId)]);

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (verifyResult.rows[0].user_id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    await pool.query('DELETE FROM speakedge_comments WHERE id = $1', [parseInt(commentId)]);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
});

// =====================================================
// PARTNER INVITATIONS & MANAGEMENT
// =====================================================

/**
 * Search for new conversation partners
 */
router.get('/partners/search/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { level, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT 
        u.id,
        u.name,
        u.profile_photo,
        u.english_level,
        sp.speakedge_badge,
        sp.bio,
        sp.is_available_for_conversation,
        (SELECT status FROM speakedge_partner_invites 
         WHERE (sender_id = $1 AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = $1)
         LIMIT 1) as invite_status,
        (SELECT 1 FROM speakedge_partners 
         WHERE (user1_id = $1 AND user2_id = u.id) OR (user1_id = u.id AND user2_id = $1)
         LIMIT 1) as is_partner
      FROM users u
      LEFT JOIN speakedge_profiles sp ON u.id = sp.user_id
      WHERE u.id != $1
        AND u.id NOT IN (
          SELECT blocked_id FROM speakedge_blocks WHERE blocker_id = $1
          UNION
          SELECT blocker_id FROM speakedge_blocks WHERE blocked_id = $1
        )
        AND (sp.is_available_for_conversation IS NULL OR sp.is_available_for_conversation = true)
    `;
    
    const params = [parseInt(userId), parseInt(limit), parseInt(offset)];
    
    if (level) {
      query += ` AND u.english_level = $4`;
      params.push(level);
    }
    
    query += ` ORDER BY RANDOM() LIMIT $2 OFFSET $3`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows.map(user => ({
        userId: user.id.toString(),
        name: user.name,
        profilePhoto: user.profile_photo,
        englishLevel: user.english_level,
        speakedgeBadge: user.speakedge_badge,
        bio: user.bio,
        isAvailable: user.is_available_for_conversation !== false,
        inviteStatus: user.invite_status || 'none',
        isPartner: !!user.is_partner
      }))
    });
  } catch (error) {
    console.error('Error searching partners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search partners',
      error: error.message
    });
  }
});

/**
 * Send partner invitation
 */
router.post('/partners/invite', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: senderId, receiverId'
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send invitation to yourself'
      });
    }

    // Check if blocked
    const blockQuery = `
      SELECT 1 FROM speakedge_blocks
      WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)
    `;
    const blockResult = await pool.query(blockQuery, [parseInt(senderId), parseInt(receiverId)]);
    
    if (blockResult.rows.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Cannot send invitation'
      });
    }

    const query = `
      INSERT INTO speakedge_partner_invites (sender_id, receiver_id, status)
      VALUES ($1, $2, 'pending')
      ON CONFLICT (sender_id, receiver_id) DO UPDATE SET
        status = 'pending',
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [parseInt(senderId), parseInt(receiverId)]);

    // Create notification
    const senderQuery = 'SELECT name FROM users WHERE id = $1';
    const senderResult = await pool.query(senderQuery, [parseInt(senderId)]);
    
    await pool.query(
      `INSERT INTO speakedge_notifications (user_id, type, content, related_user_id)
       VALUES ($1, 'partner_invite', $2, $3)`,
      [
        parseInt(receiverId),
        `${senderResult.rows[0].name} sent you a conversation partner invitation`,
        parseInt(senderId)
      ]
    );

    res.json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        id: result.rows[0].id,
        senderId: result.rows[0].sender_id.toString(),
        receiverId: result.rows[0].receiver_id.toString(),
        status: result.rows[0].status
      }
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invitation',
      error: error.message
    });
  }
});

/**
 * Respond to partner invitation
 */
router.put('/partners/invite/:inviteId/respond', async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { userId, status } = req.body; // status: 'accepted', 'rejected', 'not_interested'

    if (!['accepted', 'rejected', 'not_interested'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be accepted, rejected, or not_interested'
      });
    }

    // Verify user is the receiver
    const verifyQuery = 'SELECT sender_id, receiver_id FROM speakedge_partner_invites WHERE id = $1';
    const verifyResult = await pool.query(verifyQuery, [parseInt(inviteId)]);

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    if (verifyResult.rows[0].receiver_id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this invitation'
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update invitation status
      await client.query(
        'UPDATE speakedge_partner_invites SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [status, parseInt(inviteId)]
      );

      // If accepted, create partnership
      if (status === 'accepted') {
        const senderId = verifyResult.rows[0].sender_id;
        const receiverId = verifyResult.rows[0].receiver_id;
        
        await client.query(
          `INSERT INTO speakedge_partners (user1_id, user2_id)
           VALUES (LEAST($1, $2), GREATEST($1, $2))
           ON CONFLICT (user1_id, user2_id) DO NOTHING`,
          [senderId, receiverId]
        );

        // Create notification for sender
        const receiverQuery = 'SELECT name FROM users WHERE id = $1';
        const receiverResult = await client.query(receiverQuery, [receiverId]);
        
        await client.query(
          `INSERT INTO speakedge_notifications (user_id, type, content, related_user_id)
           VALUES ($1, 'partner_accepted', $2, $3)`,
          [
            senderId,
            `${receiverResult.rows[0].name} accepted your conversation partner invitation`,
            receiverId
          ]
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: `Invitation ${status}`,
        data: { status }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error responding to invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to invitation',
      error: error.message
    });
  }
});

/**
 * Get my conversation partners
 */
router.get('/partners/my/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT 
        u.id,
        u.name,
        u.profile_photo,
        u.english_level,
        sp.speakedge_badge,
        sp.bio,
        p.created_at as partnered_since
      FROM speakedge_partners p
      JOIN users u ON (
        CASE 
          WHEN p.user1_id = $1 THEN p.user2_id
          ELSE p.user1_id
        END = u.id
      )
      LEFT JOIN speakedge_profiles sp ON u.id = sp.user_id
      WHERE p.user1_id = $1 OR p.user2_id = $1
      ORDER BY p.created_at DESC
    `;

    const result = await pool.query(query, [parseInt(userId)]);

    res.json({
      success: true,
      data: result.rows.map(partner => ({
        userId: partner.id.toString(),
        name: partner.name,
        profilePhoto: partner.profile_photo,
        englishLevel: partner.english_level,
        speakedgeBadge: partner.speakedge_badge,
        bio: partner.bio,
        partneredSince: partner.partnered_since
      }))
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partners',
      error: error.message
    });
  }
});

/**
 * Get pending partner invitations
 */
router.get('/partners/invites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'received' } = req.query; // 'received' or 'sent'

    let query;
    if (type === 'received') {
      query = `
        SELECT 
          i.id,
          i.status,
          i.created_at,
          u.id as user_id,
          u.name,
          u.profile_photo,
          u.english_level,
          sp.speakedge_badge
        FROM speakedge_partner_invites i
        JOIN users u ON i.sender_id = u.id
        LEFT JOIN speakedge_profiles sp ON u.id = sp.user_id
        WHERE i.receiver_id = $1 AND i.status = 'pending'
        ORDER BY i.created_at DESC
      `;
    } else {
      query = `
        SELECT 
          i.id,
          i.status,
          i.created_at,
          u.id as user_id,
          u.name,
          u.profile_photo,
          u.english_level,
          sp.speakedge_badge
        FROM speakedge_partner_invites i
        JOIN users u ON i.receiver_id = u.id
        LEFT JOIN speakedge_profiles sp ON u.id = sp.user_id
        WHERE i.sender_id = $1
        ORDER BY i.created_at DESC
      `;
    }

    const result = await pool.query(query, [parseInt(userId)]);

    res.json({
      success: true,
      data: result.rows.map(invite => ({
        inviteId: invite.id,
        userId: invite.user_id.toString(),
        userName: invite.name,
        userPhoto: invite.profile_photo,
        englishLevel: invite.english_level,
        speakedgeBadge: invite.speakedge_badge,
        status: invite.status,
        createdAt: invite.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invitations',
      error: error.message
    });
  }
});

/**
 * Remove partner
 */
router.delete('/partners/remove/:userId/:partnerId', async (req, res) => {
  try {
    const { userId, partnerId } = req.params;

    await pool.query(
      `DELETE FROM speakedge_partners 
       WHERE (user1_id = LEAST($1, $2) AND user2_id = GREATEST($1, $2))`,
      [parseInt(userId), parseInt(partnerId)]
    );

    res.json({
      success: true,
      message: 'Partner removed successfully'
    });
  } catch (error) {
    console.error('Error removing partner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove partner',
      error: error.message
    });
  }
});

// =====================================================
// BLOCKING & ACCOUNT REACTIONS
// =====================================================

/**
 * Block user
 */
router.post('/block', async (req, res) => {
  try {
    const { blockerId, blockedId } = req.body;

    if (!blockerId || !blockedId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: blockerId, blockedId'
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Add block
      await client.query(
        `INSERT INTO speakedge_blocks (blocker_id, blocked_id)
         VALUES ($1, $2)
         ON CONFLICT (blocker_id, blocked_id) DO NOTHING`,
        [parseInt(blockerId), parseInt(blockedId)]
      );

      // Remove partnership if exists
      await client.query(
        `DELETE FROM speakedge_partners 
         WHERE (user1_id = LEAST($1, $2) AND user2_id = GREATEST($1, $2))`,
        [parseInt(blockerId), parseInt(blockedId)]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'User blocked successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block user',
      error: error.message
    });
  }
});

/**
 * Unblock user
 */
router.delete('/block/:blockerId/:blockedId', async (req, res) => {
  try {
    const { blockerId, blockedId } = req.params;

    await pool.query(
      'DELETE FROM speakedge_blocks WHERE blocker_id = $1 AND blocked_id = $2',
      [parseInt(blockerId), parseInt(blockedId)]
    );

    res.json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock user',
      error: error.message
    });
  }
});

/**
 * Like/Dislike account
 */
router.post('/account-reaction', async (req, res) => {
  try {
    const { userId, targetUserId, reactionType } = req.body;

    if (!userId || !targetUserId || !reactionType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, targetUserId, reactionType'
      });
    }

    if (!['like', 'dislike'].includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type. Must be like or dislike'
      });
    }

    const query = `
      INSERT INTO speakedge_account_reactions (user_id, target_user_id, reaction_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, target_user_id) DO UPDATE SET
        reaction_type = $3,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [
      parseInt(userId),
      parseInt(targetUserId),
      reactionType
    ]);

    res.json({
      success: true,
      message: 'Reaction recorded',
      data: {
        userId: result.rows[0].user_id.toString(),
        targetUserId: result.rows[0].target_user_id.toString(),
        reactionType: result.rows[0].reaction_type
      }
    });
  } catch (error) {
    console.error('Error recording account reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record reaction',
      error: error.message
    });
  }
});

// =====================================================
// NOTIFICATIONS
// =====================================================

/**
 * Get user notifications
 */
router.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT 
        n.id,
        n.type,
        n.content,
        n.is_read,
        n.created_at,
        u.id as related_user_id,
        u.name as related_user_name,
        u.profile_photo as related_user_photo
      FROM speakedge_notifications n
      LEFT JOIN users u ON n.related_user_id = u.id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [parseInt(userId), parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: result.rows.map(notif => ({
        id: notif.id,
        type: notif.type,
        content: notif.content,
        isRead: notif.is_read,
        createdAt: notif.created_at,
        relatedUser: notif.related_user_id ? {
          userId: notif.related_user_id.toString(),
          name: notif.related_user_name,
          photo: notif.related_user_photo
        } : null
      }))
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

/**
 * Mark notification as read
 */
router.put('/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    await pool.query(
      'UPDATE speakedge_notifications SET is_read = true WHERE id = $1',
      [parseInt(notificationId)]
    );

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

/**
 * Mark all notifications as read
 */
router.put('/notifications/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;

    await pool.query(
      'UPDATE speakedge_notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [parseInt(userId)]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

// =====================================================
// ADVERTISEMENTS
// =====================================================

/**
 * Get ad packages
 */
router.get('/ads/packages', async (req, res) => {
  try {
    const query = 'SELECT * FROM speakedge_ad_packages ORDER BY total_price ASC';
    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        pricePerClick: parseFloat(pkg.price_per_click),
        totalClicksIncluded: pkg.total_clicks_included,
        totalPrice: parseFloat(pkg.total_price),
        durationDays: pkg.duration_days
      }))
    });
  } catch (error) {
    console.error('Error fetching ad packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ad packages',
      error: error.message
    });
  }
});

/**
 * Create advertisement post
 */
router.post('/ads/create', async (req, res) => {
  try {
    const { userId, content, mediaUrl } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, content'
      });
    }

    // Check if user has active ad account
    const adAccountQuery = `
      SELECT * FROM speakedge_ad_accounts
      WHERE user_id = $1 AND is_active = true AND clicks_remaining > 0
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    `;
    const adAccountResult = await pool.query(adAccountQuery, [parseInt(userId)]);

    if (adAccountResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No active ad account or clicks remaining'
      });
    }

    const query = `
      INSERT INTO speakedge_posts (user_id, content, media_url, is_advertisement)
      VALUES ($1, $2, $3, true)
      RETURNING *
    `;

    const result = await pool.query(query, [parseInt(userId), content, mediaUrl || null]);

    res.json({
      success: true,
      message: 'Advertisement created successfully',
      data: {
        id: result.rows[0].id,
        userId: result.rows[0].user_id.toString(),
        content: result.rows[0].content,
        mediaUrl: result.rows[0].media_url,
        isAd: true,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Error creating advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create advertisement',
      error: error.message
    });
  }
});

/**
 * Track ad click
 */
router.post('/ads/:adId/click', async (req, res) => {
  try {
    const { adId } = req.params;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Increment ad clicks
      const postResult = await client.query(
        'UPDATE speakedge_posts SET ad_clicks = ad_clicks + 1 WHERE id = $1 AND is_advertisement = true RETURNING user_id',
        [parseInt(adId)]
      );

      if (postResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Advertisement not found'
        });
      }

      // Decrement clicks remaining from ad account
      await client.query(
        `UPDATE speakedge_ad_accounts 
         SET clicks_remaining = clicks_remaining - 1, clicks_used = clicks_used + 1
         WHERE user_id = $1 AND clicks_remaining > 0`,
        [postResult.rows[0].user_id]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Ad click tracked'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error tracking ad click:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track ad click',
      error: error.message
    });
  }
});

/**
 * Get my ad account
 */
router.get('/ads/account/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT 
        aa.*,
        p.name as package_name,
        p.price_per_click
      FROM speakedge_ad_accounts aa
      LEFT JOIN speakedge_ad_packages p ON aa.package_id = p.id
      WHERE aa.user_id = $1
    `;

    const result = await pool.query(query, [parseInt(userId)]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    const account = result.rows[0];

    res.json({
      success: true,
      data: {
        id: account.id,
        userId: account.user_id.toString(),
        packageName: account.package_name,
        pricePerClick: account.price_per_click ? parseFloat(account.price_per_click) : null,
        clicksRemaining: account.clicks_remaining,
        clicksUsed: account.clicks_used,
        amountPaid: parseFloat(account.amount_paid),
        expiresAt: account.expires_at,
        isActive: account.is_active
      }
    });
  } catch (error) {
    console.error('Error fetching ad account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ad account',
      error: error.message
    });
  }
});

/**
 * Purchase ad package
 */
router.post('/ads/purchase', async (req, res) => {
  try {
    const { userId, packageId, paymentId } = req.body;

    if (!userId || !packageId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, packageId'
      });
    }

    // Get package details
    const packageQuery = 'SELECT * FROM speakedge_ad_packages WHERE id = $1';
    const packageResult = await pool.query(packageQuery, [parseInt(packageId)]);

    if (packageResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    const pkg = packageResult.rows[0];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + pkg.duration_days);

    const query = `
      INSERT INTO speakedge_ad_accounts (
        user_id, package_id, clicks_remaining, amount_paid, expires_at, is_active
      )
      VALUES ($1, $2, $3, $4, $5, true)
      ON CONFLICT (user_id) DO UPDATE SET
        package_id = $2,
        clicks_remaining = speakedge_ad_accounts.clicks_remaining + $3,
        amount_paid = speakedge_ad_accounts.amount_paid + $4,
        expires_at = GREATEST(speakedge_ad_accounts.expires_at, $5),
        is_active = true,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [
      parseInt(userId),
      parseInt(packageId),
      pkg.total_clicks_included,
      pkg.total_price,
      expiresAt
    ]);

    res.json({
      success: true,
      message: 'Ad package purchased successfully',
      data: {
        clicksRemaining: result.rows[0].clicks_remaining,
        expiresAt: result.rows[0].expires_at
      }
    });
  } catch (error) {
    console.error('Error purchasing ad package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase ad package',
      error: error.message
    });
  }
});

module.exports = router;
