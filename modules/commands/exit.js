module.exports = {
	config: {
		name: "exit",
		version: "1.0",
		author: "YourName",
		countDown: 5,
		role: 1,
		description: "Make the bot leave the current group",
		category: "box chat",
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function ({ api, event, message }) {
		try {
			await message.reply("👋 تم، غادي نخرج من المجموعة.");

			await new Promise(resolve =>
				setTimeout(resolve, 1000)
			);

			return api.removeUserFromGroup(
				api.getCurrentUserID(),
				event.threadID
			);

		} catch (error) {
			console.error("exit error:", error);

			return message.reply(
				"❌ ما قدرتش نخرج من المجموعة.\n" +
				"تأكد أن البوت عنده الصلاحيات اللازمة."
			);
		}
	}
};
