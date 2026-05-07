const QueueService = require('./Backend/src/services/queue.service');
const redis = require('./Backend/src/config/redis');

async function test() {
    await redis.del('active:event1');
    await redis.del('queue:event1');
    await redis.del('socketmap:event1');

    console.log('Testing with max active = 1');
    const res1 = await QueueService.joinQueue('event1', 'user1', 'socket1');
    console.log('User 1:', res1);

    const res2 = await QueueService.joinQueue('event1', 'user2', 'socket2');
    console.log('User 2:', res2);

    process.exit();
}

test();
