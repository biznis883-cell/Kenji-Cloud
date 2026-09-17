const activeRuns = new Map();

const WORDS = [
  "نيك", "امك", "القحبه", "ابلع", "زب", "الملک", "بسيط",
  "نياكك", "يا", "قحبه", "امك", "نفشخ", "لها", "طبونها",
  "ضعيفة", "الشخصية", "راقبي", "نڪح", "ام", "ام", "ام",
  "امك 😹" "قحبه" "تحب" "الزب" " ام" "دنيا" "عاشقة" "الزب" البسيطي" "دنيا" "قحبه" "عبد" "الباسط" "ڪلڪم" "فوق" "زب" "المايسترو" "بسيط" "فشخ" "و" "نڪح" "شرموط" "ام" "دنيا" "سعايت" "البوتات"  "بإختصار ادنيا كون تطلبي لله بلمعدل لي تطلبي بيه لبوتات كون راكي من اهل لجنه" 
];

function stop(threadID, senderID) {
  const key = `${threadID}:${senderID}`;
  const timer = activeRuns.get(key);

  if (!timer) return false;

  clearTimeout(timer);
  activeRuns.delete(key);
  return true;
}

module.exports = {
  config: {
    name: "nik",
    aliases: ["نيك", "نیک"],
    version: "1.0",
    author: "Azadx69x",
    countDown: 3,
    role: 1,
    description: {
      en: "Send the configured word sequence continuously"
    },
    category: "box chat",
    guide: {
      en: "{pn} امهم | {pn} off"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const key = `${event.threadID}:${event.senderID}`;

    // إيقاف الأمر
    if ((args[0] || "").toLowerCase() === "off") {
      return message.reply(
        stop(event.threadID, event.senderID)
          ? "✅ تم إيقاف الأمر."
          : "ℹ️ لا يوجد أمر مفعّل."
      );
    }

    // التحقق من طريقة الاستعمال
    if ((args[0] || "").toLowerCase() !== "امهم") {
      return message.reply(
        "طريقة الاستخدام: نيك امهم أو نيك off"
      );
    }

    // إيقاف أي تشغيل قديم
    stop(event.threadID, event.senderID);

    let index = 0;

    const sendNext = async () => {
      // إذا وصل لآخر كلمة يرجع للأولى
      if (index >= WORDS.length) {
        index = 0;
      }

      try {
        await api.sendMessage(
          WORDS[index],
          event.threadID
        );

        index++;

        // يعاود الإرسال بعد 650ms
        const timer = setTimeout(sendNext, 650);
        activeRuns.set(key, timer);

      } catch (error) {
        activeRuns.delete(key);
        console.error("[nik] stopped:", error.message);
      }
    };

    await message.reply(
      "✅ بدأ إرسال الكلمات بشكل مستمر.\nللتوقف: نيك off"
    );

    sendNext();
  }
};
