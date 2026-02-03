const axios = require('axios');
const dayjs = require('dayjs');

class TweetScoutService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.tweetscout.io/v2';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Accept': 'application/json',
        'ApiKey': this.apiKey
      }
    });
  }

  async getAccountInfo(handle) {
    try {
      console.log(`[TweetScout] Fetching info for @${handle}...`);
      const response = await this.client.get(`/info/${handle}`);
      console.log(`[TweetScout] ✅ Info for @${handle} received.`);
      return response.data;
    } catch (error) {
      console.error(`[TweetScout] ❌ Error fetching info for ${handle}:`, error.message);
      return null;
    }
  }

  async getAccountScore(handle) {
    try {
      console.log(`[TweetScout] Fetching score for @${handle}...`);
      const response = await this.client.get(`/score/${handle}`);
      console.log(`[TweetScout] ✅ Score for @${handle} received.`);
      return response.data;
    } catch (error) {
      console.error(`[TweetScout] ❌ Error fetching score for ${handle}:`, error.message);
      return null;
    }
  }

  async getFollowerStats(handle) {
    try {
      console.log(`[TweetScout] Fetching follower stats for @${handle}...`);
      const response = await this.client.get(`/followers-stats`, {
        params: { user_handle: handle }
      });
      console.log(`[TweetScout] ✅ Follower stats for @${handle} received.`);
      return response.data;
    } catch (error) {
      console.error(`[TweetScout] ❌ Error fetching follower stats for ${handle}:`, error.message);
      return null;
    }
  }

  async getAbout(handle) {
    try {
      console.log(`[TweetScout] Fetching about info for @${handle}...`);
      const response = await this.client.get(`/about`, {
        params: { link: handle }
      });
      console.log(`[TweetScout] ✅ About info for @${handle} received.`);
      return response.data;
    } catch (error) {
      console.error(`[TweetScout] ❌ Error fetching about info for ${handle}:`, error.message);
      return null;
    }
  }

  async getTopFollowers(handle) {
    try {
      console.log(`[TweetScout] Fetching top followers for @${handle}...`);
      const response = await this.client.get(`/top-followers/${handle}`, {
        params: { from: 'db' }
      });
      console.log(`[TweetScout] ✅ Top followers for @${handle} received.`);
      return response.data;
    } catch (error) {
      console.error(`[TweetScout] ❌ Error fetching top followers for ${handle}:`, error.message);
      return [];
    }
  }

  async getMentionsLastWeek(handle) {
    let allTweets = [];
    let nextCursor = null;
    const oneWeekAgo = dayjs().subtract(7, 'days');
    let page = 1;

    try {
      console.log(`[TweetScout] Fetching mentions for @${handle}...`);
      while (true) {
        const payload = {
          query: `(@${handle}) -filter:replies`,
          order: 'latest'
        };
        if (nextCursor) {
          payload.next_cursor = nextCursor;
        }

        console.log(`[TweetScout]  - Requesting mentions page ${page}...`);
        const response = await this.client.post('/search-tweets', payload);
        const tweets = response.data.tweets || [];
        
        if (tweets.length === 0) {
          console.log(`[TweetScout]  - No more mentions found.`);
          break;
        }

        const filteredTweets = tweets.filter(tweet => {
          const createdAt = dayjs(tweet.created_at);
          return createdAt.isAfter(oneWeekAgo);
        });

        allTweets = allTweets.concat(filteredTweets);
        console.log(`[TweetScout]  - Page ${page}: Found ${tweets.length} tweets, ${filteredTweets.length} within last 7 days.`);

        // If some tweets in this batch are older than 7 days, we've reached the limit
        const hasOlderTweets = tweets.some(tweet => dayjs(tweet.created_at).isBefore(oneWeekAgo));
        if (hasOlderTweets) {
          console.log(`[TweetScout]  - Reached tweets older than 7 days.`);
          break;
        }

        nextCursor = response.data.next_cursor;
        if (!nextCursor) break;
        page++;
      }
      console.log(`[TweetScout] ✅ Total mentions for @${handle} in last 7 days: ${allTweets.length}`);
      return allTweets;
    } catch (error) {
      console.error(`[TweetScout] ❌ Error fetching mentions for ${handle}:`, error.message);
      return [];
    }
  }
}

module.exports = TweetScoutService;
