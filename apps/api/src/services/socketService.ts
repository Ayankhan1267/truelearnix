import { Server, Socket } from 'socket.io';

// userId -> socketId mapping for targeted events
const userSockets = new Map<string, string>();
// in-memory polls: pollId -> { question, options, votes: {option: count}, closed }
const polls = new Map<string, any>();

export const initSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {

    // ── Join class room ───────────────────────────────────────────────────────
    socket.on('join-class', ({ classId, userId, userName }) => {
      socket.join(`class:${classId}`);
      if (userId) userSockets.set(userId, socket.id);
      socket.to(`class:${classId}`).emit('user-joined', { userId, userName });
    });

    // ── Chat ─────────────────────────────────────────────────────────────────
    socket.on('class-message', ({ classId, userId, userName, message, avatar }) => {
      io.to(`class:${classId}`).emit('new-message', {
        userId, userName, avatar, message, timestamp: new Date(),
      });
    });

    // ── Raise hand ───────────────────────────────────────────────────────────
    socket.on('raise-hand', ({ classId, userId, userName }) => {
      io.to(`class:${classId}`).emit('hand-raised', { userId, userName });
    });

    // ── Doubt system ──────────────────────────────────────────────────────────
    socket.on('doubt-submit', ({ classId, userId, userName, avatar, doubt, doubtId }) => {
      io.to(`class:${classId}`).emit('new-doubt', {
        doubtId, userId, userName, avatar, doubt, timestamp: new Date(), answered: false,
      });
    });

    socket.on('doubt-answer', ({ classId, doubtId, answer, answeredBy }) => {
      io.to(`class:${classId}`).emit('doubt-answered', { doubtId, answer, answeredBy });
    });

    // ── Media controls (mentor → students) ───────────────────────────────────
    socket.on('mute-all', ({ classId }) => {
      socket.to(`class:${classId}`).emit('force-mute');
    });

    socket.on('unmute-all', ({ classId }) => {
      socket.to(`class:${classId}`).emit('force-unmute');
    });

    socket.on('cam-off-all', ({ classId }) => {
      socket.to(`class:${classId}`).emit('force-cam-off');
    });

    socket.on('mute-student', ({ classId, targetUserId }) => {
      const targetSocketId = userSockets.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('force-mute-user', { targetUserId });
      } else {
        // Broadcast to class; student checks if it's for them
        socket.to(`class:${classId}`).emit('force-mute-user', { targetUserId });
      }
    });

    // ── Poll system ───────────────────────────────────────────────────────────
    socket.on('create-poll', ({ classId, pollId, question, options }) => {
      const poll = {
        pollId, question, options,
        votes: Object.fromEntries(options.map((o: string) => [o, 0])),
        voters: new Set<string>(),
        closed: false,
      };
      polls.set(pollId, poll);
      io.to(`class:${classId}`).emit('poll-started', {
        pollId, question, options, votes: poll.votes,
      });
    });

    socket.on('poll-vote', ({ classId, pollId, option, userId }) => {
      const poll = polls.get(pollId);
      if (!poll || poll.closed || poll.voters.has(userId)) return;
      poll.voters.add(userId);
      poll.votes[option] = (poll.votes[option] || 0) + 1;
      const totalVotes = Object.values(poll.votes).reduce((a: any, b: any) => a + b, 0);
      io.to(`class:${classId}`).emit('poll-updated', {
        pollId, votes: poll.votes, totalVotes,
      });
    });

    socket.on('close-poll', ({ classId, pollId }) => {
      const poll = polls.get(pollId);
      if (poll) {
        poll.closed = true;
        const totalVotes = Object.values(poll.votes).reduce((a: any, b: any) => a + b, 0);
        io.to(`class:${classId}`).emit('poll-closed', {
          pollId, votes: poll.votes, totalVotes,
        });
      }
    });

    // ── Quiz launch ───────────────────────────────────────────────────────────
    socket.on('launch-quiz', ({ classId, quizId, quizTitle }) => {
      socket.to(`class:${classId}`).emit('quiz-launched', { quizId, quizTitle });
    });

    // ── Leave class ───────────────────────────────────────────────────────────
    socket.on('leave-class', ({ classId, userId, userName }) => {
      socket.leave(`class:${classId}`);
      if (userId) userSockets.delete(userId);
      socket.to(`class:${classId}`).emit('user-left', { userId, userName });
    });

    // ── Notifications room ────────────────────────────────────────────────────
    socket.on('join-notifications', ({ userId }) => {
      socket.join(`user:${userId}`);
      if (userId) userSockets.set(userId, socket.id);
    });

    // ── WebRTC signaling ──────────────────────────────────────────────────────
    socket.on('webrtc-offer', ({ classId, offer, senderId }) => {
      socket.to(`class:${classId}`).emit('webrtc-offer', { offer, senderId });
    });
    socket.on('webrtc-answer', ({ classId, answer, senderId }) => {
      socket.to(`class:${classId}`).emit('webrtc-answer', { answer, senderId });
    });
    socket.on('webrtc-ice-candidate', ({ classId, candidate, senderId }) => {
      socket.to(`class:${classId}`).emit('webrtc-ice-candidate', { candidate, senderId });
    });

    socket.on('disconnect', () => {
      // Clean up userSockets
      for (const [userId, sid] of userSockets.entries()) {
        if (sid === socket.id) { userSockets.delete(userId); break; }
      }
    });
  });
};

export const sendNotificationToUser = (io: Server, userId: string, notification: object) => {
  io.to(`user:${userId}`).emit('notification', notification);
};
