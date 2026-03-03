require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const TweetScoutService = require('./services/tweetscout');
const dayjs = require('dayjs');

// Validate env vars before starting
if (!process.env.BOTKEY || !process.env.TW_APIKEY) {
  console.error('❌ Missing BOTKEY or TW_APIKEY in .env');
  process.exit(1);
}

// Prevent crashes from unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
  process.exit(1);
});

const bot = new Telegraf(process.env.BOTKEY);
const tweetScout = new TweetScoutService(process.env.TW_APIKEY);

bot.catch((err, ctx) => {
  console.error(`[Bot] Error for ${ctx.updateType}:`, err.message);
});

bot.start((ctx) => {
  const startMessage = `Welcome! Just send me a Twitter or X.com link and I will gather all the stats for you 🔍\n\n` +
    `<b>How to add the bot to a group:</b>\n\n` +
    `• Open this bot’s profile.\n` +
    `• Tap "Add to Group".\n` +
    `• Choose the group you want.\n\n` +
    `🔗 <a href="https://sorsa.io/api-about?utm_source=botchecker">API</a> | <a href="https://x.com/SorsaApp">X</a> | <a href="https://sorsa.io/?utm_source=botchecker">Web</a>`;
  
  return ctx.reply(startMessage, { parse_mode: 'HTML', disable_web_page_preview: true })
    .catch(e => console.error('[Bot] Error sending start message:', e.message));
});

// Regex for extracting handle from x.com or twitter.com links
const twitterRegex = /(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)/i;

// Simple cache to avoid redundant API calls
const cache = new Map();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

let activeJobs = 0;
const MAX_CONCURRENT_JOBS = 100;

/**
 * Handles the logic for a single Twitter/X link
 */
async function handleTwitterLink(ctx, handle) {
  // Check cache first
  const cachedData = cache.get(handle);
  if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
    console.log(`[Bot] Serving cached data for @${handle}`);
    return ctx.reply(cachedData.message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...cachedData.keyboard,
      reply_to_message_id: ctx.message.message_id
    }).catch(e => console.error(`[Bot] Error sending cached reply:`, e.message));
  }

  if (activeJobs >= MAX_CONCURRENT_JOBS) {
    return ctx.reply('⚠️ The bot is currently busy processing too many requests. Please try again in a few seconds.', {
      reply_to_message_id: ctx.message.message_id
    }).catch(e => console.error(`[Bot] Error sending busy message:`, e.message));
  }

  activeJobs++;
  let statusMessage;
  try {
    console.log(`\n[Bot] Processing request for @${handle} (Active jobs: ${activeJobs})`);
    // Notify user that we are working
    statusMessage = await ctx.reply('🔍 Gathering information for @' + handle + '...', {
      reply_to_message_id: ctx.message.message_id
    });

    // Fetch data in parallel
    const [info, scoreData, followerStats, aboutData, topFollowers] = await Promise.all([
      tweetScout.getAccountInfo(handle),
      tweetScout.getAccountScore(handle),
      tweetScout.getFollowerStats(handle),
      tweetScout.getAbout(handle),
      tweetScout.getTopFollowers(handle)
    ]);

    if (!info) {
      const nfMessage = `Could not find information for handle: @${handle}\n\n` +
        `🔗 <a href="https://sorsa.io/api-about?utm_source=botchecker">API</a> | <a href="https://x.com/SorsaApp">X</a> | <a href="https://sorsa.io/?utm_source=botchecker">Web</a>`;

      await ctx.telegram.editMessageText(
        ctx.chat.id,
        statusMessage.message_id,
        null,
        nfMessage,
        { parse_mode: 'HTML', disable_web_page_preview: true }
      ).catch(() => {});
      return;
    }

    // Format report
    const score = scoreData ? Math.round(scoreData.score) : 'N/A';
    const followersCount = info.followers_count ? info.followers_count.toLocaleString() : '0';
    const tweetsCount = info.tweets_count ? info.tweets_count.toLocaleString() : '0';
    const regDate = info.register_date ? dayjs(info.register_date).format('MMM YYYY') : 'N/A';
    
    // Follower stats
    const kols = followerStats ? (followerStats.influencers_count || 0).toLocaleString() : 'N/A';
    const vcs = followerStats ? (followerStats.venture_capitals_count || 0).toLocaleString() : 'N/A';
    const projects = followerStats ? (followerStats.projects_count || 0).toLocaleString() : 'N/A';

    // About data
    const countryName = aboutData ? (aboutData.country || 'N/A') : 'N/A';
    const flags = {
      'Spain': '🇪🇸', 'United States': '🇺🇸', 'USA': '🇺🇸', 'United Kingdom': '🇬🇧', 'UK': '🇬🇧',
      'Russia': '🇷🇺', 'Ukraine': '🇺🇦', 'Germany': '🇩🇪', 'France': '🇫🇷', 'Italy': '🇮🇹',
      'Japan': '🇯🇵', 'China': '🇨🇳', 'Canada': '🇨🇦', 'Australia': '🇦🇺', 'Brazil': '🇧🇷',
      'India': '🇮🇳', 'Turkey': '🇹🇷', 'Netherlands': '🇳🇱', 'Singapore': '🇸🇬', 'UAE': '🇦🇪',
      'United Arab Emirates': '🇦🇪', 'Vietnam': '🇻🇳', 'Thailand': '🇹🇭', 'Indonesia': '🇮🇩',
      'South Korea': '🇰🇷', 'Switzerland': '🇨🇭', 'Hong Kong': '🇭🇰', 'Portugal': '🇵🇹',
      'Poland': '🇵🇱', 'Mexico': '🇲🇽', 'Nigeria': '🇳🇬', 'Argentina': '🇦🇷', 'Israel': '🇮🇱',
      'Norway': '🇳🇴', 'Sweden': '🇸🇪', 'Denmark': '🇩🇰', 'Finland': '🇫🇮', 'Belgium': '🇧🇪',
      'Austria': '🇦🇹', 'Ireland': '🇮🇪', 'Greece': '🇬🇷', 'Czech Republic': '🇨🇿', 'Hungary': '🇭🇺',
      'Romania': '🇷🇴', 'Bulgaria': '🇧🇬', 'Slovakia': '🇸🇰', 'Croatia': '🇭🇷', 'Slovenia': '🇸🇮',
      'Estonia': '🇪🇪', 'Latvia': '🇱🇻', 'Lithuania': '🇱🇹', 'South Africa': '🇿🇦', 'Egypt': '🇪🇬',
      'Morocco': '🇲🇦', 'Saudi Arabia': '🇸🇦', 'Qatar': '🇶🇦', 'Kuwait': '🇰🇼', 'Malaysia': '🇲🇾',
      'Philippines': '🇵🇭', 'New Zealand': '🇳🇿', 'Colombia': '🇨🇴', 'Chile': '🇨🇱', 'Peru': '🇵🇪',
      'Kazakhstan': '🇰🇿', 'Uzbekistan': '🇺🇿', 'Georgia': '🇬🇪', 'Armenia': '🇦🇲', 'Azerbaijan': '🇦🇿',
      'Belarus': '🇧🇾', 'Moldova': '🇲🇩', 'Cyprus': '🇨🇾', 'Malta': '🇲🇹', 'Iceland': '🇮🇸',
      'Pakistan': '🇵🇰', 'Bangladesh': '🇧🇩', 'Sri Lanka': '🇱🇰', 'Taiwan': '🇹🇼'
    };
    const flag = flags[countryName] || '';
    const countryDisplay = flag ? `${countryName} ${flag}` : countryName;

    const nameChanges = aboutData ? (aboutData.username_change_count || 0) : 'N/A';
    const lastChange = aboutData && aboutData.last_username_change_at 
      ? dayjs(aboutData.last_username_change_at).format('DD MMM YYYY') 
      : 'N/A';

    let message = `<b>${info.name} (<a href="https://x.com/${info.screen_name}">@${info.screen_name}</a>)</b>\n\n`;
    message += `📝 <b>Description:</b> ${info.description || 'No description'}\n\n`;
    message += `📊 <b>Main Stats:</b>\n`;
    message += `• <b>Score:</b> ${score}\n`;
    message += `• <b>Followers:</b> ${followersCount}\n`;
    message += `• <b>Tweets:</b> ${tweetsCount}\n`;
    message += `• <b>Registered:</b> ${regDate}\n\n`;

    message += `👥 <b>Followers Stats:</b>\n`;
    message += `• <b>KOLs:</b> ${kols}\n`;
    message += `• <b>VCs:</b> ${vcs}\n`;
    message += `• <b>Projects:</b> ${projects}\n\n`;

    message += `ℹ️ <b>Additional Info:</b>\n`;
    message += `• <b>Country:</b> ${countryDisplay}\n`;
    message += `• <b>Username Changes:</b> ${nameChanges}\n`;
    message += `• <b>Last Change:</b> ${lastChange}\n\n`;

    if (topFollowers && topFollowers.length > 0) {
      message += `🔝 <b>Top Followers:</b>\n`;
      topFollowers.slice(0, 3).forEach((f, idx) => {
        const fScore = Math.round(f.score || 0);
        message += `${idx + 1}. <a href="https://x.com/${f.screeName || f.screen_name}">@${f.screeName || f.screen_name}</a> (Score: ${fScore})\n`;
      });
      message += `\n`;
    }

    message += `🔗<a href="https://sorsa.io/api-about?utm_source=botchecker">API</a> | <a href="https://x.com/SorsaApp">X</a> | <a href="https://sorsa.io/?utm_source=botchecker">Web</a>`;

    const keyboard = Markup.inlineKeyboard([
      Markup.button.url('View Sorsa Profile', `https://app.sorsa.io/profile/${handle}?utm_source=botchecker`)
    ]);

    // Cache result
    cache.set(handle, {
      timestamp: Date.now(),
      message: message,
      keyboard: keyboard
    });

    await ctx.telegram.editMessageText(
      ctx.chat.id,
      statusMessage.message_id,
      null,
      message,
      {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...keyboard
      }
    ).catch(() => {});

  } catch (error) {
    console.error(`[Bot] Error processing @${handle}:`, error.message);
    const errMessage = `Sorry, an error occurred while fetching account details for @${handle}.\n\n` +
      `____________________________\n` +
      `🔗 <a href="https://sorsa.io/api-about?utm_source=botchecker">API</a> | <a href="https://x.com/SorsaApp">X</a> | <a href="https://sorsa.io/?utm_source=botchecker">Web</a>`;
    
    if (statusMessage) {
      await ctx.telegram.editMessageText(ctx.chat.id, statusMessage.message_id, null, errMessage, { parse_mode: 'HTML' }).catch(() => {});
    } else {
      await ctx.reply(errMessage, { parse_mode: 'HTML' }).catch(() => {});
    }
  } finally {
    activeJobs--;
    // Periodic cache cleanup
    if (cache.size > 200) {
      const now = Date.now();
      for (const [key, val] of cache.entries()) {
        if (now - val.timestamp > CACHE_TTL) cache.delete(key);
      }
    }
  }
}

bot.on(['text', 'caption'], (ctx) => {
  const text = ctx.message.text || ctx.message.caption;
  if (!text) return;
  const match = text.match(twitterRegex);

  if (match && match[1]) {
    const handle = match[1].toLowerCase();
    
    // We don't want to trigger on common paths like 'home', 'notifications', etc.
    const commonPaths = ['home', 'explore', 'notifications', 'messages', 'search', 'settings', 'i'];
    if (commonPaths.includes(handle)) return;

    // Fire and forget: don't await the whole processing to let the bot pick up next update immediately
    handleTwitterLink(ctx, handle).catch(err => console.error(`[Bot] Fatal error in handler:`, err));
  }
});

console.log('Starting bot...');
bot.launch({
  polling: {
    limit: 100 // Fetch up to 100 updates at once
  }
})
  .then(() => {
    console.log('✅ Bot @Sorsa_Check_Bot is running and ready!');
  })
  .catch((err) => {
    console.error('❌ Failed to launch bot:', err);
  });

// Enable graceful stop
process.once('SIGINT', () => {
  try {
    bot.stop('SIGINT');
  } catch (e) {
    process.exit(0);
  }
});
process.once('SIGTERM', () => {
  try {
    bot.stop('SIGTERM');
  } catch (e) {
    process.exit(0);
  }
});
