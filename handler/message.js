const { handleCommand } = require('./command');
const { Users, Threads } = require('../database/database');
const config = require('../config/config.json');
const { log } = require('../logger/logger');

const handleMessage = async (event, api) => {
  try {
    if (
      (event.type !== 'message' && event.type !== 'message_reply') ||
      !event.body
    ) {
      return;
    }

    const body = String(event.body || '').trim();
    if (!body) return;

    // =========================
    // User info
    // =========================
    let userName = 'Unknown User';

    try {
      const userInfo = await api.getUserInfo(event.senderID);
      userName = userInfo?.[event.senderID]?.name || 'Unknown User';
    } catch (err) {
      log('warn', `getUserInfo failed: ${err.message}`);
    }

    // =========================
    // Thread info
    // =========================
    let threadName = 'Unknown Thread';

    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      threadName = threadInfo?.name || 'Unknown Thread';
    } catch (err) {
      log('warn', `getThreadInfo failed for ${event.threadID}: ${err.message}`);
    }

    // =========================
    // Database
    // =========================
    try {
      Users.create(event.senderID, userName);
      Threads.create(event.threadID, threadName);

      const userData = Users.get(event.senderID);

      if (userData) {
        userData.name = userName;
        userData.messageCount = (userData.messageCount || 0) + 1;
        userData.lastActive = new Date().toISOString();

        const xpToGive = Math.floor(Math.random() * 10) + 5;

        userData.xp = (userData.xp || 0) + xpToGive;
        userData.totalxp = (userData.totalxp || 0) + xpToGive;

        const rank = userData.rank || 0;
        const requiredXp = 5 * Math.pow(rank + 1, 2);

        if (userData.xp >= requiredXp) {
          userData.rank = rank + 1;
          userData.xp -= requiredXp;
        }

        Users.set(event.senderID, userData);
      }

      const threadData = Threads.get(event.threadID);

      if (threadData) {
        threadData.name = threadName;
        Threads.set(event.threadID, threadData);
      }
    } catch (err) {
      log('warn', `Database error: ${err.message}`);
    }

    // =========================
    // Handle replies
    // =========================
    const handleReply = global.client?.handleReply || [];

    if (event.messageReply && handleReply.length > 0) {
      const reply = handleReply.find(
        r => r.messageID === event.messageReply.messageID
      );

      if (reply) {
        const command = global.client.commands.get(reply.name);

        if (command?.handleReply) {
          try {
            await command.handleReply({
              event,
              api,
              handleReply: reply
            });
          } catch (err) {
            log('error', `handleReply error: ${err.message}`);
          }
        }
      }
    }

    // =========================
    // Commands
    // =========================
    const commands = global.client.commands;

    if (!commands) {
      log('error', 'Commands collection is not available');
      return;
    }

    const threadData = Threads.get(event.threadID);
    const currentPrefix =
      threadData?.settings?.prefix || config.prefix;

    const commandName = body.split(/\s+/)[0].toLowerCase();

    const noPrefixCommand =
      commands.get(commandName) ||
      Array.from(commands.values()).find(cmd =>
        cmd.config?.aliases?.includes(commandName)
      );

    if (
      noPrefixCommand &&
      noPrefixCommand.config?.prefix === false
    ) {
      const args = body.split(/\s+/);

      await handleCommand({
        message: body,
        args,
        event,
        api,
        Users,
        Threads,
        commands,
        config: global.client.config
      });

      return;
    }

    // =========================
    // Prefix command
    // =========================
    if (body.startsWith(currentPrefix)) {
      const content = body.slice(currentPrefix.length).trim();

      if (!content) return;

      const args = content.split(/\s+/);

      await handleCommand({
        message: body,
        args,
        event,
        api,
        Users,
        Threads,
        commands,
        config: global.client.config
      });
    }

  } catch (error) {
    log(
      'error',
      `Message handling error: ${error.stack || error.message}`
    );
  }
};

module.exports = { handleMessage };
