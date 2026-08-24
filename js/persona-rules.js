(function () {
  "use strict";

  const audiences = ["Z世代", "精致妈妈", "都市白领", "都市银发", "小镇中老年", "小镇青年", "新锐蓝领", "资深中产"];
  const genders = ["不限", "男", "女"];
  const ages = ["18–23", "24–30", "31–40", "41–50", "51–60", "60+", "自定义"];
  const defaults = {
    "Z世代": { gender: "不限", min: 18, max: 24, plus: false },
    "精致妈妈": { gender: "女", min: 25, max: 40, plus: false },
    "都市白领": { gender: "不限", min: 22, max: 40, plus: false },
    "都市银发": { gender: "不限", min: 50, max: null, plus: true },
    "小镇中老年": { gender: "不限", min: 45, max: null, plus: true },
    "小镇青年": { gender: "不限", min: 18, max: 35, plus: false },
    "新锐蓝领": { gender: "不限", min: 18, max: 40, plus: false },
    "资深中产": { gender: "不限", min: 35, max: 55, plus: false }
  };

  const audienceAliases = { "新锐白领": "都市白领", "都市蓝领": "新锐蓝领", "Z 世代": "Z世代" };
  const genderAliases = { "女性": "女", "男性": "男" };

  function normalizeAudience(value) {
    return audienceAliases[value] || value;
  }

  function normalizeGender(value) {
    return genderAliases[value] || value;
  }

  function profileFor(value) {
    const profile = defaults[normalizeAudience(value)];
    return profile ? { ...profile } : null;
  }

  function formatCustomAge(min, max, plus) {
    if (!min) return "";
    return plus || !max ? `${min}+` : `${min}–${max}`;
  }

  function parseAge(value) {
    const text = String(value || "").trim().replace(/岁$/, "");
    if (!text) return { value: "", preset: false, min: "", max: "", plus: false };
    if (ages.includes(text) && text !== "自定义") return { value: text, preset: true, min: "", max: "", plus: false };
    if (/^\d+\+$/.test(text)) return { value: text, preset: false, min: text.slice(0, -1), max: "", plus: true };
    const matched = text.match(/^(\d{1,2})\s*[–-]\s*(\d{1,2})$/);
    return matched
      ? { value: `${matched[1]}–${matched[2]}`, preset: false, min: matched[1], max: matched[2], plus: false }
      : { value: text, preset: false, min: "", max: "", plus: false };
  }

  window.ContentCompassPersonaRules = Object.freeze({
    audiences: Object.freeze([...audiences]),
    genders: Object.freeze([...genders]),
    ages: Object.freeze([...ages]),
    normalizeAudience,
    normalizeGender,
    profileFor,
    formatCustomAge,
    parseAge
  });
})();
