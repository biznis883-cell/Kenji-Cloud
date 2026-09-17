module.exports = {
  config: {
    name: "كنية",
    version: "1.0",
    author: "Azadx69x",
    countDown: 5,
    role: 1,
    description: {
      en: "Change the nickname of all group members"
    },
    category: "box chat",
    guide: {
      en: "{pn} <nickname> | reply to a message\nحدف كنية الجميع"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadID;

    // حذف الكنية للجميع
    if (
      args.join(" ").trim().toLowerCase() === "حدف كنية الجميع" ||
      args.join(" ").trim().toLowerCase() === "حذف كنية الجميع"
    ) {
      try {
        const info = await api.getThreadInfo(threadID);
        const members = info.participantIDs || [];

        await message.reply(`⏳ جاري حذف كنية ${members.length} عضو...`);

        let success = 0;

        for (const userID of members) {
          try {
            await api.changeNickname("", threadID, userID);
            success++;
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (e) {
            console.error(`Failed ${userID}:`, e.message);
          }
        }

        return message.reply(`✅ تم حذف الكنية من ${success} عضو.`);
      } catch (error) {
        console.error(error);
        return message.reply("❌ وقع خطأ أثناء حذف الكنيات.");
      }
    }

    // الحصول على الكنية من الرد أو من النص
    const replyText = event.messageReply?.body?.trim();

    const nickname = replyText || args.join(" ").trim();

    if (!nickname) {
      return message.reply(
        "❌ اكتب الكنية أو قم بالرد على رسالة.\n\nمثال:\nكنية الجميع محمد\nأو رد على رسالة واكتب: كنية الجميع"
      );
    }

    try {
      const info = await api.getThreadInfo(threadID);
      const members = info.participantIDs || [];

      await message.reply(
        `⏳ جاري تغيير كنية ${members.length} عضو إلى: ${nickname}`
      );

      let success = 0;

      for (const userID of members) {
        try {
          await api.changeNickname(nickname, threadID, userID);
          success++;

          // تأخير بسيط لتقليل احتمال rate limit
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (e) {
          console.error(`Failed ${userID}:`, e.message);
        }
      }

      return message.reply(
        `✅ تم تغيير الكنية لـ ${success} عضو.\n👤 الكنية: ${nickname}`
      );
    } catch (error) {
      console.error("[كنية] Error:", error);
      return message.reply("❌ وقع خطأ أثناء تغيير الكنيات.");
    }
  }
};
